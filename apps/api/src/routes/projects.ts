import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { prisma } from '../db.js';
import { createProjectSchema, updateProjectSchema, idSchema } from '@bsa-kit/shared';

const router: RouterType = Router();

const isRecordWithCode = (value: unknown): value is { code: string } =>
    typeof value === 'object' && value !== null && typeof (value as { code?: unknown }).code === 'string';

// GET /api/projects — List all projects
router.get('/', async (_req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: { select: { features: true, connections: true } },
            },
        });
        res.json({ success: true, data: projects });
    } catch (err) {
        console.error('Failed to list projects:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve projects' });
    }
});

// GET /api/projects/:id — Get project by ID
router.get('/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID format' });
        return;
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: idResult.data },
            include: {
                features: {
                    orderBy: { order: 'asc' },
                    include: {
                        functions: {
                            orderBy: { order: 'asc' },
                            include: { _count: { select: { artifacts: true } } },
                        },
                    },
                },
                connections: true,
            },
        });
        if (!project) {
            res.status(404).json({ success: false, error: 'Project not found' });
            return;
        }
        res.json({ success: true, data: project });
    } catch (err) {
        console.error('Failed to get project:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve project' });
    }
});

// POST /api/projects — Create project
router.post('/', async (req: Request, res: Response) => {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }
    try {
        const project = await prisma.project.create({ data: parsed.data });
        res.status(201).json({ success: true, data: project });
    } catch (err) {
        console.error('Failed to create project:', err);
        res.status(500).json({ success: false, error: 'Failed to create project' });
    }
});

// PATCH /api/projects/:id — Update project
router.patch('/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID format' });
        return;
    }

    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    // Reject empty update body
    if (Object.keys(parsed.data).length === 0) {
        res.status(400).json({ success: false, error: 'No fields provided for update' });
        return;
    }

    try {
        const project = await prisma.project.update({
            where: { id: idResult.data },
            data: parsed.data,
        });
        res.json({ success: true, data: project });
    } catch (err) {
        if (isRecordWithCode(err) && err.code === 'P2025') {
            res.status(404).json({ success: false, error: 'Project not found' });
            return;
        }
        console.error('Failed to update project:', err);
        res.status(500).json({ success: false, error: 'Failed to update project' });
    }
});

// DELETE /api/projects/:id — Delete project
router.delete('/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID format' });
        return;
    }

    try {
        await prisma.project.delete({ where: { id: idResult.data } });
        res.json({ success: true });
    } catch (err) {
        if (isRecordWithCode(err) && err.code === 'P2025') {
            res.status(404).json({ success: false, error: 'Project not found' });
            return;
        }
        console.error('Failed to delete project:', err);
        res.status(500).json({ success: false, error: 'Failed to delete project' });
    }
});

export default router;
