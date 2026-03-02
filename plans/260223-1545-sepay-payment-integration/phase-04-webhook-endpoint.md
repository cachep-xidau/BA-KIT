# Phase 4: Webhook Endpoint

## Context
- Parent: [plan.md](./plan.md)
- Depends on: Phase 3 (SePay service)

## Overview
- **Priority:** P1 (core feature)
- **Status:** completed
- **Description:** Create webhook endpoint for SePay callbacks

## Key Insights
- SePay expects `{"success": true}` with HTTP 200/201 on success
- Must handle duplicate webhooks (idempotent)
- Log failures for debugging

## Requirements

### Functional
- POST `/api/webhooks/sepay` receives SePay webhook
- Validate payload via Zod
- Save to database (skip if duplicate)
- Return `{"success": true}` on success

### Non-Functional
- Idempotent handling (safe to retry)
- Error logging without exposing internals

## Architecture

```
POST /api/webhooks/sepay
         │
         ▼
┌─────────────────────┐
│ Validate Payload    │◄─── Zod schema
└────────┬────────────┘
         │ valid?
         ▼
┌─────────────────────┐
│ Check Duplicate     │◄─── Query by sepayTxId
└────────┬────────────┘
         │ exists?
         │ YES ──► return {"success": true} (idempotent)
         │ NO
         ▼
┌─────────────────────┐
│ Save Payment        │◄─── Prisma create
└────────┬────────────┘
         │
         ▼
    {"success": true}
```

## Related Code Files

### Create
- `apps/api/src/routes/webhooks.ts` - Webhook route handler

### Modify
- `apps/api/src/index.ts` - Register route

## Implementation Steps

1. [x] Create `apps/api/src/routes/webhooks.ts`
2. [x] Implement POST handler:
   - Parse body with Zod
   - Check for duplicate via sepayTxId
   - Save to Payment table
   - Return success response
3. [x] Register route in `index.ts`: `app.use('/api/webhooks', webhooksRoutes)`
4. [x] Handle errors gracefully

## Route Code Pattern

```typescript
// apps/api/src/routes/webhooks.ts
router.post('/sepay', async (req, res) => {
  const parsed = sepayWebhookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid payload' });
    return;
  }

  const payload = parsed.data;

  // Check duplicate
  const existing = await prisma.payment.findUnique({
    where: { sepayTxId: payload.id }
  });

  if (existing) {
    res.status(200).json({ success: true }); // Idempotent
    return;
  }

  // Save payment
  await prisma.payment.create({
    data: {
      sepayTxId: payload.id,
      gateway: payload.gateway,
      accountNumber: payload.accountNumber,
      transferType: payload.transferType,
      amount: payload.transferAmount,
      content: payload.content,
      referenceCode: payload.referenceCode,
      rawPayload: JSON.stringify(payload),
    }
  });

  res.status(201).json({ success: true });
});
```

## Success Criteria
- [x] POST `/api/webhooks/sepay` accepts valid payload
- [x] Returns 400 for invalid payload
- [x] Returns 200/201 for valid payload
- [x] Duplicate handling works (idempotent)
- [x] Payment saved to database

## Security Considerations
- Consider webhook signature verification (SePay future feature)
- Rate limit webhook endpoint
- Log suspicious patterns

## Next Steps
→ Phase 5: Tests
