import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { prisma } from '../db.js';
import { TIERS, CREDIT_PACKS, type TierKey, type CreditPackId } from '@bsa-kit/shared';

const router: RouterType = Router();

// ── Helper: ensure UserPlan record exists ──
async function getOrCreatePlan() {
    let plan = await prisma.userPlan.findUnique({ where: { id: 'default' } });
    if (!plan) {
        plan = await prisma.userPlan.create({ data: { id: 'default' } });
    }
    return plan;
}

// GET /api/plan — return current plan + usage stats
router.get('/', async (_req: Request, res: Response) => {
    try {
        const plan = await getOrCreatePlan();
        const tier = TIERS[plan.tier as TierKey] || TIERS.free;

        // Count actual projects
        const projectCount = await prisma.project.count();

        res.json({
            success: true,
            data: {
                tier: plan.tier,
                tierConfig: tier,
                billingCycle: plan.billingCycle,
                credits: {
                    subscription: plan.creditsRemaining,
                    addon: plan.creditsAddon,
                    total: plan.creditsRemaining + plan.creditsAddon,
                    max: tier.credits,
                },
                usage: {
                    chatUsedToday: plan.chatUsedToday,
                    chatLimit: tier.chatPerDay,
                    projectCount,
                    projectLimit: tier.projects,
                },
                batchTrialUsed: plan.batchTrialUsed,
                renewalDate: plan.renewalDate,
            },
        });
    } catch (err) {
        console.error('GET /api/plan error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch plan' });
    }
});

// POST /api/plan/upgrade — change tier
router.post('/upgrade', async (req: Request, res: Response) => {
    try {
        const { tier, billingCycle } = req.body as { tier?: string; billingCycle?: string };

        if (!tier || !['free', 'pro', 'team'].includes(tier)) {
            res.status(400).json({ success: false, error: 'Invalid tier. Must be free, pro, or team.' });
            return;
        }

        const targetTier = TIERS[tier as TierKey];
        const plan = await getOrCreatePlan();

        // Check if upgrading
        const currentTier = TIERS[plan.tier as TierKey] || TIERS.free;
        if (targetTier.price <= currentTier.price && tier !== 'free') {
            res.status(400).json({ success: false, error: 'Use /downgrade to switch to a lower tier.' });
            return;
        }

        const updated = await prisma.userPlan.update({
            where: { id: 'default' },
            data: {
                tier,
                billingCycle: billingCycle === 'annual' ? 'annual' : 'monthly',
                creditsRemaining: targetTier.credits,
                renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
            },
        });

        res.json({
            success: true,
            data: {
                tier: updated.tier,
                credits: updated.creditsRemaining,
                billingCycle: updated.billingCycle,
                renewalDate: updated.renewalDate,
            },
        });
    } catch (err) {
        console.error('POST /api/plan/upgrade error:', err);
        res.status(500).json({ success: false, error: 'Failed to upgrade plan' });
    }
});

// POST /api/plan/downgrade — downgrade tier
router.post('/downgrade', async (req: Request, res: Response) => {
    try {
        const { tier } = req.body as { tier?: string };

        if (!tier || !['free', 'pro'].includes(tier)) {
            res.status(400).json({ success: false, error: 'Invalid tier for downgrade.' });
            return;
        }

        const targetTier = TIERS[tier as TierKey];
        const plan = await getOrCreatePlan();
        const currentTier = TIERS[plan.tier as TierKey] || TIERS.free;

        if (targetTier.price >= currentTier.price) {
            res.status(400).json({ success: false, error: 'Use /upgrade to switch to a higher tier.' });
            return;
        }

        // Calculate consequences
        const projectCount = await prisma.project.count();
        const projectsToArchive = Math.max(0, projectCount - targetTier.projects);

        const updated = await prisma.userPlan.update({
            where: { id: 'default' },
            data: {
                tier,
                creditsRemaining: Math.min(plan.creditsRemaining, targetTier.credits),
                // addon credits are preserved!
            },
        });

        res.json({
            success: true,
            data: {
                tier: updated.tier,
                credits: updated.creditsRemaining,
                creditsAddon: updated.creditsAddon,
                projectsArchived: projectsToArchive,
            },
        });
    } catch (err) {
        console.error('POST /api/plan/downgrade error:', err);
        res.status(500).json({ success: false, error: 'Failed to downgrade plan' });
    }
});

// POST /api/plan/buy-credits — add credits from credit pack
router.post('/buy-credits', async (req: Request, res: Response) => {
    try {
        const { packId } = req.body as { packId?: string };

        const pack = CREDIT_PACKS.find(p => p.id === packId);
        if (!pack) {
            res.status(400).json({
                success: false,
                error: `Invalid pack. Choose: ${CREDIT_PACKS.map(p => p.id).join(', ')}`,
            });
            return;
        }

        const plan = await getOrCreatePlan();

        const updated = await prisma.userPlan.update({
            where: { id: 'default' },
            data: {
                creditsAddon: plan.creditsAddon + pack.credits,
            },
        });

        res.json({
            success: true,
            data: {
                packPurchased: pack.label,
                creditsAdded: pack.credits,
                creditsAddon: updated.creditsAddon,
                totalCredits: updated.creditsRemaining + updated.creditsAddon,
            },
        });
    } catch (err) {
        console.error('POST /api/plan/buy-credits error:', err);
        res.status(500).json({ success: false, error: 'Failed to buy credits' });
    }
});

// POST /api/plan/reset-daily — reset daily chat counter (cron or manual)
router.post('/reset-daily', async (_req: Request, res: Response) => {
    try {
        await prisma.userPlan.update({
            where: { id: 'default' },
            data: { chatUsedToday: 0 },
        });
        res.json({ success: true, message: 'Daily chat counter reset' });
    } catch (err) {
        console.error('POST /api/plan/reset-daily error:', err);
        res.status(500).json({ success: false, error: 'Failed to reset daily counter' });
    }
});

export default router;
