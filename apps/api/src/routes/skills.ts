// @ts-nocheck
import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { idSchema } from '@bsa-kit/shared';

const router: RouterType = Router();

// GET /api/skills — List all skills
router.get('/', async (req: Request, res: Response) => {
    const { type, category } = req.query;
    const where: Record<string, unknown> = { enabled: true };
    if (type && typeof type === 'string') where.type = type;
    if (category && typeof category === 'string') where.category = category;

    try {
        const skills = await prisma.skill.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: skills });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch skills' });
    }
});

// GET /api/skills/:id — Get single skill
router.get('/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid skill ID' });
        return;
    }

    try {
        const skill = await prisma.skill.findUnique({ where: { id: idResult.data } });
        if (!skill) {
            res.status(404).json({ success: false, error: 'Skill not found' });
            return;
        }
        res.json({ success: true, data: skill });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch skill' });
    }
});

// POST /api/skills — Create custom skill
const createSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    type: z.enum(['skill', 'workflow', 'agent']),
    category: z.string().min(1).max(50),
    icon: z.string().max(50).optional(),
    triggerType: z.enum(['navigate', 'modal', 'chat']),
    triggerConfig: z.string().optional(),
});

router.post('/', async (req: Request, res: Response) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    try {
        const maxOrder = await prisma.skill.aggregate({ _max: { sortOrder: true } });
        const skill = await prisma.skill.create({
            data: {
                ...parsed.data,
                description: parsed.data.description || '',
                icon: parsed.data.icon || 'Zap',
                triggerConfig: parsed.data.triggerConfig || '{}',
                builtIn: false,
                sortOrder: (maxOrder._max.sortOrder || 0) + 1,
            },
        });
        res.status(201).json({ success: true, data: skill });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to create skill' });
    }
});

// PATCH /api/skills/:id — Update skill
router.patch('/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid skill ID' });
        return;
    }

    try {
        const skill = await prisma.skill.update({
            where: { id: idResult.data },
            data: req.body,
        });
        res.json({ success: true, data: skill });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update skill' });
    }
});

// DELETE /api/skills/:id — Delete (custom only)
router.delete('/:id', async (req: Request, res: Response) => {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
        res.status(400).json({ success: false, error: 'Invalid skill ID' });
        return;
    }

    try {
        const skill = await prisma.skill.findUnique({ where: { id: idResult.data } });
        if (!skill) {
            res.status(404).json({ success: false, error: 'Skill not found' });
            return;
        }
        if (skill.builtIn) {
            res.status(403).json({ success: false, error: 'Cannot delete built-in skills' });
            return;
        }
        await prisma.skill.delete({ where: { id: idResult.data } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete skill' });
    }
});

export default router;
