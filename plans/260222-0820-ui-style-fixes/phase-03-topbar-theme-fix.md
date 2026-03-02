## Context Links

- Main stylesheet: `apps/web/app/globals.css` (lines 316-370 - topbar styles)
- Root layout: `apps/web/app/layout.tsx` (uses `.topbar` class)

## Overview

- **Priority:** P2
- **Status:** pending
- **Description:** Replace hardcoded topbar colors with CSS variables for proper theme support. Currently uses hardcoded `#1E293B` and `#0F1A2A`.

## Key Insights

1. Topbar uses hardcoded dark colors in both themes (lines 322, 329)
2. Dark theme override at line 333-336 also hardcodes
3. Should use CSS variables for consistency with rest of app
4. Other components (sidebar, cards) properly use CSS variables

## Requirements

### Functional
- Topbar uses CSS variables for background and border
- Light theme: appropriate dark topbar (matches current)
- Dark theme: appropriate darker topbar (matches current)
- Smooth theme transitions

### Non-Functional
- Define variables in :root and [data-theme="dark"]
- Maintain existing visual appearance exactly
- Keep transition animations working

## Architecture

```
:root {
  --bg-topbar: #1E293B;
  --topbar-border: #334155;
  --topbar-text: #ffffff;
}

[data-theme="dark"] {
  --bg-topbar: #0F1A2A;
  --topbar-border: #1E293B;
}

.topbar {
  background: var(--bg-topbar);
  border-bottom: 1px solid var(--topbar-border);
  color: var(--topbar-text);
}
```

## Related Code Files

### Modify
- `apps/web/app/globals.css` - Add variables and update topbar class

### Create
- None

### Delete
- None

## Implementation Steps

1. **Add topbar variables to :root** (after line 137)
   ```css
   --bg-topbar: #1E293B;
   --topbar-border: #334155;
   --topbar-text: #ffffff;
   ```

2. **Add topbar variables to dark theme** (after line 213)
   ```css
   --bg-topbar: #0F1A2A;
   --topbar-border: #1E293B;
   ```

3. **Update .topbar class** (line 316-331)
   - Replace `background: #1E293B;` → `background: var(--bg-topbar);`
   - Replace `border-bottom: 1px solid #334155;` → `border-bottom: 1px solid var(--topbar-border);`
   - Replace `color: #fff;` → `color: var(--topbar-text);`

4. **Remove dark theme override** (lines 333-336)
   - Delete the entire `[data-theme="dark"] .topbar` block (variables handle it now)

5. **Verify theme toggle transition** works with new variables

## Todo List

- [ ] Add `--bg-topbar` to :root
- [ ] Add `--topbar-border` to :root
- [ ] Add `--topbar-text` to :root
- [ ] Add `--bg-topbar` to dark theme
- [ ] Add `--topbar-border` to dark theme
- [ ] Update .topbar to use variables
- [ ] Remove [data-theme="dark"] .topbar override
- [ ] Test light theme topbar appearance
- [ ] Test dark theme topbar appearance
- [ ] Test theme toggle transition

## Success Criteria

- [ ] Topbar uses CSS variables (no hardcoded colors in .topbar class)
- [ ] Visual appearance identical to current in both themes
- [ ] Theme transition animation works smoothly
- [ ] No [data-theme="dark"] .topbar override needed

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Color mismatch | Low | Low | Use exact hex values in variables |
| Transition flash | Low | Low | Variables support transitions |

## Security Considerations

None - pure CSS refactoring.

## Next Steps

- Proceed to Phase 04 (Skeleton Components) after completion
- Consider adding topbar variants (transparent, blur) for future use
