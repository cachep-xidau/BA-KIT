# Code Review: SePay Payment Integration

## Scope
- **Files reviewed:**
  - `/apps/api/src/types/sepay.ts` (32 lines)
  - `/apps/api/src/services/sepay.ts` (45 lines)
  - `/apps/api/src/routes/webhooks.ts` (44 lines)
  - `/apps/api/prisma/schema.prisma` - Payment model (24 lines)
- **Total LOC:** ~145 lines (focused scope)
- **Focus:** Security, payment handling, webhook processing
- **Tests:** Present (`sepay.test.ts`, `webhooks.test.ts`)

---

## Overall Assessment: **7.5/10**

Solid foundation with good patterns (Zod validation, idempotency, type safety). Missing critical security controls for payment webhooks.

---

## Critical Issues (P0)

### 1. **No Webhook Signature Verification**
**Severity:** CRITICAL - Security vulnerability

The webhook endpoint has **no authentication**. Anyone who knows the endpoint URL can submit fake payment notifications.

```typescript
// Current: No verification at all
router.post('/sepay', async (req: Request, res: Response) => {
    const parsed = parseWebhookPayload(req.body);  // Trusts any input
```

**Impact:** Payment fraud, unauthorized access to premium features.

**Fix Required:** Implement HMAC signature verification using `SEPAY_SECRET_KEY`:
```typescript
import crypto from 'crypto';

function verifySePaySignature(payload: string, signature: string, secret: string): boolean {
    const expected = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

### 2. **No `transferType` Filter - Accepts Outbound Transfers**
**Severity:** HIGH - Business logic error

```typescript
// sepay.ts:12 - Schema accepts 'out' transfers
transferType: z.enum(['in', 'out']),
```

Webhook processes both `in` (incoming) and `out` (outgoing) transfers. Outbound transfers should not create payment records.

**Fix:**
```typescript
// Either reject in validation
if (payload.transferType !== 'in') {
    res.status(200).json({ success: true }); // Acknowledge but ignore
    return;
}
```

---

## High Priority (P1)

### 3. **Generic Error Message Hides Validation Details**
**File:** `/apps/api/src/services/sepay.ts:25`

```typescript
return { success: false, error: 'Invalid payload format' };
```

Loss of Zod validation details makes debugging difficult. Should log the actual error while returning generic message to client.

**Fix:**
```typescript
if (!result.success) {
    console.error('SePay validation error:', result.error.issues);
    return { success: false, error: 'Invalid payload format' };
}
```

---

### 4. **Database `Float` for Money Amounts**
**File:** `/apps/api/prisma/schema.prisma:153`

```prisma
amount         Float
```

Floating-point arithmetic introduces precision errors for monetary values. Use `Decimal` type.

**Fix:**
```prisma
amount         Decimal  @db.Text  // SQLite workaround
```

Or for production PostgreSQL:
```prisma
amount         Decimal  @db.Decimal(19, 4)
```

---

### 5. **No Rate Limiting on Webhook Endpoint**
**File:** `/apps/api/src/index.ts`

General rate limit applies (`/api/`), but webhooks from SePay may be legitimate high-volume. Should have dedicated config or whitelist SePay IPs.

**Recommendation:**
- Add `SEPAY_WEBHOOK_IPS` env var for IP whitelist
- Or implement per-IP rate limit with higher threshold

---

## Medium Priority (P2)

### 6. **Missing Transaction Date in PaymentData**
**File:** `/apps/api/src/types/sepay.ts`

`transactionDate` from SePay is parsed but not stored. Useful for reconciliation.

```typescript
export interface PaymentData {
    // Missing: transactionDate: string;
```

---

### 7. **No Content Length Limit on Webhook**
**File:** `/apps/api/src/index.ts`

Default 1MB limit applies. SePay payloads are small (~500 bytes). Should enforce strict limit.

**Fix:**
```typescript
app.use('/api/webhooks', express.json({ limit: '10kb' }), webhooksRoutes);
```

---

### 8. **Type Inconsistency: Nullable vs Non-null**
**Files:** `sepay.ts:9` vs `PaymentData`

```typescript
// Schema says nullable
code: z.string().nullable(),

// But PaymentData doesn't include 'code' field at all
export interface PaymentData {
    // code is missing entirely
```

Either include it or document why it's excluded.

---

### 9. **Status Field Without Enum Constraint**
**File:** `/apps/api/prisma/schema.prisma:158`

```prisma
status         String   @default("completed")
```

Should be an enum for type safety:
```prisma
enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

status         PaymentStatus @default(COMPLETED)
```

---

## Low Priority (P3)

### 10. **Unused `buildAuthHeader` Function**
**File:** `/apps/api/src/services/sepay.ts:11`

Function exists but is never used. Dead code or future feature?

**Action:** Remove if not needed, or add comment about future API calls.

---

### 11. **No Structured Logging**
**File:** `/apps/api/src/routes/webhooks.ts:38`

```typescript
console.error('SePay webhook error:', err);
```

Use structured logging (pino/winston) for production observability.

---

### 12. **Test Cleanup Uses `.catch(() => {})`**
**File:** `/apps/api/src/routes/webhooks.test.ts:29`

Silent error swallowing in cleanup is acceptable for tests, but worth noting.

---

## Edge Cases Not Handled

| Case | Current Behavior | Risk |
|------|-----------------|------|
| Zero amount | Accepted (schema allows any positive) | May be legitimate, but verify with SePay |
| Very large amounts | Accepted | Consider max limit validation |
| Concurrent duplicate webhooks | Race condition possible | Use DB transaction + unique constraint (already has `@unique`) |
| Malformed JSON | Express returns 400 | OK - handled by body parser |
| Content-Type mismatch | Accepted | Should verify `application/json` |

---

## Positive Observations

1. **Zod validation** - Strong typing with runtime validation
2. **Idempotency** - Duplicate detection via `sepayTxId` unique constraint
3. **Type safety** - `SePayWebhookPayload` derived from schema
4. **Clean separation** - Types, service, routes properly modularized
5. **Tests present** - Unit and integration tests covering happy paths
6. **Proper HTTP codes** - 201 for create, 200 for idempotent, 400 for invalid
7. **Raw payload stored** - Useful for debugging and audit trail

---

## Recommended Actions (Priority Order)

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Add HMAC signature verification | P0 | 2h |
| 2 | Filter `transferType !== 'in'` | P0 | 15min |
| 3 | Log validation errors (server-side) | P1 | 15min |
| 4 | Change `amount` to Decimal | P1 | 30min |
| 5 | Add webhook IP whitelist config | P1 | 1h |
| 6 | Add `transactionDate` to PaymentData | P2 | 15min |
| 7 | Reduce webhook body limit to 10kb | P2 | 5min |
| 8 | Add PaymentStatus enum | P2 | 30min |
| 9 | Remove or document `buildAuthHeader` | P3 | 5min |
| 10 | Add structured logging | P3 | 1h |

---

## Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Type Coverage | 100% | 100% |
| Test Coverage | ~85% (est) | 90%+ |
| Linting Issues | 0 (assumed) | 0 |
| Security Score | 6/10 | 9/10 |
| Code Quality | 8/10 | 9/10 |

---

## Unresolved Questions

1. **SePay webhook IP addresses?** - Need for whitelist configuration
2. **SePay signature header name?** - Need to confirm header key for HMAC
3. **Zero-amount payments valid?** - Business decision needed
4. **Max amount validation?** - Business rule needed
5. **Refund handling?** - Not implemented, is it needed?

---

## Verdict

**Do not deploy to production** without P0 fixes (signature verification, transferType filter). Current implementation is vulnerable to payment fraud via forged webhooks.

After P0/P1 fixes, code quality is production-ready.
