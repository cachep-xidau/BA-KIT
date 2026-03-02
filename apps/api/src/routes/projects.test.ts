import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test-app.js';
import { prisma } from '../db.js';

const app = createTestApp();

// Track created IDs for cleanup
const createdIds: string[] = [];

afterAll(async () => {
    // Clean up test projects
    for (const id of createdIds) {
        await prisma.project.delete({ where: { id } }).catch(() => { });
    }
    await prisma.$disconnect();
});

describe('Projects API', () => {
    it('POST /api/projects — creates project', async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({ name: 'Test Project', description: 'For testing' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('Test Project');
        expect(res.body.data.id).toBeDefined();
        createdIds.push(res.body.data.id);
    });

    it('POST /api/projects — rejects empty name', async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({ name: '' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/projects — rejects missing name', async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('GET /api/projects — lists projects', async () => {
        const res = await request(app).get('/api/projects');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/projects/:id — returns project', async () => {
        const createRes = await request(app)
            .post('/api/projects')
            .send({ name: 'GetById Project' });
        createdIds.push(createRes.body.data.id);

        const res = await request(app).get(`/api/projects/${createRes.body.data.id}`);
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('GetById Project');
    });

    it('GET /api/projects/:nonexistent — returns 400 for invalid ID', async () => {
        const res = await request(app).get('/api/projects/nonexistent-id-12345');
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('PATCH /api/projects/:id — updates name', async () => {
        const createRes = await request(app)
            .post('/api/projects')
            .send({ name: 'Original' });
        createdIds.push(createRes.body.data.id);

        const res = await request(app)
            .patch(`/api/projects/${createRes.body.data.id}`)
            .send({ name: 'Updated' });

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('Updated');
    });

    it('POST /api/projects — rejects name over 200 chars', async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({ name: 'A'.repeat(201) });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/projects — rejects description over 2000 chars', async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({ name: 'Valid Name', description: 'X'.repeat(2001) });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('DELETE /api/projects/:id — deletes project', async () => {
        const createRes = await request(app)
            .post('/api/projects')
            .send({ name: 'ToDelete' });

        const id = createRes.body.data.id;
        const deleteRes = await request(app).delete(`/api/projects/${id}`);
        expect(deleteRes.status).toBe(200);

        // Verify deleted
        const getRes = await request(app).get(`/api/projects/${id}`);
        expect(getRes.status).toBe(404);
    });
});
