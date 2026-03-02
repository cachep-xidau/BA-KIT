import { z } from 'zod';

// SePay webhook payload schema
export const sepayWebhookSchema = z.object({
    id: z.number().int().positive(),
    gateway: z.string().min(1),
    transactionDate: z.string(),
    accountNumber: z.string().min(1),
    code: z.string().nullable(),
    content: z.string(),
    transferType: z.enum(['in', 'out']),
    transferAmount: z.number().positive(),
    accumulated: z.number(),
    subAccount: z.string().nullable(),
    referenceCode: z.string(),
    description: z.string(),
});

export type SePayWebhookPayload = z.infer<typeof sepayWebhookSchema>;

// Parsed payment data for database
export interface PaymentData {
    sepayTxId: number;
    gateway: string;
    accountNumber: string;
    transferType: string;
    amount: number;
    content: string | null;
    referenceCode: string | null;
    rawPayload: string;
}
