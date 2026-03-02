# Phase 4: Verification + Polish

## Goal
Browser-test all changes, capture comparison screenshots, and fix any visual issues.

## Verification Steps

1. **TypeScript**: `pnpm tsc --noEmit` — zero errors
2. **Browser checks**:
   - Open `http://localhost:3000/connections`
   - Verify header with MCP status
   - Click "Connect New Service" → verify Stitch modal
   - Select different providers → verify form updates
   - Click "Test Connection" → verify feedback
   - Click "Save & Connect" → verify connection flow
   - Close modal → verify page state
   - Check card hover states
   - Scroll to activity table → verify alignment
3. **Screenshots**: Capture before/after comparison
4. **Responsive**: Check at 1280px and 768px widths

## Polishing
- Animation: `animate-in fade-in zoom-in-95` on modal
- Focus trap: Tab key stays within modal
- Provider card hover: `scale-[1.02]` subtle lift
- Consistent border radius: `rounded-xl` everywhere
