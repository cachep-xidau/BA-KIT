import { describe, it, expect } from 'vitest';
import { buildAuthHeader, parseWebhookPayload, toPaymentData } from '../services/sepay.js';

describe('SePay Service', () => {
    describe('buildAuthHeader', () => {
        it('returns correct Basic auth header', () => {
            const header = buildAuthHeader('merchant123', 'secret456');
            // base64('merchant123:secret456') = 'bWVyY2hhbnQxMjM6c2VjcmV0NDU2'
            expect(header).toBe('Basic bWVyY2hhbnQxMjM6c2VjcmV0NDU2');
        });

        it('handles empty credentials', () => {
            const header = buildAuthHeader('', '');
            expect(header).toBe('Basic Og==');
        });
    });

    describe('parseWebhookPayload', () => {
        const validPayload = {
            id: 12345,
            gateway: 'Vietcombank',
            transactionDate: '2024-01-15 10:30:00',
            accountNumber: '1234567890',
            code: 'VCB',
            content: 'Payment order #ABC123',
            transferType: 'in' as const,
            transferAmount: 500000,
            accumulated: 1500000,
            subAccount: null,
            referenceCode: 'REF001',
            description: 'Bank transfer',
        };

        it('validates correct payload', () => {
            const result = parseWebhookPayload(validPayload);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.id).toBe(12345);
                expect(result.data.gateway).toBe('Vietcombank');
                expect(result.data.transferAmount).toBe(500000);
            }
        });

        it('rejects invalid payload - missing id', () => {
            const result = parseWebhookPayload({ ...validPayload, id: undefined });
            expect(result.success).toBe(false);
        });

        it('rejects invalid payload - wrong transferType', () => {
            const result = parseWebhookPayload({ ...validPayload, transferType: 'invalid' });
            expect(result.success).toBe(false);
        });

        it('rejects invalid payload - negative amount', () => {
            const result = parseWebhookPayload({ ...validPayload, transferAmount: -100 });
            expect(result.success).toBe(false);
        });

        it('rejects completely invalid payload', () => {
            const result = parseWebhookPayload({ foo: 'bar' });
            expect(result.success).toBe(false);
        });
    });

    describe('toPaymentData', () => {
        it('converts webhook payload to payment data', () => {
            const payload = {
                id: 12345,
                gateway: 'Vietcombank',
                transactionDate: '2024-01-15 10:30:00',
                accountNumber: '1234567890',
                code: 'VCB',
                content: 'Payment order #ABC123',
                transferType: 'in' as const,
                transferAmount: 500000,
                accumulated: 1500000,
                subAccount: null,
                referenceCode: 'REF001',
                description: 'Bank transfer',
            };

            const data = toPaymentData(payload);
            expect(data.sepayTxId).toBe(12345);
            expect(data.gateway).toBe('Vietcombank');
            expect(data.accountNumber).toBe('1234567890');
            expect(data.transferType).toBe('in');
            expect(data.amount).toBe(500000);
            expect(data.content).toBe('Payment order #ABC123');
            expect(data.referenceCode).toBe('REF001');
            expect(data.rawPayload).toContain('Vietcombank');
        });
    });
});
