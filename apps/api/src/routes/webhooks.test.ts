import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test-app.js';
import { prisma } from '../db.js';

const app = createTestApp();

const validPayload = {
    id: 999991,
    gateway: 'Vietcombank',
    transactionDate: '2024-01-15 10:30:00',
    accountNumber: '1234567890',
    code: 'VCB',
    content: 'Test payment',
    transferType: 'in',
    transferAmount: 100000,
    accumulated: 500000,
    subAccount: null,
    referenceCode: 'TEST-REF-001',
    description: 'Test webhook',
};

const createdTxIds: number[] = [];
let testIdCounter = 1000000;

afterAll(async () => {
    // Cleanup test payments
    for (const txId of createdTxIds) {
        await prisma.payment.delete({ where: { sepayTxId: txId } }).catch(() => {});
    }
    await prisma.$disconnect();
});

describe('POST /api/webhooks/sepay', () => {
    it('returns 201 for valid incoming transfer', async () => {
        const uniquePayload = { ...validPayload, id: ++testIdCounter };
        const res = await request(app).post('/api/webhooks/sepay').send(uniquePayload);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        createdTxIds.push(uniquePayload.id);
    });

    it('returns 400 for invalid payload', async () => {
        const res = await request(app)
            .post('/api/webhooks/sepay')
            .send({ foo: 'bar' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('returns 400 for missing required fields', async () => {
        const res = await request(app)
            .post('/api/webhooks/sepay')
            .send({ id: 123, gateway: 'Test' }); // missing many required fields

        expect(res.status).toBe(400);
    });

    it('returns 200 for duplicate webhook (idempotent)', async () => {
        const uniquePayload = { ...validPayload, id: ++testIdCounter };

        // First call creates
        const res1 = await request(app).post('/api/webhooks/sepay').send(uniquePayload);
        expect(res1.status).toBe(201);
        createdTxIds.push(uniquePayload.id);

        // Second call is idempotent
        const res2 = await request(app).post('/api/webhooks/sepay').send(uniquePayload);
        expect(res2.status).toBe(200);
        expect(res2.body.success).toBe(true);
    });

    it('returns 200 and ignores outgoing transfers', async () => {
        const outgoingPayload = { ...validPayload, id: ++testIdCounter, transferType: 'out' };
        const res = await request(app).post('/api/webhooks/sepay').send(outgoingPayload);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Ignored outgoing transfer');
        // Verify no payment was created
        const payment = await prisma.payment.findUnique({ where: { sepayTxId: outgoingPayload.id } });
        expect(payment).toBeNull();
    });
});
