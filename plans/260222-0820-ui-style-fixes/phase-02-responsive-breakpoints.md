## Context Links

- Main stylesheet: `apps/web/app/globals.css` (lines 935-963 for grids, media queries at 3900+)
- Dashboard: `apps/web/app/page.tsx` (uses `.grid-3`)
- Generate page: `apps/web/app/generate/page.tsx` (uses `.grid-auto`)

## Overview

- **Priority:** P1
- **Status:** pending
- **Description:** Refactor grid layouts with proper mobile-first responsive breakpoints. Current grids have inconsistent breakpoint handling.

## Key Insights

1. Existing breakpoints in globals.css: 1280px, 1024px, 768px, 480px (scattered)
2. Grid classes defined at line 935-963 with media queries at 3900+
3. Current responsive approach is desktop-first (overrides downward)
4. Should standardize on: 640px (sm), 768px (md), 1024px (lg)

## Requirements

### Functional
- `.grid-3`: 1 col mobile → 2 cols tablet → 3 cols desktop
- `.grid-4`: 1 col mobile → 2 cols tablet → 4 cols desktop
- `.grid-auto`: Single column on mobile, auto-fill on larger screens
- Smooth transitions at breakpoints

### Non-Functional
- Use CSS custom properties for breakpoints if possible
- Maintain existing gap values
- Keep CSS DRY (combine media queries)

## Architecture

```
/* Grid System - Mobile First Approach */

/* Base (mobile): 1 column */
.grid-3, .grid-4 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.grid-auto {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

/* sm: 640px - 2 columns */
@media (min-width: 640px) {
  .grid-3, .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-auto { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
}

/* lg: 1024px - full columns */
@media (min-width: 1024px) {
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-4 { grid-template-columns: repeat(4, 1fr); }
  .grid-auto { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
}
```

## Related Code Files

### Modify
- `apps/web/app/globals.css` - Refactor grid classes and media queries

### Create
- None

### Delete
- Duplicate/broken media query rules for grids (lines 3919-3990, 4343-4377)

## Implementation Steps

1. **Define breakpoint variables** (globals.css :root)
   ```css
   --breakpoint-sm: 640px;
   --breakpoint-md: 768px;
   --breakpoint-lg: 1024px;
   ```

2. **Rewrite .grid-3 base** (line 935)
   - Change to mobile-first: `grid-template-columns: 1fr`

3. **Rewrite .grid-4 base** (line 941)
   - Change to mobile-first: `grid-template-columns: 1fr`

4. **Rewrite .grid-auto base** (line 953)
   - Change to mobile-first: `grid-template-columns: 1fr`

5. **Add @640px media query**
   ```css
   @media (min-width: 640px) {
     .grid-3, .grid-4 { grid-template-columns: repeat(2, 1fr); }
     .grid-auto { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
   }
   ```

6. **Add @1024px media query**
   ```css
   @media (min-width: 1024px) {
     .grid-3 { grid-template-columns: repeat(3, 1fr); }
     .grid-4 { grid-template-columns: repeat(4, 1fr); }
   }
   ```

7. **Remove duplicate grid rules** from scattered media queries
   - Clean up lines 3919-3928, 3952-3966, 3987-3989, 4343-4351, 4369-4377

8. **Test responsive behavior**
   - Mobile (375px): all grids single column
   - Tablet (768px): 2 columns
   - Desktop (1280px): full columns

## Todo List

- [ ] Add breakpoint CSS variables to :root
- [ ] Rewrite .grid-3 with mobile-first approach
- [ ] Rewrite .grid-4 with mobile-first approach
- [ ] Rewrite .grid-auto with mobile-first approach
- [ ] Add consolidated 640px breakpoint
- [ ] Add consolidated 1024px breakpoint
- [ ] Remove duplicate/broken grid media queries
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1280px)

## Success Criteria

- [ ] Grid layouts display single column on mobile
- [ ] Grid layouts display 2 columns on tablet (640-1023px)
- [ ] Grid layouts display full columns on desktop (1024px+)
- [ ] No visual regression on any viewport
- [ ] CSS is DRY (no duplicate media queries)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breakpoint conflicts | Medium | Medium | Remove old media queries completely |
| Layout shift | Low | High | Test all pages at each breakpoint |

## Security Considerations

None - pure CSS refactoring.

## Next Steps

- Proceed to Phase 03 (Topbar Theme Fix) after completion
- Consider CSS Grid `auto-fit` vs `auto-fill` optimization (future)
