import { describe, it, expect, vi, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test-app.js';
import { prisma } from '../db.js';

// Mock AI engine
vi.mock('@bsa-kit/ai-engine', () => ({
    aiRouter: {
        execute: vi.fn().mockResolvedValue({
            content: JSON.stringify({
                overallStatus: 'Pass',
                holisticScore: 4,
                checks: [
                    { name: 'Information Density', status: 'Pass', score: 90, findings: [], recommendation: 'Good' },
                    { name: 'Measurability', status: 'Pass', score: 85, findings: ['Minor vague term'], recommendation: 'Add metrics' },
                    { name: 'Traceability', status: 'Pass', score: 95, findings: [], recommendation: 'Excellent' },
                    { name: 'Implementation Leakage', status: 'Warning', score: 70, findings: ['Found: Express 5'], recommendation: 'Remove tech names' },
                    { name: 'SMART Compliance', status: 'Pass', score: 88, findings: [], recommendation: 'Good' },
                    { name: 'Completeness', status: 'Pass', score: 100, findings: [], recommendation: 'All sections present' },
                ],
                strengths: ['Well-structured', 'Clear requirements'],
                topImprovements: ['Remove implementation details', 'Add more metrics', 'Improve traceability'],
                summary: 'PRD đạt chất lượng tốt với một số điểm cần cải thiện.',
            }),
            provider: 'claude',
            tokensUsed: { input: 500, output: 300 },
            latencyMs: 1000,
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

describe('PRD Validate API', () => {
    let projectWithPrd: string;
    let projectWithoutPrd: string;

    beforeAll(async () => {
        // Create project WITH PRD
        const res1 = await request(app)
            .post('/api/projects')
            .send({ name: 'PRD Validate Test', description: 'Has PRD content' });
        projectWithPrd = res1.body.data.id;
        projectIds.push(projectWithPrd);

        // Add PRD content
        await request(app)
            .patch(`/api/projects/${projectWithPrd}`)
            .send({
                prdContent: `# Product Requirements Document - BSA Kit

## Executive Summary
BSA Kit là bộ công cụ AI-First giúp Business System Analyst tự động hóa quy trình phân tích yêu cầu.

## Success Criteria
- Giảm 70-80% thời gian tạo tài liệu
- API response time < 200ms

## Functional Requirements
### FR-101: Project CRUD
BSA can tạo project mới với tên (1-200 ký tự).

## Non-Functional Requirements
### NFR-101: Performance
API response time (non-AI endpoints) < 200ms.`,
            });

        // Create project WITHOUT PRD
        const res2 = await request(app)
            .post('/api/projects')
            .send({ name: 'No PRD Project' });
        projectWithoutPrd = res2.body.data.id;
        projectIds.push(projectWithoutPrd);
    });

    it('POST /api/prd-validate — validates PRD successfully', async () => {
        const res = await request(app)
            .post('/api/prd-validate')
            .send({ projectId: projectWithPrd });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.overallStatus).toBe('Pass');
        expect(res.body.data.holisticScore).toBe(4);
        expect(res.body.data.checks).toHaveLength(6);
        expect(res.body.data.strengths).toEqual(expect.arrayContaining(['Well-structured']));
        expect(res.body.data.topImprovements).toHaveLength(3);
        expect(res.body.data.summary).toBeDefined();
    });

    it('POST /api/prd-validate — checks all 6 BMAD criteria', async () => {
        const res = await request(app)
            .post('/api/prd-validate')
            .send({ projectId: projectWithPrd });

        const checkNames = res.body.data.checks.map((c: any) => c.name);
        expect(checkNames).toContain('Information Density');
        expect(checkNames).toContain('Measurability');
        expect(checkNames).toContain('Traceability');
        expect(checkNames).toContain('Implementation Leakage');
        expect(checkNames).toContain('SMART Compliance');
        expect(checkNames).toContain('Completeness');
    });

    it('POST /api/prd-validate — each check has score and status', async () => {
        const res = await request(app)
            .post('/api/prd-validate')
            .send({ projectId: projectWithPrd });

        for (const check of res.body.data.checks) {
            expect(check.status).toMatch(/^(Pass|Warning|Critical)$/);
            expect(typeof check.score).toBe('number');
            expect(check.findings).toBeDefined();
            expect(check.recommendation).toBeDefined();
        }
    });

    it('POST /api/prd-validate — rejects missing projectId', async () => {
        const res = await request(app)
            .post('/api/prd-validate')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/prd-validate — rejects invalid projectId', async () => {
        const res = await request(app)
            .post('/api/prd-validate')
            .send({ projectId: 'invalid-id' });

        expect(res.status).toBe(400);
    });

    it('POST /api/prd-validate — returns 400 when project has no PRD', async () => {
        const res = await request(app)
            .post('/api/prd-validate')
            .send({ projectId: projectWithoutPrd });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('no PRD');
    });

    it('POST /api/prd-validate — handles malformed AI JSON gracefully', async () => {
        // Override mock to return non-JSON
        const { aiRouter } = await import('@bsa-kit/ai-engine');
        vi.mocked(aiRouter.execute).mockResolvedValueOnce({
            content: 'This is not valid JSON',
            provider: 'claude',
            tokensUsed: { input: 100, output: 50 },
            latencyMs: 500,
        });

        const res = await request(app)
            .post('/api/prd-validate')
            .send({ projectId: projectWithPrd });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        // Should have the fallback structure
        expect(res.body.data.overallStatus).toBe('Warning');
        expect(res.body.data.rawContent).toBe('This is not valid JSON');
    });

    it('POST /api/prd-validate — handles AI JSON wrapped in markdown', async () => {
        const { aiRouter } = await import('@bsa-kit/ai-engine');
        vi.mocked(aiRouter.execute).mockResolvedValueOnce({
            content: '```json\n{"overallStatus":"Pass","holisticScore":5,"checks":[],"strengths":[],"topImprovements":[],"summary":"Perfect"}\n```',
            provider: 'claude',
            tokensUsed: { input: 100, output: 50 },
            latencyMs: 500,
        });

        const res = await request(app)
            .post('/api/prd-validate')
            .send({ projectId: projectWithPrd });

        expect(res.status).toBe(200);
        expect(res.body.data.overallStatus).toBe('Pass');
        expect(res.body.data.holisticScore).toBe(5);
    });
});
