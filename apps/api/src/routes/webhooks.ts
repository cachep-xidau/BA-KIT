import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { prisma } from '../db.js';
import { parseWebhookPayload, toPaymentData } from '../services/sepay.js';

const router: RouterType = Router();

// POST /api/webhooks/sepay — Handle SePay bank transfer webhooks
router.post('/sepay', async (req: Request, res: Response) => {
    // Validate payload
    const parsed = parseWebhookPayload(req.body);
    if (!parsed.success) {
        console.warn('SePay webhook: invalid payload format');
        res.status(400).json({ success: false, error: 'Invalid payload format' });
        return;
    }

    const payload = parsed.data;

    // Only process incoming transfers (outgoing should not create payment records)
    if (payload.transferType !== 'in') {
        res.status(200).json({ success: true, message: 'Ignored outgoing transfer' });
        return;
    }

    try {
        // Check for duplicate (idempotent)
        const existing = await prisma.payment.findUnique({
            where: { sepayTxId: payload.id },
        });

        if (existing) {
            res.status(200).json({ success: true });
            return;
        }

        // Save payment
        const paymentData = toPaymentData(payload);
        await prisma.payment.create({
            data: paymentData,
        });

        res.status(201).json({ success: true });
    } catch (err) {
        console.error('SePay webhook error:', err);
        res.status(500).json({ success: false, error: 'Failed to process webhook' });
    }
});

export default router;
