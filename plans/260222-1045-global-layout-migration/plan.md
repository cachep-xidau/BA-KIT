# Global UI Layout Migration Plan (Option A)

This plan details the migration of the global `layout.tsx` and the `connections/page.tsx` to the newly approved dark glassmorphism Tailwind design template.

## Execution Phases

### Phase 1: Global Styles & Root Configuration
**Goal:** Adapt `globals.css` to include the requested CSS variables and basic body styling.
- Inject the new `--bg-[...]`, `--accent-[...]`, `--text-[...]` and status badge colors into `:root`.
- Update the `body` tag in `globals.css` to use the provided `radial-gradient` dark background.
- Extract the utility classes from the template (`.glass-panel`, `.glass-button`, `.status-badge`) into `@layer components` in Tailwind or regular CSS so they can be reused across pages.

### Phase 2: Main Layout Shell (`layout.tsx`)
**Goal:** Transform the global shell while preserving existing features (project fetching, mobile menu, theme logic).
- Remove the old `.app-shell` styling and replace with the Tailwind equivalent (`flex h-screen overflow-hidden`).
- Build the new left `<aside>` Sidebar using the provided HTML template classes.
- Re-wire the existing `projects` state mapping (Next.js Link tags, the "Add Project" button) into the new sidebar design.
- Wrap the `<main>` children container to handle scrolling properly, leaving out the page-specific Topbar logic.

### Phase 3: Page Context Topbars
**Goal:** Implement the top section (Header) shown in the template.
- Move the `<header>` element from the template down into the specific pages (like `connections/page.tsx`, `page.tsx`), since "MCP Connections" and the action buttons are page-specific.
- Ensure the header visually sticks or stays at the top of the main scroll container.

### Phase 4: Connections Page Content Redesign
**Goal:** Migrate the actual server cards to the new design.
- Replace the old `mcp-card` classes with the new `connection-card glass-panel` styles.
- Convert the connected and disconnected statuses into the new `status-badge` pulse designs.
- Implement the "Recent MCP Activities" mockup table layout on the connections page.

## Verification Criteria
> [!IMPORTANT]
> - Does the global sidebar successfully list the dynamic projects from SQLite?
> - Does clicking a navigation link smoothly route to the page without a full reload?
> - Is the responsive menu still accessible (or safely hidden) on small screens?
> - Are other pages (like the project overview) legible on the newly enforced dark gradient background?

Once approved, we will begin with Phase 1.
