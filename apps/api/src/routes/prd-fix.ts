import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { aiRouter } from '@bsa-kit/ai-engine';

const router: RouterType = Router();

const idSchema = z.string().cuid();

// --- BMAD PRD Fix Prompt ---
const FIX_SYSTEM_PROMPT = `You are a PRD Improvement Specialist using BMAD methodology.
Your role is to fix specific issues in PRD documents based on validation findings.

## Rules
- Fix ONLY the specific issue described. Do not change other parts of the PRD.
- Preserve the overall structure and formatting of the PRD.
- Follow BMAD quality standards:
  - Information Density: No filler phrases, no wordy constructions
  - Measurability: Every requirement must have testable criteria
  - Traceability: Requirements must link to user needs
  - No Implementation Leakage: Describe capabilities, not solutions
  - SMART Compliance: Specific, Measurable, Achievable, Relevant, Time-bound
  - Completeness: All sections present and well-structured

## Output Format
Respond with valid JSON (no markdown wrapper). Use this exact structure:
{
  "improvedPrd": "<the complete improved PRD in markdown>",
  "changesSummary": "<brief summary of what was changed, in Vietnamese, 2-3 sentences>"
}`;

const fixSchema = z.object({
    projectId: idSchema,
    checkName: z.string().min(1),
    recommendation: z.string().min(1),
    findings: z.array(z.string()).optional().default([]),
});

const fixAllSchema = z.object({
    projectId: idSchema,
    checks: z.array(z.object({
        name: z.string(),
        status: z.string(),
        recommendation: z.string(),
        findings: z.array(z.string()),
    })),
    topImprovements: z.array(z.string()).optional().default([]),
});

// POST /api/prd-fix — Fix a specific validation issue in the PRD
router.post('/', async (req: Request, res: Response) => {
    const parsed = fixSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { projectId, checkName, recommendation, findings } = parsed.data;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { name: true, prdContent: true },
    });

    if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
    }

    if (!project.prdContent || project.prdContent.trim().length === 0) {
        res.status(400).json({ success: false, error: 'Project has no PRD content to fix' });
        return;
    }

    try {
        const prompt = `Fix the following specific issue in this PRD document.

PRD Title: ${project.name}

--- ISSUE TO FIX ---
Check: ${checkName}
Recommendation: ${recommendation}
${findings.length > 0 ? `Findings:\n${findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}` : ''}
--- END ISSUE ---

--- PRD CONTENT START ---
${project.prdContent}
--- PRD CONTENT END ---

Apply the recommendation to fix this specific issue. Output the complete improved PRD and a brief summary of changes.`;

        const response = await aiRouter.execute({
            taskType: 'prd-fix',
            prompt,
            context: FIX_SYSTEM_PROMPT,
        });

        let result;
        try {
            let cleaned = response.content.trim();
            if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
            }
            result = JSON.parse(cleaned);
        } catch {
            // If JSON fails, treat entire content as the improved PRD
            result = {
                improvedPrd: response.content,
                changesSummary: 'PRD đã được cải thiện theo recommendation.',
            };
        }

        res.json({
            success: true,
            data: result,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'PRD fix failed',
        });
    }
});

// POST /api/prd-fix/all — Fix all validation issues at once
router.post('/all', async (req: Request, res: Response) => {
    const parsed = fixAllSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { projectId, checks, topImprovements } = parsed.data;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { name: true, prdContent: true },
    });

    if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
    }

    if (!project.prdContent || project.prdContent.trim().length === 0) {
        res.status(400).json({ success: false, error: 'Project has no PRD content to fix' });
        return;
    }

    // Only include non-pass checks
    const issueChecks = checks.filter(c => c.status !== 'Pass');

    if (issueChecks.length === 0 && topImprovements.length === 0) {
        res.json({
            success: true,
            data: {
                improvedPrd: project.prdContent,
                changesSummary: 'Không có issue nào cần fix. PRD đã đạt chuẩn.',
            },
        });
        return;
    }

    try {
        const issuesList = issueChecks.map((c, i) =>
            `${i + 1}. **${c.name}** (${c.status}): ${c.recommendation}\n   Findings: ${c.findings.join('; ')}`
        ).join('\n');

        const improvementsList = topImprovements.length > 0
            ? `\n\nTop Improvements:\n${topImprovements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}`
            : '';

        const prompt = `Fix ALL the following validation issues in this PRD document.

PRD Title: ${project.name}

--- ALL ISSUES TO FIX ---
${issuesList}${improvementsList}
--- END ISSUES ---

--- PRD CONTENT START ---
${project.prdContent}
--- PRD CONTENT END ---

Apply ALL recommendations to fix every issue. Output the complete improved PRD and a summary of all changes made.`;

        const response = await aiRouter.execute({
            taskType: 'prd-fix',
            prompt,
            context: FIX_SYSTEM_PROMPT,
        });

        let result;
        try {
            let cleaned = response.content.trim();
            if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
            }
            result = JSON.parse(cleaned);
        } catch {
            result = {
                improvedPrd: response.content,
                changesSummary: `Đã sửa ${issueChecks.length} vấn đề validation.`,
            };
        }

        res.json({
            success: true,
            data: result,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'PRD fix-all failed',
        });
    }
});

export default router;
