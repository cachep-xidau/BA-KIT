# Phase 2: Page Header + MCP Status Bar

## Goal
Redesign the page header to match the Stitch "Artifact Studio" header with MCP status indicator, breadcrumbs, and action buttons.

## Target
#### [MODIFY] `page.tsx` — header section (lines 337-367)

## Design Spec

### Header Bar (replaces current)
- Height: `h-14`
- Background: `bg-slate-900/80 backdrop-blur-xl border-b border-white/5`
- **Left side**:
  - MCP Status indicator: green dot + "MCP Status: Connected" text (or "Disconnected" in red)
  - Status derived from: count of connected servers > 0
- **Center/breadcrumb area**:
  - Breadcrumb: `Projects › {projectName}` or `MCP Connections`
  - Use `text-slate-500` for separator, `text-white` for current
- **Right side**:
  - Collaborator avatars (placeholder — 2-3 stacked circles)
  - Settings cog icon button
  - `Export` button (ghost style)
  - `Connect New Service` button (indigo primary, matches current)

### Sub-header / Title area
- Remove the current title+subtitle block from the header
- Title `MCP Connections` moves into the content area as a page-level heading
- Subtitle `Manage integrations with external MCP servers` below it

## Implementation Notes
- MCP status = `connections.filter(c => c.status === 'connected').length > 0`
- Breadcrumb is static for now (no router-level crumbs)
- Collaborator avatars: 3 colored circles with `z-index` stacking

---

## Verification
- [ ] MCP Status shows green "Connected" when ≥1 server connected
- [ ] MCP Status shows gray/red "Disconnected" when 0 connected
- [ ] Breadcrumb renders project name if available
- [ ] Connect New Service button opens modal
- [ ] Header is sticky on scroll
