import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { createHash } from 'crypto';
import { prisma } from '../db.js';
import { aiRouter } from '@bsa-kit/ai-engine';

const router: RouterType = Router();

const idSchema = z.string().cuid();

// --- BMAD-Aligned System Prompt ---
const EPIC_SYSTEM_PROMPT = `You are a Product Strategist and Technical Specifications Writer using the BMAD methodology.
Your role is to guide the user through decomposing PRD requirements into implementation-ready Epics and User Stories.

## Your Approach
- Read the PRD provided, extract ALL Functional Requirements (FRs) and Non-Functional Requirements (NFRs)
- Group requirements by USER VALUE into Epics (NOT by technical layers)
- Create detailed User Stories with acceptance criteria

## Epic Design Principles
1. **User-Value First**: Each epic must enable users to accomplish something meaningful
2. **Incremental Delivery**: Each epic should deliver value independently
3. **Dependency-Free**: Epic 2 must not require Epic 3 to function
4. **Standalone**: Each epic delivers COMPLETE functionality for its domain

## User Story Format (BSA Standard)
Each story must follow this structure:
- **As a** [role] **I want** [action] **So that** [benefit]
- **Acceptance Criteria** using Given/When/Then format:
  - **Given** [precondition] **When** [action] **Then** [expected outcome]
- Business Rules (if applicable)
- Exception Handling (if applicable)
- NO code blocks — describe behavior only

## Communication Style
- Speak in Vietnamese (user's language)
- Be structured, concise, professional
- Present epics/stories section by section
- Wait for user approval before proceeding

## Action Buttons
When you present options or ask for user confirmation, ALWAYS end your response with an action block:
---ACTIONS---
[button] Label | value_to_send
[button] Label | value_to_send
---END_ACTIONS---

For multi-select (e.g. selecting FRs):
---ACTIONS---
[multi] Label | value
[multi] Label | value
---END_ACTIONS---

Examples:
- After presenting requirements: [button] ✅ Xác nhận | Xác nhận requirements  AND  [button] ✏️ Sửa đổi | Sửa đổi requirements
- After presenting epics: [button] ✅ Duyệt | Duyệt epic structure  AND  [button] ✏️ Điều chỉnh | Điều chỉnh epics
- Step 4 final: [button] 💾 Compile & Save | Compile  AND  [button] ✏️ Sửa | Sửa đổi  AND  [button] ➕ Thêm | Thêm stories`;

// BMAD Epic Steps (4 steps) — aligned with BMAD workflow
const EPIC_STEPS = [
    {
        step: 1,
        name: 'Extract Requirements',
        prompt: `Tôi sẽ phân tích PRD để trích xuất tất cả requirements.

**Quá trình:**
1. Đọc toàn bộ PRD
2. Trích xuất **Functional Requirements (FRs)** — hệ thống phải LÀM gì
3. Trích xuất **Non-Functional Requirements (NFRs)** — hiệu suất, bảo mật, usability

Sau khi trích xuất xong, tôi sẽ trình bày danh sách FRs/NFRs để bạn xác nhận.`,
    },
    {
        step: 2,
        name: 'Design Epics',
        prompt: `Requirements đã được xác nhận. Bây giờ tôi sẽ nhóm requirements thành **Epics** theo user value.

**Nguyên tắc Epic Design (BMAD):**
- Mỗi Epic phải mang lại **giá trị thực** cho người dùng
- Tổ chức theo **user value**, KHÔNG theo technical layers
- Mỗi Epic phải **hoạt động độc lập** — Epic 2 không cần Epic 3 để chạy

Tôi sẽ đề xuất cấu trúc Epic kèm FR Coverage Map để bạn duyệt.`,
    },
    {
        step: 3,
        name: 'Create Stories',
        prompt: `Epic structure đã được duyệt. Bây giờ tôi sẽ viết chi tiết từng User Story.

**Format mỗi Story (BSA Standard):**
- **As a** [role] **I want** [action] **So that** [benefit]
- **Acceptance Criteria**: Given/When/Then format
- **Business Rules** (nếu có)
- **Exception Handling** (nếu có)

**Nguyên tắc:**
- Mỗi story phải hoàn thành được bởi 1 dev
- Story trong Epic không phụ thuộc vào story tương lai
- Tạo database/entity CHỈ khi story cần

Tôi sẽ viết stories theo từng Epic, bắt đầu từ Epic 1.`,
    },
    {
        step: 4,
        name: 'Final Validation',
        prompt: `Tất cả Epics và User Stories đã được tạo.

**Kiểm tra cuối cùng:**
- Coverage: Tất cả FRs đều được bao phủ bởi ít nhất 1 story
- Dependencies: Không có dependency vòng
- Sizing: Mỗi story đủ nhỏ cho 1 dev session
- AC: Tất cả stories có Acceptance Criteria testable

**Bạn muốn:**
- **Compile & Save** — Lưu tất cả epics và stories
- **Sửa** — Chỉnh sửa epic/story cụ thể
- **Thêm** — Tạo thêm stories`,
    },
];

const chatSchema = z.object({
    projectId: idSchema,
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })),
    step: z.number().min(1).max(5),
    selectedPrdId: z.string().optional(),
});

// --- Action Parser ---
interface ParsedAction {
    type: 'button' | 'multi';
    label: string;
    value: string;
}

function parseActions(content: string): { cleanContent: string; actions: ParsedAction[] } {
    // Match with or without closing delimiter (AI sometimes omits ---END_ACTIONS---)
    const actionRegex = /---ACTIONS---\n([\s\S]*?)(?:\n---END_ACTIONS---|$)/;
    const match = content.match(actionRegex);
    if (!match) return { cleanContent: content.trim(), actions: [] };

    const cleanContent = content.replace(/---ACTIONS---[\s\S]*$/, '').trim();
    const actionLines = match[1].trim().split('\n');
    const actions: ParsedAction[] = [];

    for (const line of actionLines) {
        const btnMatch = line.match(/^\[(button|multi)\]\s*(.+?)\s*\|\s*(.+)$/);
        if (btnMatch) {
            actions.push({
                type: btnMatch[1] as 'button' | 'multi',
                label: btnMatch[2].trim(),
                value: btnMatch[3].trim(),
            });
        }
    }

    return { cleanContent, actions };
}

// ═══════════════════════════════════════
// CHAT WORKFLOW ENDPOINTS
// ═══════════════════════════════════════

// POST /api/artifact-chat — Send message in Epics & Stories flow
router.post('/', async (req: Request, res: Response) => {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { projectId, messages, step, selectedPrdId } = parsed.data;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { name: true, description: true, prdContent: true },
    });
    if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
    }

    try {
        // Resolve PRD content: use selected PRD if provided, else fallback to project.prdContent
        let prdText = project.prdContent || '';
        if (selectedPrdId && selectedPrdId !== 'project-prd') {
            const doc = await prisma.analysisDocument.findUnique({
                where: { id: selectedPrdId },
                select: { content: true },
            });
            if (doc?.content) prdText = doc.content;
        }

        const projectContext = `Project: ${project.name}${project.description ? `\nDescription: ${project.description}` : ''}`;
        const prdContext = prdText
            ? `\n\n--- PRD CONTENT ---\n${prdText}\n--- END PRD ---`
            : '';

        const currentStep = EPIC_STEPS.find(s => s.step === step);
        const stepContext = currentStep
            ? `\n\nCurrent Step: ${currentStep.name} (Step ${step}/4)`
            : '';

        // Finalization step: compile all epics & stories
        if (step === 5) {
            const compilePrompt = `Based on our conversation, compile ALL Epics and User Stories into structured output.

${projectContext}${prdContext}

For each epic and its stories, output in this EXACT format:

---EPIC---
TITLE: [Epic title]
GOAL: [What users can accomplish with this epic]
CONTENT:
[Full epic description in markdown]
---END_EPIC---

For each story within an epic:

---STORY---
EPIC: [Epic title that this story belongs to]
TITLE: [Story title, e.g. US-001: User Registration]
CONTENT:
As a [role],
I want [capability],
So that [value/benefit].

**Acceptance Criteria:**

**Given** [precondition]
**When** [action]
**Then** [expected outcome]
---END_STORY---

Output ALL epics first, then ALL stories. No commentary outside the blocks.

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n\n')}`;

            const response = await aiRouter.execute({
                taskType: 'analysis-chat',
                prompt: compilePrompt,
                context: EPIC_SYSTEM_PROMPT,
            });

            const { cleanContent, actions } = parseActions(response.content);

            res.json({
                success: true,
                data: {
                    role: 'assistant',
                    content: cleanContent,
                    step,
                    actions,
                    isComplete: true,
                },
            });
            return;
        }

        const conversationHistory = messages.map(m => `${m.role === 'user' ? 'User' : 'Strategist'}: ${m.content}`).join('\n\n');

        const prompt = `${projectContext}${prdContext}${stepContext}

Conversation so far:
${conversationHistory}

Based on the user's latest response, guide them through the BMAD Epics & Stories workflow:
- Step 1 (Extract Requirements): Read PRD. Extract ALL FRs (system behaviors) and NFRs (performance, security). Present numbered list for user confirmation.
- Step 2 (Design Epics): Group confirmed FRs into Epics by USER VALUE. Show Epic title, user outcome, FR coverage. Create FR Coverage Map. Get explicit approval.
- Step 3 (Create Stories): Write detailed User Stories per approved Epic. Use As a/I want/So that + Given/When/Then AC. Process epics sequentially.
- Step 4 (Final Validation): Validate FR coverage, dependencies, story sizing. Offer compile/edit/add options.

Current step: ${currentStep?.name || ''}
Keep responses structured. Respond in Vietnamese.`;

        const response = await aiRouter.execute({
            taskType: 'analysis-chat',
            prompt,
            context: EPIC_SYSTEM_PROMPT,
        });

        const { cleanContent: normalContent, actions: normalActions } = parseActions(response.content);

        res.json({
            success: true,
            data: {
                role: 'assistant',
                content: normalContent,
                step,
                actions: normalActions,
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Artifact chat failed',
        });
    }
});

// GET /api/artifact-chat/init/:projectId — Initialize epics workflow
router.get('/init/:projectId', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.projectId);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
    }

    const project = await prisma.project.findUnique({
        where: { id: idResult.data },
        select: { name: true, prdContent: true },
    });
    if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
    }

    // Fetch all analysis documents for this project as potential PRD sources
    const analysisDocs = await prisma.analysisDocument.findMany({
        where: { projectId: idResult.data },
        select: { id: true, title: true, type: true, content: true, status: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
    });

    // Build PRD sources list
    const prdSources: { id: string; title: string; preview: string; source: string; status: string; wordCount: number }[] = [];
    if (project.prdContent) {
        const words = project.prdContent.split(/\s+/).length;
        prdSources.push({
            id: 'project-prd',
            title: `${project.name} — PRD`,
            preview: project.prdContent.slice(0, 200) + (project.prdContent.length > 200 ? '...' : ''),
            source: 'prd-tab',
            status: 'completed',
            wordCount: words,
        });
    }
    for (const doc of analysisDocs) {
        const words = doc.content ? doc.content.split(/\s+/).length : 0;
        if (words === 0) continue; // Skip empty docs
        prdSources.push({
            id: doc.id,
            title: doc.title,
            preview: doc.content ? doc.content.slice(0, 200) + (doc.content.length > 200 ? '...' : '') : '',
            source: `analysis-${doc.type}`,
            status: doc.status,
            wordCount: words,
        });
    }

    // Check existing epics for this project
    const existingEpics = await prisma.artifact.count({
        where: { projectId: idResult.data, type: 'epic', status: 'current' },
    });

    const hasSources = prdSources.length > 0;

    const greeting = `Tôi sẽ giúp bạn tạo **Epics & User Stories** cho project **"${project.name}"** theo BMAD methodology.

Quy trình gồm **4 bước**:
1. Extract Requirements — Trích xuất FRs/NFRs từ PRD
2. Design Epics — Nhóm requirements theo user value
3. Create Stories — Viết User Stories chi tiết
4. Final Validation — Kiểm tra coverage & lưu
${existingEpics > 0 ? `\n⚠️ Epics hiện có: ${existingEpics} (sẽ tạo version mới)` : ''}

${hasSources ? '**Chọn tài liệu nguồn để bắt đầu:**' : '❌ Chưa có PRD hoặc Analysis nào — hãy tạo trước khi tạo Epics & Stories.'}`;

    res.json({
        success: true,
        data: {
            role: 'assistant',
            content: greeting,
            step: 0,
            steps: EPIC_STEPS.map(s => ({ step: s.step, name: s.name })),
            prdSources,
        },
    });
});

// POST /api/artifact-chat/next-step — Get prompt for next step
router.post('/next-step', async (req: Request, res: Response) => {
    const schema = z.object({ step: z.number().min(1).max(5) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid step' });
        return;
    }

    const { step } = parsed.data;
    const stepData = EPIC_STEPS.find(s => s.step === step);

    if (!stepData) {
        res.json({
            success: true,
            data: {
                role: 'assistant',
                content: 'Tất cả các bước đã hoàn tất! Tôi sẽ compile Epics & Stories cho bạn...',
                step: 5,
                isComplete: true,
            },
        });
        return;
    }

    res.json({
        success: true,
        data: {
            role: 'assistant',
            content: stepData.prompt,
            step: stepData.step,
        },
    });
});

// POST /api/artifact-chat/finalize — Save compiled epics & stories
router.post('/finalize', async (req: Request, res: Response) => {
    const finalizeSchema = z.object({
        projectId: idSchema,
        epics: z.array(z.object({
            title: z.string(),
            content: z.string(),
            stories: z.array(z.object({
                title: z.string(),
                content: z.string(),
            })),
        })),
    });

    const parsed = finalizeSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { projectId, epics } = parsed.data;

    try {
        // Get PRD hash for staleness tracking
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { prdContent: true },
        });
        const sourceHash = project?.prdContent
            ? createHash('md5').update(project.prdContent).digest('hex')
            : null;

        // Archive existing epics and their stories
        await prisma.artifact.updateMany({
            where: { projectId, type: { in: ['epic', 'user-story'] }, status: 'current' },
            data: { status: 'archived', archivedAt: new Date() },
        });

        const created: { epics: unknown[]; stories: unknown[] } = { epics: [], stories: [] };

        for (const epicData of epics) {
            // Create epic
            const epic = await prisma.artifact.create({
                data: {
                    type: 'epic',
                    title: epicData.title,
                    content: epicData.content,
                    version: 1,
                    status: 'current',
                    sourceHash,
                    projectId,
                },
            });
            created.epics.push(epic);

            // Create stories for this epic
            for (const storyData of epicData.stories) {
                const story = await prisma.artifact.create({
                    data: {
                        type: 'user-story',
                        title: storyData.title,
                        content: storyData.content,
                        version: 1,
                        status: 'current',
                        sourceHash,
                        projectId,
                        epicId: epic.id,
                    },
                });
                created.stories.push(story);
            }
        }

        res.status(201).json({ success: true, data: created });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Failed to save epics & stories',
        });
    }
});

// ═══════════════════════════════════════
// CRUD ENDPOINTS
// ═══════════════════════════════════════

// GET /api/artifact-chat/epics/:projectId — List all epics with stories
router.get('/epics/:projectId', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.projectId);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
    }

    const epics = await prisma.artifact.findMany({
        where: { projectId: idResult.data, type: 'epic', status: 'current' },
        orderBy: { createdAt: 'asc' },
        include: {
            stories: {
                where: { status: 'current' },
                orderBy: { createdAt: 'asc' },
                include: {
                    storyArtifacts: {
                        where: { status: 'current' },
                        select: { id: true, type: true, title: true, version: true, createdAt: true },
                        orderBy: { type: 'asc' },
                    },
                },
            },
        },
    });

    res.json({ success: true, data: epics });
});

// PUT /api/artifact-chat/epic/:id — Update epic
router.put('/epic/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid ID' });
        return;
    }

    const updateSchema = z.object({
        title: z.string().optional(),
        content: z.string().optional(),
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
    } catch {
        res.status(404).json({ success: false, error: 'Artifact not found' });
    }
});

// PUT /api/artifact-chat/story/:id — Update story
router.put('/story/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid ID' });
        return;
    }

    const updateSchema = z.object({
        title: z.string().optional(),
        content: z.string().optional(),
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
    } catch {
        res.status(404).json({ success: false, error: 'Story not found' });
    }
});

// DELETE /api/artifact-chat/artifact/:id — Soft-delete (archive)
router.delete('/artifact/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid ID' });
        return;
    }

    try {
        // Archive the artifact and all its children (stories under epic)
        await prisma.artifact.updateMany({
            where: {
                OR: [
                    { id: idResult.data },
                    { epicId: idResult.data },
                ],
            },
            data: { status: 'archived', archivedAt: new Date() },
        });
        res.json({ success: true });
    } catch {
        res.status(404).json({ success: false, error: 'Artifact not found' });
    }
});

// POST /api/artifact-chat/story — Add new story to epic
router.post('/story', async (req: Request, res: Response) => {
    const storySchema = z.object({
        epicId: idSchema,
        title: z.string(),
        content: z.string(),
    });

    const parsed = storySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { epicId, title, content } = parsed.data;

    // Get parent epic to inherit projectId
    const epic = await prisma.artifact.findUnique({
        where: { id: epicId },
        select: { projectId: true, sourceHash: true },
    });
    if (!epic) {
        res.status(404).json({ success: false, error: 'Epic not found' });
        return;
    }

    const story = await prisma.artifact.create({
        data: {
            type: 'user-story',
            title,
            content,
            version: 1,
            status: 'current',
            sourceHash: epic.sourceHash,
            projectId: epic.projectId,
            epicId,
        },
    });

    res.status(201).json({ success: true, data: story });
});

// POST /api/artifact-chat/epic — Create single epic (manual)
router.post('/epic', async (req: Request, res: Response) => {
    const epicSchema = z.object({
        projectId: idSchema,
        title: z.string().min(1),
        content: z.string().default(''),
        stories: z.array(z.object({
            title: z.string().min(1),
            content: z.string().default(''),
        })).default([]),
    });

    const parsed = epicSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { projectId, title, content, stories } = parsed.data;

    try {
        const epic = await prisma.artifact.create({
            data: {
                type: 'epic',
                title,
                content,
                version: 1,
                status: 'current',
                projectId,
            },
        });

        const createdStories = [];
        for (const storyData of stories) {
            const story = await prisma.artifact.create({
                data: {
                    type: 'user-story',
                    title: storyData.title,
                    content: storyData.content,
                    version: 1,
                    status: 'current',
                    projectId,
                    epicId: epic.id,
                },
            });
            createdStories.push(story);
        }

        res.status(201).json({
            success: true,
            data: { ...epic, stories: createdStories },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Failed to create epic',
        });
    }
});

// POST /api/artifact-chat/import — Bulk import epics (append, no archive)
router.post('/import', async (req: Request, res: Response) => {
    const importSchema = z.object({
        projectId: idSchema,
        epics: z.array(z.object({
            title: z.string().min(1),
            content: z.string().default(''),
            stories: z.array(z.object({
                title: z.string().min(1),
                content: z.string().default(''),
            })).default([]),
        })).min(1),
    });

    const parsed = importSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { projectId, epics } = parsed.data;

    try {
        const created: { epics: unknown[]; stories: unknown[] } = { epics: [], stories: [] };

        for (const epicData of epics) {
            const epic = await prisma.artifact.create({
                data: {
                    type: 'epic',
                    title: epicData.title,
                    content: epicData.content,
                    version: 1,
                    status: 'current',
                    projectId,
                },
            });
            created.epics.push(epic);

            for (const storyData of epicData.stories) {
                const story = await prisma.artifact.create({
                    data: {
                        type: 'user-story',
                        title: storyData.title,
                        content: storyData.content,
                        version: 1,
                        status: 'current',
                        projectId,
                        epicId: epic.id,
                    },
                });
                created.stories.push(story);
            }
        }

        res.status(201).json({ success: true, data: created });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Failed to import epics',
        });
    }
});

export default router;
