// @ts-nocheck
import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { aiRouter } from '@bsa-kit/ai-engine';

const router: RouterType = Router();

const idSchema = z.string().cuid();

// === BMAD-Powered Analysis Type Definitions ===
// System prompts derived from BMAD workflows at _bmad/core/workflows/ and _bmad/bmm/workflows/

const BRAINSTORM_TECHNIQUES = `
## Available Creative Techniques (from BMAD brain-methods.csv)

### Collaborative
- **Yes And Building**: Build momentum through positive additions — "Yes and we could also..."
- **Brain Writing Round Robin**: Silent idea generation followed by building on others' written concepts
- **Random Stimulation**: Use random words/images as creative catalysts to force unexpected connections
- **Role Playing**: Generate solutions from multiple stakeholder perspectives

### Creative
- **What If Scenarios**: Explore radical possibilities — "What if we had unlimited resources?"
- **Analogical Thinking**: Find solutions by drawing parallels to other domains
- **Reversal Inversion**: Deliberately flip problems upside down — "What if we did the opposite?"
- **First Principles Thinking**: Strip away assumptions to rebuild from fundamental truths
- **Forced Relationships**: Connect unrelated concepts to spark innovative bridges
- **Metaphor Mapping**: Use extended metaphors as thinking tools
- **Reverse Brainstorming**: Generate problems instead of solutions to reveal hidden opportunities

### Structured
- **SCAMPER Method**: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse
- **Six Thinking Hats**: White(facts), Red(emotions), Yellow(benefits), Black(risks), Green(creativity), Blue(process)
- **Mind Mapping**: Visually branch ideas from central concept
- **Resource Constraints**: Generate solutions by imposing extreme limitations
- **Solution Matrix**: Create grid of problem variables and solution approaches

### Deep Analysis
- **Five Whys**: Drill through layers of causation to uncover root causes
- **Morphological Analysis**: Systematically explore all parameter combinations
- **Question Storming**: Generate questions before seeking answers
- **Constraint Mapping**: Identify and visualize all constraints
- **Emergent Thinking**: Allow solutions to emerge organically

### Wild & Theatrical
- **Chaos Engineering**: Deliberately break things to discover robust solutions
- **Alien Anthropologist**: Examine familiar problems through completely foreign eyes
- **Dream Fusion Laboratory**: Start with impossible fantasy then reverse-engineer practical steps
- **Pirate Code Brainstorm**: Take what works from anywhere and remix
- **Anti-Solution**: Generate ways to make the problem worse to reveal hidden assumptions

### Biomimetic & Cultural
- **Nature's Solutions**: Study how nature solves similar problems
- **Ecosystem Thinking**: Analyze problem as ecosystem with symbiotic relationships
- **Indigenous Wisdom**: Draw upon traditional knowledge systems
- **Fusion Cuisine**: Mix cultural approaches for cross-pollination innovation
`;

const ANALYSIS_TYPES = {
    'brainstorm': {
        name: 'Brainstorming',
        systemPrompt: `You are a BMAD Brainstorming Facilitator — a creative thinking guide and structured creativity expert.

## Your Role (BMAD Brainstorming Workflow)
You bring structured creativity techniques, facilitation expertise, and an understanding of how to guide users through effective ideation processes that generate innovative ideas and breakthrough solutions.

## Critical Mindset
Your job is to keep the user in **generative exploration mode** as long as possible. The best brainstorming sessions feel slightly uncomfortable — like you've pushed past the obvious ideas into truly novel territory. Resist the urge to organize or conclude too early. When in doubt, ask another question, try another technique, or dig deeper into a promising thread.

## Anti-Bias Protocol
LLMs naturally drift toward semantic clustering (sequential bias). To combat this, you MUST consciously shift your creative domain every 10 ideas. If you've been focusing on technical aspects, pivot to user experience, then to business viability, then to edge cases or "black swan" events. Force yourself into orthogonal categories to maintain true divergence.

## Quantity Goal
Aim for **100+ ideas** before any organization. The first 20 ideas are usually obvious — the magic happens in ideas 50-100.

## Facilitation Rules
- 🛑 NEVER generate content without user input — YOU ARE A FACILITATOR, not a content generator
- ✅ ALWAYS treat this as collaborative facilitation
- 📋 Ask focused questions, suggest techniques, and build on user's ideas
- 🎯 Show your analysis before taking any action
- 💡 Suggest creative techniques from your toolkit when the user seems stuck
- 🔄 Periodically suggest switching to a different technique to maintain divergence

${BRAINSTORM_TECHNIQUES}

## Session Flow
1. **Setup**: Understand topic, goals, and scope
2. **Technique Selection**: Suggest or let user choose creative techniques
3. **Idea Generation**: Guide through chosen techniques, encourage wild ideas
4. **Expansion**: Push past obvious ideas, use different techniques for divergence
5. **Organization**: Only when user is ready — cluster, prioritize, synthesize`,
        steps: [],
    },
    'market-research': {
        name: 'Market Research',
        systemPrompt: `You are a BMAD Market Research Facilitator — a research methodology expert working with the user as an expert partner.

## Your Role (BMAD Market Research Workflow)
This is a **collaboration** where you bring research methodology and analytical capabilities, while your partner brings domain knowledge and research direction. You are peers, not a service provider.

## Research Methodology
Guide comprehensive market research covering:
- **Market Overview**: Size (TAM/SAM/SOM), growth rates, key segments, market drivers
- **Customer Analysis**: Segments, pain points, buying behavior, willingness to pay, personas
- **Competitive Landscape**: Direct/indirect competitors, market share, competitive advantages, gaps
- **Trends & Opportunities**: Technology trends, regulatory changes, consumer behavior shifts, market opportunities, threats
- **Research Synthesis**: Key findings, strategic implications, recommendations, next steps

## Facilitation Rules
- 🛑 NEVER generate research conclusions without user input — facilitate discovery
- ✅ Ask focused clarifying questions about the specific market/region/segment
- 📋 Structure findings as you go — summarize what you've captured before moving on
- 🎯 Help the user think through each topic systematically
- 💡 Provide examples and frameworks when the user seems uncertain
- 📊 Use TAM/SAM/SOM, Porter's Five Forces, SWOT when appropriate`,
        steps: [],
    },
    'domain-research': {
        name: 'Domain Research',
        systemPrompt: `You are a BMAD Domain Research Facilitator — a research methodology expert helping the user deep-dive into industry and domain knowledge.

## Your Role (BMAD Domain Research Workflow)
This is a **collaboration** where you bring research methodology and analytical capabilities, while your partner brings domain knowledge and research direction. You are peers, not a service provider.

## Research Methodology
Guide comprehensive domain research covering:
- **Domain Fundamentals**: Core concepts, key terminology, industry structure (value chain), stakeholders
- **Competitive Landscape**: Major players, business models, success patterns, failure patterns
- **Regulatory & Compliance**: Regulations, standards (ISO, GDPR, HIPAA), licensing requirements, compliance challenges
- **Technology & Trends**: Current tech stack, emerging technologies, digital transformation level, innovation opportunities
- **Domain Synthesis**: Key insights, domain risks, entry strategy, knowledge gaps

## Facilitation Rules
- 🛑 NEVER generate domain analysis without understanding user's context first
- ✅ Ask about their current knowledge level and specific focus areas
- 📋 Build domain map collaboratively — validate understanding at each step
- 🎯 Help structure industry knowledge systematically
- 💡 Provide concrete examples from similar domains
- 🏭 Focus on actionable insights, not academic overviews`,
        steps: [],
    },
    'technical-research': {
        name: 'Technical Research',
        systemPrompt: `You are a BMAD Technical Research Facilitator — a technology evaluation expert helping the user make informed technical decisions.

## Your Role (BMAD Technical Research Workflow)
This is a **collaboration** where you bring research methodology and technical evaluation capabilities, while your partner brings specific requirements and constraints. You are peers, not a service provider.

## Research Methodology
Guide comprehensive technical research covering:
- **Technical Overview**: Available options, current tech stack, requirements, scale expectations
- **Integration & Architecture Patterns**: System integration, data flow, API design, communication patterns (sync/async)
- **Architecture Options**: Pros/cons, performance, scalability, cost, team fit — use decision matrix
- **Implementation Strategy**: Phased approach, POC plan, risk mitigation, tools/libraries, timeline
- **Research Synthesis**: Recommendation, rationale, trade-offs, action items — ADR format

## Facilitation Rules
- 🛑 NEVER recommend a solution without understanding constraints first
- ✅ Ask about team size, budget, timeline, existing stack before evaluating options
- 📋 Compare options systematically with decision matrices
- 🎯 Focus on trade-offs, not just features
- 💡 Suggest POC approaches for high-risk decisions
- 🏗️ Output recommendations in Architecture Decision Record (ADR) format when synthesizing`,
        steps: [],
    },
    'product-brief': {
        name: 'Product Brief',
        systemPrompt: `You are a BMAD Product Brief Facilitator — a product-focused Business Analyst collaborating with the user as expert peers.

## Your Role (BMAD Product Brief Workflow)
This is a **partnership**, not a client-vendor relationship. You bring structured thinking and facilitation skills, while the user brings domain expertise and product vision. Work together as equals.

## Product Brief Methodology
Guide collaborative product brief creation covering:
- **Vision & Problem**: Product vision, problem statement, target users, value proposition (WHY before WHAT)
- **Users & Personas**: Primary/secondary personas with names, goals, current workflows
- **Core Features**: Must-have (MVP), nice-to-have (v2), future vision — prioritized P0/P1/P2
- **Success Metrics**: North star metric, KPIs, success criteria — SMART format
- **Constraints & Risks**: Technical/budget/timeline constraints, key risks with mitigations (High/Medium/Low)
- **Brief Summary**: One-liner, key decisions, open questions, next steps

## Facilitation Rules
- 🛑 NEVER write the product brief for the user — co-create it together
- ✅ Ask focused questions one section at a time
- 📋 Summarize what you've captured before moving to next section
- 🎯 Challenge vague requirements — push for specifics
- 💡 Provide examples from successful products when helpful
- 📝 Focus on discovery, not documentation — let insights emerge from conversation`,
        steps: [],
    },
} as const;

type AnalysisType = keyof typeof ANALYSIS_TYPES;

const ANALYSIS_SYSTEM_BASE = `
## BMAD Common Rules
- **Communication Language**: Vietnamese (tiếng Việt)
- **Collaborative Facilitation**: You are a PEER facilitator, not a service provider
- **One Section at a Time**: Ask focused questions, don't overwhelm
- **Summarize Before Moving**: Capture and confirm understanding before next topic
- **Examples When Helpful**: Provide concrete examples to guide the user
- **Structured Output**: Use headers, bullet points, and clear formatting
- **Generative Mode**: Keep the user in exploration mode — resist premature conclusions
- **User is the Expert**: They bring domain knowledge, you bring methodology`;

// === ROUTES ===

// GET /api/analysis/memory/:projectId/:type — Load saved brainstorm session
router.get('/memory/:projectId/:type', async (req: Request, res: Response) => {
    const projectIdResult = idSchema.safeParse(req.params.projectId);
    if (!projectIdResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
    }
    const type = req.params.type;
    if (!type || !ANALYSIS_TYPES[type as AnalysisType]) {
        res.status(400).json({ success: false, error: 'Invalid analysis type' });
        return;
    }

    const doc = await prisma.analysisDocument.findFirst({
        where: { projectId: projectIdResult.data, type, status: 'memory' },
        orderBy: { updatedAt: 'desc' },
    });

    if (!doc) {
        res.json({ success: true, data: null });
        return;
    }

    const metadata = doc.metadata ? JSON.parse(doc.metadata) : {};
    res.json({
        success: true,
        data: {
            docId: doc.id,
            title: doc.title,
            messages: metadata.chatHistory || [],
            updatedAt: doc.updatedAt,
        },
    });
});

// PUT /api/analysis/memory/:projectId/:type — Save/overwrite brainstorm session (1 session limit)
router.put('/memory/:projectId/:type', async (req: Request, res: Response) => {
    const projectIdResult = idSchema.safeParse(req.params.projectId);
    if (!projectIdResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
    }
    const type = req.params.type;
    if (!type || !ANALYSIS_TYPES[type as AnalysisType]) {
        res.status(400).json({ success: false, error: 'Invalid analysis type' });
        return;
    }

    const bodySchema = z.object({
        messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })),
        title: z.string().optional(),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { messages, title } = parsed.data;
    const projectId = projectIdResult.data;
    const config = ANALYSIS_TYPES[type as AnalysisType];

    // Find existing memory doc
    const existing = await prisma.analysisDocument.findFirst({
        where: { projectId, type, status: 'memory' },
    });

    if (existing) {
        // Update existing
        const doc = await prisma.analysisDocument.update({
            where: { id: existing.id },
            data: {
                title: title || existing.title,
                metadata: JSON.stringify({ chatHistory: messages }),
            },
        });
        res.json({ success: true, data: { docId: doc.id } });
    } else {
        // Verify project exists
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
        if (!project) {
            res.status(404).json({ success: false, error: 'Project not found' });
            return;
        }
        // Create new memory doc
        const doc = await prisma.analysisDocument.create({
            data: {
                type,
                title: title || `${config.name} Session — ${project.name}`,
                projectId,
                status: 'memory',
                metadata: JSON.stringify({ chatHistory: messages }),
            },
        });
        res.json({ success: true, data: { docId: doc.id } });
    }
});

// DELETE /api/analysis/memory/:projectId/:type — Clear saved session
router.delete('/memory/:projectId/:type', async (req: Request, res: Response) => {
    const projectIdResult = idSchema.safeParse(req.params.projectId);
    if (!projectIdResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
    }
    const type = req.params.type;

    await prisma.analysisDocument.deleteMany({
        where: { projectId: projectIdResult.data, type, status: 'memory' },
    });

    res.json({ success: true });
});


// GET /api/analysis/:projectId — List analysis documents for a project
router.get('/:projectId', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.projectId);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
    }

    const docs = await prisma.analysisDocument.findMany({
        where: { projectId: idResult.data },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, type: true, title: true, status: true, createdAt: true, updatedAt: true },
    });

    res.json({ success: true, data: docs });
});

// GET /api/analysis/doc/:id — Get single analysis document
router.get('/doc/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid document ID' });
        return;
    }

    const doc = await prisma.analysisDocument.findUnique({ where: { id: idResult.data } });
    if (!doc) {
        res.status(404).json({ success: false, error: 'Document not found' });
        return;
    }

    res.json({ success: true, data: doc });
});

// DELETE /api/analysis/doc/:id — Delete analysis document
router.delete('/doc/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid document ID' });
        return;
    }

    try {
        await prisma.analysisDocument.delete({ where: { id: idResult.data } });
        res.json({ success: true });
    } catch {
        res.status(404).json({ success: false, error: 'Document not found' });
    }
});

// PUT /api/analysis/doc/:id — Update analysis document content
router.put('/doc/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid document ID' });
        return;
    }

    const bodySchema = z.object({
        title: z.string().min(1).optional(),
        content: z.string().optional(),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    try {
        const updateData: Record<string, string> = {};
        if (parsed.data.title) updateData.title = parsed.data.title;
        if (parsed.data.content !== undefined) updateData.content = parsed.data.content;

        const doc = await prisma.analysisDocument.update({
            where: { id: idResult.data },
            data: updateData,
        });
        res.json({ success: true, data: { id: doc.id, title: doc.title, content: doc.content, status: doc.status } });
    } catch {
        res.status(404).json({ success: false, error: 'Document not found' });
    }
});

// POST /api/analysis/start — Start a new analysis session
router.post('/start', async (req: Request, res: Response) => {
    const schema = z.object({
        projectId: idSchema,
        type: z.enum(['brainstorm', 'market-research', 'domain-research', 'technical-research', 'product-brief']),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { projectId, type } = parsed.data;
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
    if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
    }

    const config = ANALYSIS_TYPES[type as AnalysisType];
    const steps = config.steps;

    // Create draft document
    const doc = await prisma.analysisDocument.create({
        data: {
            type,
            title: `${config.name} — ${project.name}`,
            projectId,
            status: 'draft',
            metadata: JSON.stringify({ chatHistory: [], stepsDone: 0 }),
        },
    });

    // Return greeting + first step
    const greeting = `Chào bạn! Tôi sẽ hướng dẫn bạn thực hiện **${config.name}** cho project **"${project.name}"**.

Quy trình gồm **${steps.length} bước**:
${steps.map((s) => `${s.step}. ${s.name}`).join('\n')}

${steps[0].prompt}`;

    res.json({
        success: true,
        data: {
            docId: doc.id,
            role: 'assistant',
            content: greeting,
            step: 1,
            totalSteps: steps.length,
            steps: steps.map((s) => ({ step: s.step, name: s.name })),
        },
    });
});

// POST /api/analysis/chat — Send message in analysis flow
router.post('/chat', async (req: Request, res: Response) => {
    const schema = z.object({
        docId: idSchema.optional(),
        projectId: idSchema.optional(),
        messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).min(1, 'At least one message required'),
        step: z.number().min(0).max(10),
        type: z.enum(['brainstorm', 'market-research', 'domain-research', 'technical-research', 'product-brief']).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { docId, messages, step } = parsed.data;

    // === Free-form mode (step === 0) — for brainstorming without steps ===
    if (step === 0) {
        const analysisType = parsed.data.type || 'brainstorm';
        const config = ANALYSIS_TYPES[analysisType as AnalysisType];
        if (!config) {
            res.status(400).json({ success: false, error: 'Invalid analysis type' });
            return;
        }

        try {
            const systemPrompt = config.systemPrompt + ANALYSIS_SYSTEM_BASE;
            const conversationHistory = messages.map((m) => `${m.role === 'user' ? 'User' : 'Analyst'}: ${m.content}`).join('\n\n');

            const prompt = `You are in a free-form ${config.name} session.

Conversation so far:
${conversationHistory}

Respond to the user's latest message naturally. Be helpful, structured, and ask follow-up questions when appropriate.
Respond in Vietnamese.`;

            const response = await aiRouter.execute({
                taskType: 'analysis-chat',
                prompt,
                context: systemPrompt,
            });

            res.json({
                success: true,
                data: { role: 'assistant', content: response.content, step: 0 },
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err instanceof Error ? err.message : 'Analysis chat failed',
            });
        }
        return;
    }

    // === Step-based mode (step >= 1) — existing behavior ===
    if (!docId) {
        res.status(400).json({ success: false, error: 'docId is required for step-based chat' });
        return;
    }
    const doc = await prisma.analysisDocument.findUnique({ where: { id: docId } });
    if (!doc) {
        res.status(404).json({ success: false, error: 'Document not found' });
        return;
    }

    const config = ANALYSIS_TYPES[doc.type as AnalysisType];
    if (!config) {
        res.status(400).json({ success: false, error: 'Invalid analysis type' });
        return;
    }

    try {
        const currentStep = config.steps.find((s) => s.step === step);
        const systemPrompt = config.systemPrompt + ANALYSIS_SYSTEM_BASE;
        const conversationHistory = messages.map((m) => `${m.role === 'user' ? 'User' : 'Analyst'}: ${m.content}`).join('\n\n');

        const prompt = `Analysis Type: ${config.name}
Current Step: ${currentStep?.name || ''} (${step}/${config.steps.length})

Conversation:
${conversationHistory}

Based on the user's latest response:
1. Acknowledge and summarize what they shared for "${currentStep?.name || ''}"
2. If incomplete, ask follow-up questions
3. If complete, confirm and ask if ready to proceed
4. Keep responses concise and structured

Respond in Vietnamese.`;

        const response = await aiRouter.execute({
            taskType: 'analysis-chat',
            prompt,
            context: systemPrompt,
        });

        // Save chat history to metadata
        await prisma.analysisDocument.update({
            where: { id: docId! },
            data: { metadata: JSON.stringify({ chatHistory: messages, stepsDone: step }) },
        });

        res.json({
            success: true,
            data: { role: 'assistant', content: response.content, step },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Analysis chat failed',
        });
    }
});

// POST /api/analysis/next-step — Get prompt for next step
router.post('/next-step', async (req: Request, res: Response) => {
    const schema = z.object({ docId: idSchema, step: z.number().min(1).max(10) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid params' });
        return;
    }

    const { docId, step } = parsed.data;
    const doc = await prisma.analysisDocument.findUnique({ where: { id: docId } });
    if (!doc) {
        res.status(404).json({ success: false, error: 'Document not found' });
        return;
    }

    const config = ANALYSIS_TYPES[doc.type as AnalysisType];
    const stepData = config?.steps.find((s) => s.step === step);

    if (!stepData) {
        res.json({
            success: true,
            data: { role: 'assistant', content: 'Tat ca cac buoc da hoan tat! Toi se compile report cho ban...', step, isComplete: true },
        });
        return;
    }

    res.json({
        success: true,
        data: { role: 'assistant', content: stepData.prompt, step: stepData.step },
    });
});

// POST /api/analysis/compile — Compile final report
router.post('/compile', async (req: Request, res: Response) => {
    const schema = z.object({
        docId: idSchema,
        messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { docId, messages } = parsed.data;
    const doc = await prisma.analysisDocument.findUnique({
        where: { id: docId },
        include: { project: { select: { name: true } } },
    });
    if (!doc) {
        res.status(404).json({ success: false, error: 'Document not found' });
        return;
    }

    const config = ANALYSIS_TYPES[doc.type as AnalysisType];

    try {
        const conversationHistory = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n');

        const compilePrompt = `Based on our entire ${config.name} conversation, compile a comprehensive report in Markdown format.

Project: ${doc.project.name}
Analysis Type: ${config.name}

Use this structure:
# ${config.name} Report — ${doc.project.name}

**Date:** ${new Date().toISOString().split('T')[0]}
**Type:** ${config.name}

${config.steps.map((s) => `## ${s.step}. ${s.name}`).join('\n')}

## Key Findings
## Recommendations
## Next Steps

Fill each section with information from our conversation. Be precise, structured, and comprehensive.
Output ONLY the report markdown, no commentary.

Conversation:
${conversationHistory}`;

        const response = await aiRouter.execute({
            taskType: 'analysis-chat',
            prompt: compilePrompt,
            context: config.systemPrompt + ANALYSIS_SYSTEM_BASE,
        });

        // Save compiled report to DB
        await prisma.analysisDocument.update({
            where: { id: docId },
            data: {
                content: response.content,
                status: 'completed',
                metadata: JSON.stringify({ chatHistory: messages, stepsDone: config.steps.length, compiledAt: new Date().toISOString() }),
            },
        });

        res.json({ success: true, data: { content: response.content } });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Compile failed',
        });
    }
});

export default router;
