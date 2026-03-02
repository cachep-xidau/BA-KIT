## Context Links

- Main stylesheet: `apps/web/app/globals.css`
- Dashboard: `apps/web/app/page.tsx` (skeleton integration)
- Components: `apps/web/app/components/Skeleton.tsx` (new)

## Overview

- **Priority:** P3
- **Status:** pending
- **Description:** Create reusable React skeleton components with pulse animation, integrate into Dashboard page.

## Key Insights

1. No existing skeleton/loading states in current codebase
2. App fetches projects, features, functions - ideal for skeleton UX
3. CSS variables already define colors, border-radius - leverage these
4. Animation `fadeIn` exists at line ~4500 - add pulse animation alongside
5. React components provide better DX than raw CSS classes

## Requirements

### Functional
- `<Skeleton>` base component with pulse animation
- `<SkeletonText>` for text placeholders (lines, varying widths)
- `<SkeletonCard>` for card placeholders
- `<SkeletonStat>` for stat card placeholders
- Respect both light and dark themes
- Dashboard integration: show skeletons while loading projects

### Non-Functional
- Use existing CSS variables for colors
- Subtle pulse animation (1.5s ease-in-out infinite)
- Accessible: `aria-hidden="true"` on skeleton elements
- TypeScript with proper prop types

## Architecture

```
apps/web/app/components/Skeleton.tsx
├── Skeleton (base)
├── SkeletonText (text lines)
├── SkeletonCard (card placeholder)
└── SkeletonStat (stat card placeholder)

CSS in globals.css:
├── .skeleton (base class)
├── .skeleton-text
├── .skeleton-card
├── .skeleton-stat
└── @keyframes skeleton-pulse
```

## Related Code Files

### Modify
- `apps/web/app/globals.css` - Add skeleton CSS classes
- `apps/web/app/page.tsx` - Add loading state with skeletons

### Create
- `apps/web/app/components/Skeleton.tsx` - React skeleton components

### Delete
- None

## Implementation Steps

1. **Add skeleton CSS classes** (globals.css)
   ```css
   /* ============================================
      Skeleton Loading States
      ============================================ */
   .skeleton {
     background: linear-gradient(
       90deg,
       var(--border-light) 0%,
       var(--border) 50%,
       var(--border-light) 100%
     );
     background-size: 200% 100%;
     animation: skeleton-pulse 1.5s ease-in-out infinite;
     border-radius: var(--radius-sm);
   }

   @keyframes skeleton-pulse {
     0% { background-position: 200% 0; }
     100% { background-position: -200% 0; }
   }

   .skeleton-text { height: 1em; border-radius: var(--radius-xs); }
   .skeleton-text--sm { width: 40%; }
   .skeleton-text--md { width: 60%; }
   .skeleton-text--lg { width: 80%; }
   .skeleton-text--full { width: 100%; }

   .skeleton-card { height: 120px; border-radius: var(--radius-md); }
   .skeleton-avatar { width: 40px; height: 40px; border-radius: var(--radius-full); }
   .skeleton-stat { height: 80px; border-radius: var(--radius-md); }
   ```

2. **Create Skeleton.tsx component**
   ```tsx
   interface SkeletonProps {
     className?: string;
     width?: string | number;
     height?: string | number;
   }

   export function Skeleton({ className = '', width, height }: SkeletonProps) {
     return (
       <div
         className={`skeleton ${className}`}
         style={{ width, height }}
         aria-hidden="true"
       />
     );
   }

   export function SkeletonText({ width = '100%', lines = 1 }: { width?: string; lines?: number }) {
     return (
       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
         {Array.from({ length: lines }).map((_, i) => (
           <Skeleton key={i} className="skeleton-text" width={width} />
         ))}
       </div>
     );
   }

   export function SkeletonCard() {
     return <Skeleton className="skeleton-card" />;
   }

   export function SkeletonStat() {
     return (
       <div className="glass-card-static skeleton-stat" style={{ padding: '1.35rem 1.5rem', display: 'flex', gap: '1rem' }}>
         <Skeleton className="skeleton-avatar" />
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
           <Skeleton className="skeleton-text" width="40%" height="1.5rem" />
           <Skeleton className="skeleton-text" width="60%" height="0.8rem" />
         </div>
       </div>
     );
   }
   ```

3. **Add loading state to Dashboard** (page.tsx)
   - Add `const [loading, setLoading] = useState(true)`
   - Set `setLoading(false)` after projects fetch
   - Show `<SkeletonStat />` x 3 while loading
   - Show `<SkeletonCard />` x 9 for artifact types while loading

4. **Export from components**

## Todo List

- [ ] Add skeleton CSS section to globals.css
- [ ] Add .skeleton base class
- [ ] Add @keyframes skeleton-pulse
- [ ] Add .skeleton-text, .skeleton-card, .skeleton-stat classes
- [ ] Create apps/web/app/components/Skeleton.tsx
- [ ] Export Skeleton, SkeletonText, SkeletonCard, SkeletonStat
- [ ] Add loading state to Dashboard page
- [ ] Replace stat cards with SkeletonStat while loading
- [ ] Replace artifact cards with SkeletonCard while loading
- [ ] Test in light theme
- [ ] Test in dark theme

## Success Criteria

- [ ] React skeleton components available
- [ ] Pulse animation works smoothly
- [ ] Uses CSS variables (theme-aware)
- [ ] Dashboard shows skeletons during initial load
- [ ] No layout shift when content loads
- [ ] TypeScript prop types working

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Animation performance | Low | Low | CSS animations are GPU-accelerated |
| Layout shift | Medium | Medium | Use fixed heights for skeleton containers |

## Security Considerations

None - pure UI components with no security implications.

## Next Steps

- Add skeletons to Generate page
- Create table row skeleton variant
- Consider skeleton for sidebar project list
