// ── Pricing Configuration ──────────────────────────────────────────
// Single source of truth for BSA Kit monetization (Epic 11)

export const TIERS = {
    free: {
        key: 'free' as const,
        name: 'Free',
        price: 0,
        priceAnnual: 0,
        credits: 30,
        projects: 1,
        chatPerDay: 10,
        mcpConnections: 0,
        users: 1,
        batchGeneration: false,
        cleanExport: false,
        description: 'Bắt đầu khám phá BSA Kit',
    },
    pro: {
        key: 'pro' as const,
        name: 'Pro',
        price: 199_000,
        priceAnnual: 1_990_000, // save 17%
        credits: 300,
        projects: 5,
        chatPerDay: 50,
        mcpConnections: 3,
        users: 1,
        batchGeneration: true,
        cleanExport: true,
        description: 'Cho BSA làm việc hàng ngày',
    },
    team: {
        key: 'team' as const,
        name: 'Team',
        price: 499_000,
        priceAnnual: 4_990_000, // save 17%
        credits: 1_000,
        projects: 20,
        chatPerDay: -1, // unlimited
        mcpConnections: -1, // unlimited
        users: 5,
        batchGeneration: true,
        cleanExport: true,
        description: 'Cho team BSA cần collaboration',
    },
} as const;

export type TierKey = keyof typeof TIERS;
export type TierConfig = (typeof TIERS)[TierKey];

export const TIER_ORDER: TierKey[] = ['free', 'pro', 'team'];

// Credit costs per AI action
export const CREDIT_COSTS = {
    'generate-single': { cost: 8, label: 'Generate 1 artifact', icon: 'FileText' },
    'batch-pipeline': { cost: 30, label: 'Batch pipeline (5 types)', icon: 'Layers' },
    'analysis-session': { cost: 10, label: 'Analysis session', icon: 'BarChart3' },
    'skill-action': { cost: 8, label: 'Skill (SWOT/Persona)', icon: 'Zap' },
    'extract-structure': { cost: 5, label: 'Extract structure', icon: 'Network' },
    'prd-validate': { cost: 5, label: 'PRD validation', icon: 'ClipboardCheck' },
    'mcp-tool-call': { cost: 1, label: 'MCP tool call', icon: 'Plug' },
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

// Credit pack add-ons
export const CREDIT_PACKS = [
    { id: 'mini', credits: 50, price: 49_000, label: 'Mini', savings: null },
    { id: 'standard', credits: 150, price: 129_000, label: 'Standard', savings: '12% off' },
    { id: 'mega', credits: 500, price: 399_000, label: 'Mega', savings: '19% off' },
] as const;

export type CreditPackId = (typeof CREDIT_PACKS)[number]['id'];

// Feature comparison matrix for pricing page
export const FEATURES_COMPARISON = [
    { label: 'AI credits / tháng', free: '30', pro: '300', team: '1,000' },
    { label: 'Projects', free: '1', pro: '5', team: '20' },
    { label: 'Chat / ngày', free: '10 msg', pro: '50 msg', team: 'Unlimited' },
    { label: 'MCP connections', free: '—', pro: '3', team: 'Unlimited' },
    { label: 'Team members', free: '1', pro: '1', team: '5' },
    { label: 'Batch generation', free: '1x trial', pro: '✓', team: '✓' },
    { label: 'Clean export (no watermark)', free: '—', pro: '✓', team: '✓' },
    { label: 'PRD Chat & Validation', free: '✓', pro: '✓', team: '✓' },
    { label: 'Artifact versioning', free: '✓', pro: '✓', team: '✓' },
    { label: 'Priority support', free: '—', pro: '—', team: '✓' },
] as const;

// FAQ data
export const PRICING_FAQ = [
    {
        q: 'Credits hết thì sao?',
        a: 'Khi hết credits, bạn có thể mua thêm credit pack hoặc nâng cấp gói. Chat miễn phí vẫn hoạt động trong giới hạn hàng ngày.',
    },
    {
        q: 'Credits có chuyển sang tháng sau không?',
        a: 'Credits từ subscription sẽ reset mỗi tháng (không rollover). Credits mua thêm (add-on) không hết hạn.',
    },
    {
        q: 'Hạ cấp thì dữ liệu có mất không?',
        a: 'Không — projects vượt limit sẽ bị archived (không xóa). Bạn có thể nâng cấp lại để truy cập.',
    },
    {
        q: 'Thanh toán bằng gì?',
        a: 'Hỗ trợ chuyển khoản ngân hàng qua VietQR (SePay). Xác nhận tự động trong vài phút.',
    },
    {
        q: 'Có trial cho Pro/Team không?',
        a: 'Free tier bao gồm 30 credits và 1 lần dùng thử batch generation miễn phí.',
    },
] as const;

// Helpers
export function formatVND(amount: number): string {
    if (amount === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export function formatVNDShort(amount: number): string {
    if (amount === 0) return 'Free';
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 2)}M`;
    return `${Math.round(amount / 1_000)}k`;
}
