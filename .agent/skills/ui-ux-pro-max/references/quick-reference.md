# UI/UX Pro Max - Quick Reference Card

## 🚀 Standard Workflow

```bash
# 1. Generate design system (REQUIRED - always start here)
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "product keywords" --design-system

# 2. Get additional details (optional)
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "keywords" --domain ux
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "keywords" --domain typography

# 3. Get stack guidelines (optional)
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "keywords" --stack html-tailwind
```

---

## 📸 Screenshot Best Practices

```typescript
// ALWAYS: Resize + JPEG + Viewport
browser_resize({ width: 1440, height: 900 })
browser_take_screenshot({ type: "jpeg" })
browser_snapshot()

// NEVER: Full-page PNG (causes context limit)
// ❌ browser_take_screenshot({ type: "png", fullPage: true })
```

---

## 🎨 Common Domains

| Domain | Use For |
|--------|---------|
| `product` | Product type recommendations |
| `style` | UI styles, effects |
| `typography` | Font pairings |
| `color` | Color palettes |
| `landing` | Page structure |
| `ux` | Best practices |
| `chart` | Chart types |

---

## 🛠️ Common Stacks

| Stack | Use For |
|-------|---------|
| `html-tailwind` | Default - Tailwind utilities |
| `react` | React/Next.js performance |
| `nextjs` | SSR, routing |
| `shadcn` | shadcn/ui components |
| `vue` | Vue.js apps |
| `svelte` | Svelte apps |
| `react-native` | Mobile apps |
| `flutter` | Flutter apps |

---

## 🎯 Priority Checklist

### CRITICAL (Do First)
- [ ] Color contrast 4.5:1 minimum
- [ ] Touch targets 44x44px minimum
- [ ] Focus states visible
- [ ] Alt text for images

### HIGH (Do Second)
- [ ] Viewport meta tag
- [ ] Minimum 16px font on mobile
- [ ] No horizontal scroll
- [ ] Image optimization (WebP, lazy load)

### MEDIUM (Do Third)
- [ ] Line height 1.5-1.75
- [ ] Smooth transitions 150-300ms
- [ ] No emoji icons (use SVG)
- [ ] Cursor pointer on clickable elements

---

## 🚫 Common Anti-Patterns

| ❌ Don't | ✅ Do |
|---------|-------|
| Use emojis as icons | Use SVG (Heroicons, Lucide) |
| `bg-white/10` in light mode | `bg-white/80` or higher |
| `text-gray-400` for body | `text-slate-600` minimum |
| Hover with scale transform | Hover with color/opacity |
| Skip `cursor-pointer` | Add to all clickable |
| Full-page PNG screenshots | JPEG viewport screenshots |

---

## 📊 Token Budget (200K session)

| Method | Tokens | % of Budget |
|--------|--------|-------------|
| PNG fullPage ❌ | 80K-120K | 40-60% |
| JPEG viewport ✅ | 4K-8K | 2-4% |
| Design system search | 5K | 2.5% |
| browser_snapshot | 500-2K | 0.25-1% |

**Use optimized approach → Keep 66.5% budget for actual work**

---

## 🔍 Search Examples

```bash
# Healthcare SaaS dashboard
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "healthcare saas dashboard professional" --design-system

# E-commerce beauty store
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "ecommerce beauty elegant luxury" --design-system -p "Beauty Store"

# Fintech crypto app
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "fintech crypto dark modern" --design-system

# Get specific UX guidelines
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux

# Get font pairings
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "elegant serif modern" --domain typography

# Get React performance tips
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "memo rerender" --stack react
```

---

## 💡 Pro Tips

1. **Always start with `--design-system`** for complete recommendations
2. **Resize browser before screenshots** to reduce tokens
3. **Use JPEG for UI reference** (PNG only for pixel-perfect)
4. **Combine screenshot + snapshot** for best context
5. **Search multiple times** with different keywords
6. **Check UX domain** for common issues (z-index, animation, a11y)
