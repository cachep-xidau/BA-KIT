# Phase 3: Server Cards + Grid Redesign

## Goal
Upgrade the server cards and grid layout to match the Stitch visual language — tighter spacing, blue active borders, and refined status indicators.

## Target
#### [MODIFY] `page.tsx` — card grid section (lines 370-458)
#### [MODIFY] `mcp-registry.ts` — add `iconColor` field for provider-specific accent colors

## Design Spec

### Card Refinements
- **Connected cards**: `border-indigo-500/30 bg-indigo-500/5` with subtle left-side accent
- **Icon**: Provider-specific color (Figma=purple, GitHub=white, Confluence=blue, Jira=blue)
- **Status dot**: Small colored circle next to card title:
  - 🟢 Connected
  - 🟡 Connecting
  - 🔴 Error
  - ⚫ Not configured (dim gray)
- **Remove separate status badge row** — integrate the dot into the title row
- **Sync info**: Move "Last synced: X ago" to a small `text-[10px]` line under subtitle
- **Hover**: `border-indigo-500/20 bg-slate-800/80` with subtle shadow

### Action Buttons
- Keep existing button logic but refine sizing
- Connected: `Manage` + `⟳` (sync) stays
- Add: 3-dot menu shows `Disconnect` option

### Grid
- Keep responsive grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- Remove `2xl:grid-cols-4` — Stitch caps at 3 columns
- Gap: `gap-3` (tighter than current `gap-4`)

### Registry Changes
Add `iconColor` to `MCPServerEntry`:
```ts
iconColor?: string; // Tailwind color class for icon background, e.g. 'bg-purple-500/15'
```
Update each server entry with provider-appropriate colors.

---

## Verification
- [ ] Connected cards have indigo accent border
- [ ] Status dots render next to titles
- [ ] Grid is 3-column max on large screens
- [ ] Hover state shows subtle blue glow
- [ ] 3-dot menu includes disconnect option
