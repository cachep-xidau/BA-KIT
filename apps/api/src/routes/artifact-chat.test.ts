import { describe, it, expect, vi, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test-app.js';
import { prisma } from '../db.js';

// Mock AI engine
vi.mock('@bsa-kit/ai-engine', () => ({
    aiRouter: {
        execute: vi.fn().mockResolvedValue({
            content: 'Tôi đã phân tích PRD. Dưới đây là cấu trúc Epic đề xuất...',
            provider: 'claude',
            tokensUsed: { input: 300, output: 200 },
            latencyMs: 1200,
        }),
        init: vi.fn(),
        getAvailableProviders: vi.fn().mockReturnValue(['claude']),
    },
}));

const app = createTestApp();
const projectIds: string[] = [];

afterAll(async () => {
    for (const id of projectIds) {
        // Clean up artifacts first
        await prisma.artifact.deleteMany({ where: { projectId: id } }).catch(() => { });
        await prisma.project.delete({ where: { id } }).catch(() => { });
    }
    await prisma.$disconnect();
});

describe('Artifact Chat API', () => {
    let projectId: string;

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({ name: 'Artifact Chat Project' });
        projectId = res.body.data.id;
        projectIds.push(projectId);

        // Add PRD so init doesn't warn
        await request(app)
            .patch(`/api/projects/${projectId}`)
            .send({ prdContent: '# Test PRD\n\n## FR-101\nUser can register.' });
    });

    // --- Init endpoint ---
    describe('GET /api/artifact-chat/init/:projectId', () => {
        it('returns greeting with workflow steps', async () => {
            const res = await request(app).get(`/api/artifact-chat/init/${projectId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe('assistant');
            expect(res.body.data.content).toBeDefined();
            expect(res.body.data.step).toBe(1);
        });

        it('indicates PRD status in greeting', async () => {
            const res = await request(app).get(`/api/artifact-chat/init/${projectId}`);

            expect(res.body.data.content).toContain('PRD');
        });

        it('returns 400 for invalid ID', async () => {
            const res = await request(app).get('/api/artifact-chat/init/invalid-id');

            expect(res.status).toBe(400);
        });
    });

    // --- Chat endpoint ---
    describe('POST /api/artifact-chat', () => {
        it('sends message and receives AI response', async () => {
            const res = await request(app)
                .post('/api/artifact-chat')
                .send({
                    projectId,
                    messages: [{ role: 'user', content: 'Đây là các FR cần extract' }],
                    step: 1,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe('assistant');
            expect(res.body.data.content).toBeDefined();
        });

        it('supports multi-step flow', async () => {
            for (const step of [1, 2, 3, 4]) {
                const res = await request(app)
                    .post('/api/artifact-chat')
                    .send({
                        projectId,
                        messages: [{ role: 'user', content: `Step ${step} response` }],
                        step,
                    });
                expect(res.status).toBe(200);
            }
        });

        it('finalize step (step 5) compiles epics', async () => {
            const { aiRouter } = await import('@bsa-kit/ai-engine');
            vi.mocked(aiRouter.execute).mockResolvedValueOnce({
                content: `---EPIC---
TITLE: User Authentication
GOAL: Users can register and login
CONTENT:
Implement registration and login flows.
---END_EPIC---
---STORY---
EPIC: User Authentication
TITLE: US-001: User Registration
CONTENT:
**As a** new user **I want** to register with email **So that** I can access the system.
**Acceptance Criteria:**
- **Given** valid email **When** submitting form **Then** account is created
---END_STORY---`,
                provider: 'claude',
                tokensUsed: { input: 500, output: 600 },
                latencyMs: 2000,
            });

            const res = await request(app)
                .post('/api/artifact-chat')
                .send({
                    projectId,
                    messages: [
                        { role: 'user', content: 'Compile all epics' },
                        { role: 'assistant', content: 'Compiling...' },
                    ],
                    step: 5,
                });

            expect(res.status).toBe(200);
            expect(res.body.data.content).toContain('EPIC');
        });

        it('rejects missing projectId', async () => {
            const res = await request(app)
                .post('/api/artifact-chat')
                .send({ messages: [{ role: 'user', content: 'test' }], step: 1 });

            expect(res.status).toBe(400);
        });

        it('rejects invalid step', async () => {
            const res = await request(app)
                .post('/api/artifact-chat')
                .send({ projectId, messages: [{ role: 'user', content: 'test' }], step: 0 });

            expect(res.status).toBe(400);
        });

        it('rejects step > 5', async () => {
            const res = await request(app)
                .post('/api/artifact-chat')
                .send({ projectId, messages: [{ role: 'user', content: 'test' }], step: 6 });

            expect(res.status).toBe(400);
        });
    });

    // --- Finalize endpoint ---
    describe('POST /api/artifact-chat/finalize', () => {
        it('saves epics and stories to database', async () => {
            const res = await request(app)
                .post('/api/artifact-chat/finalize')
                .send({
                    projectId,
                    epics: [
                        {
                            title: 'Epic 1: Project Management',
                            content: 'Users can manage projects with CRUD operations.',
                            stories: [
                                { title: 'US-001: Create Project', content: 'As a BSA I want to create a project.' },
                                { title: 'US-002: Delete Project', content: 'As a BSA I want to delete a project.' },
                            ],
                        },
                        {
                            title: 'Epic 2: Artifact Generation',
                            content: 'Users can generate analysis artifacts from PRD.',
                            stories: [
                                { title: 'US-003: Generate User Story', content: 'As a BSA I want to generate user stories.' },
                            ],
                        },
                    ],
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.epics).toHaveLength(2);
            expect(res.body.data.stories).toHaveLength(3);
        });

        it('saved epics persist in database', async () => {
            const artifacts = await prisma.artifact.findMany({
                where: { projectId, type: 'epic' },
            });
            expect(artifacts.length).toBeGreaterThanOrEqual(2);
        });

        it('saved stories link to epics', async () => {
            const stories = await prisma.artifact.findMany({
                where: { projectId, type: 'user-story' },
            });
            expect(stories.length).toBeGreaterThanOrEqual(3);
            // Each story should have an epicId
            for (const story of stories) {
                expect(story.epicId).toBeDefined();
            }
        });

        it('rejects missing epics array', async () => {
            const res = await request(app)
                .post('/api/artifact-chat/finalize')
                .send({ projectId });

            expect(res.status).toBe(400);
        });

        it('accepts empty epic title (Zod allows z.string())', async () => {
            const res = await request(app)
                .post('/api/artifact-chat/finalize')
                .send({
                    projectId,
                    epics: [{ title: '', content: 'content', stories: [] }],
                });

            expect(res.status).toBe(201);
        });
    });

    // --- Next-step endpoint (POST) ---
    describe('POST /api/artifact-chat/next-step', () => {
        it('returns prompt for valid step', async () => {
            const res = await request(app)
                .post('/api/artifact-chat/next-step')
                .send({ step: 2 });

            expect(res.status).toBe(200);
            expect(res.body.data.step).toBe(2);
            expect(res.body.data.content).toBeDefined();
        });

        it('returns completion when past last step', async () => {
            const res = await request(app)
                .post('/api/artifact-chat/next-step')
                .send({ step: 5 });

            expect(res.status).toBe(200);
            expect(res.body.data.isComplete).toBe(true);
        });
    });
});
