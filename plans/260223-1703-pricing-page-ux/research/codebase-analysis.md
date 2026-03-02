# Codebase Research — Pricing Page & Upgrade UX

## Current App Architecture

**Monorepo:** Turborepo + pnpm, 4 packages
- `apps/web` — Next.js 15 App Router, inline-styled `'use client'` components
- `apps/api` — Express 5 + Prisma + SQLite
- `packages/ai-engine` — Claude + Gemini routing
- `packages/shared` — Types + Zod schemas

## Existing Routes & Nav

Sidebar nav (`layout.tsx`): Repo (`/`), Skills (`/skills`), Settings (`/settings`)
Additional routes: `/projects/[id]`, `/generate`, `/artifacts`, `/connections`

**No `/pricing` route currently exists.**

## Relevant Existing Patterns

### UI Patterns (from `page.tsx`, `layout.tsx`)
- **Glass panels:** `className="glass-panel"` + `backdrop-filter: blur`
- **Cards:** `className="app-card"` + `app-card-grid`
- **Buttons:** `className="glass-button"` or inline-styled primary buttons
- **Modals:** Fixed inset overlay + `glass-panel` centered card
- **Loading:** `<Loader>` from lucide-react with spin animation
- **Theme:** CSS variables `var(--text-primary)`, `var(--bg-elevated)`, etc.

### Payment Integration (existing)
- **Prisma model:** `Payment` — SePay webhook, amounts, status
- **Route:** `POST /api/webhooks/sepay` — idempotent webhook handler
- **Service:** `services/sepay.ts` — payload parsing + validation

### Database Models (relevant)
- `Payment` — sepayTxId, amount, content, status, projectId
- `Project` — existing project model with artifacts/features count
- No `Subscription`, `CreditBalance`, or `Tier` models yet

## Key CSS Classes Available

From `globals.css` (149K lines):
- `.glass-panel`, `.glass-button`, `.app-card`, `.app-card--dashed`
- `.app-card-grid`, `.app-card-grid--4col`
- `.status-badge`, `.status-connected`, `.status-disconnected`
- `.nav-link`, `.nav-link.active`
- CSS variables for colors, borders, shadows

## What Needs to Be Built

| Component | Exists? | Notes |
|---|---|---|
| Pricing page route | ❌ | New: `/pricing` |
| Subscription tier data | ❌ | Need Prisma models or static config |
| Credit balance display | ❌ | Header badge component |
| Upgrade flow UI | ❌ | Modal/slide-over panel |
| Downgrade flow UI | ❌ | Settings sub-section |
| Credit pack purchase | ❌ | Quick-buy dropdown |
| Payment integration | ✅ | SePay exists, extend for subscriptions |
| Plan management API | ❌ | New API routes needed |

## Unresolved Questions

1. SePay supports VietQR bank transfers — is this the only payment method for subscriptions?
2. Should pricing data be hardcoded (config file) or database-driven?
3. Auth system (Epic 7) doesn't exist yet — how to track per-user subscriptions without auth?
