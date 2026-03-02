# Figma-to-CSS Extraction Rules

## Auto-Layout → Flexbox/Grid

| Figma Property | CSS Output |
|----------------|------------|
| `layoutMode: HORIZONTAL` | `display: flex; flex-direction: row` |
| `layoutMode: VERTICAL` | `display: flex; flex-direction: column` |
| `primaryAxisAlignItems: MIN` | `justify-content: flex-start` |
| `primaryAxisAlignItems: CENTER` | `justify-content: center` |
| `primaryAxisAlignItems: MAX` | `justify-content: flex-end` |
| `primaryAxisAlignItems: SPACE_BETWEEN` | `justify-content: space-between` |
| `counterAxisAlignItems: MIN` | `align-items: flex-start` |
| `counterAxisAlignItems: CENTER` | `align-items: center` |
| `counterAxisAlignItems: MAX` | `align-items: flex-end` |
| `itemSpacing` | `gap: {value}px` (column-gap in horizontal, row-gap in vertical) |
| `counterAxisSpacing` | `row-gap: {value}px` (horizontal) or `column-gap: {value}px` (vertical) |
| `layoutWrap: WRAP` | `flex-wrap: wrap` |
| `paddingTop/Right/Bottom/Left` | `padding: {t}px {r}px {b}px {l}px` |

## Fills → Colors

```
fills[0].color.r → Math.round(r * 255)
fills[0].color.g → Math.round(g * 255)
fills[0].color.b → Math.round(b * 255)
fills[0].opacity → Include in rgba() if < 1
```

**Gradient fills:**
- `fills[0].type: GRADIENT_LINEAR` → `linear-gradient()`
- `gradientHandlePositions` → angle calculation
- `gradientStops` → color stop positions

## Text → Typography

| Figma Property | CSS Output |
|----------------|------------|
| `fontFamily` | `font-family` (import from Google Fonts or local) |
| `fontSize` | `font-size: {value}px` |
| `fontWeight` | `font-weight: {value}` |
| `lineHeightPx` | `line-height: {value}px` |
| `letterSpacing` | `letter-spacing: {value}px` |
| `textAlignHorizontal` | `text-align: left/center/right/justify` |
| `textDecoration` | `text-decoration: underline/line-through/none` |
| `textCase: UPPER` | `text-transform: uppercase` |

## Effects → Shadows & Blur

| Figma Effect | CSS Output |
|--------------|------------|
| `DROP_SHADOW` | `box-shadow: {x}px {y}px {radius}px rgba(r,g,b,a)` |
| `INNER_SHADOW` | `box-shadow: inset {x}px {y}px {radius}px rgba(r,g,b,a)` |
| `LAYER_BLUR` | `filter: blur({radius}px)` |
| `BACKGROUND_BLUR` | `backdrop-filter: blur({radius}px)` |

## Corners & Strokes

| Figma Property | CSS Output |
|----------------|------------|
| `cornerRadius` | `border-radius: {value}px` |
| `rectangleCornerRadii` | `border-radius: {tl}px {tr}px {br}px {bl}px` |
| `strokes[0].color` | `border-color: hex` |
| `strokeWeight` | `border-width: {value}px` |
| `strokeAlign: INSIDE` | `box-sizing: border-box` |
| `strokeAlign: OUTSIDE` | Add strokeWeight to dimensions |

## Constraints → Responsive

| Figma Constraint | CSS Approach |
|------------------|-------------|
| `SCALE` | Percentage width/height |
| `STRETCH` | `width: 100%` or `flex: 1` |
| `MIN/MAX` | Fixed position from edge |
| `CENTER` | `margin: auto` or flex centering |
