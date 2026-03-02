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

describe('Functions API', () => {
    let projectId: string;
    let featureId: string;

    // Setup: create project → feature chain
    it('setup — creates project and feature', async () => {
        const projectRes = await request(app)
            .post('/api/projects')
            .send({ name: 'Function Test Project' });
        projectId = projectRes.body.data.id;
        projectIds.push(projectId);

        const featureRes = await request(app)
            .post('/api/features')
            .send({ projectId, name: 'Test Feature' });
        featureId = featureRes.body.data.id;
    });

    it('POST /api/functions — creates function with auto-order', async () => {
        const res = await request(app)
            .post('/api/functions')
            .send({ featureId, name: 'Process Refund', description: 'Handle refund requests' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('Process Refund');
        expect(res.body.data.order).toBe(0);
        expect(res.body.data.featureId).toBe(featureId);
    });

    it('POST /api/functions — second function gets order=1', async () => {
        const res = await request(app)
            .post('/api/functions')
            .send({ featureId, name: 'Validate Payment' });

        expect(res.status).toBe(201);
        expect(res.body.data.order).toBe(1);
    });

    it('POST /api/functions — rejects missing featureId', async () => {
        const res = await request(app)
            .post('/api/functions')
            .send({ name: 'Orphan Function' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/functions — rejects empty name', async () => {
        const res = await request(app)
            .post('/api/functions')
            .send({ featureId, name: '' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('GET /api/functions/:featureId — lists functions ordered', async () => {
        const res = await request(app).get(`/api/functions/${featureId}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        expect(res.body.data[0].order).toBeLessThanOrEqual(res.body.data[1].order);
    });

    it('PATCH /api/functions/:id — updates function name', async () => {
        const createRes = await request(app)
            .post('/api/functions')
            .send({ featureId, name: 'Original Function' });
        const funcId = createRes.body.data.id;

        const res = await request(app)
            .patch(`/api/functions/${funcId}`)
            .send({ name: 'Renamed Function' });

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('Renamed Function');
    });

    it('PATCH /api/functions/:nonexistent — returns 400 for invalid ID', async () => {
        const res = await request(app)
            .patch('/api/functions/clxxxxxxxxxxxxxxxxxxxxxxxxx')
            .send({ name: 'Ghost' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('DELETE /api/functions/:id — deletes function', async () => {
        const createRes = await request(app)
            .post('/api/functions')
            .send({ featureId, name: 'ToDelete Function' });
        const funcId = createRes.body.data.id;

        const deleteRes = await request(app).delete(`/api/functions/${funcId}`);
        expect(deleteRes.status).toBe(200);

        // Verify deleted
        const func = await prisma.function.findUnique({ where: { id: funcId } });
        expect(func).toBeNull();
    });
});
