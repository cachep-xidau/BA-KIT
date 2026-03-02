import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test-app.js';

const app = createTestApp();

describe('MCP API — Validation', () => {
    it('POST /api/mcp/connect — rejects missing name', async () => {
        const res = await request(app)
            .post('/api/mcp/connect')
            .send({ type: 'figma', projectId: 'default', credentials: { token: 'x' } });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/mcp/connect — rejects missing type', async () => {
        const res = await request(app)
            .post('/api/mcp/connect')
            .send({ name: 'Test', projectId: 'default', credentials: { token: 'x' } });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/mcp/connect — rejects invalid type', async () => {
        const res = await request(app)
            .post('/api/mcp/connect')
            .send({ name: 'Test', type: 'invalid-type', projectId: 'default', credentials: {} });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/mcp/connect — rejects missing credentials', async () => {
        const res = await request(app)
            .post('/api/mcp/connect')
            .send({ name: 'Test', type: 'figma', projectId: 'default' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/mcp/connect — rejects Figma with no token', async () => {
        const res = await request(app)
            .post('/api/mcp/connect')
            .send({ name: 'Test', type: 'figma', projectId: 'default', credentials: {} });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/mcp/connect — rejects Confluence with missing fields', async () => {
        const res = await request(app)
            .post('/api/mcp/connect')
            .send({
                name: 'Test',
                type: 'confluence',
                projectId: 'default',
                credentials: { baseUrl: 'https://x.atlassian.net/wiki' },
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('GET /api/mcp/status — returns array', async () => {
        const res = await request(app).get('/api/mcp/status');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/mcp/tools — returns array', async () => {
        const res = await request(app).get('/api/mcp/tools');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
