# Stitch Design → Connections Page – Full Redesign

**Task**: Apply the Stitch "Artifact Studio" design language to `/connections`
**Option**: B – Full Page + Modal Redesign
**Est**: 4 phases, ~6-8 hours

## Phases

| # | Phase | Files | Est |
|---|---|---|---|
| 1 | New Connect Modal (Stitch) | `ConnectModal.tsx` [NEW] | 2h |
| 2 | Page Header + Status Bar | `page.tsx` header section | 1h |
| 3 | Server Cards Redesign | `page.tsx` card grid, `mcp-registry.ts` | 2h |
| 4 | Verification + Polish | Browser tests, screenshots | 1h |

## Design Reference

- Stitch MCP Modal: `stitch_mcp_modal_view_1771736500418.png`
- Stitch Canvas: `artifact_studio_design_1771733885397.png`
- Current page: `connections_page_top_1771733141932.png`

## Key Decisions

- Sync Capabilities: **decorative** (checkboxes shown, all synced)
- Test Connection: **real** — uses existing connect API with validation
- Provider selector: **step-based** — matches Stitch modal exactly
