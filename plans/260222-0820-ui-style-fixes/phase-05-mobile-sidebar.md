## Context Links

- Main layout: `apps/web/app/layout.tsx`
- Main stylesheet: `apps/web/app/globals.css`

## Overview

- **Priority:** P1
- **Status:** pending
- **Description:** Add mobile-responsive sidebar with hamburger menu toggle. Sidebar collapses to hamburger on mobile (< 768px).

## Key Insights

1. Current sidebar is always visible, fixed width 260px
2. No mobile consideration - sidebar takes 30%+ of mobile viewport
3. Topbar already exists - ideal place for hamburger toggle
4. CSS-only approach with React state for toggle

## Requirements

### Functional
- Hamburger menu button in topbar (visible only on mobile)
- Sidebar slides in/out on mobile
- Overlay backdrop when sidebar open on mobile
- Sidebar remains fixed visible on desktop (≥768px)
- Close sidebar when clicking outside or navigating

### Non-Functional
- Smooth slide animation (200-300ms)
- Touch-friendly tap targets (min 44px)
- Preserve desktop experience unchanged

## Architecture

```
Desktop (≥768px):
┌─────────────────────────────────────┐
│ Topbar (fixed)                       │
├─────────┬───────────────────────────┤
│ Sidebar │ Main Content               │
│ (fixed) │ (margin-left: 260px)       │
│         │                            │
└─────────┴───────────────────────────┘

Mobile (<768px):
┌─────────────────────────────────────┐
│ ☰ Topbar                            │
├─────────────────────────────────────┤
│ Main Content (full width)           │
│                                     │
└─────────────────────────────────────┘

Sidebar open (mobile):
┌─────────────────────────────────────┐
│ ☰ Topbar                            │
├─────────────────────────────────────┤
│▓▓▓▓▓▓▓▓│ Main Content (dimmed)      │
│ Sidebar │                            │
│ (slide) │                            │
└─────────┴───────────────────────────┘
```

## Related Code Files

### Modify
- `apps/web/app/globals.css` - Add responsive sidebar CSS
- `apps/web/app/layout.tsx` - Add mobile menu state and toggle

### Create
- None

### Delete
- None

## Implementation Steps

1. **Add CSS variables for mobile**
   ```css
   :root {
     --sidebar-transform-closed: translateX(-100%);
     --sidebar-transform-open: translateX(0);
   }
   ```

2. **Add mobile sidebar styles** (globals.css)
   ```css
   /* Mobile Sidebar */
   @media (max-width: 767px) {
     .sidebar {
       transform: var(--sidebar-transform-closed);
       transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
       z-index: 200;
     }

     .sidebar.open {
       transform: var(--sidebar-transform-open);
     }

     .main-content {
       margin-left: 0;
     }

     .sidebar-overlay {
       position: fixed;
       inset: 56px 0 0 0;
       background: rgba(0, 0, 0, 0.5);
       z-index: 150;
       opacity: 0;
       pointer-events: none;
       transition: opacity 250ms ease;
     }

     .sidebar-overlay.open {
       opacity: 1;
       pointer-events: auto;
     }

     .topbar__menu-toggle {
       display: flex;
     }
   }

   @media (min-width: 768px) {
     .topbar__menu-toggle {
       display: none;
     }

     .sidebar-overlay {
       display: none;
     }
   }
   ```

3. **Add hamburger button CSS**
   ```css
   .topbar__menu-toggle {
     align-items: center;
     justify-content: center;
     width: 36px;
     height: 36px;
     background: transparent;
     border: none;
     cursor: pointer;
     color: #fff;
     margin-right: 12px;
   }

   .topbar__menu-toggle:hover {
     background: rgba(255, 255, 255, 0.1);
     border-radius: 6px;
   }
   ```

4. **Update layout.tsx** - Add mobile menu state
   ```tsx
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
   const closeMobileMenu = () => setMobileMenuOpen(false);

   // Close menu on navigation
   useEffect(() => {
     closeMobileMenu();
   }, [pathname]);
   ```

5. **Add hamburger button to topbar**
   ```tsx
   <header className="topbar">
     <button
       className="topbar__menu-toggle"
       onClick={toggleMobileMenu}
       aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
       aria-expanded={mobileMenuOpen}
     >
       {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
     </button>
     <h1 className="topbar__title">BSA Kit</h1>
     ...
   </header>
   ```

6. **Add sidebar overlay**
   ```tsx
   <div
     className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`}
     onClick={closeMobileMenu}
   />
   ```

7. **Add open class to sidebar**
   ```tsx
   <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
   ```

8. **Import Menu icon from lucide-react**

## Todo List

- [ ] Add --sidebar-transform CSS variables
- [ ] Add @media (max-width: 767px) sidebar styles
- [ ] Add .topbar__menu-toggle styles
- [ ] Add .sidebar-overlay styles
- [ ] Add mobileMenuOpen state to layout.tsx
- [ ] Add hamburger button to topbar
- [ ] Add sidebar overlay element
- [ ] Add conditional 'open' class to sidebar
- [ ] Import Menu icon from lucide-react
- [ ] Close menu on pathname change
- [ ] Test on mobile viewport
- [ ] Test on desktop (sidebar still fixed)

## Success Criteria

- [ ] Hamburger visible only on mobile (<768px)
- [ ] Sidebar slides in smoothly on mobile
- [ ] Overlay dims main content when sidebar open
- [ ] Clicking overlay closes sidebar
- [ ] Navigating closes sidebar
- [ ] Desktop experience unchanged (sidebar always visible)
- [ ] Touch-friendly tap targets

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Layout shift on desktop | Low | High | Use @media queries, test desktop |
| Animation jank on mobile | Low | Medium | Use transform (GPU-accelerated) |
| Z-index conflicts | Medium | Medium | Use z-index: 200 for sidebar, 150 for overlay |

## Security Considerations

None - pure UI change with no security implications.

## Next Steps

- Consider swipe-to-open gesture (optional enhancement)
- Add keyboard navigation (Escape to close)
- Test on various mobile devices
