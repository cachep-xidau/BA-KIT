# Phase 3: Credit Balance & Upgrade Flow

> Parent: [plan.md](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/plan.md)
> Depends on: [Phase 1](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/phase-01-data-layer.md), [Phase 2](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/phase-02-pricing-page.md)

## Overview

| Field | Value |
|---|---|
| **Date** | 2026-02-23 |
| **Priority** | P1 |
| **Effort** | 3h |
| **Status** | ⬜ pending |

Add credit balance badge to global header, soft-nudge upgrade prompts, and slide-over upgrade panel — the daily touchpoints for monetization.

## Key Insights (from brainstorming)

- **Idea #1:** Credit pill badge `142/300` always visible in header
- **Idea #79:** Zero page navigation — upgrade in slide-over panel
- **Idea #94-97:** Quick-buy credit packs from header dropdown
- **Idea #37:** Magnify credit value: "8 credits = 1 artifact = 2h saved"

## Requirements

1. Credit balance badge in app header (all pages)
2. Click badge → dropdown with usage breakdown + "Buy Credits" CTA
3. Upgrade slide-over panel (triggered from pricing page or nudge)
4. Soft nudge toast when credits < 20% remaining
5. "Insufficient credits" modal when trying action with 0 balance
6. Quick-buy dropdown for credit packs

## Implementation Steps

### 3.1 Credit Badge Component

Add to `layout.tsx` header area (after sidebar, in main content header):

```tsx
// CreditBadge — shows in top-right of every page
function CreditBadge({ credits, maxCredits, tier }: Props) {
  const pct = credits / maxCredits;
  const color = pct > 0.2 ? 'var(--text-dim)' : pct > 0.05 ? '#f59e0b' : '#ef4444';
  // Pill badge: "142/300 ⚡"
  // Click → CreditDropdown
}
```

### 3.2 Credit Dropdown Panel

On click of CreditBadge, shows:
- Current balance: `142/300 subscription` + `50 add-on`
- Usage breakdown (today): chat 3/50, projects 2/5
- Quick actions: [Buy Credits] [Upgrade Plan]
- Progress bar visualizing credit usage

### 3.3 Upgrade Slide-Over Panel

Triggered by "Upgrade" CTA anywhere in app. Slides in from right:
- Current plan summary
- Target plan comparison (mini pricing table)
- Billing toggle (monthly/annual)
- Payment section (SePay QR or placeholder)
- "Upgrade" CTA button
- Close/cancel button

### 3.4 Soft Nudge System

**Low credit toast:** When `credits < 20% of max`:
```
"Bạn còn 25 credits. [Mua thêm] hoặc [Nâng cấp]"
```
Show once per session (sessionStorage flag).

**Zero credit modal:** When action blocked:
```
"Hết credits — Cần 8 credits để generate artifact"
[Mua Credit Pack] [Nâng cấp Pro]
```

### 3.5 Hook: `usePlan()`

Create a React hook that fetches plan data and provides state:

```typescript
function usePlan() {
  // Fetch GET /api/plan
  // Return: { tier, credits, creditsMax, chatUsed, chatLimit, ... }
  // Auto-refresh on focus
  // Provide: upgradeTo(), buyCredits()
}
```

## Todo

- [ ] 3.1 Create `CreditBadge` component in layout
- [ ] 3.2 Create `CreditDropdown` panel
- [ ] 3.3 Create `UpgradeSlideOver` panel
- [ ] 3.4 Create `CreditNudgeToast` + `InsufficientCreditsModal`
- [ ] 3.5 Create `usePlan()` hook
- [ ] 3.6 Wire up to API endpoints (Phase 1)

## Success Criteria

- Credit badge visible on all pages with correct count
- Dropdown shows usage breakdown on click
- Upgrade panel slides in from right, shows comparison
- Low credit toast appears once when threshold hit
- Insufficient credit modal blocks action with upgrade CTAs
- `usePlan()` correctly fetches and caches plan data
