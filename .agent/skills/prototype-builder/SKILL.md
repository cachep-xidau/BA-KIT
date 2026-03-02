---
name: prototype-builder
description: Build pixel-perfect interactive prototypes from BMAD outputs (PRD, BRD, epic, UX spec) + Figma designs + Confluence docs. Zero hallucination — all visual values extracted from Figma MCP. Outputs working Next.js/React pages with exact CSS.
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# Prototype Builder

Build interactive prototypes with pixel-perfect fidelity to Figma designs.

**Core Rule: ZERO HALLUCINATION.** Every color, font, spacing, shadow value MUST come from Figma data or BMAD spec. Never invent visual values.

## When to Use

- Building interactive prototype from BMAD UX Design Specification
- Translating Figma designs into working React/Next.js pages
- Creating demo-ready prototypes for BSA Phase 5
- Stakeholder validation with clickable flows

## Input Sources (Priority Order)

| # | Source | MCP Tool | Extracts |
|---|--------|----------|----------|
| 1 | **Figma Design** | `get_figma_data(fileKey, nodeId)` | Layout, components, exact CSS |
| 2 | **Figma Tokens** | `get_file_styles(fileKey)` | Colors, typography, effects |
| 3 | **Figma Components** | `get_file_components(fileKey)` | Reusable component specs |
| 4 | **BMAD UX Spec** | Local file read | Visual foundation, component strategy |
| 5 | **Confluence** | `confluence_search` / `get_page` | Business rules, existing specs |
| 6 | **PRD/BRD/Epic** | Local file read | Requirements, acceptance criteria |

### Framelink vs Raw API

| Need | Use | Why |
|------|-----|-----|
| Screen layout, component tree | **Framelink** `get_figma_data` | Simplified structure, lower tokens |
| Exact design tokens (colors, typography) | **Raw API** `get_file_styles` | Full style objects with precise values |
| Component specs, variants | **Raw API** `get_file_components` | Detailed component metadata |
| Export images/icons | **Framelink** `download_figma_images` | Asset export with cropping support |

### Figma Account Routing

| Project | MCP Prefix |
|---------|------------|
| Default | `mcp__figma__` |
| AMS | `mcp__AMS_Figma__` |
| A2V | `mcp__A2V__` |
| AMS-Web3 | `mcp__AMS-Web3__` |
| Raw API | `mcp__figma-a2v__` |

## Anti-Hallucination Protocol

**MANDATORY before writing ANY CSS/style:**

```
1. EXTRACT from Figma → get_figma_data(fileKey, nodeId) per screen
2. EXTRACT design tokens → get_file_styles(fileKey) for colors/typography
3. MAP values → Create token-to-CSS mapping table
4. VERIFY → Cross-check with BMAD Visual Foundation (Step 8)
5. NEVER INVENT → If value missing, ASK user or flag [MISSING_FROM_FIGMA]
```

### Value Extraction Checklist

| Property | Source | Fallback |
|----------|--------|----------|
| Colors (hex/rgb) | Figma styles → BMAD color system | `[MISSING]` flag |
| Font family | Figma typography → BMAD typography | `[MISSING]` flag |
| Font size/weight | Figma node properties | BMAD type scale |
| Spacing (px) | Figma auto-layout/padding | BMAD spacing scale |
| Border radius | Figma node cornerRadius | `[MISSING]` flag |
| Shadows | Figma effects array | `[MISSING]` flag |
| Opacity | Figma node opacity | 1.0 (default) |
| Layout (flex/grid) | Figma auto-layout mode | Figma structure |

**If ANY `[MISSING]` flag remains → STOP and ask user before proceeding.**

## Build Protocol

### Phase 1: Design Token Extraction

```
1. Call get_file_styles(fileKey) → Extract ALL design tokens
2. Call get_file_components(fileKey) → Map component library
3. Read BMAD UX Spec → Sections: [Step 8] Visual Foundation, [Step 11] Component Strategy
4. Read Confluence docs (if provided) → Business rules, constraints
5. OUTPUT: Token map file (colors, typography, spacing, effects)
```

### Phase 2: Screen-by-Screen Extraction

**For EACH screen in the prototype:**

```
1. Call get_figma_data(fileKey, nodeId) → Get full layout tree
2. For each node, extract:
   - Position: x, y, width, height
   - Layout: layoutMode, padding, itemSpacing, counterAxisSpacing
   - Visual: fills[], strokes[], effects[], cornerRadius, opacity
   - Text: fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textAlign
   - Constraints: constraints.horizontal, constraints.vertical
3. Export image assets → download_figma_images(fileKey, nodes) for raster fills/icons
4. Map to CSS → Generate exact Tailwind classes or CSS custom properties
5. Document component hierarchy → Parent-child nesting
```

### Phase 3: Scaffold & Build

```
1. Create Next.js page structure (app router)
2. Generate globals.css with extracted tokens as CSS variables
3. Configure fonts via next/font (Google Fonts or local files from Figma)
4. Apply responsive breakpoints from BMAD [Step 13] Responsive Strategy
5. Build components bottom-up (atoms → molecules → organisms)
6. Wire navigation between screens
7. Add mock data from PRD/BRD/epic user stories
8. Add interactions from BMAD [Step 7] Core Interaction Definition + Figma prototype data
```

### Phase 4: Verify

```
1. mcp__playwright-headless__browser_resize({ width: 1440, height: 900 })
2. mcp__playwright-headless__browser_take_screenshot({ type: "jpeg" }) → Compare with Figma (JPEG viewport-only, never fullPage PNG)
3. mcp__playwright-headless__browser_snapshot → Verify accessibility tree
3. Check every extracted value against Figma source
4. Flag any deviation as [DRIFT] with explanation
```

## Output Structure

```
src/
├── app/
│   ├── globals.css          # Design tokens as CSS variables
│   ├── layout.tsx           # Root layout with fonts
│   └── (screens)/
│       ├── page.tsx          # Each Figma frame = 1 page
│       └── ...
├── components/
│   ├── ui/                  # Extracted Figma components
│   └── [screen-name]/       # Screen-specific components
├── lib/
│   ├── design-tokens.ts     # Token constants (type-safe)
│   └── mock-data.ts         # From PRD/BRD user stories
└── figma-audit.md           # Extraction log with source references
```

### figma-audit.md (Required)

Every prototype MUST include an audit trail:

```markdown
# Figma Extraction Audit

## Source
- File: [Figma URL]
- Extracted: [Date]
- Screens: [List of nodeIds]

## Token Map
| Token | Figma Value | CSS Variable | Source Node |
|-------|-------------|--------------|-------------|
| primary | #3B82F6 | --color-primary | style:123 |
| body-font | Inter 16/24 | --font-body | style:456 |

## Deviations
| Item | Figma | Implemented | Reason |
|------|-------|-------------|--------|
| (none if pixel-perfect) | | | |
```

## CSS Extraction Rules

> **Full reference:** `references/figma-css-extraction.md` — Auto-layout, fills, text, effects, corners, constraints mapping.

## Quick Start

```
User provides: Figma URL + BMAD spec (or PRD/BRD)
     ↓
Extract design tokens (Phase 1)
     ↓
Extract per-screen layout (Phase 2)
     ↓
Scaffold + Build (Phase 3)
     ↓
Verify with Playwright (Phase 4)
     ↓
Output: Working prototype + figma-audit.md
```

## Related Skills

| Skill | Relationship |
|-------|-------------|
| `frontend-design` | Design principles (loaded by frontend-specialist) |
| `bsa-solution-design` | Screen descriptions, user stories |
| `app-builder` | Scaffolding templates, agent coordination |
| `tailwind-patterns` | Tailwind utility classes |
| `react-patterns` | Component patterns |
