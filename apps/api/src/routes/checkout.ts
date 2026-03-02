import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
// @ts-ignore — sepay-pg-node has no types
import { SePayPgClient } from 'sepay-pg-node';

const router: RouterType = Router();

// POST /api/checkout — Create SePay checkout session
router.post('/', async (req: Request, res: Response) => {
    const { amount, description, orderId } = req.body;

    // Validate input
    if (!amount || typeof amount !== 'number' || amount < 1000) {
        res.status(400).json({
            success: false,
            error: 'Amount must be >= 1000 VND',
        });
        return;
    }

    const merchantId = process.env.SEPAY_MERCHANT_ID;
    const secretKey = process.env.SEPAY_SECRET_KEY;

    if (!merchantId || !secretKey) {
        res.status(500).json({
            success: false,
            error: 'SePay credentials not configured',
        });
        return;
    }

    try {
        const client = new SePayPgClient({
            env: 'sandbox',
            merchant_id: merchantId,
            secret_key: secretKey,
        });

        const invoiceNumber = orderId || `BSA-${Date.now()}`;
        const baseUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';

        const checkoutUrl = client.checkout.initCheckoutUrl();
        const formFields = client.checkout.initOneTimePaymentFields({
            payment_method: 'BANK_TRANSFER',
            order_invoice_number: invoiceNumber,
            order_amount: amount,
            currency: 'VND',
            order_description: description || `Thanh toán ${invoiceNumber}`,
            success_url: `${baseUrl}/payment/success?order=${invoiceNumber}`,
            error_url: `${baseUrl}/payment/error?order=${invoiceNumber}`,
            cancel_url: `${baseUrl}/payment/cancel?order=${invoiceNumber}`,
        });

        res.json({
            success: true,
            data: {
                checkoutUrl,
                formFields,
                invoiceNumber,
            },
        });
    } catch (err) {
        console.error('Checkout error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to create checkout session',
        });
    }
});

// GET /api/checkout/status — Check payment status (for frontend polling)
router.get('/status/:orderId', async (req: Request, res: Response) => {
    const { prisma } = await import('../db.js');
    const orderId = req.params.orderId as string;

    const payment = await prisma.payment.findFirst({
        where: { content: { contains: orderId } },
        orderBy: { createdAt: 'desc' },
    });

    res.json({
        success: true,
        data: {
            paid: !!payment,
            payment: payment || null,
        },
    });
});

export default router;
