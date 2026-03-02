# Phase 2: Pricing Page UI

> Parent: [plan.md](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/plan.md)
> Depends on: [Phase 1](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/phase-01-data-layer.md)

## Overview

| Field | Value |
|---|---|
| **Date** | 2026-02-23 |
| **Priority** | P1 |
| **Effort** | 4h |
| **Status** | ⬜ pending |

Build the `/pricing` page with glassmorphism 3-column tier cards, monthly/annual toggle, feature comparison, credit calculator, and FAQ section.

## Key Insights (from brainstorming)

- **Layout 1 "Glassmorphism 3-Column"** selected — consistent with BSA Kit design
- Pro card highlighted with purple glow border + "Most Popular" badge
- Annual toggle shows -17% savings with animated reveal
- Credit cost-per-action table below cards → transparency
- Mobile: stacked cards with swipeable feel

## Requirements

1. New route: `/pricing` (Next.js App Router page)
2. Add "Pricing" nav link to sidebar (`layout.tsx`)
3. Three tier cards: Free, Pro (highlighted), Team
4. Monthly/Annual toggle pill switch
5. Feature comparison checklist per card
6. Credit cost table section
7. FAQ accordion section
8. Mobile responsive layout
9. "Current Plan" indicator on active tier

## Architecture

```
apps/web/app/pricing/
└── page.tsx          # 'use client' — single page component
```

Import `TIERS`, `CREDIT_COSTS`, `CREDIT_PACKS` from `@bsa-kit/shared/pricing`.

## Implementation Steps

### 2.1 Create Route `/pricing/page.tsx`

Components to build (all inline, consistent with app style):

**a) PricingHeader**
- Title: "Chọn gói phù hợp" (or "Choose Your Plan")
- Subtitle: "Tăng năng suất BSA gấp 10x"
- Billing toggle: Monthly ↔ Annual (pill switch)

**b) TierCard × 3**
- Glass-panel card with tier name, price, credit count
- Feature checklist (✅/❌/limited)
- CTA button: "Get Started" (Free), "Upgrade to Pro" (Pro), "Contact Us" (Team)
- Pro card: slightly larger, purple glow border, "Most Popular" badge
- Current plan indicator if active

**c) CreditCostTable**
- Grid showing each action → credit cost
- Icons per action (Generate, Batch, Analysis, etc.)

**d) FAQAccordion**
- 5-6 common questions
- Expandable/collapsible

### 2.2 Add Nav Link

In `layout.tsx`, add to `TOP_NAV` array:
```typescript
{ href: '/pricing', label: 'Pricing', icon: CreditCard },
```

### 2.3 Style Specifications

| Element | Style |
|---|---|
| Card container | `glass-panel` + `border-radius: 1rem` |
| Pro card | `border: 2px solid #7c3aed` + `box-shadow: 0 0 30px rgba(124,58,237,0.15)` |
| Toggle | Pill switch with `var(--primary)` active bg |
| Price text | `2.5rem` font, `font-weight: 800` |
| Feature check | `lucide-react Check` icon in green |
| Feature cross | `lucide-react X` icon in dim |
| CTA (Pro) | `background: var(--primary)`, solid |
| CTA (Free/Team) | `glass-button` ghost style |

### 2.4 Responsive Layout

- **Desktop (≥1024px):** 3 columns, Pro center card 10% larger
- **Tablet (768–1023px):** 3 columns equal size
- **Mobile (<768px):** Single column, stacked cards

## Todo

- [ ] 2.1 Create `apps/web/app/pricing/page.tsx`
- [ ] 2.2 Build PricingHeader with billing toggle
- [ ] 2.3 Build TierCard component (3 instances)
- [ ] 2.4 Build CreditCostTable
- [ ] 2.5 Build FAQAccordion
- [ ] 2.6 Add "Pricing" to sidebar nav
- [ ] 2.7 Mobile responsive testing

## Success Criteria

- `/pricing` page renders 3 tier cards
- Toggle switches between monthly/annual prices
- Pro card visually highlighted
- Current plan badge shown correctly
- Credit cost table displays all 7 action types
- FAQ expandable sections work
- Mobile layout stacks properly

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Large CSS file (149K) conflicts | Use inline styles (existing pattern) + scoped CSS |
| Pricing import from shared package | Ensure `@bsa-kit/shared` builds before web dev server |
