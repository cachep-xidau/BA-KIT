# Phase 5: Tests

## Context
- Parent: [plan.md](./plan.md)
- Depends on: Phase 4 (webhook endpoint)

## Overview
- **Priority:** P1 (quality assurance)
- **Status:** completed
- **Description:** Unit tests for SePay integration

## Key Insights
- Follow existing Vitest pattern
- Mock Prisma for unit tests
- Test edge cases: duplicate, invalid payload

## Requirements

### Test Coverage
- SePay service functions
- Webhook endpoint validation
- Duplicate handling
- Error responses

## Related Code Files

### Create
- `apps/api/src/__tests__/sepay.test.ts` - Service tests
- `apps/api/src/__tests__/webhooks.test.ts` - Route tests

### Reference
- `apps/api/src/__tests__/*.test.ts` - Existing test patterns

## Implementation Steps

1. [x] Create `sepay.test.ts` for service functions:
   - `buildAuthHeader()` test
   - `parseWebhookPayload()` valid/invalid cases
2. [x] Create `webhooks.test.ts` for endpoint:
   - Valid webhook payload
   - Invalid payload (400)
   - Duplicate webhook (idempotent 200)
3. [x] Run tests: `pnpm test`

## Test Cases

### Service Tests
```typescript
describe('SePay Service', () => {
  test('buildAuthHeader returns correct Basic auth', () => {
    const header = buildAuthHeader('merchant123', 'secret456');
    expect(header).toBe('Basic bWVyY2hhbnQxMjM6c2VjcmV0NDU2');
  });

  test('parseWebhookPayload validates correct payload', () => {
    const result = parseWebhookPayload(validPayload);
    expect(result.success).toBe(true);
  });

  test('parseWebhookPayload rejects invalid payload', () => {
    const result = parseWebhookPayload({ invalid: 'data' });
    expect(result.success).toBe(false);
  });
});
```

### Webhook Tests
```typescript
describe('POST /api/webhooks/sepay', () => {
  test('returns 201 for valid payload', async () => {
    const res = await request(app)
      .post('/api/webhooks/sepay')
      .send(validWebhookPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('returns 400 for invalid payload', async () => {
    const res = await request(app)
      .post('/api/webhooks/sepay')
      .send({ foo: 'bar' });
    expect(res.status).toBe(400);
  });

  test('returns 200 for duplicate (idempotent)', async () => {
    // First call creates
    await request(app).post('/api/webhooks/sepay').send(validPayload);
    // Second call is idempotent
    const res = await request(app).post('/api/webhooks/sepay').send(validPayload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

## Success Criteria
- [x] All tests pass (`pnpm test`)
- [x] Coverage for service functions ≥ 80%
- [x] Edge cases tested (duplicate, invalid)

## Security Considerations
- Don't test with real credentials
- Use mock data only

## Final Checklist

After all tests pass:
- [x] Run `pnpm build` - verify no compile errors
- [x] Run `pnpm test` - all 32+ tests pass
- [x] Manual test: POST to `/api/webhooks/sepay` with curl

## Completion

All phases complete. Integration ready for:
- SePay webhook configuration
- Production deployment with real credentials
