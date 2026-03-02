import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { idSchema } from '@bsa-kit/shared';

const router: RouterType = Router();

const isRecordWithCode = (value: unknown): value is { code: string } =>
    typeof value === 'object' && value !== null && typeof (value as { code?: unknown }).code === 'string';

// --- Schemas ---
const createFunctionSchema = z.object({
    featureId: idSchema,
    name: z.string().min(1).max(200),
    description: z.string().optional(),
});

const updateFunctionSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    order: z.number().int().min(0).optional(),
});

// GET /api/functions/:featureId — List functions for a feature (with artifact counts)
router.get('/:featureId', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.featureId);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid feature ID' });
        return;
    }

    try {
        const functions = await prisma.function.findMany({
            where: { featureId: idResult.data },
            orderBy: { order: 'asc' },
            include: {
                _count: { select: { artifacts: true } },
            },
        });
        res.json({ success: true, data: functions });
    } catch (err) {
        console.error('Failed to list functions:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve functions' });
    }
});

// POST /api/functions — Create function
router.post('/', async (req: Request, res: Response) => {
    const parsed = createFunctionSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { featureId, name, description } = parsed.data;

    try {
        // Get next order number
        const maxOrder = await prisma.function.findFirst({
            where: { featureId },
            orderBy: { order: 'desc' },
            select: { order: true },
        });

        const func = await prisma.function.create({
            data: {
                name,
                description,
                order: (maxOrder?.order ?? -1) + 1,
                featureId,
            },
        });

        res.status(201).json({ success: true, data: func });
    } catch (err) {
        console.error('Failed to create function:', err);
        res.status(500).json({ success: false, error: 'Failed to create function' });
    }
});

// PATCH /api/functions/:id — Update function
router.patch('/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid function ID' });
        return;
    }

    const parsed = updateFunctionSchema.safeParse(req.body);
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
        const func = await prisma.function.update({
            where: { id: idResult.data },
            data: parsed.data,
        });
        res.json({ success: true, data: func });
    } catch (err) {
        if (isRecordWithCode(err) && err.code === 'P2025') {
            res.status(404).json({ success: false, error: 'Function not found' });
            return;
        }
        console.error('Failed to update function:', err);
        res.status(500).json({ success: false, error: 'Failed to update function' });
    }
});

// DELETE /api/functions/:id — Delete function (cascades artifacts)
router.delete('/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid function ID' });
        return;
    }

    try {
        await prisma.function.delete({ where: { id: idResult.data } });
        res.json({ success: true });
    } catch (err) {
        if (isRecordWithCode(err) && err.code === 'P2025') {
            res.status(404).json({ success: false, error: 'Function not found' });
            return;
        }
        console.error('Failed to delete function:', err);
        res.status(500).json({ success: false, error: 'Failed to delete function' });
    }
});

export default router;
