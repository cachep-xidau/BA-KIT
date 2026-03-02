# Phase 2: Environment Config

## Context
- Parent: [plan.md](./plan.md)
- Depends on: Phase 1 (database schema)

## Overview
- **Priority:** P0 (required for service)
- **Status:** completed
- **Description:** Add SePay credentials to environment validation

## Key Insights
- SePay uses Basic Auth (merchant_id:secret_key) for Payment Gateway API
- Optional in dev, required in production
- Use existing Zod pattern from `packages/shared/src/schemas.ts`

## Requirements

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `SEPAY_BASE_URL` | No (default: sandbox) | API base URL |
| `SEPAY_MERCHANT_ID` | Yes (prod) | Merchant identifier |
| `SEPAY_SECRET_KEY` | Yes (prod) | API secret key |

## Related Code Files

### Modify
- `packages/shared/src/schemas.ts` - Add SEPAY_* to envSchema
- `.env.example` - Document new variables

## Implementation Steps

1. [x] Add SePay env vars to envSchema in `packages/shared/src/schemas.ts`
2. [x] Update `.env.example` with SEPAY_* variables
3. [x] Rebuild shared package: `pnpm --filter @bsa-kit/shared build`

## Schema Addition

```typescript
// Add to envSchema in packages/shared/src/schemas.ts
SEPAY_BASE_URL: z.string().url().default('https://pgapi-sandbox.sepay.vn'),
SEPAY_MERCHANT_ID: z.string().optional(),
SEPAY_SECRET_KEY: z.string().optional(),
```

## Success Criteria
- [x] Schema validates SEPAY_* vars
- [x] Default sandbox URL provided
- [x] `.env.example` updated

## Security Considerations
- `SEPAY_SECRET_KEY` is sensitive - never commit actual values
- Use `ENCRYPTION_KEY` pattern for production secret storage

## Next Steps
→ Phase 3: SePay Service
