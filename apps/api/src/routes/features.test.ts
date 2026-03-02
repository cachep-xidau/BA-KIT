import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test-app.js';
import { prisma } from '../db.js';

const app = createTestApp();

// Track IDs for cleanup
const projectIds: string[] = [];

afterAll(async () => {
    for (const id of projectIds) {
        await prisma.project.delete({ where: { id } }).catch(() => { });
    }
    await prisma.$disconnect();
});

describe('Features API', () => {
    let projectId: string;

    // Setup: create a project for all feature tests
    it('setup — creates a project for feature tests', async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({ name: 'Feature Test Project' });

        expect(res.status).toBe(201);
        projectId = res.body.data.id;
        projectIds.push(projectId);
    });

    it('POST /api/features — creates feature with auto-order', async () => {
        const res = await request(app)
            .post('/api/features')
            .send({ projectId, name: 'Payment Processing', description: 'Handle payments' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('Payment Processing');
        expect(res.body.data.order).toBe(0);
        expect(res.body.data.projectId).toBe(projectId);
    });

    it('POST /api/features — second feature gets order=1', async () => {
        const res = await request(app)
            .post('/api/features')
            .send({ projectId, name: 'User Management' });

        expect(res.status).toBe(201);
        expect(res.body.data.order).toBe(1);
    });

    it('POST /api/features — rejects missing projectId', async () => {
        const res = await request(app)
            .post('/api/features')
            .send({ name: 'No Project' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/features — rejects empty name', async () => {
        const res = await request(app)
            .post('/api/features')
            .send({ projectId, name: '' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('GET /api/features/:projectId — lists features ordered by order ASC', async () => {
        const res = await request(app).get(`/api/features/${projectId}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        // Verify order
        expect(res.body.data[0].order).toBeLessThanOrEqual(res.body.data[1].order);
    });

    it('PATCH /api/features/:id — updates feature name', async () => {
        // Create a feature to update
        const createRes = await request(app)
            .post('/api/features')
            .send({ projectId, name: 'Original Feature' });
        const featureId = createRes.body.data.id;

        const res = await request(app)
            .patch(`/api/features/${featureId}`)
            .send({ name: 'Updated Feature' });

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('Updated Feature');
    });

    it('PATCH /api/features/:nonexistent — returns 400 for invalid ID', async () => {
        const res = await request(app)
            .patch('/api/features/clxxxxxxxxxxxxxxxxxxxxxxxxx')
            .send({ name: 'Ghost' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('DELETE /api/features/:id — deletes feature and cascade deletes functions', async () => {
        // Create feature + function chain
        const featureRes = await request(app)
            .post('/api/features')
            .send({ projectId, name: 'ToDelete Feature' });
        const featureId = featureRes.body.data.id;

        const funcRes = await request(app)
            .post('/api/functions')
            .send({ featureId, name: 'Child Function' });
        const functionId = funcRes.body.data.id;

        // Delete feature
        const deleteRes = await request(app).delete(`/api/features/${featureId}`);
        expect(deleteRes.status).toBe(200);

        // Verify function is cascade deleted
        const func = await prisma.function.findUnique({ where: { id: functionId } });
        expect(func).toBeNull();
    });
});
