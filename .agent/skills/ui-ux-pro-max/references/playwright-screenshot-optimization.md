# Playwright Screenshot Optimization Guide

## Problem: Context Limit from Large Screenshots

Full-page PNG screenshots consume 80K-120K tokens, causing "Context limit reached" errors early in sessions.

## Solution: Best Hybrid Approach

Combine **JPEG format** + **viewport-only** + **browser resize** for 94% token reduction.

---

## Quick Reference

### ❌ NEVER (Causes Context Limit)
```typescript
browser_take_screenshot({
  type: "png",
  fullPage: true
})
// Result: 80K-120K tokens
```

### ✅ ALWAYS (Recommended)
```typescript
// Step 1: Resize browser to reduce pixels
browser_resize({ width: 1440, height: 900 })

// Step 2: Take JPEG screenshot (viewport only)
browser_take_screenshot({ type: "jpeg" })

// Step 3: Get text content for analysis
browser_snapshot()

// Result: 4K-8K tokens (94% reduction)
```

---

## Token Comparison Table

| Method | Tokens | Quality | Use Case |
|--------|--------|---------|----------|
| PNG fullPage | 80K-120K | Perfect | ❌ Never |
| JPEG fullPage | 40K-70K | Good | ❌ Avoid |
| PNG viewport | 8K-15K | Perfect | Rare pixel-perfect needs |
| **JPEG viewport** | **4K-8K** | **Good** | ✅ **Default** |
| JPEG viewport + resize | 2K-4K | Acceptable | Quick checks |
| browser_snapshot | 500-2K | Text-only | ✅ Always supplement |

---

## Viewport Size Guide

### Desktop
```typescript
browser_resize({ width: 1440, height: 900 })  // Standard
browser_resize({ width: 1920, height: 1080 }) // Large (use sparingly)
```

### Tablet
```typescript
browser_resize({ width: 768, height: 1024 })  // iPad
browser_resize({ width: 820, height: 1180 })  // iPad Air
```

### Mobile
```typescript
browser_resize({ width: 390, height: 844 })   // iPhone 14 Pro
browser_resize({ width: 375, height: 667 })   // iPhone SE
```

---

## Complete Workflow Example

### Bad Approach (Causes Context Limit)
```typescript
// Navigate to page
browser_navigate({ url: "https://example.com" })

// Take full-page screenshot
browser_take_screenshot({
  type: "png",
  fullPage: true,
  filename: "page.png"
})
// Result: 80K-120K tokens consumed → Context limit!
```

### Good Approach (Optimized)
```typescript
// Navigate to page
browser_navigate({ url: "https://example.com" })

// Resize to standard desktop viewport
browser_resize({ width: 1440, height: 900 })

// Take JPEG screenshot of viewport only
browser_take_screenshot({
  type: "jpeg",
  filename: "page-viewport.jpeg"
})

// Get text-based content for analysis
browser_snapshot()

// Result: ~5K tokens total (94% reduction)
```

---

## When to Use Each Format

### Use JPEG (90% of cases)
- ✅ Website screenshots for UI reference
- ✅ Design inspiration analysis
- ✅ Layout and color review
- ✅ General visual context

### Use PNG (rare cases)
- Pixel-perfect comparison needed
- Screenshots with transparency
- Technical debugging of visual glitches
- Screenshots where text clarity is critical

### Use browser_snapshot (always)
- ✅ Get page structure and content
- ✅ Extract text for analysis
- ✅ Supplement visual screenshots
- ✅ Accessibility tree inspection

---

## Advanced: Post-Processing

If you need even smaller files, create helper scripts:

### Option 1: ImageMagick (macOS/Linux)
```bash
#!/bin/bash
# Resize JPEG to max 1200px width
magick input.jpeg -resize 1200x\> -quality 85 output.jpeg
```

### Option 2: Python PIL (cross-platform)
```python
from PIL import Image

img = Image.open('input.jpeg')
img.thumbnail((1200, 9999))  # Max width 1200px
img.save('output.jpeg', 'JPEG', quality=85, optimize=True)
```

---

## Checklist Before Taking Screenshots

- [ ] Browser resized to appropriate viewport (1440x900 or smaller)
- [ ] Using `type: "jpeg"` (not PNG)
- [ ] **NOT** using `fullPage: true` flag
- [ ] Will supplement with `browser_snapshot()` for text content
- [ ] Only taking 1-2 screenshots max per analysis (not multiple)

---

## Token Budget Guidelines

For a typical UI/UX session with 200K token budget:

| Task | Tokens | Percentage |
|------|--------|------------|
| Design system search | 5K | 2.5% |
| Viewport JPEG screenshot (x2) | 10K | 5% |
| browser_snapshot (x2) | 2K | 1% |
| Code implementation | 50K | 25% |
| **Buffer for conversation** | **133K** | **66.5%** |

With optimized screenshots, you have 66.5% budget remaining for actual work.

With full-page PNG, you'd have only 10% budget remaining after screenshots.

---

## Summary

**3 Rules to Remember:**
1. **Always resize browser first** → `browser_resize({ width: 1440, height: 900 })`
2. **Always use JPEG format** → `type: "jpeg"`
3. **Never use fullPage flag** → Omit `fullPage` parameter

**Result:** 94% token savings while maintaining sufficient visual context for UI/UX work.
