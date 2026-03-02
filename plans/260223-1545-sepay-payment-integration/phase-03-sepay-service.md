# Phase 3: SePay Service

## Context
- Parent: [plan.md](./plan.md)
- Depends on: Phase 2 (environment config)

## Overview
- **Priority:** P1 (core logic)
- **Status:** completed
- **Description:** Create SePay API client service

## Key Insights
- Use native `fetch` (Node.js 18+)
- Basic Auth: `Authorization: Basic base64(merchant_id:secret_key)`
- Follow existing service pattern (pure functions, no side effects)

## Requirements

### Functional
- Generate Basic Auth header
- Verify webhook signature (future)
- Parse webhook payload to Payment data

### Non-Functional
- Type-safe with TypeScript
- Zod validation for webhook payload

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  services/sepay.ts                  │
├─────────────────────────────────────────────────────┤
│ buildAuthHeader(merchantId, secretKey): string     │
│ parseWebhookPayload(raw): SePayWebhookPayload      │
│ isDuplicateTransaction(sepayTxId): Promise<bool>   │
│ savePayment(payload): Promise<Payment>             │
└─────────────────────────────────────────────────────┘
```

## Related Code Files

### Create
- `apps/api/src/services/sepay.ts` - SePay service
- `apps/api/src/types/sepay.ts` - TypeScript types

### Reference
- `apps/api/src/services/crypto.ts` - Existing service pattern

## Implementation Steps

1. [x] Create `apps/api/src/types/sepay.ts` with SePay types
2. [x] Create `apps/api/src/services/sepay.ts` with functions:
   - `buildAuthHeader()`
   - `parseWebhookPayload()` with Zod validation
   - `isDuplicateTransaction()`
   - `savePayment()`
3. [x] Export from service index

## Zod Schema for Webhook

```typescript
// apps/api/src/types/sepay.ts
import { z } from 'zod';

export const sepayWebhookSchema = z.object({
  id: z.number(),
  gateway: z.string(),
  transactionDate: z.string(),
  accountNumber: z.string(),
  code: z.string().nullable(),
  content: z.string(),
  transferType: z.enum(['in', 'out']),
  transferAmount: z.number(),
  accumulated: z.number(),
  subAccount: z.string().nullable(),
  referenceCode: z.string(),
  description: z.string(),
});

export type SePayWebhookPayload = z.infer<typeof sepayWebhookSchema>;
```

## Success Criteria
- [x] Service builds without errors
- [x] Webhook payload validation works
- [x] Basic Auth header generation correct

## Security Considerations
- Validate all incoming data via Zod
- Log raw payload for debugging (optional, audit trail)

## Next Steps
→ Phase 4: Webhook Endpoint
