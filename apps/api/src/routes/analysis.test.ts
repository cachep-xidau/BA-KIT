import { describe, it, expect, vi, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test-app.js';
import { prisma } from '../db.js';

// Mock AI engine
vi.mock('@bsa-kit/ai-engine', () => ({
    aiRouter: {
        execute: vi.fn().mockResolvedValue({
            content: 'Tuyệt vời! Tôi sẽ phân tích ý tưởng của bạn.',
            provider: 'claude',
            tokensUsed: { input: 150, output: 100 },
            latencyMs: 700,
        }),
        init: vi.fn(),
        getAvailableProviders: vi.fn().mockReturnValue(['claude']),
    },
}));

const app = createTestApp();
const projectIds: string[] = [];
const docIds: string[] = [];

afterAll(async () => {
    for (const id of docIds) {
        await prisma.analysisDocument.delete({ where: { id } }).catch(() => { });
    }
    for (const id of projectIds) {
        await prisma.analysisDocument.deleteMany({ where: { projectId: id } }).catch(() => { });
        await prisma.project.delete({ where: { id } }).catch(() => { });
    }
    await prisma.$disconnect();
});

describe('Analysis API', () => {
    let projectId: string;

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({ name: 'Analysis Test Project' });
        projectId = res.body.data.id;
        projectIds.push(projectId);
    });

    // --- Start endpoint ---
    describe('POST /api/analysis/start', () => {
        it('starts brainstorm session', async () => {
            const res = await request(app)
                .post('/api/analysis/start')
                .send({ projectId, type: 'brainstorm' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.docId).toBeDefined();
            expect(res.body.data.step).toBe(1);
            expect(res.body.data.totalSteps).toBe(4); // brainstorm has 4 steps
            expect(res.body.data.content).toContain('Brainstorming');
            docIds.push(res.body.data.docId);
        });

        it('starts market research session', async () => {
            const res = await request(app)
                .post('/api/analysis/start')
                .send({ projectId, type: 'market-research' });

            expect(res.status).toBe(200);
            expect(res.body.data.totalSteps).toBe(6); // market research has 6 steps
            expect(res.body.data.content).toContain('Market Research');
            docIds.push(res.body.data.docId);
        });

        it('starts domain research session', async () => {
            const res = await request(app)
                .post('/api/analysis/start')
                .send({ projectId, type: 'domain-research' });

            expect(res.status).toBe(200);
            expect(res.body.data.totalSteps).toBe(6);
            docIds.push(res.body.data.docId);
        });

        it('starts technical research session', async () => {
            const res = await request(app)
                .post('/api/analysis/start')
                .send({ projectId, type: 'technical-research' });

            expect(res.status).toBe(200);
            expect(res.body.data.totalSteps).toBe(6);
            docIds.push(res.body.data.docId);
        });

        it('starts product brief session', async () => {
            const res = await request(app)
                .post('/api/analysis/start')
                .send({ projectId, type: 'product-brief' });

            expect(res.status).toBe(200);
            expect(res.body.data.totalSteps).toBe(6);
            docIds.push(res.body.data.docId);
        });

        it('creates draft document in DB', async () => {
            const res = await request(app)
                .post('/api/analysis/start')
                .send({ projectId, type: 'brainstorm' });

            const doc = await prisma.analysisDocument.findUnique({
                where: { id: res.body.data.docId },
            });
            expect(doc).not.toBeNull();
            expect(doc?.type).toBe('brainstorm');
            expect(doc?.status).toBe('draft');
            docIds.push(res.body.data.docId);
        });

        it('rejects invalid analysis type', async () => {
            const res = await request(app)
                .post('/api/analysis/start')
                .send({ projectId, type: 'invalid-type' });

            expect(res.status).toBe(400);
        });

        it('rejects missing projectId', async () => {
            const res = await request(app)
                .post('/api/analysis/start')
                .send({ type: 'brainstorm' });

            expect(res.status).toBe(400);
        });

        it('returns 404 for nonexistent project', async () => {
            const res = await request(app)
                .post('/api/analysis/start')
                .send({ projectId: 'cm00000000000000000000000', type: 'brainstorm' });

            expect(res.status).toBe(404);
        });
    });

    // --- List documents ---
    describe('GET /api/analysis/:projectId', () => {
        it('lists analysis documents for project', async () => {
            const res = await request(app).get(`/api/analysis/${projectId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(5);
        });

        it('returns documents with correct fields', async () => {
            const res = await request(app).get(`/api/analysis/${projectId}`);

            const doc = res.body.data[0];
            expect(doc.id).toBeDefined();
            expect(doc.type).toBeDefined();
            expect(doc.title).toBeDefined();
            expect(doc.status).toBeDefined();
            expect(doc.createdAt).toBeDefined();
        });

        it('returns 400 for invalid project ID', async () => {
            const res = await request(app).get('/api/analysis/invalid-id');

            expect(res.status).toBe(400);
        });
    });

    // --- Get single document ---
    describe('GET /api/analysis/doc/:id', () => {
        it('returns single document', async () => {
            const docId = docIds[0];
            const res = await request(app).get(`/api/analysis/doc/${docId}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(docId);
            expect(res.body.data.type).toBe('brainstorm');
        });

        it('returns 404 for nonexistent doc', async () => {
            const res = await request(app).get('/api/analysis/doc/cm00000000000000000000000');

            expect(res.status).toBe(404);
        });

        it('returns 400 for invalid ID', async () => {
            const res = await request(app).get('/api/analysis/doc/invalid-id');

            expect(res.status).toBe(400);
        });
    });

    // --- Update document ---
    describe('PUT /api/analysis/doc/:id', () => {
        it('updates document title', async () => {
            const docId = docIds[0];
            const res = await request(app)
                .put(`/api/analysis/doc/${docId}`)
                .send({ title: 'Updated Brainstorm Title' });

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Updated Brainstorm Title');
        });

        it('updates document content', async () => {
            const docId = docIds[0];
            const res = await request(app)
                .put(`/api/analysis/doc/${docId}`)
                .send({ content: '# Updated Report\n\nNew content here.' });

            expect(res.status).toBe(200);
            expect(res.body.data.content).toContain('Updated Report');
        });

        it('returns 404 for nonexistent doc', async () => {
            const res = await request(app)
                .put('/api/analysis/doc/cm00000000000000000000000')
                .send({ title: 'Ghost' });

            expect(res.status).toBe(404);
        });
    });

    // --- Delete document ---
    describe('DELETE /api/analysis/doc/:id', () => {
        it('deletes document', async () => {
            // Create a doc to delete
            const startRes = await request(app)
                .post('/api/analysis/start')
                .send({ projectId, type: 'brainstorm' });
            const deleteDocId = startRes.body.data.docId;

            const res = await request(app).delete(`/api/analysis/doc/${deleteDocId}`);
            expect(res.status).toBe(200);

            // Verify deleted
            const doc = await prisma.analysisDocument.findUnique({ where: { id: deleteDocId } });
            expect(doc).toBeNull();
        });

        it('returns 404 for nonexistent doc', async () => {
            const res = await request(app).delete('/api/analysis/doc/cm00000000000000000000000');
            expect(res.status).toBe(404);
        });
    });

    // --- Chat endpoint ---
    describe('POST /api/analysis/chat', () => {
        it('sends message and receives AI response', async () => {
            const docId = docIds[0];
            const res = await request(app)
                .post('/api/analysis/chat')
                .send({
                    docId,
                    messages: [{ role: 'user', content: 'I want to brainstorm about AI tools' }],
                    step: 1,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe('assistant');
            expect(res.body.data.content).toBeDefined();
            expect(res.body.data.step).toBe(1);
        });

        it('saves chat history to metadata', async () => {
            const docId = docIds[0];
            await request(app)
                .post('/api/analysis/chat')
                .send({
                    docId,
                    messages: [{ role: 'user', content: 'Testing metadata save' }],
                    step: 2,
                });

            const doc = await prisma.analysisDocument.findUnique({ where: { id: docId } });
            const metadata = JSON.parse(doc?.metadata as string);
            expect(metadata.chatHistory).toBeDefined();
            expect(metadata.stepsDone).toBe(2);
        });

        it('rejects missing docId', async () => {
            const res = await request(app)
                .post('/api/analysis/chat')
                .send({ messages: [{ role: 'user', content: 'test' }], step: 1 });

            expect(res.status).toBe(400);
        });

        it('returns 404 for nonexistent doc', async () => {
            const res = await request(app)
                .post('/api/analysis/chat')
                .send({
                    docId: 'cm00000000000000000000000',
                    messages: [{ role: 'user', content: 'test' }],
                    step: 1,
                });

            expect(res.status).toBe(404);
        });
    });

    // --- Next step endpoint ---
    describe('POST /api/analysis/next-step', () => {
        it('returns prompt for next step', async () => {
            const docId = docIds[0]; // brainstorm doc
            const res = await request(app)
                .post('/api/analysis/next-step')
                .send({ docId, step: 2 });

            expect(res.status).toBe(200);
            expect(res.body.data.step).toBe(2);
            expect(res.body.data.content).toBeDefined();
        });

        it('returns completion when past last step', async () => {
            const docId = docIds[0]; // brainstorm has 4 steps
            const res = await request(app)
                .post('/api/analysis/next-step')
                .send({ docId, step: 5 });

            expect(res.status).toBe(200);
            expect(res.body.data.isComplete).toBe(true);
        });

        it('returns 404 for nonexistent doc', async () => {
            const res = await request(app)
                .post('/api/analysis/next-step')
                .send({ docId: 'cm00000000000000000000000', step: 1 });

            expect(res.status).toBe(404);
        });
    });

    // --- Compile endpoint ---
    describe('POST /api/analysis/compile', () => {
        it('compiles AI report and saves to DB', async () => {
            const { aiRouter } = await import('@bsa-kit/ai-engine');
            vi.mocked(aiRouter.execute).mockResolvedValueOnce({
                content: '# Brainstorming Report\n\n## Key Findings\nSeveral promising ideas identified.',
                provider: 'claude',
                tokensUsed: { input: 800, output: 600 },
                latencyMs: 3000,
            });

            const docId = docIds[0];
            const res = await request(app)
                .post('/api/analysis/compile')
                .send({
                    docId,
                    messages: [
                        { role: 'user', content: 'AI tools brainstorm' },
                        { role: 'assistant', content: 'Great ideas!' },
                    ],
                });

            expect(res.status).toBe(200);
            expect(res.body.data.content).toContain('Brainstorming Report');

            // Verify saved to DB
            const doc = await prisma.analysisDocument.findUnique({ where: { id: docId } });
            expect(doc?.content).toContain('Brainstorming Report');
            expect(doc?.status).toBe('completed');
        });

        it('rejects missing docId', async () => {
            const res = await request(app)
                .post('/api/analysis/compile')
                .send({ messages: [{ role: 'user', content: 'test' }] });

            expect(res.status).toBe(400);
        });

        it('returns 404 for nonexistent doc', async () => {
            const res = await request(app)
                .post('/api/analysis/compile')
                .send({
                    docId: 'cm00000000000000000000000',
                    messages: [{ role: 'user', content: 'test' }],
                });

            expect(res.status).toBe(404);
        });
    });
});
