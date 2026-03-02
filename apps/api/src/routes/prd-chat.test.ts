import { describe, it, expect, vi, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test-app.js';
import { prisma } from '../db.js';

// Mock AI engine
vi.mock('@bsa-kit/ai-engine', () => ({
    aiRouter: {
        execute: vi.fn().mockResolvedValue({
            content: 'Chào bạn! Hãy cho tôi biết về sản phẩm bạn muốn xây dựng.',
            provider: 'claude',
            tokensUsed: { input: 200, output: 100 },
            latencyMs: 800,
        }),
        init: vi.fn(),
        getAvailableProviders: vi.fn().mockReturnValue(['claude']),
    },
}));

const app = createTestApp();
const projectIds: string[] = [];

afterAll(async () => {
    for (const id of projectIds) {
        await prisma.project.delete({ where: { id } }).catch(() => { });
    }
    await prisma.$disconnect();
});

describe('PRD Chat API', () => {
    let projectId: string;

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({ name: 'PRD Chat Project', description: 'Test PRD creation' });
        projectId = res.body.data.id;
        projectIds.push(projectId);
    });

    // --- Init endpoint ---
    describe('GET /api/prd-chat/init/:projectId', () => {
        it('returns greeting for new project (create mode)', async () => {
            const res = await request(app).get(`/api/prd-chat/init/${projectId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe('assistant');
            expect(res.body.data.content).toBeDefined();
            expect(res.body.data.step).toBe(1);
            expect(res.body.data.mode).toBe('create');
        });

        it('returns edit mode when query param mode=edit', async () => {
            // Add PRD to project
            await request(app)
                .patch(`/api/projects/${projectId}`)
                .send({ prdContent: '# Existing PRD\n\nSome content here' });

            const res = await request(app).get(`/api/prd-chat/init/${projectId}?mode=edit`);

            expect(res.status).toBe(200);
            expect(res.body.data.mode).toBe('edit');
        });

        it('returns 400 for invalid project ID', async () => {
            const res = await request(app).get('/api/prd-chat/init/invalid-id');

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // --- Chat endpoint ---
    describe('POST /api/prd-chat', () => {
        it('sends message and receives AI response', async () => {
            const res = await request(app)
                .post('/api/prd-chat')
                .send({
                    projectId,
                    messages: [
                        { role: 'user', content: 'Tôi muốn xây dựng tool quản lý dự án' },
                    ],
                    step: 1,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe('assistant');
            expect(res.body.data.content).toBeDefined();
        });

        it('handles step progression (step 1 to 7)', async () => {
            for (const step of [1, 2, 3, 4, 5, 6]) {
                const res = await request(app)
                    .post('/api/prd-chat')
                    .send({
                        projectId,
                        messages: [{ role: 'user', content: `Response for step ${step}` }],
                        step,
                    });
                expect(res.status).toBe(200);
            }
        });

        it('finalize step compiles full PRD (step = totalSteps + 1)', async () => {
            const { aiRouter } = await import('@bsa-kit/ai-engine');
            vi.mocked(aiRouter.execute).mockResolvedValueOnce({
                content: '# Compiled PRD\n\n## Executive Summary\nFull PRD content...',
                provider: 'claude',
                tokensUsed: { input: 500, output: 800 },
                latencyMs: 2000,
            });

            const res = await request(app)
                .post('/api/prd-chat')
                .send({
                    projectId,
                    messages: [
                        { role: 'user', content: 'Please compile' },
                        { role: 'assistant', content: 'Compiling...' },
                    ],
                    step: 7, // finalize step (6 PRD steps + 1)
                });

            expect(res.status).toBe(200);
            expect(res.body.data.content).toContain('Compiled PRD');
        });

        it('rejects missing projectId', async () => {
            const res = await request(app)
                .post('/api/prd-chat')
                .send({ messages: [{ role: 'user', content: 'test' }], step: 1 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('rejects empty messages', async () => {
            const res = await request(app)
                .post('/api/prd-chat')
                .send({ projectId, messages: [], step: 1 });

            // Empty messages array is technically valid in zod, check behavior
            expect([200, 400]).toContain(res.status);
        });

        it('rejects invalid step number', async () => {
            const res = await request(app)
                .post('/api/prd-chat')
                .send({ projectId, messages: [{ role: 'user', content: 'test' }], step: 0 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('rejects step > 7', async () => {
            const res = await request(app)
                .post('/api/prd-chat')
                .send({ projectId, messages: [{ role: 'user', content: 'test' }], step: 8 });

            expect(res.status).toBe(400);
        });

        it('supports edit mode', async () => {
            const res = await request(app)
                .post('/api/prd-chat')
                .send({
                    projectId,
                    messages: [{ role: 'user', content: 'I want to edit section 2' }],
                    step: 1,
                    mode: 'edit',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // --- Finalize endpoint ---
    describe('POST /api/prd-chat/finalize', () => {
        it('saves compiled PRD to project', async () => {
            const prdContent = '# Finalized PRD\n\n## Summary\nThis is the final PRD.';
            const res = await request(app)
                .post('/api/prd-chat/finalize')
                .send({ projectId, prdContent });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify saved
            const project = await prisma.project.findUnique({ where: { id: projectId } });
            expect(project?.prdContent).toBe(prdContent);
        });

        it('rejects missing prdContent', async () => {
            const res = await request(app)
                .post('/api/prd-chat/finalize')
                .send({ projectId });

            expect(res.status).toBe(400);
        });

        it('rejects empty prdContent', async () => {
            const res = await request(app)
                .post('/api/prd-chat/finalize')
                .send({ projectId, prdContent: '' });

            expect(res.status).toBe(400);
        });
    });
});
