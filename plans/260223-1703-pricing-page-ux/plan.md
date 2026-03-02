---
title: "Pricing Page & Upgrade/Downgrade UX"
description: "Implement pricing page wireframe with 3-tier comparison, credit balance header badge, upgrade/downgrade flows, and credit pack quick-buy — following Epic 11 monetization spec."
status: pending
priority: P1
effort: 12h
branch: main
tags: [pricing, monetization, ux, epic-11, frontend, api]
created: 2026-02-23
---

# Pricing Page & Upgrade/Downgrade UX

## Goal

Implement the pricing model / monetization UI for BSA Kit based on the [brainstorming session](file:///Users/lucasbraci/Desktop/Antigravity/_bmad-output/brainstorming/brainstorming-session-2026-02-23.md) and [Epic 11](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/docs/05.%20epics.md) specifications.

**Scope:** Frontend pricing page + credit balance header + upgrade/downgrade UX flows + supporting API routes. **No auth system** (deferred to Epic 7 v0.2).

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Pricing data source | Static config file (`shared/pricing.ts`) | No auth = no per-user DB; easy to tweak |
| Pricing page route | `/pricing` (new) + nav link in sidebar | Discoverable, shareable URL |
| Upgrade flow | Slide-over panel (no page navigation) | Brainstorm idea #79: zero navigation |
| Credit display | Header pill badge | Brainstorm idea #1: always visible |
| Downgrade flow | Settings → "My Plan" section | Natural location for plan management |
| Payment method | SePay VietQR (existing) | Already integrated |

## Phase Overview

| # | Phase | Est. | Status |
|---|---|---|---|
| 1 | [Data layer & shared config](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/phase-01-data-layer.md) | 2h | ⬜ pending |
| 2 | [Pricing page UI](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/phase-02-pricing-page.md) | 4h | ⬜ pending |
| 3 | [Credit balance & upgrade flow](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/phase-03-upgrade-flow.md) | 3h | ⬜ pending |
| 4 | [Downgrade, credit packs & polish](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/phase-04-downgrade-polish.md) | 3h | ⬜ pending |

## Dependencies

- **SePay payment webhook** — already functional (`apps/api/src/routes/webhooks.ts`)
- **Prisma + SQLite** — already configured
- **No auth** — current plan uses static/local state for "current plan" (will be replaced when Epic 7 lands)

## Research

- [Codebase analysis](file:///Users/lucasbraci/Desktop/Antigravity/projects/ba-kit/plans/260223-1703-pricing-page-ux/research/codebase-analysis.md) — existing UI patterns, payment integration, missing models
