# Phase 1: New Connect Modal (Stitch Design)

## Goal
Replace the current single-column connect modal with Stitch's two-column, stepped design.

## Target
#### [NEW] `ConnectModal.tsx`
New component at `app/connections/ConnectModal.tsx`

## Design Spec (from Stitch)

### Layout
- Full-screen backdrop: `bg-black/60 backdrop-blur-sm`
- Modal: `max-w-2xl` (wider than current `max-w-lg`)
- Two-column layout for Step 2: left = form fields, right = sync capabilities

### Step 1 — SELECT PROVIDER
- Section header: `①  SELECT PROVIDER` (numbered circle + uppercase label)
- 4 horizontal cards in a row: Figma, Confluence, GitHub, Jira
- Each card: icon + name, `border-2 border-transparent` → selected state: `border-indigo-500 bg-indigo-500/10`
- Clicking a card selects the provider and auto-advances focus to Step 2

### Step 2 — AUTHENTICATION & PERMISSIONS
- Section header: `②  AUTHENTICATION & PERMISSIONS`
- **Left column** (60%):
  - `API Access Token` — password input with eye toggle icon
  - Helper text below: `Token must have read:project scope enabled.` (use `cred.placeholder` data)
  - `Workspace URL` — text input, placeholder from registry
- **Right column** (40%):
  - Card with title `Sync Capabilities`
  - 3 checkboxes:
    - ✅ Read Project Requirements (PRDs) — "Allow importing text content from files."
    - ✅ Write/Update Artifacts — "Enable bi-directional sync for comments."
    - ☐ Sync Visual Diagrams — "Access vector data for diagram generation."
  - All decorative — state doesn't affect API call

### Footer
- Left: `🔄 Test Connection` — ghost button with refresh icon
  - On click: calls connect API, shows success/fail inline
- Right: `Cancel` (ghost) + `Save & Connect →` (indigo primary)
- Primary button: `bg-indigo-600 hover:bg-indigo-500` with right arrow icon

### Close
- `✕` button at top-right corner

## Props Interface
```tsx
interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (serverId: string, name: string, credentials: Record<string, string>) => Promise<void>;
  servers: MCPServerEntry[];
  initialServerId?: string; // Pre-select a provider
  connectError?: string;
  connecting?: boolean;
}
```

## Implementation Notes
- Extract from `page.tsx` lines 568-646 (current modal)
- Provider selection state: `selectedProvider: MCPServerEntry | null`
- Eye toggle for password fields: local `showPassword` state per field
- Animate step transitions with `transition-all duration-200`

---

## Verification
- [ ] Modal opens from "Connect New Service" header button
- [ ] Modal opens from individual card "Connect" buttons (pre-selects provider)
- [ ] Provider cards highlight on selection
- [ ] Credential fields render based on selected provider
- [ ] Test Connection shows loading + result
- [ ] Save & Connect calls parent handler
- [ ] Cancel / backdrop click closes modal
- [ ] X button closes modal
