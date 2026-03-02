import {
    sepayWebhookSchema,
    type SePayWebhookPayload,
    type PaymentData,
} from '../types/sepay.js';

/**
 * Build Basic Auth header for SePay API.
 * Format: "Basic base64(merchant_id:secret_key)"
 */
export function buildAuthHeader(merchantId: string, secretKey: string): string {
    const credentials = Buffer.from(`${merchantId}:${secretKey}`).toString('base64');
    return `Basic ${credentials}`;
}

/**
 * Parse and validate SePay webhook payload.
 * Returns parsed data or validation error.
 */
export function parseWebhookPayload(
    raw: unknown
): { success: true; data: SePayWebhookPayload } | { success: false; error: string } {
    const result = sepayWebhookSchema.safeParse(raw);
    if (!result.success) {
        return { success: false, error: 'Invalid payload format' };
    }
    return { success: true, data: result.data };
}

/**
 * Convert validated webhook payload to payment data for database.
 */
export function toPaymentData(payload: SePayWebhookPayload): PaymentData {
    return {
        sepayTxId: payload.id,
        gateway: payload.gateway,
        accountNumber: payload.accountNumber,
        transferType: payload.transferType,
        amount: payload.transferAmount,
        content: payload.content || null,
        referenceCode: payload.referenceCode || null,
        rawPayload: JSON.stringify(payload),
    };
}
