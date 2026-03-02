import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test-app.js';
import { prisma } from '../db.js';

const app = createTestApp();

// Track IDs for cleanup
const projectIds: string[] = [];
const featureIds: string[] = [];
const functionIds: string[] = [];

afterAll(async () => {
    // Cleanup in reverse order: artifacts → functions → features → projects
    for (const id of functionIds) {
        await prisma.artifact.deleteMany({ where: { functionId: id } }).catch(() => { });
        await prisma.function.delete({ where: { id } }).catch(() => { });
    }
    for (const id of featureIds) {
        await prisma.feature.delete({ where: { id } }).catch(() => { });
    }
    for (const id of projectIds) {
        await prisma.project.delete({ where: { id } }).catch(() => { });
    }
    await prisma.$disconnect();
});

describe('Generate API — Validation', () => {
    it('POST /api/generate — rejects missing functionId', async () => {
        const res = await request(app)
            .post('/api/generate')
            .send({ artifactTypes: ['srs'] });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/generate — rejects empty artifact types', async () => {
        const res = await request(app)
            .post('/api/generate')
            .send({ functionId: 'invalidcuid01234567890', artifactTypes: [] });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/generate — rejects invalid artifact type', async () => {
        const res = await request(app)
            .post('/api/generate')
            .send({ functionId: 'invalidcuid01234567890', artifactTypes: ['invalid'] });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/generate — rejects function with no PRD in project', async () => {
        // Create project → feature → function chain
        const projectRes = await request(app)
            .post('/api/projects')
            .send({ name: 'NoPrdProject' });
        projectIds.push(projectRes.body.data.id);

        const featureRes = await request(app)
            .post('/api/features')
            .send({ projectId: projectRes.body.data.id, name: 'Test Feature' });
        featureIds.push(featureRes.body.data.id);

        const functionRes = await request(app)
            .post('/api/functions')
            .send({ featureId: featureRes.body.data.id, name: 'Test Function' });
        functionIds.push(functionRes.body.data.id);

        const res = await request(app)
            .post('/api/generate')
            .send({
                functionId: functionRes.body.data.id,
                artifactTypes: ['user-story'],
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('PRD');
    });

    it('GET /api/generate/artifact/:nonexistent — returns 400 for invalid ID', async () => {
        const res = await request(app).get('/api/generate/artifact/nonexistentid12345678');

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});
