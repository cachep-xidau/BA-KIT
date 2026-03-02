# Phase 4: Downgrade, Credit Packs & Polish

> Parent: [plan.md](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/plan.md)
> Depends on: [Phase 3](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/phase-03-upgrade-flow.md)

## Overview

| Field | Value |
|---|---|
| **Date** | 2026-02-23 |
| **Priority** | P2 |
| **Effort** | 3h |
| **Status** | ⬜ pending |

Implement downgrade flow in Settings, credit pack purchase, and final polish (animations, edge cases, responsive QA).

## Requirements

1. "My Plan" section in Settings page with plan management
2. Downgrade flow with consequence preview
3. Credit pack purchase flow (1-click buy from dropdown)
4. Retention offer on downgrade attempt
5. Animations & transitions polish
6. Edge case handling (0 credits, plan changes mid-session)

## Implementation Steps

### 4.1 Settings → "My Plan" Tab

Add new section to `settings/page.tsx`:

- **Plan card:** Current tier name + badge, price, renewal date
- **Credit bar:** Visual bar `142/300` with color coding
- **Billing info:** Payment method, last payment date
- **Actions:** [Change Plan] [Buy Credits] [Cancel Subscription]

### 4.2 Downgrade Flow

When user clicks "Downgrade" or selects lower tier:

1. **Warning modal:** "Khi hạ cấp, bạn sẽ mất:"
   - Projects over limit → "4/5 projects sẽ bị archived"
   - MCP connections → "3 connections sẽ bị disconnect"
   - Remaining credits → "45 subscription credits sẽ mất khi cycle kết thúc"
   - Add-on credits → "50 add-on credits sẽ được giữ lại ✅"
2. **Retention offer:** "Trước khi đi — giảm 20% cho 3 tháng tiếp?"
3. **Confirm:** "Hạ cấp cuối billing cycle (ngày X)"
4. Call `POST /api/plan/downgrade`

### 4.3 Credit Pack Purchase

From `CreditDropdown` (Phase 3):
- Show 3 pack cards: Mini (50 = 49k), Standard (150 = 129k), Mega (500 = 399k)
- 1-click buy with saved payment → `POST /api/plan/buy-credits`
- Toast: "✅ Đã thêm 150 credits"
- Badge updates instantly

### 4.4 Animations & Polish

| Element | Animation |
|---|---|
| Tier cards on load | `fadeInUp` staggered 100ms each |
| Toggle monthly→annual | Price cross-fade + savings badge `scaleIn` |
| Credit badge update | Number count-up animation |
| Slide-over panel | `translateX(100%) → 0` with backdrop fade |
| Nudge toast | Slide in from bottom-right, auto-dismiss 8s |
| Modal | `fadeIn` backdrop + `scaleIn` content |
| Pro card glow | Subtle pulse animation on border |

### 4.5 Edge Cases

| Case | Handling |
|---|---|
| 0 credits, tries generate | Block + modal with upgrade CTAs |
| Downgrade with >limit projects | Archive excess (don't delete) |
| Buy credits while at 0 | Instant add, refresh badge |
| Toggle annual on Free tier | Grey out / footnote "Available for Pro/Team" |
| API error on upgrade | Toast error + retry button |

## Todo

- [ ] 4.1 Add "My Plan" section to Settings page
- [ ] 4.2 Build DowngradeWarningModal
- [ ] 4.3 Build RetentionOfferModal
- [ ] 4.4 Build CreditPackPurchase in dropdown
- [ ] 4.5 Add animations (fadeInUp, scaleIn, count-up)
- [ ] 4.6 Handle edge cases
- [ ] 4.7 Responsive QA on mobile/tablet

## Success Criteria

- Settings shows current plan with full management UI
- Downgrade warning clearly shows consequences
- Retention offer appears before final downgrade
- Credit packs purchasable with 1-click
- All animations smooth (60fps)
- Edge cases handled gracefully without crashes

## Security Considerations

- Credit balance changes go through API (not client-side manipulation)
- Plan changes validated server-side against TIERS config
- No negative credits possible (server-side floor at 0)
