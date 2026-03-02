# Phase 1: Data Layer & Shared Config

> Parent: [plan.md](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/plan.md)

## Overview

| Field | Value |
|---|---|
| **Date** | 2026-02-23 |
| **Priority** | P1 |
| **Effort** | 2h |
| **Status** | ⬜ pending |

Create the shared pricing configuration, Prisma schema extensions, and API routes needed before building any UI.

## Key Insights

- No auth system yet → use static config + localStorage for "current plan" demo
- SePay payment model exists but has no subscription/tier logic
- Pricing data (tiers, credit costs, limits) should be a single source of truth in `packages/shared`

## Requirements

1. Static pricing config file with all tier data (from Epic 11)
2. Prisma schema: `UserPlan` model (local/demo mode — no auth)
3. API routes: `GET /api/plan`, `POST /api/plan/upgrade`, `POST /api/plan/buy-credits`
4. Credit cost constants per action type

## Related Code Files

- [packages/shared/src/index.ts](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/packages/shared/src/index.ts) — shared exports
- [apps/api/prisma/schema.prisma](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/apps/api/prisma/schema.prisma) — add UserPlan model
- [apps/api/src/index.ts](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/apps/api/src/index.ts) — register new routes

## Implementation Steps

### 1.1 Create `packages/shared/src/pricing.ts`

```typescript
// Static pricing config — single source of truth
export const TIERS = {
  free:  { name: 'Free',  price: 0,   credits: 30,   projects: 1,  chatPerDay: 10,  mcp: 0, users: 1 },
  pro:   { name: 'Pro',   price: 199000, credits: 300,  projects: 5,  chatPerDay: 50,  mcp: 3, users: 1 },
  team:  { name: 'Team',  price: 499000, credits: 1000, projects: 20, chatPerDay: -1,  mcp: -1, users: 5 },
} as const;

export const CREDIT_COSTS = {
  'generate-single': 8,
  'batch-pipeline': 30,
  'analysis-session': 10,
  'skill-action': 8,
  'extract-structure': 5,
  'prd-validate': 5,
  'mcp-tool-call': 1,
} as const;

export const CREDIT_PACKS = [
  { id: 'mini',     credits: 50,  price: 49000,  label: 'Mini' },
  { id: 'standard', credits: 150, price: 129000, label: 'Standard' },
  { id: 'mega',     credits: 500, price: 399000, label: 'Mega' },
] as const;

export type TierKey = keyof typeof TIERS;
```

### 1.2 Add Prisma `UserPlan` Model

```prisma
model UserPlan {
  id              String   @id @default("default")
  tier            String   @default("free")  // free | pro | team
  creditsRemaining Int     @default(30)
  creditsAddon    Int      @default(0)
  chatUsedToday   Int      @default(0)
  batchTrialUsed  Boolean  @default(false)
  billingCycle    String   @default("monthly")
  renewalDate     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 1.3 Create API Route `apps/api/src/routes/plan.ts`

- `GET /api/plan` — Return current plan, credit balance, usage stats
- `POST /api/plan/upgrade` — Change tier (body: `{ tier: 'pro' | 'team' }`)
- `POST /api/plan/downgrade` — Downgrade to lower tier
- `POST /api/plan/buy-credits` — Add credits from pack (body: `{ packId: 'mini' | 'standard' | 'mega' }`)
- `POST /api/plan/reset-daily` — Reset daily chat counter (triggered by cron or manual)

### 1.4 Export shared pricing from package

Update `packages/shared/src/index.ts` to re-export pricing config.

## Todo

- [ ] 1.1 Create `pricing.ts` in shared package
- [ ] 1.2 Add `UserPlan` model to Prisma schema
- [ ] 1.3 Run `npx prisma migrate dev`
- [ ] 1.4 Create `routes/plan.ts` with 5 endpoints
- [ ] 1.5 Register routes in `index.ts`
- [ ] 1.6 Seed default UserPlan record

## Success Criteria

- `GET /api/plan` returns tier, credits, limits
- `POST /api/plan/upgrade` changes tier and adjusts credits
- `POST /api/plan/buy-credits` adds credits to balance
- Prisma migration succeeds without breaking existing models
- Shared package builds successfully

## Risk Assessment

| Risk | Mitigation |
|---|---|
| No auth — who owns the plan? | Single `UserPlan` record with id="default", replaced in v0.2 |
| SePay not connected to subscriptions | Phase 1 = manual/demo; SePay integration for real payments is Phase 4 |
