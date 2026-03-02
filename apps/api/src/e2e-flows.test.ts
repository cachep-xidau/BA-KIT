import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from './test-app.js';
import { prisma } from './db.js';

const app = createTestApp();

// Track IDs for cleanup
const projectIds: string[] = [];

afterAll(async () => {
    for (const id of projectIds) {
        await prisma.project.delete({ where: { id } }).catch(() => { });
    }
    await prisma.$disconnect();
});

describe('E2E Flow A: Project → Feature → Function → Generate (validation path)', () => {
    let projectId: string;
    let featureId: string;
    let functionId: string;

    it('step 1: create project', async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({ name: 'E2E Cart Service', description: 'E-commerce checkout flow' });

        expect(res.status).toBe(201);
        projectId = res.body.data.id;
        projectIds.push(projectId);
    });

    it('step 2: add feature to project', async () => {
        const res = await request(app)
            .post('/api/features')
            .send({ projectId, name: 'Payment Processing' });

        expect(res.status).toBe(201);
        featureId = res.body.data.id;
    });

    it('step 3: add function to feature', async () => {
        const res = await request(app)
            .post('/api/functions')
            .send({ featureId, name: 'Process Refund' });

        expect(res.status).toBe(201);
        functionId = res.body.data.id;
    });

    it('step 4: generate rejects without PRD', async () => {
        const res = await request(app)
            .post('/api/generate')
            .send({ functionId, artifactTypes: ['user-story'] });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('PRD');
    });

    it('step 5: add PRD content to project', async () => {
        const res = await request(app)
            .patch(`/api/projects/${projectId}`)
            .send({ prdContent: '# Cart Service PRD\n\n## Overview\nE-commerce checkout system...' });

        expect(res.status).toBe(200);
        expect(res.body.data.prdContent).toContain('Cart Service PRD');
    });

    it('step 6: verify project detail includes feature → function chain', async () => {
        const res = await request(app).get(`/api/projects/${projectId}`);

        expect(res.status).toBe(200);
        expect(res.body.data.features).toHaveLength(1);
        expect(res.body.data.features[0].name).toBe('Payment Processing');
        expect(res.body.data.features[0].functions).toHaveLength(1);
        expect(res.body.data.features[0].functions[0].name).toBe('Process Refund');
    });
});

describe('E2E: Cascade Delete (Project → Features → Functions)', () => {
    it('deleting project cascade removes features and functions', async () => {
        // Create full chain: project → feature → function
        const projectRes = await request(app)
            .post('/api/projects')
            .send({ name: 'Cascade Test Project' });
        const projectId = projectRes.body.data.id;

        const featureRes = await request(app)
            .post('/api/features')
            .send({ projectId, name: 'Cascade Feature' });
        const featureId = featureRes.body.data.id;

        const funcRes = await request(app)
            .post('/api/functions')
            .send({ featureId, name: 'Cascade Function' });
        const functionId = funcRes.body.data.id;

        // Delete project
        const deleteRes = await request(app).delete(`/api/projects/${projectId}`);
        expect(deleteRes.status).toBe(200);

        // Verify feature is gone
        const feature = await prisma.feature.findUnique({ where: { id: featureId } });
        expect(feature).toBeNull();

        // Verify function is gone
        const func = await prisma.function.findUnique({ where: { id: functionId } });
        expect(func).toBeNull();
    });
});

describe('E2E: PRD Content Storage', () => {
    it('stores and retrieves large PRD content', async () => {
        const largePrd = '# Large PRD\n' + 'Section content. '.repeat(5000);

        const createRes = await request(app)
            .post('/api/projects')
            .send({ name: 'Large PRD Project' });
        const projectId = createRes.body.data.id;
        projectIds.push(projectId);

        // Store PRD
        const updateRes = await request(app)
            .patch(`/api/projects/${projectId}`)
            .send({ prdContent: largePrd });
        expect(updateRes.status).toBe(200);

        // Retrieve and verify
        const getRes = await request(app).get(`/api/projects/${projectId}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.data.prdContent).toBe(largePrd);
    });
});

describe('E2E: Project Listing Sort Order', () => {
    it('projects are sorted by updatedAt DESC', async () => {
        // Create first project
        const p1 = await request(app)
            .post('/api/projects')
            .send({ name: 'Sort Test Alpha' });
        projectIds.push(p1.body.data.id);

        // Wait a tiny bit to ensure different timestamps
        await new Promise(r => setTimeout(r, 50));

        // Create second project (newer)
        const p2 = await request(app)
            .post('/api/projects')
            .send({ name: 'Sort Test Beta' });
        projectIds.push(p2.body.data.id);

        // List projects
        const listRes = await request(app).get('/api/projects');
        expect(listRes.status).toBe(200);

        const names = listRes.body.data.map((p: any) => p.name);
        const betaIdx = names.indexOf('Sort Test Beta');
        const alphaIdx = names.indexOf('Sort Test Alpha');

        // Beta (newer) should come before Alpha (older)
        expect(betaIdx).toBeLessThan(alphaIdx);
    });

    it('updating a project moves it to top of list', async () => {
        // Create two projects
        const p1 = await request(app)
            .post('/api/projects')
            .send({ name: 'Update Sort A' });
        projectIds.push(p1.body.data.id);

        await new Promise(r => setTimeout(r, 50));

        const p2 = await request(app)
            .post('/api/projects')
            .send({ name: 'Update Sort B' });
        projectIds.push(p2.body.data.id);

        await new Promise(r => setTimeout(r, 50));

        // Update the OLDER project (p1) → should move to top
        await request(app)
            .patch(`/api/projects/${p1.body.data.id}`)
            .send({ description: 'Now updated' });

        const listRes = await request(app).get('/api/projects');
        const names = listRes.body.data.map((p: any) => p.name);
        const aIdx = names.indexOf('Update Sort A');
        const bIdx = names.indexOf('Update Sort B');

        // A was updated later, should come first
        expect(aIdx).toBeLessThan(bIdx);
    });
});

describe('E2E: Feature → Function Auto-Order Sequential', () => {
    it('multiple features get sequential order within project', async () => {
        const projectRes = await request(app)
            .post('/api/projects')
            .send({ name: 'Order Test Project' });
        const projectId = projectRes.body.data.id;
        projectIds.push(projectId);

        const f1 = await request(app).post('/api/features').send({ projectId, name: 'First' });
        const f2 = await request(app).post('/api/features').send({ projectId, name: 'Second' });
        const f3 = await request(app).post('/api/features').send({ projectId, name: 'Third' });

        expect(f1.body.data.order).toBe(0);
        expect(f2.body.data.order).toBe(1);
        expect(f3.body.data.order).toBe(2);

        // Functions within a feature also get sequential order
        const featureId = f1.body.data.id;
        const fn1 = await request(app).post('/api/functions').send({ featureId, name: 'Fn A' });
        const fn2 = await request(app).post('/api/functions').send({ featureId, name: 'Fn B' });

        expect(fn1.body.data.order).toBe(0);
        expect(fn2.body.data.order).toBe(1);
    });
});
