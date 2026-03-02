import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BUILT_IN_SKILLS = [
    // === WORKFLOWS (multi-step guided chat) ===
    {
        name: 'Brainstorming',
        description: 'Generate & organize ideas using creative techniques',
        type: 'workflow',
        category: 'analysis',
        icon: 'Lightbulb',
        triggerType: 'navigate',
        triggerConfig: JSON.stringify({ tab: 'analysis', type: 'brainstorm' }),
        sortOrder: 1,
    },
    {
        name: 'Market Research',
        description: 'Market size, competition, TAM/SAM/SOM analysis',
        type: 'workflow',
        category: 'analysis',
        icon: 'TrendingUp',
        triggerType: 'navigate',
        triggerConfig: JSON.stringify({ tab: 'analysis', type: 'market-research' }),
        sortOrder: 2,
    },
    {
        name: 'Domain Research',
        description: 'Industry deep-dive, regulations, domain mapping',
        type: 'workflow',
        category: 'analysis',
        icon: 'Building2',
        triggerType: 'navigate',
        triggerConfig: JSON.stringify({ tab: 'analysis', type: 'domain-research' }),
        sortOrder: 3,
    },
    {
        name: 'Technical Research',
        description: 'Architecture, tech stack evaluation, ADR',
        type: 'workflow',
        category: 'analysis',
        icon: 'Wrench',
        triggerType: 'navigate',
        triggerConfig: JSON.stringify({ tab: 'analysis', type: 'technical-research' }),
        sortOrder: 4,
    },
    {
        name: 'Product Brief',
        description: 'Vision, target users, core features, success metrics',
        type: 'workflow',
        category: 'analysis',
        icon: 'Briefcase',
        triggerType: 'navigate',
        triggerConfig: JSON.stringify({ tab: 'analysis', type: 'product-brief' }),
        sortOrder: 5,
    },
    {
        name: 'Create PRD',
        description: '6-step BMAD PRD creation flow',
        type: 'workflow',
        category: 'prd',
        icon: 'FilePlus',
        triggerType: 'navigate',
        triggerConfig: JSON.stringify({ tab: 'prd', action: 'create' }),
        sortOrder: 6,
    },
    {
        name: 'Edit PRD',
        description: '4-step PRD review & edit workflow',
        type: 'workflow',
        category: 'prd',
        icon: 'FileEdit',
        triggerType: 'navigate',
        triggerConfig: JSON.stringify({ tab: 'prd', action: 'edit' }),
        sortOrder: 7,
    },
    {
        name: 'Generate Epics',
        description: 'AI-powered epic & story breakdown from PRD',
        type: 'workflow',
        category: 'artifact',
        icon: 'Layers',
        triggerType: 'navigate',
        triggerConfig: JSON.stringify({ tab: 'artifacts', action: 'generate' }),
        sortOrder: 8,
    },

    // === SKILLS (single-action tools) ===
    {
        name: 'SWOT Generator',
        description: 'Generate SWOT matrix from project context',
        type: 'skill',
        category: 'analysis',
        icon: 'Grid3x3',
        triggerType: 'modal',
        triggerConfig: JSON.stringify({ prompt: 'Generate a comprehensive SWOT analysis' }),
        sortOrder: 9,
    },
    {
        name: 'Competitor Matrix',
        description: 'Compare features across competitors',
        type: 'skill',
        category: 'analysis',
        icon: 'BarChart3',
        triggerType: 'modal',
        triggerConfig: JSON.stringify({ prompt: 'Generate a competitor comparison matrix' }),
        sortOrder: 10,
    },
    {
        name: 'User Persona Builder',
        description: 'Generate user personas from project docs',
        type: 'skill',
        category: 'analysis',
        icon: 'Users',
        triggerType: 'modal',
        triggerConfig: JSON.stringify({ prompt: 'Generate user personas' }),
        sortOrder: 11,
    },
    {
        name: 'Requirements Extractor',
        description: 'Extract FR/NFR list from PRD',
        type: 'skill',
        category: 'prd',
        icon: 'ListChecks',
        triggerType: 'modal',
        triggerConfig: JSON.stringify({ prompt: 'Extract all functional and non-functional requirements' }),
        sortOrder: 12,
    },
    {
        name: 'Export Artifacts',
        description: 'Bundle all artifacts as JSON export',
        type: 'skill',
        category: 'utility',
        icon: 'Download',
        triggerType: 'navigate',
        triggerConfig: JSON.stringify({ tab: 'artifacts', action: 'export' }),
        sortOrder: 13,
    },
    {
        name: 'PRD Validator',
        description: 'Run BMAD quality check on PRD',
        type: 'skill',
        category: 'prd',
        icon: 'ShieldCheck',
        triggerType: 'navigate',
        triggerConfig: JSON.stringify({ tab: 'prd', action: 'validate' }),
        sortOrder: 14,
    },

    // === AGENTS (conversational AI) ===
    {
        name: 'BSA Advisor',
        description: 'General BSA methodology guidance & best practices',
        type: 'agent',
        category: 'advisor',
        icon: 'Bot',
        triggerType: 'chat',
        triggerConfig: JSON.stringify({
            systemPrompt: 'You are a senior Business Systems Analyst advisor. Help users with BSA methodology, requirements gathering, stakeholder management, and best practices. Respond in Vietnamese.',
        }),
        sortOrder: 15,
    },
    {
        name: 'Requirements Analyst',
        description: 'Refine unclear requirements into actionable specs',
        type: 'agent',
        category: 'advisor',
        icon: 'MessageSquareText',
        triggerType: 'chat',
        triggerConfig: JSON.stringify({
            systemPrompt: 'You are a Requirements Analyst AI. Help users clarify vague requirements into specific, measurable, testable specifications. Use techniques like user story mapping, acceptance criteria definition, and edge case analysis. Respond in Vietnamese.',
        }),
        sortOrder: 16,
    },
    {
        name: 'Technical Architect',
        description: 'Architecture decisions, system design, ADRs',
        type: 'agent',
        category: 'advisor',
        icon: 'Cpu',
        triggerType: 'chat',
        triggerConfig: JSON.stringify({
            systemPrompt: 'You are a Technical Architect AI. Help users make architecture decisions, evaluate technology stacks, design system components, and write Architecture Decision Records (ADRs). Respond in Vietnamese.',
        }),
        sortOrder: 17,
    },
];

async function main() {
    console.log('Seeding skills...');

    // Upsert each skill (by name + builtIn)
    for (const skill of BUILT_IN_SKILLS) {
        const existing = await prisma.skill.findFirst({
            where: { name: skill.name, builtIn: true },
        });

        if (existing) {
            await prisma.skill.update({
                where: { id: existing.id },
                data: skill,
            });
            console.log(`  Updated: ${skill.name}`);
        } else {
            await prisma.skill.create({ data: { ...skill, builtIn: true } });
            console.log(`  Created: ${skill.name}`);
        }
    }

    console.log(`Done — ${BUILT_IN_SKILLS.length} skills seeded.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
