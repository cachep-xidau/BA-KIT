'use client';

import { useState, useEffect } from 'react';
import {
    Check,
    X,
    CreditCard,
    Sparkles,
    Users,
    ChevronDown,
    ChevronUp,
    Zap,
    FileText,
    Layers,
    BarChart3,
    Network,
    ClipboardCheck,
    Plug,
    Crown,
    ArrowRight,
} from 'lucide-react';

/* ── Pricing Data (shared config) ──────────────────────────── */

const TIERS = {
    free: {
        key: 'free' as const, name: 'Free', price: 0, priceAnnual: 0,
        credits: 30, projects: 1, chatPerDay: 10, mcpConnections: 0, users: 1,
        batchGeneration: false, cleanExport: false,
        description: 'Bắt đầu khám phá BSA Kit',
    },
    pro: {
        key: 'pro' as const, name: 'Pro', price: 199_000, priceAnnual: 1_990_000,
        credits: 300, projects: 5, chatPerDay: 50, mcpConnections: 3, users: 1,
        batchGeneration: true, cleanExport: true,
        description: 'Cho BSA làm việc hàng ngày',
    },
    team: {
        key: 'team' as const, name: 'Team', price: 499_000, priceAnnual: 4_990_000,
        credits: 1_000, projects: 20, chatPerDay: -1, mcpConnections: -1, users: 5,
        batchGeneration: true, cleanExport: true,
        description: 'Cho team BSA cần collaboration',
    },
} as const;

type TierKey = keyof typeof TIERS;

const FEATURES_COMPARISON = [
    { label: 'AI credits / tháng', free: '30', pro: '300', team: '1,000' },
    { label: 'Projects', free: '1', pro: '5', team: '20' },
    { label: 'Chat / ngày', free: '10 msg', pro: '50 msg', team: 'Unlimited' },
    { label: 'MCP connections', free: '—', pro: '3', team: 'Unlimited' },
    { label: 'Team members', free: '1', pro: '1', team: '5' },
    { label: 'Batch generation', free: '1x trial', pro: '✓', team: '✓' },
    { label: 'Clean export', free: '—', pro: '✓', team: '✓' },
    { label: 'PRD Chat & Validation', free: '✓', pro: '✓', team: '✓' },
    { label: 'Priority support', free: '—', pro: '—', team: '✓' },
];

const CREDIT_COSTS = [
    { label: 'Generate 1 artifact', cost: 8, icon: FileText },
    { label: 'Batch pipeline (5 types)', cost: 30, icon: Layers },
    { label: 'Analysis session', cost: 10, icon: BarChart3 },
    { label: 'Skill (SWOT/Persona)', cost: 8, icon: Zap },
    { label: 'Extract structure', cost: 5, icon: Network },
    { label: 'PRD validation', cost: 5, icon: ClipboardCheck },
    { label: 'MCP tool call', cost: 1, icon: Plug },
];

const FAQ = [
    { q: 'Credits hết thì sao?', a: 'Khi hết credits, bạn có thể mua thêm credit pack hoặc nâng cấp gói. Chat miễn phí vẫn hoạt động trong giới hạn hàng ngày.' },
    { q: 'Credits có chuyển sang tháng sau không?', a: 'Credits từ subscription sẽ reset mỗi tháng (không rollover). Credits mua thêm (add-on) không hết hạn.' },
    { q: 'Hạ cấp thì dữ liệu có mất không?', a: 'Không — projects vượt limit sẽ bị archived (không xóa). Bạn có thể nâng cấp lại để truy cập.' },
    { q: 'Thanh toán bằng gì?', a: 'Hỗ trợ chuyển khoản ngân hàng qua VietQR (SePay). Xác nhận tự động trong vài phút.' },
    { q: 'Có trial cho Pro/Team không?', a: 'Free tier bao gồm 30 credits và 1 lần dùng thử batch generation miễn phí.' },
];

/* ── Helpers ──────────────────────────────────────────────── */

function formatVND(amount: number): string {
    if (amount === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

function formatShort(amount: number): string {
    if (amount === 0) return '0đ';
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 2)}M`;
    return `${Math.round(amount / 1_000)}k`;
}

/* ── Components ──────────────────────────────────────────── */



function TierCard({
    tier,
    isPopular,
    currentTier,
}: {
    tier: (typeof TIERS)[TierKey];
    isPopular: boolean;
    currentTier: string;
}) {
    const [isAnnual, setIsAnnual] = useState(false);

    // Only Pro plan allows toggling in this new design, free/team default to monthly or their set price
    const activeAnnual = tier.key === 'pro' ? isAnnual : false;

    const price = activeAnnual ? tier.priceAnnual : tier.price;
    const monthlyEquiv = activeAnnual && tier.priceAnnual > 0
        ? Math.round(tier.priceAnnual / 12)
        : tier.price;
    const isCurrent = currentTier === tier.key;

    const tierIcons: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
        free: Zap,
        pro: Sparkles,
        team: Users,
    };
    const TierIcon = tierIcons[tier.key] || Zap;

    const tierColors: Record<string, string> = {
        free: 'var(--text-dim)',
        pro: 'var(--primary)',
        team: 'var(--text-secondary)',
    };
    const color = tierColors[tier.key];

    return (
        <div
            className="glass-panel"
            style={{
                borderRadius: '1rem',
                padding: '2rem',
                display: 'flex', flexDirection: 'column',
                position: 'relative', overflow: 'hidden',
                border: isPopular ? `2px solid ${color}` : '1px solid var(--border)',
                boxShadow: isPopular
                    ? `0 0 40px color-mix(in srgb, ${color} 8%, transparent), 0 20px 40px rgba(0,0,0,0.1)`
                    : '0 4px 20px rgba(0,0,0,0.05)',
                transform: isPopular ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.3s ease',
                animation: 'fadeIn 0.5s ease',
            }}
        >
            {/* Popular badge */}
            {isPopular && (
                <div style={{
                    position: 'absolute', top: '-1px', right: '1.5rem',
                    background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 80%, transparent))`,
                    color: '#fff', padding: '0.25rem 0.75rem 0.375rem',
                    borderRadius: '0 0 0.5rem 0.5rem',
                    fontSize: '0.6875rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                }}>
                    <Crown size={11} /> Phổ biến
                </div>
            )}

            {/* Tier header & Toggle */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                        width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
                        background: `color-mix(in srgb, ${color} 8%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${color} 15%, transparent)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <TierIcon size={18} style={{ color }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            {tier.name}
                        </h3>
                    </div>
                </div>

                {/* Inline Toggle for Pro Plan */}
                {tier.key === 'pro' && (
                    <div style={{
                        display: 'flex', alignItems: 'center', background: 'var(--border-light)',
                        borderRadius: '9999px', padding: '0.25rem', gap: '0.125rem',
                        border: '1px solid var(--border)'
                    }}>
                        <button
                            onClick={() => setIsAnnual(false)}
                            style={{
                                padding: '0.375rem 0.75rem', borderRadius: '9999px',
                                fontSize: '0.75rem', fontWeight: 600,
                                background: !isAnnual ? 'var(--bg-elevated)' : 'transparent',
                                color: !isAnnual ? 'var(--text-primary)' : 'var(--text-dim)',
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: !isAnnual ? 'var(--shadow-sm)' : 'none',
                            }}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            style={{
                                padding: '0.375rem 0.75rem', borderRadius: '9999px',
                                fontSize: '0.75rem', fontWeight: 600,
                                background: isAnnual ? 'var(--bg-elevated)' : 'transparent',
                                color: isAnnual ? 'var(--text-primary)' : 'var(--text-dim)',
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: isAnnual ? 'var(--shadow-sm)' : 'none',
                                display: 'flex', alignItems: 'center', gap: '0.375rem'
                            }}
                        >
                            Yearly
                            <span style={{
                                fontSize: '0.625rem', fontWeight: 700,
                                background: 'rgba(52, 211, 153, 0.15)', color: '#34d399',
                                padding: '0.125rem 0.375rem', borderRadius: '9999px',
                            }}>
                                Save 17%
                            </span>
                        </button>
                    </div>
                )}
            </div>

            <p style={{
                fontSize: '0.8125rem', color: 'var(--text-dim)', margin: '0 0 1.25rem',
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                {tier.description}
            </p>

            {/* Price */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{
                        fontSize: '2.25rem', fontWeight: 800,
                        color: 'var(--text-primary)', letterSpacing: '-0.02em',
                    }}>
                        {price === 0 ? 'Free' : formatShort(monthlyEquiv)}
                    </span>
                    {price > 0 && (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
                            /tháng
                        </span>
                    )}
                </div>
                {activeAnnual && price > 0 && (
                    <p style={{
                        fontSize: '0.75rem', color: 'var(--text-dim)', margin: '0.25rem 0 0',
                    }}>
                        Thanh toán {formatVND(price)} / năm
                    </p>
                )}
            </div>

            {/* Credit highlight */}
            <div style={{
                background: `color-mix(in srgb, ${color} 3%, transparent)`,
                border: `1px solid color-mix(in srgb, ${color} 8%, transparent)`,
                borderRadius: '0.5rem', padding: '0.625rem 0.75rem',
                marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
                <Zap size={14} style={{ color }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {tier.credits.toLocaleString()} credits / tháng
                </span>
            </div>

            {/* Feature list */}
            <ul style={{
                listStyle: 'none', padding: 0, margin: '0 0 1.5rem',
                display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1,
            }}>
                {[
                    { text: `${tier.projects} projects`, ok: true },
                    { text: tier.chatPerDay === -1 ? 'Unlimited chat' : `${tier.chatPerDay} chat / ngày`, ok: true },
                    { text: tier.mcpConnections === -1 ? 'Unlimited MCP' : tier.mcpConnections > 0 ? `${tier.mcpConnections} MCP connections` : 'No MCP', ok: tier.mcpConnections !== 0 },
                    { text: tier.users > 1 ? `${tier.users} team members` : 'Solo use', ok: tier.users > 1 },
                    { text: 'Batch generation', ok: tier.batchGeneration },
                    { text: 'Clean export', ok: tier.cleanExport },
                ].map((f, i) => (
                    <li key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.8125rem',
                        color: f.ok ? 'var(--text-secondary)' : 'var(--text-dim)',
                        opacity: f.ok ? 1 : 0.5,
                    }}>
                        {f.ok
                            ? <Check size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                            : <X size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                        }
                        {f.text}
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <button
                style={{
                    width: '100%', padding: '0.75rem',
                    borderRadius: '0.625rem',
                    fontSize: '0.875rem', fontWeight: 600,
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                    transition: 'all 0.2s',
                    ...(isCurrent ? {
                        background: 'var(--bg-elevated)', color: 'var(--text-dim)',
                        border: '1px solid var(--border)',
                    } : isPopular ? {
                        background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 86%, transparent))`,
                        color: '#fff', border: 'none',
                        boxShadow: `0 8px 20px color-mix(in srgb, ${color} 20%, transparent)`,
                    } : {
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                    }),
                }}
                disabled={isCurrent}
            >
                {isCurrent ? (
                    'Gói hiện tại'
                ) : tier.key === 'free' ? (
                    'Bắt đầu miễn phí'
                ) : (
                    <>Nâng cấp {tier.name} <ArrowRight size={14} /></>
                )}
            </button>
        </div>
    );
}

function CreditCostSection() {
    return (
        <div style={{
            maxWidth: '56rem', margin: '3rem auto 0',
            animation: 'fadeIn 0.6s ease',
        }}>
            <h3 style={{
                fontSize: '1.125rem', fontWeight: 700,
                color: 'var(--text-primary)', textAlign: 'center',
                marginBottom: '1.5rem',
            }}>
                Chi phí Credits
            </h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.75rem',
            }}>
                {CREDIT_COSTS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="glass-panel" style={{
                            borderRadius: '0.75rem', padding: '1rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            border: '1px solid var(--border)',
                        }}>
                            <div style={{
                                width: '2rem', height: '2rem', borderRadius: '0.5rem',
                                background: 'var(--primary-bg)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Icon size={14} style={{ color: 'var(--primary)' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    fontSize: '0.75rem', color: 'var(--text-dim)',
                                    margin: 0, lineHeight: 1.3,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>{item.label}</p>
                                <p style={{
                                    fontSize: '0.9375rem', fontWeight: 700,
                                    color: 'var(--text-primary)', margin: 0,
                                }}>{item.cost} credits</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function FAQSection() {
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    return (
        <div style={{
            maxWidth: '40rem', margin: '3rem auto 0',
            animation: 'fadeIn 0.7s ease',
        }}>
            <h3 style={{
                fontSize: '1.125rem', fontWeight: 700,
                color: 'var(--text-primary)', textAlign: 'center',
                marginBottom: '1.5rem',
            }}>
                Câu hỏi thường gặp
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {FAQ.map((item, i) => (
                    <div key={i} className="glass-panel" style={{
                        borderRadius: '0.75rem',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                    }}>
                        <button
                            onClick={() => setOpenIdx(openIdx === i ? null : i)}
                            style={{
                                width: '100%', textAlign: 'left',
                                padding: '1rem 1.25rem',
                                background: 'transparent', border: 'none',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem', fontWeight: 600,
                            }}
                        >
                            {item.q}
                            {openIdx === i
                                ? <ChevronUp size={16} style={{ color: 'var(--text-dim)' }} />
                                : <ChevronDown size={16} style={{ color: 'var(--text-dim)' }} />
                            }
                        </button>
                        {openIdx === i && (
                            <div style={{
                                padding: '0 1.25rem 1rem',
                                fontSize: '0.8125rem', color: 'var(--text-dim)',
                                lineHeight: 1.6,
                                animation: 'fadeIn 0.2s ease',
                            }}>
                                {item.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Main Page ───────────────────────────────────────────── */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PricingPage() {
    const [pricingMode, setPricingMode] = useState<'individual' | 'team'>('individual');
    const [currentTier, setCurrentTier] = useState('free');

    useEffect(() => {
        fetch(`${API_URL}/api/plan`)
            .then(r => r.json())
            .then(data => {
                if (data.success && data.data?.tier) {
                    setCurrentTier(data.data.tier);
                }
            })
            .catch(() => { /* fallback to free */ });
    }, []);

    return (
        <div className="overflow-auto h-full" style={{ padding: '2rem' }}>
            {/* Header (Skills-style flat) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CreditCard size={24} style={{ color: 'var(--primary)' }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Pricing</h1>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', background: 'var(--bg-input)', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                        3 plans
                    </span>
                </div>
            </div>

            {/* Content */}
            <div>
                <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

                    {/* Hero */}
                    <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                        <h1 style={{
                            fontSize: '1.75rem', fontWeight: 800,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.02em',
                        }}>
                            Tăng năng suất BSA gấp 10x
                        </h1>
                        <p style={{
                            fontSize: '0.9375rem', color: 'var(--text-dim)',
                            maxWidth: '32rem', margin: '0.5rem auto 0',
                            lineHeight: 1.5,
                        }}>
                            Từ PRD → User Stories, SRS, ERD, SQL trong vài phút.<br />
                            Chọn gói phù hợp để bắt đầu.
                        </p>
                    </div>

                    {/* Main Toggle (Individual / Team) */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        justifyContent: 'center', margin: '2rem 0',
                        padding: '0.25rem', background: 'var(--border-light)',
                        borderRadius: '0.5rem', width: 'max-content',
                        marginLeft: 'auto', marginRight: 'auto'
                    }}>
                        <button
                            onClick={() => setPricingMode('individual')}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '0.375rem',
                                fontSize: '0.875rem', fontWeight: 600,
                                background: pricingMode === 'individual' ? 'var(--bg-elevated)' : 'transparent',
                                color: pricingMode === 'individual' ? 'var(--text-primary)' : 'var(--text-dim)',
                                border: 'none', cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: pricingMode === 'individual' ? 'var(--shadow-sm)' : 'none',
                            }}
                        >
                            Individual
                        </button>
                        <button
                            onClick={() => setPricingMode('team')}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '0.375rem',
                                fontSize: '0.875rem', fontWeight: 600,
                                background: pricingMode === 'team' ? 'var(--bg-elevated)' : 'transparent',
                                color: pricingMode === 'team' ? 'var(--text-primary)' : 'var(--text-dim)',
                                border: 'none', cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: pricingMode === 'team' ? 'var(--shadow-sm)' : 'none',
                            }}
                        >
                            Team and Enterprise
                        </button>
                    </div>

                    {/* Tier Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.5rem', alignItems: 'start',
                        maxWidth: '56rem', margin: '0 auto',
                    }}>
                        {(pricingMode === 'individual' ? ['free', 'pro'] : ['team']).map(key => (
                            <TierCard
                                key={key}
                                tier={TIERS[key as TierKey]}
                                isPopular={key === 'pro'}
                                currentTier={currentTier}
                            />
                        ))}
                    </div>

                    {/* Credit costs */}
                    <CreditCostSection />

                    {/* FAQ */}
                    <FAQSection />

                    {/* Footer note */}
                    <p style={{
                        textAlign: 'center', fontSize: '0.75rem',
                        color: 'var(--text-dim)', marginTop: '2.5rem',
                        paddingBottom: '2rem',
                    }}>
                        Tất cả gói đều bao gồm: SSL encryption, auto backup, artifact versioning, PRD chat.
                    </p>
                </div>
            </div>
        </div>
    );
}
