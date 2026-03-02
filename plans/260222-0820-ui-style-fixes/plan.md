---
title: "UI Style Fixes - CSS Refactoring"
description: "Extract inline styles, add responsive breakpoints, fix topbar theme, add skeleton loaders, mobile sidebar"
status: complete
priority: P2
effort: 4.5h
branch: main
tags: [css, refactoring, responsive, accessibility, mobile]
created: 2026-02-22
completed: 2026-02-22
---

## Overview

Refactor BSA Kit UI styles to improve maintainability, responsiveness, and theme consistency. Custom CSS system with CSS variables - no Tailwind migration.

## Phases

| Phase | Description | Status | Effort |
|-------|-------------|--------|--------|
| [01](./phase-01-extract-inline-styles.md) | Extract inline styles to CSS classes | pending | 45min |
| [02](./phase-02-responsive-breakpoints.md) | Add responsive breakpoints to grid layouts | pending | 45min |
| [03](./phase-03-topbar-theme-fix.md) | Fix topbar dark theme with CSS variables | pending | 30min |
| [04](./phase-04-skeleton-components.md) | Add React skeleton components + Dashboard integration | pending | 90min |
| [05](./phase-05-mobile-sidebar.md) | Add mobile-responsive sidebar with hamburger | pending | 60min |

## Key Files

- `apps/web/app/globals.css` - Main stylesheet (4400+ lines)
- `apps/web/app/layout.tsx` - Root layout with sidebar
- `apps/web/app/page.tsx` - Dashboard with modals
- `apps/web/app/generate/page.tsx` - Generate page with forms
- `apps/web/app/components/Skeleton.tsx` - New skeleton components

## Dependencies

- Phase 01 → Phase 04 (modal classes needed for skeleton integration)
- Phase 05 can run in parallel with others

## Risks

- **Regression**: CSS changes may affect existing layouts
- **Theme parity**: Must test both light/dark modes
- **Mobile**: Responsive changes need device testing
- **Layout shift**: Skeleton heights must match content

## Success Criteria

1. Zero inline styles in JSX (except dynamic values)
2. Grid layouts responsive on all breakpoints
3. Topbar uses CSS variables in both themes
4. Skeleton components show during Dashboard loading
5. Mobile sidebar with hamburger toggle working
6. All existing functionality preserved
