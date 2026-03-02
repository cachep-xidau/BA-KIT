import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { idSchema } from '@bsa-kit/shared';

const router: RouterType = Router();

const isRecordWithCode = (value: unknown): value is { code: string } =>
    typeof value === 'object' && value !== null && typeof (value as { code?: unknown }).code === 'string';

// --- Schemas ---
const createFeatureSchema = z.object({
    projectId: idSchema,
    name: z.string().min(1).max(200),
    description: z.string().optional(),
});

const updateFeatureSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    order: z.number().int().min(0).optional(),
});

// GET /api/features/:projectId — List features for a project (with nested counts)
router.get('/:projectId', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.projectId);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid project ID' });
        return;
    }

    try {
        const features = await prisma.feature.findMany({
            where: { projectId: idResult.data },
            orderBy: { order: 'asc' },
            include: {
                functions: {
                    orderBy: { order: 'asc' },
                    include: {
                        _count: { select: { artifacts: true } },
                    },
                },
            },
        });
        res.json({ success: true, data: features });
    } catch (err) {
        console.error('Failed to list features:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve features' });
    }
});

// POST /api/features — Create feature
router.post('/', async (req: Request, res: Response) => {
    const parsed = createFeatureSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { projectId, name, description } = parsed.data;

    try {
        // Get next order number
        const maxOrder = await prisma.feature.findFirst({
            where: { projectId },
            orderBy: { order: 'desc' },
            select: { order: true },
        });

        const feature = await prisma.feature.create({
            data: {
                name,
                description,
                order: (maxOrder?.order ?? -1) + 1,
                projectId,
            },
        });

        res.status(201).json({ success: true, data: feature });
    } catch (err) {
        console.error('Failed to create feature:', err);
        res.status(500).json({ success: false, error: 'Failed to create feature' });
    }
});

// PATCH /api/features/:id — Update feature
router.patch('/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid feature ID' });
        return;
    }

    const parsed = updateFeatureSchema.safeParse(req.body);
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
        const feature = await prisma.feature.update({
            where: { id: idResult.data },
            data: parsed.data,
        });
        res.json({ success: true, data: feature });
    } catch (err) {
        if (isRecordWithCode(err) && err.code === 'P2025') {
            res.status(404).json({ success: false, error: 'Feature not found' });
            return;
        }
        console.error('Failed to update feature:', err);
        res.status(500).json({ success: false, error: 'Failed to update feature' });
    }
});

// DELETE /api/features/:id — Delete feature (cascades functions + artifacts)
router.delete('/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid feature ID' });
        return;
    }

    try {
        await prisma.feature.delete({ where: { id: idResult.data } });
        res.json({ success: true });
    } catch (err) {
        if (isRecordWithCode(err) && err.code === 'P2025') {
            res.status(404).json({ success: false, error: 'Feature not found' });
            return;
        }
        console.error('Failed to delete feature:', err);
        res.status(500).json({ success: false, error: 'Failed to delete feature' });
    }
});

export default router;
