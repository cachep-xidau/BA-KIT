import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { aiRouter } from '@bsa-kit/ai-engine';

const router: RouterType = Router();

const idSchema = z.string().cuid();

// --- BMAD PRD Validation Prompt ---
const VALIDATION_SYSTEM_PROMPT = `You are a PRD Quality Assurance Specialist using the BMAD (Build Measure Analyze Deliver) methodology.
Your role is to validate PRD documents against BMAD quality standards.

## Validation Checks
You must evaluate the PRD against these 6 criteria:

1. **Information Density** — Detect filler phrases ("The system will allow users to..."), wordy phrases ("Due to the fact that"), and redundant phrases ("future plans"). Count violations.
2. **Measurability** — Check that every FR and NFR has testable, specific criteria. Not vague ("easy to use") but precise ("response < 200ms").
3. **Traceability** — Verify requirements link to user needs and business objectives. Each FR should map to a user journey or business goal.
4. **Implementation Leakage** — Find technology names, specific libraries, or implementation details leaking into requirements. Requirements should describe capabilities, not solutions.
5. **SMART Compliance** — Assess if requirements are Specific, Measurable, Achievable, Relevant, Time-bound. Calculate compliance percentage.
6. **Completeness** — Check all expected PRD sections are present: Executive Summary, Success Criteria, Product Scope, User Journeys, Functional Requirements, Non-Functional Requirements.

## Output Format
Respond ONLY with valid JSON (no markdown wrapper, no commentary). Use this exact structure:
{
  "overallStatus": "Pass" | "Warning" | "Critical",
  "holisticScore": <number 1-5>,
  "checks": [
    {
      "name": "<check name>",
      "status": "Pass" | "Warning" | "Critical",
      "score": <number or percentage>,
      "findings": ["<finding 1>", "<finding 2>"],
      "recommendation": "<recommendation>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "topImprovements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "summary": "<one-line summary in Vietnamese>"
}`;

// POST /api/prd-validate — Validate a project's PRD
router.post('/', async (req: Request, res: Response) => {
    const schema = z.object({ projectId: idSchema });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
    }

    const project = await prisma.project.findUnique({
        where: { id: parsed.data.projectId },
        select: { name: true, prdContent: true },
    });

    if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
    }

    if (!project.prdContent || project.prdContent.trim().length === 0) {
        res.status(400).json({ success: false, error: 'Project has no PRD content to validate' });
        return;
    }

    try {
        const prompt = `Validate the following PRD document against BMAD quality standards.

PRD Title: ${project.name}

--- PRD CONTENT START ---
${project.prdContent}
--- PRD CONTENT END ---

Perform all 6 validation checks and return the structured JSON result.`;

        const response = await aiRouter.execute({
            taskType: 'prd-validation',
            prompt,
            context: VALIDATION_SYSTEM_PROMPT,
        });

        // Parse the AI response as JSON
        let validationResult;
        try {
            // Strip markdown code fences if present
            let cleaned = response.content.trim();
            if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
            }
            validationResult = JSON.parse(cleaned);
        } catch {
            // If JSON parsing fails, return raw content with a warning
            validationResult = {
                overallStatus: 'Warning',
                holisticScore: 0,
                checks: [],
                strengths: [],
                topImprovements: [],
                summary: 'Validation completed but response format was unexpected.',
                rawContent: response.content,
            };
        }

        res.json({
            success: true,
            data: validationResult,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'PRD validation failed',
        });
    }
});

export default router;
