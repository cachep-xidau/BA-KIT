## Context Links

- Main stylesheet: `apps/web/app/globals.css`
- Dashboard: `apps/web/app/page.tsx` (lines 147-221 - modal inline styles)
- Layout: `apps/web/app/layout.tsx` (lines 224-230 - sidebar divider)

## Overview

- **Priority:** P0 (highest)
- **Status:** pending
- **Description:** Extract all inline styles from JSX to dedicated CSS classes in globals.css. Improves maintainability and enables theme consistency.

## Key Insights

1. Modal backdrop pattern appears in `page.tsx` - fixed positioning with blur
2. Sidebar bottom divider uses inline styles in `layout.tsx`
3. Success toast styling hardcoded in modal
4. Existing CSS uses BEM-like naming (`.sidebar-nav`, `.glass-card`)

## Requirements

### Functional
- Create reusable CSS classes for repeated inline style patterns
- Preserve exact visual appearance after migration
- Support both light and dark themes

### Non-Functional
- Follow existing CSS naming conventions (kebab-case, BEM-like)
- Keep CSS organized with clear section comments

## Architecture

```
globals.css
├── /* Modal Utilities */ (new section)
│   ├── .modal-backdrop
│   ├── .modal-content
│   └── .modal-header
├── /* Sidebar */ (existing)
│   └── .sidebar-divider (new)
└── /* Feedback */ (new section)
    └── .success-toast
```

## Related Code Files

### Modify
- `apps/web/app/globals.css` - Add new utility classes
- `apps/web/app/page.tsx` - Replace inline styles with classes
- `apps/web/app/layout.tsx` - Replace inline styles with classes

### Create
- None (adding to existing files)

### Delete
- None

## Implementation Steps

1. **Add modal backdrop class** (globals.css)
   ```css
   .modal-backdrop {
     position: fixed;
     inset: 0;
     background: rgba(0, 0, 0, 0.5);
     backdrop-filter: blur(4px);
     -webkit-backdrop-filter: blur(4px);
     display: flex;
     align-items: center;
     justify-content: center;
     z-index: 1000;
   }
   ```

2. **Add modal content class** (globals.css)
   ```css
   .modal-content {
     width: 100%;
     max-width: 480px;
     padding: 2rem;
     animation: fadeIn 0.2s ease;
   }
   ```

3. **Add modal header class** (globals.css)
   ```css
   .modal-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 1.5rem;
   }
   ```

4. **Add success toast class** (globals.css)
   ```css
   .success-toast {
     display: flex;
     align-items: center;
     gap: 0.5rem;
     padding: 0.75rem 1rem;
     border-radius: 8px;
     background: var(--success-bg);
     color: var(--color-success);
     font-weight: 500;
     font-size: 0.85rem;
   }
   ```

5. **Add sidebar divider class** (globals.css)
   ```css
   .sidebar-divider {
     border-top: 1px solid var(--border);
     padding-top: 0.75rem;
     display: flex;
     flex-direction: column;
     gap: 4px;
   }
   ```

6. **Update page.tsx modal** (lines 147-181)
   - Replace backdrop inline styles with `.modal-backdrop`
   - Replace content inline styles with `.modal-content` on `.glass-card-static`
   - Replace header inline styles with `.modal-header`
   - Replace success inline styles with `.success-toast`

7. **Update layout.tsx sidebar** (lines 224-230)
   - Replace inline border/padding with `.sidebar-divider`

## Todo List

- [ ] Add `.modal-backdrop` class to globals.css
- [ ] Add `.modal-content` class to globals.css
- [ ] Add `.modal-header` class to globals.css
- [ ] Add `.success-toast` class to globals.css
- [ ] Add `.sidebar-divider` class to globals.css
- [ ] Update page.tsx to use new classes
- [ ] Update layout.tsx to use new classes
- [ ] Test light theme
- [ ] Test dark theme

## Success Criteria

- [ ] No inline styles for modal positioning/styling
- [ ] No inline styles for sidebar bottom section
- [ ] Visual appearance unchanged in both themes
- [ ] CSS classes follow existing naming patterns

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Visual regression | Medium | Medium | Side-by-side comparison before/after |
| Missing dynamic styles | Low | Low | Review all inline styles carefully |

## Security Considerations

None - pure CSS refactoring with no security implications.

## Next Steps

- Proceed to Phase 02 (Responsive Breakpoints) after completion
- Consider creating storybook components for modal variants (future)
