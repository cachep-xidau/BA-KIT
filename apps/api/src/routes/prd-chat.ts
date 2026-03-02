import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { aiRouter } from '@bsa-kit/ai-engine';
import { idSchema } from '@bsa-kit/shared';

const router: RouterType = Router();

// --- BMAD PRD System Prompt ---
const BMAD_SYSTEM_PROMPT = `You are a Product Manager AI assistant using the BMAD (Build Measure Analyze Deliver) methodology.
Your role is to guide the user through creating a comprehensive PRD (Product Requirements Document).

## PRD Quality Standards (BMAD)
- **High Information Density** — every sentence carries weight, zero fluff
- **Measurable Requirements** — all FRs and NFRs are testable with specific criteria
- **Clear Traceability** — each requirement links to user need and business objective
- **Dual Audience** — human-readable AND LLM-consumable
- **Markdown Format** — professional, clean, accessible

## Anti-Patterns to Avoid
- AVOID: "The system will allow users to..." -> USE: "Users can..."
- AVOID: Subjective adjectives: "easy to use", "intuitive", "fast"
- AVOID: Implementation leakage: technology names, specific libraries
- AVOID: Vague quantifiers: "multiple", "several", "various"

## Communication Style
- Speak in Vietnamese (the user's preferred language)
- Be concise, structured, professional
- Ask focused questions — one section at a time
- Provide examples when helpful
- Summarize what you've captured before moving to next section

## Action Buttons
When you ask for confirmation or present options, ALWAYS end your response with:
---ACTIONS---
[button] Label | value_to_send
---END_ACTIONS---

Examples:
- After summarizing a section: [button] ✅ Tiếp tục | Tiếp tục  AND  [button] ✏️ Sửa lại | Sửa lại phần này
- After all sections done: [button] 💾 Compile PRD | Compile PRD  AND  [button] ✏️ Chỉnh sửa | Chỉnh sửa thêm`;

// PRD sections to guide through
const PRD_STEPS = [
    {
        step: 1,
        name: 'Executive Summary',
        prompt: `Bắt đầu tạo PRD.

Trước tiên, hãy cho tôi biết về **Executive Summary** của dự án:

1. **Tên sản phẩm** là gì?
2. **Vấn đề** mà sản phẩm giải quyết?
3. **Đối tượng mục tiêu** là ai?
4. **Điểm khác biệt** so với giải pháp hiện có?

Hãy mô tả ngắn gọn, tập trung vào giá trị cốt lõi.`,
    },
    {
        step: 2,
        name: 'Success Criteria',
        prompt: `Tiếp theo là **Success Criteria** — Tiêu chí thành công.

Hãy xác định các tiêu chí đo lường được (SMART):
- **Specific:** Mục tiêu cụ thể?
- **Measurable:** Đo lường bằng gì? (số liệu, KPI)
- **Attainable:** Khả thi trong thời gian nào?
- **Relevant:** Liên quan đến mục tiêu kinh doanh?

Vi du: "1000 nguoi dung dang ky trong thang dau", "Toc do tai trang < 2 giay"`,
    },
    {
        step: 3,
        name: 'Product Scope',
        prompt: `Bây giờ hãy xác định **Product Scope** — Phạm vi sản phẩm:

**MVP (Minimum Viable Product):**
- Những tính năng nào PHẢI có trong bản đầu tiên?

**Growth Phase:**
- Tính năng nào sẽ thêm sau MVP?

**Vision:**
- Tầm nhìn dài hạn cho sản phẩm?

Hãy phân loại rõ ràng theo 3 giai đoạn trên.`,
    },
    {
        step: 4,
        name: 'User Journeys',
        prompt: `Tiếp theo là **User Journeys** — Hành trình người dùng.

Mô tả các luồng chính mà người dùng sẽ thực hiện:

Ví dụ format:
1. **Tên luồng:** Đăng ký tài khoản
   - Bước 1: User truy cập trang chủ
   - Bước 2: Click "Đăng ký"
   - Bước 3: Điền form → Xác nhận email
   - Kết quả: Tài khoản được tạo

Hãy liệt kê 3-5 luồng chính nhất.`,
    },
    {
        step: 5,
        name: 'Functional Requirements',
        prompt: `Bây giờ là **Functional Requirements** — Yêu cầu chức năng.

Mỗi FR cần:
- Mô tả **khả năng** (capability), không phải implementation
- **Đo lường được** với test criteria
- **Truy vết** về user journey tương ứng

Format: "FR-XX: [Mô tả khả năng] — [Test criteria]"

Vi du: "FR-01: Users co the dang ky bang email — Xac nhan trong 30 giay, password >= 8 ky tu"

Liệt kê các FR cho từng tính năng MVP.`,
    },
    {
        step: 6,
        name: 'Non-Functional Requirements',
        prompt: `Cuối cùng, **Non-Functional Requirements** — Yêu cầu phi chức năng.

Các lĩnh vực cần xem xét:
- **Performance:** Thời gian phản hồi, concurrent users
- **Security:** Authentication, authorization, data encryption
- **Scalability:** Khả năng mở rộng
- **Availability:** Uptime SLA
- **Accessibility:** WCAG compliance

Format: "NFR-XX: [Metric] [Condition] [Measurement]"
Ví dụ: "NFR-01: API response < 200ms cho 95th percentile"`,
    },
];

// --- BMAD Edit PRD Steps (4-step workflow) ---
const EDIT_SYSTEM_PROMPT = `You are a PRD Improvement Specialist using the BMAD Edit methodology.
Your role is to guide the user through improving an existing PRD.

## Your Approach
- Read and understand the existing PRD content provided to you
- Discover what the user wants to edit
- Analyze the PRD section-by-section and propose a change plan
- Apply changes only after user confirms the plan
- Output the final updated PRD in clean markdown

## PRD Quality Standards (BMAD)
- High Information Density — zero fluff
- Measurable Requirements — testable with specific criteria
- Clear Traceability — each requirement links to user need
- No Implementation Leakage — avoid technology names

## Communication Style
- Speak in Vietnamese (user's language)
- Be analytical, structured, professional
- Show section-by-section analysis
- Always confirm change plan before editing

## Action Buttons
When you ask for confirmation or present options, ALWAYS end your response with:
---ACTIONS---
[button] Label | value_to_send
---END_ACTIONS---

Examples:
- After showing change plan: [button] ✅ Duyệt | Duyệt change plan  AND  [button] ✏️ Sửa | Sửa change plan
- After completing edits: [button] 💾 Compile | Compile PRD  AND  [button] ✏️ Sửa thêm | Tiếp tục chỉnh sửa  AND  [button] ✅ Validate | Chạy validation`;

const EDIT_STEPS = [
    {
        step: 1,
        name: 'Discovery',
        prompt: `Tôi đã đọc PRD hiện tại của bạn.

**Bạn muốn chỉnh sửa những gì?**

Ví dụ:
- Sửa lỗi cụ thể (thông tin chưa rõ, requirements thiếu đo lường)
- Thêm section hoặc nội dung còn thiếu
- Cải thiện cấu trúc và flow
- Nâng cao chất lượng tổng thể
- Thay đổi khác

**Mô tả mục tiêu chỉnh sửa của bạn:**`,
    },
    {
        step: 2,
        name: 'Deep Review',
        prompt: `Dựa trên yêu cầu của bạn, tôi sẽ phân tích PRD chi tiết theo từng section.

Tôi sẽ đánh giá:
- **Mật độ thông tin** (tìm filler/anti-patterns)
- **Đo lường được** (requirements có testable không?)
- **Cấu trúc** (flow logic, sections đầy đủ?)
- **Implementation leakage** (có đề cập công nghệ cụ thể không?)

Sau đó tôi sẽ đề xuất **Change Plan** để bạn duyệt trước khi sửa.`,
    },
    {
        step: 3,
        name: 'Edit & Update',
        prompt: `Change Plan đã được duyệt. Tôi sẽ áp dụng các thay đổi theo thứ tự ưu tiên.

Sau khi hoàn tất, tôi sẽ xuất PRD đã cập nhật dưới dạng markdown hoàn chỉnh.`,
    },
    {
        step: 4,
        name: 'Complete',
        prompt: `PRD đã được cập nhật thành công.

**Bạn muốn làm gì tiếp?**
- **Compile** — Lưu PRD đã sửa
- **Sửa thêm** — Tiếp tục chỉnh sửa
- **Validate** — Chạy validation kiểm tra chất lượng`,
    },
];

const chatSchema = z.object({
    projectId: idSchema,
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })).min(1, 'At least one message required'),
    step: z.number().min(1).max(7),
    mode: z.enum(['create', 'edit']).optional().default('create'),
    selectedSources: z.array(z.string()).optional(),
});

const finalizeSchema = z.object({
    projectId: idSchema,
    prdContent: z.string().min(1),
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

// POST /api/prd-chat — Send message in PRD creation flow
router.post('/', async (req: Request, res: Response) => {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { projectId, messages, step, mode, selectedSources } = parsed.data;

    // Verify project exists
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { name: true, description: true, prdContent: true },
    });
    if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
    }

    const isEditMode = mode === 'edit';
    const steps = isEditMode ? EDIT_STEPS : PRD_STEPS;
    const systemPrompt = isEditMode ? EDIT_SYSTEM_PROMPT : BMAD_SYSTEM_PROMPT;
    const totalSteps = steps.length;
    const finalStep = totalSteps + 1;

    try {
        // Build conversation context
        const projectContext = `Project: ${project.name}${project.description ? `\nDescription: ${project.description}` : ''}`;
        const prdContext = isEditMode && project.prdContent
            ? `\n\n--- EXISTING PRD CONTENT ---\n${project.prdContent}\n--- END PRD ---`
            : '';

        // Fetch Analysis documents as context for PRD creation
        let analysisContext = '';
        if (!isEditMode && selectedSources && selectedSources.length > 0) {
            const analysisDocs = await prisma.analysisDocument.findMany({
                where: {
                    projectId,
                    type: { in: selectedSources },
                    content: { not: '' },
                },
                select: { title: true, type: true, content: true },
            });
            if (analysisDocs.length > 0) {
                analysisContext = '\n\n--- ANALYSIS CONTEXT (from Phase 1) ---\n' +
                    analysisDocs.map(d => `### ${d.title} (${d.type})\n${d.content}`).join('\n\n') +
                    '\n--- END ANALYSIS CONTEXT ---\n\nUse the analysis context above as input to inform the PRD. Reference specific findings, data, and insights from these documents when creating each PRD section.';
            }
        }

        // Current step info
        const currentStep = steps.find((s) => s.step === step);
        const stepContext = currentStep
            ? `\n\nCurrent Section: ${currentStep.name} (Step ${step}/${totalSteps})`
            : '';

        // Finalization step: compile full PRD
        if (step === finalStep) {
            const compilePrompt = isEditMode
                ? `Based on our conversation and the approved change plan, output the COMPLETE UPDATED PRD in Markdown format.

${projectContext}
${prdContext}

Apply all approved changes from our discussion. Keep the same structure but with improvements.
Output ONLY the complete updated PRD markdown, no commentary.

Conversation history:
${messages.map((m) => `${m.role}: ${m.content}`).join('\n\n')}`
                : `Based on our entire conversation, compile a complete PRD in Markdown format.

${projectContext}

Use this structure:
# Product Requirements Document - ${project.name}

**Author:** AI-Generated (BMAD Method)
**Date:** ${new Date().toISOString().split('T')[0]}

## 1. Executive Summary
## 2. Success Criteria
## 3. Product Scope
### 3.1 MVP
### 3.2 Growth Phase
### 3.3 Vision
## 4. User Journeys
## 5. Functional Requirements
## 6. Non-Functional Requirements

Fill each section with the information gathered from our conversation. Be precise, measurable, and follow BMAD standards.
Output ONLY the PRD markdown, no commentary.

Conversation history:
${messages.map((m) => `${m.role}: ${m.content}`).join('\n\n')}`;

            const response = await aiRouter.execute({
                taskType: 'prd-generation',
                prompt: compilePrompt,
                context: systemPrompt,
            });

            const { cleanContent: compileContent, actions: compileActions } = parseActions(response.content);

            res.json({
                success: true,
                data: {
                    role: 'assistant',
                    content: compileContent,
                    step: finalStep,
                    isComplete: true,
                    actions: compileActions,
                },
            });
            return;
        }

        // Build the prompt with conversation history
        const conversationHistory = messages.map((m) => `${m.role === 'user' ? 'User' : 'PM'}: ${m.content}`).join('\n\n');

        const prompt = isEditMode
            ? `${projectContext}${prdContext}${stepContext}

Conversation so far:
${conversationHistory}

Based on the user's latest response, do the following for the EDIT workflow:
- Step 1 (Discovery): Understand the user's edit goals. Ask clarifying questions about what they want to change.
- Step 2 (Deep Review): Analyze the PRD section-by-section. Present a detailed change plan with priorities (Critical/High/Medium). Wait for user approval.
- Step 3 (Edit & Update): Apply approved changes. Output the updated sections showing what changed.
- Step 4 (Complete): Summarize all changes made. Offer to compile the final updated PRD.

Current step: ${currentStep?.name || ''}
Keep responses concise and structured. Respond in Vietnamese.`
            : `${projectContext}${analysisContext}${stepContext}

Conversation so far:
${conversationHistory}

Based on the user's latest response, do the following:
1. Acknowledge and summarize what they shared for section "${currentStep?.name || ''}"
2. If their input is incomplete, ask follow-up questions for this section
3. If the section is complete, confirm what you've captured and ask if they want to proceed to the next section
4. Keep responses concise and structured

Respond in Vietnamese.`;

        const response = await aiRouter.execute({
            taskType: 'prd-generation',
            prompt,
            context: systemPrompt,
        });

        const { cleanContent: stepContent, actions: stepActions } = parseActions(response.content);

        res.json({
            success: true,
            data: {
                role: 'assistant',
                content: stepContent,
                step,
                actions: stepActions,
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'PRD chat failed',
        });
    }
});

// GET /api/prd-chat/init/:projectId — Get initial greeting for PRD creation/edit
router.get('/init/:projectId', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.projectId);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
    }

    const mode = req.query.mode === 'edit' ? 'edit' : 'create';

    const project = await prisma.project.findUnique({
        where: { id: idResult.data },
        select: { name: true, description: true, prdContent: true },
    });
    if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
    }

    if (mode === 'edit') {
        // Edit mode: load existing PRD and start discovery
        const prdPreview = project.prdContent
            ? project.prdContent.substring(0, 500) + (project.prdContent.length > 500 ? '...' : '')
            : '(Chưa có PRD)';

        const greeting = `Tôi sẽ giúp bạn **chỉnh sửa PRD** cho project **"${project.name}"** theo BMAD Edit Workflow.

Quy trình gồm **4 bước**:
1. Discovery — Tìm hiểu mục tiêu chỉnh sửa
2. Deep Review — Phân tích PRD & đề xuất Change Plan
3. Edit & Update — Áp dụng thay đổi đã duyệt
4. Complete — Tổng kết & lưu PRD

**PRD hiện tại (preview):**
\`\`\`
${prdPreview}
\`\`\`

${EDIT_STEPS[0].prompt}`;

        res.json({
            success: true,
            data: {
                role: 'assistant',
                content: greeting,
                step: 1,
                steps: EDIT_STEPS.map((s) => ({ step: s.step, name: s.name })),
                mode: 'edit',
            },
        });
        return;
    }

    // Fetch available analysis docs with content
    const availableAnalysis = await prisma.analysisDocument.findMany({
        where: { projectId: idResult.data, content: { not: '' } },
        select: { type: true, content: true },
    });
    const availableTypes = [...new Set(availableAnalysis.filter(d => d.content.trim().length > 0).map(d => d.type))];

    // Create mode: show source selection
    const greeting = `Tôi sẽ giúp bạn tạo **PRD (Product Requirements Document)** cho project **"${project.name}"** theo phương pháp BMAD.

Quy trình gồm **6 phần**:
1. Executive Summary
2. Success Criteria
3. Product Scope
4. User Journeys
5. Functional Requirements
6. Non-Functional Requirements

${availableTypes.length > 0 ? '**Chọn tài liệu Analysis làm input context:**' : PRD_STEPS[0].prompt}`;

    res.json({
        success: true,
        data: {
            role: 'assistant',
            content: greeting,
            step: availableTypes.length > 0 ? 0 : 1,
            steps: PRD_STEPS.map((s) => ({ step: s.step, name: s.name })),
            mode: 'create',
            availableAnalysisTypes: availableTypes,
        },
    });
});

// POST /api/prd-chat/next-step — Get prompt for next step
router.post('/next-step', async (req: Request, res: Response) => {
    const schema = z.object({
        step: z.number().min(1).max(7),
        mode: z.enum(['create', 'edit']).optional().default('create'),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid step' });
        return;
    }

    const { step, mode } = parsed.data;
    const steps = mode === 'edit' ? EDIT_STEPS : PRD_STEPS;
    const finalStep = steps.length + 1;
    const stepData = steps.find((s) => s.step === step);

    if (!stepData) {
        res.json({
            success: true,
            data: {
                role: 'assistant',
                content: mode === 'edit'
                    ? 'Tất cả các bước chỉnh sửa đã hoàn tất! Tôi sẽ compile PRD đã cập nhật cho bạn...'
                    : 'Tất cả các phần đã hoàn tất! Tôi sẽ compile PRD cho bạn...',
                step: finalStep,
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

// POST /api/prd-chat/finalize — Save compiled PRD to project
router.post('/finalize', async (req: Request, res: Response) => {
    const parsed = finalizeSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    try {
        await prisma.project.update({
            where: { id: parsed.data.projectId },
            data: { prdContent: parsed.data.prdContent },
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Failed to save PRD',
        });
    }
});

export default router;
