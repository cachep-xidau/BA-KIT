import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { createHash } from 'crypto';
import { prisma } from '../db.js';
import { pipeline } from '../pipeline/index.js';
import { mcpContext } from '../services/mcp-context.js';
import { idSchema, type ArtifactType } from '@bsa-kit/shared';

const router: RouterType = Router();

const isRecordWithCode = (value: unknown): value is { code: string } =>
    typeof value === 'object' && value !== null && typeof (value as { code?: unknown }).code === 'string';

// --- Schemas ---
const generateSchema = z.object({
    functionId: idSchema,
    artifactTypes: z.array(
        z.enum(['user-story', 'function-list', 'srs', 'erd', 'sql',
            'screen-description', 'flowchart', 'sequence-diagram', 'use-case-diagram', 'activity-diagram']),
    ).min(1).refine((arr) => arr.length === new Set(arr).size, {
        message: 'Duplicate artifact types not allowed',
    }),
    prdContent: z.string().max(500000).optional(),
    context: z.string().optional(),
});

// POST /api/generate — Start artifact generation pipeline
router.post('/', async (req: Request, res: Response) => {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { functionId, artifactTypes, context } = parsed.data;
    let { prdContent } = parsed.data;

    // If no PRD content provided, fetch from function → feature → project chain
    let projectId: string | undefined;
    if (!prdContent) {
        const func = await prisma.function.findUnique({
            where: { id: functionId },
            include: {
                feature: {
                    include: {
                        project: { select: { id: true, prdContent: true } },
                    },
                },
            },
        });
        if (!func?.feature?.project?.prdContent) {
            res.status(400).json({
                success: false,
                error: 'No PRD content provided and project has no stored PRD',
            });
            return;
        }
        prdContent = func.feature.project.prdContent;
        projectId = func.feature.project.id;
    } else {
        // Resolve projectId from functionId for MCP context
        const func = await prisma.function.findUnique({
            where: { id: functionId },
            include: { feature: { select: { projectId: true } } },
        });
        projectId = func?.feature?.projectId;
    }

    try {
        // Fetch MCP context for the project (Story 2.10 — MCP-Enhanced Generation)
        const mcpResult = projectId
            ? await mcpContext.fetchForProject(projectId)
            : null;

        // Enrich context with MCP data
        const enrichedContext = [context, mcpResult?.context]
            .filter(Boolean)
            .join('\n\n');

        const result = await pipeline.run(
            functionId,
            artifactTypes as ArtifactType[],
            prdContent,
            enrichedContext || undefined,
            mcpResult?.sources,
        );

        // Story 3.5 — Graceful Degradation: include warnings in response
        res.json({
            success: true,
            data: result,
            mcpSources: mcpResult?.sources ?? [],
            warnings: mcpResult?.warnings ?? [],
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Generation failed',
        });
    }
});

// GET /api/generate/tree/:projectId — Full tree with nested artifacts
router.get('/tree/:projectId', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.projectId);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
    }

    try {
        const statusFilter = req.query.status as string | undefined;
        const artifactWhere: Record<string, unknown> = {};
        if (statusFilter && ['current', 'archived'].includes(statusFilter)) {
            artifactWhere.status = statusFilter;
        }

        const features = await prisma.feature.findMany({
            where: { projectId: idResult.data },
            orderBy: { order: 'asc' },
            include: {
                functions: {
                    orderBy: { order: 'asc' },
                    include: {
                        artifacts: {
                            where: artifactWhere,
                            orderBy: [{ type: 'asc' }, { version: 'desc' }],
                        },
                    },
                },
            },
        });

        // Compute stale status
        const project = await prisma.project.findUnique({
            where: { id: idResult.data },
            select: { prdContent: true },
        });
        const currentHash = project?.prdContent
            ? createHash('md5').update(project.prdContent).digest('hex')
            : null;

        // Enrich artifacts with stale flag
        const enriched = features.map((f) => ({
            ...f,
            functions: f.functions.map((fn) => ({
                ...fn,
                artifacts: fn.artifacts.map((a) => ({
                    ...a,
                    isStale: currentHash && a.sourceHash ? a.sourceHash !== currentHash : false,
                })),
            })),
        }));

        res.json({ success: true, data: enriched });
    } catch (err) {
        console.error('Failed to get tree:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve artifact tree' });
    }
});

// GET /api/generate/artifact/:id — Get single artifact
router.get('/artifact/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid artifact ID' });
        return;
    }

    try {
        const artifact = await prisma.artifact.findUnique({ where: { id: idResult.data } });
        if (!artifact) {
            res.status(404).json({ success: false, error: 'Artifact not found' });
            return;
        }
        res.json({ success: true, data: artifact });
    } catch (err) {
        console.error('Failed to get artifact:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve artifact' });
    }
});

// PATCH /api/generate/artifact/:id/archive — Toggle archive status
router.patch('/artifact/:id/archive', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid artifact ID' });
        return;
    }

    try {
        const artifact = await prisma.artifact.findUnique({ where: { id: idResult.data } });
        if (!artifact) {
            res.status(404).json({ success: false, error: 'Artifact not found' });
            return;
        }

        const isArchiving = artifact.status !== 'archived';
        const updated = await prisma.artifact.update({
            where: { id: idResult.data },
            data: {
                status: isArchiving ? 'archived' : 'current',
                archivedAt: isArchiving ? new Date() : null,
            },
        });

        res.json({ success: true, data: updated });
    } catch (err) {
        console.error('Failed to archive artifact:', err);
        res.status(500).json({ success: false, error: 'Failed to update artifact status' });
    }
});

// PUT /api/generate/artifact/:id — Update artifact content
router.put('/artifact/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid artifact ID' });
        return;
    }

    const updateSchema = z.object({
        content: z.string().min(1),
        title: z.string().optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    try {
        const artifact = await prisma.artifact.update({
            where: { id: idResult.data },
            data: parsed.data,
        });
        res.json({ success: true, data: artifact });
    } catch (err) {
        console.error('Failed to update artifact:', err);
        res.status(500).json({ success: false, error: 'Failed to update artifact' });
    }
});

// DELETE /api/generate/artifact/:id — Delete artifact
router.delete('/artifact/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid artifact ID' });
        return;
    }

    try {
        await prisma.artifact.delete({ where: { id: idResult.data } });
        res.json({ success: true });
    } catch (err) {
        if (isRecordWithCode(err) && err.code === 'P2025') {
            res.status(404).json({ success: false, error: 'Artifact not found' });
            return;
        }
        console.error('Failed to delete artifact:', err);
        res.status(500).json({ success: false, error: 'Failed to delete artifact' });
    }
});

// GET /api/generate/export/:projectId — Export all current artifacts as JSON bundle
router.get('/export/:projectId', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.projectId);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
    }

    const project = await prisma.project.findUnique({
        where: { id: idResult.data },
        select: { name: true },
    });
    if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
    }

    // Fetch tree structure for export
    const features = await prisma.feature.findMany({
        where: { projectId: idResult.data },
        orderBy: { order: 'asc' },
        include: {
            functions: {
                orderBy: { order: 'asc' },
                include: {
                    artifacts: {
                        where: { status: 'current' },
                        orderBy: [{ type: 'asc' }, { version: 'desc' }],
                    },
                },
            },
        },
    });

    const bundle = features.map((f) => ({
        feature: f.name,
        functions: f.functions.map((fn) => ({
            function: fn.name,
            artifacts: fn.artifacts.map((a) => ({
                filename: `${a.type}-v${a.version}.md`,
                content: a.content,
                type: a.type,
                version: a.version,
            })),
        })),
    }));

    res.json({
        success: true,
        data: {
            projectName: project.name,
            tree: bundle,
        },
    });
});

// GET /api/generate/count — Total artifact count (for sidebar badge)
router.get('/count', async (_req: Request, res: Response) => {
    const count = await prisma.artifact.count({
        where: { status: 'current' },
    });
    res.json({ success: true, data: { count } });
});

// POST /api/generate/extract-structure — AI extracts Feature/Function tree from PRD
const extractSchema = z.object({
    projectId: idSchema,
    prdContent: z.string().min(10),
});

router.post('/extract-structure', async (req: Request, res: Response) => {
    const parsed = extractSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { prdContent } = parsed.data;

    try {
        const { aiRouter } = await import('@bsa-kit/ai-engine');

        const response = await aiRouter.execute({
            taskType: 'structure-extraction',
            prompt: `Analyze the following PRD and extract a hierarchical Feature → Function structure.

Output ONLY valid JSON (no markdown fences, no explanation) in this exact format:
{
  "features": [
    {
      "name": "Feature Name",
      "description": "Brief description",
      "functions": [
        { "name": "Function Name", "description": "Brief description" }
      ]
    }
  ]
}

Rules:
- A "Feature" is a major capability/module (e.g., "User Management", "Payment Processing")
- A "Function" is a specific action within a feature (e.g., "Login", "Register", "Process Payment")
- Extract ALL features and functions mentioned or implied in the PRD
- Keep names concise (2-5 words)
- Descriptions should be one sentence max

PRD Content:
${prdContent}`,
            context: 'You are an expert BSA. Extract a structured Feature/Function hierarchy from the PRD. Output ONLY valid JSON.',
        });

        // Parse the AI response as JSON
        let structure;
        try {
            // Strip markdown fences if present
            let jsonStr = response.content.trim();
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
            }
            structure = JSON.parse(jsonStr);
        } catch {
            res.status(422).json({
                success: false,
                error: 'AI returned invalid JSON. Please try again.',
                raw: response.content,
            });
            return;
        }

        res.json({ success: true, data: structure });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'AI extraction failed',
        });
    }
});

// POST /api/generate/apply-structure — Bulk create Features + Functions from extracted structure
const applySchema = z.object({
    projectId: idSchema,
    features: z.array(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        functions: z.array(z.object({
            name: z.string().min(1),
            description: z.string().optional(),
        })),
    })).min(1),
});

router.post('/apply-structure', async (req: Request, res: Response) => {
    const parsed = applySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { projectId, features } = parsed.data;

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Get current max order within transaction
            const maxOrderFeature = await tx.feature.findFirst({
                where: { projectId },
                orderBy: { order: 'desc' },
                select: { order: true },
            });
            let featureOrder = (maxOrderFeature?.order ?? -1) + 1;

            const created = [];

            for (const feat of features) {
                const feature = await tx.feature.create({
                    data: {
                        name: feat.name,
                        description: feat.description || undefined,
                        order: featureOrder++,
                        projectId,
                    },
                });

                const functions = [];
                for (let i = 0; i < feat.functions.length; i++) {
                    const fn = feat.functions[i];
                    const func = await tx.function.create({
                        data: {
                            name: fn.name,
                            description: fn.description || undefined,
                            order: i,
                            featureId: feature.id,
                        },
                    });
                    functions.push(func);
                }

                created.push({ ...feature, functions });
            }

            return created;
        });

        res.status(201).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Failed to create structure',
        });
    }
});

// --- BSA Reference Templates (loaded at runtime for AI standards compliance) ---
const BSA_TEMPLATES: Record<string, string> = {
    'user-story': `User Story Format:
# US-XXX-NNN: [Title]
## User Story
**As a** [role] **I want** [action] **So that** [benefit]
## Acceptance Criteria
### AC-1: [Name]
User [action] → System: [response bullets]
## Business Rules
- BR-001: [rule]
## Exception Handling
- [Exception]: [System response]
RULES: NO code blocks. Describe behavior only. Use [Ref: SRS-XXX] for implementation details.`,

    'function-list': `Function List Format:
# Function List: [Feature Name]
## Function Overview Table
| Function ID | Function Name | Description |
|---|---|---|
| F-XXX-001 | [Name] | [1-sentence] |
## Detailed Specifications
### F-XXX-001: [Name]
**Main Flow:** 3-5 high-level steps
**NFR:** Performance, Security, Reliability (optional)
RULES: Focus on user actions and system responses. No excessive UI detail.`,

    'srs': `SRS Format:
# SRS: [Module/Feature Name]
## Business Requirements
## System Requirements
## Data Requirements (SQL/API)
## Validation Rules
## Integration Points
Include: SQL scripts, API contracts, JSON schemas, validation logic.`,

    'erd': `ERD Format (DBML):
Table table_name {
  id integer [pk, increment]
  field_name type [constraints]
  created_at timestamp [default: \`now()\`]
}
Ref: table_a.id > table_b.foreign_id
RULES: Use DBML syntax for dbdiagram.io. Include all relationships.`,

    'screen-description': `Screen Description Format:
# Screen: [Screen Name]
## Layout Overview
[Brief layout description]
## Fields
| Field | Type | Required | Validation |
|---|---|---|---|
## Action Buttons
| Button | Action | Condition |
|---|---|---|
## Data Display
[Data sources and rendering rules]`,

    'use-case-diagram': `Use Case Diagram (PlantUML):
@startuml
left to right direction
actor "User" as user
rectangle "System" {
  usecase "UC-001: [Name]" as uc1
  usecase "UC-002: [Name]" as uc2
}
user --> uc1
uc1 ..> uc2 : <<include>>
@enduml`,

    'sequence-diagram': `Sequence Diagram (PlantUML):
@startuml
actor User
participant "Frontend" as FE
participant "Backend" as BE
participant "Database" as DB
User -> FE: [action]
FE -> BE: [API call]
BE -> DB: [query]
DB --> BE: [result]
BE --> FE: [response]
FE --> User: [display]
@enduml`,

    'sql': `SQL Script Format:
-- Table creation with constraints
CREATE TABLE table_name (
  id SERIAL PRIMARY KEY,
  field_name TYPE CONSTRAINTS
);
-- Include: indexes, foreign keys, triggers, seed data`,

    'flowchart': `Flowchart (Mermaid):
graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Action]
  B -->|No| D[Alternative]
  C --> E[End]`,

    'activity-diagram': `Activity Diagram (Mermaid):
graph TD
  A([Start]) --> B[Step 1]
  B --> C{Condition}
  C -->|Path A| D[Action A]
  C -->|Path B| E[Action B]
  D --> F([End])
  E --> F`,
};

// POST /api/generate/single — AI-generate a single artifact (preview only, not saved)
const singleSchema = z.object({
    storyId: idSchema.optional(),
    functionId: idSchema.optional(),
    type: z.enum(['user-story', 'function-list', 'srs', 'erd', 'sql',
        'screen-description', 'use-case-diagram', 'sequence-diagram',
        'flowchart', 'activity-diagram']),
    projectId: idSchema,
    confluenceUrl: z.string().url().optional().or(z.literal('')),
    figmaUrls: z.array(z.union([
        z.string().url(),
        z.object({ url: z.string().url(), description: z.string().optional() }),
    ])).optional().default([]),
});

router.post('/single', async (req: Request, res: Response) => {
    const parsed = singleSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { storyId, functionId, type, projectId, confluenceUrl, figmaUrls } = parsed.data;

    let contextName = '';
    let contextDetail = '';
    let prdContent = '';
    let projectName = '';
    let storyTitle = '';
    let epicTitle = '';

    if (storyId) {
        // Story-scoped: load story → epic → project
        const story = await prisma.artifact.findUnique({
            where: { id: storyId },
            include: {
                epic: true,
                project: { select: { name: true, prdContent: true } },
            },
        });
        if (!story) {
            res.status(404).json({ success: false, error: 'Story not found' });
            return;
        }
        storyTitle = story.title;
        epicTitle = story.epic?.title || '';
        projectName = story.project?.name || '';
        prdContent = story.project?.prdContent || '';
        contextName = storyTitle;
        contextDetail = `Story: ${storyTitle}\nStory Content: ${story.content}\nEpic: ${epicTitle}`;
    } else if (functionId) {
        // Legacy function-scoped (backward compat)
        const func = await prisma.function.findUnique({
            where: { id: functionId },
            include: {
                feature: {
                    include: {
                        project: { select: { name: true, prdContent: true } },
                    },
                },
            },
        });
        if (!func) {
            res.status(404).json({ success: false, error: 'Function not found' });
            return;
        }
        projectName = func.feature.project.name;
        prdContent = func.feature.project.prdContent || '';
        contextName = func.name;
        contextDetail = `Feature: ${func.feature.name}\nFunction: ${func.name}${func.description ? ` — ${func.description}` : ''}`;
    } else {
        res.status(400).json({ success: false, error: 'Either storyId or functionId is required' });
        return;
    }

    const template = BSA_TEMPLATES[type] || '';

    try {
        const { aiRouter } = await import('@bsa-kit/ai-engine');

        const prompt = `Generate a ${type} artifact for: "${contextName}".

Project: ${projectName}
${contextDetail}

${prdContent ? `--- PRD CONTENT ---\n${prdContent}\n--- END PRD ---` : '(No PRD available)'}

**BSA Template to follow:**
${template}

Generate the artifact following the BSA template above. Output ONLY the artifact content in markdown format, no commentary.
Write in the document output language that matches the PRD language (Vietnamese if PRD is in Vietnamese, English if in English).
${confluenceUrl ? `\nConfluence Reference: ${confluenceUrl}` : ''}
${figmaUrls && figmaUrls.length > 0 ? `\nFigma Design References:\n${figmaUrls.map((u: string | { url: string; description?: string }, i: number) => {
            const url = typeof u === 'string' ? u : u.url;
            const desc = typeof u === 'object' && u.description ? ` — ${u.description}` : '';
            return `  Step ${i + 1}: ${url}${desc}`;
        }).join('\n')}` : ''}`;

        const response = await aiRouter.execute({
            taskType: 'analysis-chat',
            prompt,
            context: 'You are an expert Business Systems Analyst. Generate professional BSA artifacts following the provided template strictly. Output clean markdown only.',
        });

        res.json({
            success: true,
            data: {
                content: response.content,
                type,
                storyId: storyId || null,
                functionId: functionId || null,
                storyTitle,
                epicTitle,
                contextName,
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Generation failed',
        });
    }
});

// POST /api/generate/save-single — Save a previewed artifact to DB
const saveSingleSchema = z.object({
    storyId: idSchema.optional(),
    functionId: idSchema.optional(),
    type: z.string().min(1),
    content: z.string().min(1),
    projectId: idSchema,
});

router.post('/save-single', async (req: Request, res: Response) => {
    const parsed = saveSingleSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { storyId, functionId, type, content, projectId } = parsed.data;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Get PRD hash within transaction
            const project = await tx.project.findUnique({
                where: { id: projectId },
                select: { prdContent: true },
            });
            const sourceHash = project?.prdContent
                ? createHash('md5').update(project.prdContent).digest('hex')
                : null;

            // Get next version (scope by story or function) within transaction
            const whereClause = storyId
                ? { storyId, type, status: 'current' }
                : { functionId, type, status: 'current' };

            const existing = await tx.artifact.findFirst({
                where: whereClause,
                orderBy: { version: 'desc' },
                select: { version: true },
            });
            const nextVersion = (existing?.version ?? 0) + 1;

            // Archive previous within transaction
            if (existing) {
                await tx.artifact.updateMany({
                    where: whereClause,
                    data: { status: 'archived', archivedAt: new Date() },
                });
            }

            // Create new artifact within transaction
            const artifact = await tx.artifact.create({
                data: {
                    type,
                    title: `${type.toUpperCase()} v${nextVersion}`,
                    content,
                    version: nextVersion,
                    status: 'current',
                    sourceHash,
                    storyId: storyId || null,
                    functionId: functionId || null,
                    projectId,
                },
            });

            return artifact;
        });

        res.status(201).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Failed to save artifact',
        });
    }
});

// GET /api/generate/story-artifacts/:storyId — Get all artifacts linked to a story
router.get('/story-artifacts/:storyId', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.storyId);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid story ID' });
        return;
    }

    const artifacts = await prisma.artifact.findMany({
        where: {
            storyId: idResult.data,
            status: 'current',
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            type: true,
            title: true,
            version: true,
            status: true,
            createdAt: true,
        },
    });

    res.json({ success: true, data: artifacts });
});

// POST /api/generate/batch — Generate multiple artifact types in parallel
const batchSchema = z.object({
    storyId: idSchema,
    types: z.array(z.enum(['user-story', 'function-list', 'srs', 'erd', 'sql',
        'screen-description', 'use-case-diagram', 'sequence-diagram',
        'flowchart', 'activity-diagram'])).min(1),
    projectId: idSchema,
    confluenceUrl: z.string().url().optional().or(z.literal('')),
    figmaUrls: z.array(z.union([
        z.string().url(),
        z.object({ url: z.string().url(), description: z.string().optional() }),
    ])).optional().default([]),
});

router.post('/batch', async (req: Request, res: Response) => {
    const parsed = batchSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { storyId, types, projectId, confluenceUrl, figmaUrls } = parsed.data;

    // Load story + epic + project context
    const story = await prisma.artifact.findUnique({
        where: { id: storyId },
        include: {
            epic: true,
            project: { select: { name: true, prdContent: true } },
        },
    });
    if (!story) {
        res.status(404).json({ success: false, error: 'Story not found' });
        return;
    }

    const storyTitle = story.title;
    const epicTitle = story.epic?.title || '';
    const projectName = story.project?.name || '';
    const prdContent = story.project?.prdContent || '';
    const contextDetail = `Story: ${storyTitle}\nStory Content: ${story.content}\nEpic: ${epicTitle}`;

    try {
        const { aiRouter } = await import('@bsa-kit/ai-engine');

        // Generate all types in parallel
        const results = await Promise.allSettled(
            types.map(async (type) => {
                const template = BSA_TEMPLATES[type] || '';
                const prompt = `Generate a ${type} artifact for: "${storyTitle}".

Project: ${projectName}
${contextDetail}

${prdContent ? `--- PRD CONTENT ---\n${prdContent}\n--- END PRD ---` : '(No PRD available)'}

**BSA Template to follow:**
${template}

Generate the artifact following the BSA template above. Output ONLY the artifact content in markdown format, no commentary.
Write in the document output language that matches the PRD language (Vietnamese if PRD is in Vietnamese, English if in English).
${confluenceUrl ? `\nConfluence Reference: ${confluenceUrl}` : ''}
${figmaUrls && figmaUrls.length > 0 ? `\nFigma Design References:\n${figmaUrls.map((u: string | { url: string; description?: string }, i: number) => {
                    const url = typeof u === 'string' ? u : u.url;
                    const desc = typeof u === 'object' && u.description ? ` — ${u.description}` : '';
                    return `  Step ${i + 1}: ${url}${desc}`;
                }).join('\n')}` : ''}`;

                const response = await aiRouter.execute({
                    taskType: 'analysis-chat',
                    prompt,
                    context: 'You are an expert Business Systems Analyst. Generate professional BSA artifacts following the provided template strictly. Output clean markdown only.',
                });

                return {
                    type,
                    content: response.content,
                    storyId,
                    storyTitle,
                    epicTitle,
                    contextName: storyTitle,
                };
            }),
        );

        const artifacts = results.map((r, i) => {
            if (r.status === 'fulfilled') {
                return { success: true, ...r.value };
            }
            return {
                success: false,
                type: types[i],
                error: r.reason instanceof Error ? r.reason.message : 'Generation failed',
            };
        });

        res.json({ success: true, data: artifacts });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Batch generation failed',
        });
    }
});

export default router;
