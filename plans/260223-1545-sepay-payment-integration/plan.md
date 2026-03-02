---
title: "SePay Payment Integration"
description: "Integrate Vietnamese bank payment gateway via SePay for BSA Kit"
status: completed
priority: P2
effort: 3h
branch: main
tags: [payment, integration, sepay, vietnam, webhook]
created: 2026-02-23
---

# SePay Payment Integration

## Overview

Integrate SePay Vietnamese bank payment gateway into ba-kit. Supports QR bank transfer via webhooks.

## SePay API Summary

| Item | Value |
|------|-------|
| Base URL | `https://pgapi-sandbox.sepay.vn` |
| Auth | Basic: `base64(merchant_id:secret_key)` / Bearer Token |
| Webhook Method | POST |
| Success Response | `{"success": true}` + HTTP 200/201 |

## Implementation Phases

| Phase | Description | Status | Progress |
|-------|-------------|--------|----------|
| [Phase 1](./phase-01-database-schema.md) | Database Schema | completed | 100% |
| [Phase 2](./phase-02-environment-config.md) | Environment Config | completed | 100% |
| [Phase 3](./phase-03-sepay-service.md) | SePay Service | completed | 100% |
| [Phase 4](./phase-04-webhook-endpoint.md) | Webhook Endpoint | completed | 100% |
| [Phase 5](./phase-05-tests.md) | Tests | completed | 100% |

## Dependencies

- Existing: Prisma + SQLite, Express + Zod, crypto service (AES-256-GCM)
- New: None (using native fetch)

## Key Files

### Modify
- `apps/api/prisma/schema.prisma` - Add Payment model
- `packages/shared/src/schemas.ts` - Add SePay env vars
- `.env.example` - Add SEPAY_* vars
- `apps/api/src/index.ts` - Register webhook route

### Create
- `apps/api/src/services/sepay.ts` - SePay API client
- `apps/api/src/routes/webhooks.ts` - Webhook handler
- `apps/api/src/__tests__/sepay.test.ts` - Unit tests

## Architecture

```
┌─────────────┐     POST /api/webhooks/sepay     ┌─────────────┐
│   SePay     │ ───────────────────────────────► │   ba-kit    │
│   Bank      │                                   │    API      │
└─────────────┘ ◄─────────────────────────────── └─────────────┘
                      {"success": true}
                            │
                            ▼
                    ┌───────────────┐
                    │   Payment     │
                    │   (Prisma)    │
                    └───────────────┘
```

## Success Criteria

- [x] Payment model in Prisma schema
- [x] Webhook endpoint handles SePay payload
- [x] Deduplication by SePay transaction ID
- [x] Environment variables validated
- [x] Unit tests passing

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Duplicate webhooks | Use unique constraint on `sepayTxId` |
| Invalid payload | Zod schema validation |
| Missing env vars | Graceful fallback in dev |

## Next Steps

1. Run `/clear` to start fresh context
2. Execute: `/cook --auto /Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1545-sepay-payment-integration/plan.md`
