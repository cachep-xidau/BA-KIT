'use client';

import './globals.css';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Database,
    Settings,
    ClipboardCheck,
    BookOpen,
    Menu,
    X,
    GitBranch,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    Lock,
    Zap,
    CreditCard,
} from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    disabled?: boolean;
}

const TOP_NAV: NavItem[] = [
    { href: '/', label: 'Repo', icon: Database },
    { href: '/skills', label: 'Skills', icon: Zap },
    { href: '/pricing', label: 'Pricing', icon: CreditCard },
    { href: '/settings', label: 'Settings', icon: Settings },
];

const OWNER_NAME = 'cachep';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SidebarProject {
    id: string;
    name: string;
    _count?: { features: number; connections: number };
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    // Projects state
    const [projects, setProjects] = useState<SidebarProject[]>([]);

    // Sidebar collapse state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Plan/credits state
    const [planData, setPlanData] = useState<{
        tier: string;
        credits: { subscription: number; addon: number; total: number; max: number };
        usage: { chatUsedToday: number; chatLimit: number; projectCount: number; projectLimit: number };
    } | null>(null);
    const [showCreditDrop, setShowCreditDrop] = useState(false);

    // Mobile menu state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMobileMenu = () => setMobileMenuOpen(false);

    // Theme init
    useEffect(() => {
        const saved = localStorage.getItem('bsa-kit-theme') as 'light' | 'dark' | 'system' | null;
        let resolved: 'light' | 'dark';
        if (saved === 'system' || !saved) {
            resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            resolved = saved as 'light' | 'dark';
        }
        setTheme(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
        document.documentElement.className = resolved;
        setMounted(true);

        // Restore sidebar state
        const savedCollapsed = localStorage.getItem('bsa-kit-sidebar-collapsed');
        if (savedCollapsed === 'true') setSidebarCollapsed(true);

        // Listen for theme changes from Settings page
        const observer = new MutationObserver(() => {
            const current = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
            if (current && current !== theme) setTheme(current);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    // Fetch projects
    useEffect(() => {
        fetch(`${API_URL}/api/projects`)
            .then((r) => r.json())
            .then((data) => {
                if (data.success && data.data) {
                    setProjects(data.data);
                }
            })
            .catch(() => { });
    }, [pathname]);

    // Fetch plan data
    useEffect(() => {
        fetch(`${API_URL}/api/plan`)
            .then((r) => r.json())
            .then((data) => {
                if (data.success && data.data) {
                    setPlanData(data.data);
                }
            })
            .catch(() => { });
    }, [pathname]);

    // Close mobile menu on navigation
    useEffect(() => {
        closeMobileMenu();
    }, [pathname]);

    const toggleSidebar = () => {
        const next = !sidebarCollapsed;
        setSidebarCollapsed(next);
        localStorage.setItem('bsa-kit-sidebar-collapsed', String(next));
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>BSA Kit — AI-Powered Analysis Toolkit</title>
                <meta name="description" content="Transform requirements into actionable BSA artifacts with AI" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
                {/* Blocking script: set theme BEFORE first paint to prevent FOUC */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                    (function(){
                        try {
                            var s = localStorage.getItem('bsa-kit-theme');
                            var t = s === 'dark' || s === 'light' ? s
                                : (s === 'system' || !s)
                                    ? (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')
                                    : 'dark';
                            document.documentElement.setAttribute('data-theme', t);
                            document.documentElement.className = t;
                        } catch(e) {
                            document.documentElement.setAttribute('data-theme', 'dark');
                            document.documentElement.className = 'dark';
                        }
                    })();
                `}} />
            </head>
            <body suppressHydrationWarning className="flex h-screen overflow-hidden text-sm">

                {/* Mobile Header */}
                <div className="md:hidden h-16 border-b border-white/5 glass-panel flex items-center justify-between px-4 z-30 relative shrink-0">
                    <div className="github-breadcrumb">
                        <GitBranch size={16} className="text-slate-400" />
                        <span className="github-breadcrumb-owner">{OWNER_NAME}</span>
                    </div>
                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 text-slate-400 hover:text-white"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Sidebar Overlay */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={closeMobileMenu}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`glass-panel border-r border-white/5 flex flex-col z-50 fixed md:relative h-full transition-all duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                    style={{ width: sidebarCollapsed ? '3.5rem' : '14rem' }}
                    role="navigation"
                    aria-label="Main navigation"
                >
                    {/* Sidebar header with toggle */}
                    <div
                        className="hidden md:flex items-center border-b border-white/5"
                        style={{
                            padding: sidebarCollapsed ? '0.75rem 0' : '0.75rem 1rem',
                            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                            minHeight: '3rem',
                        }}
                    >
                        {!sidebarCollapsed && (
                            <div style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                <GitBranch size={16} className="text-slate-400" />
                                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{OWNER_NAME}</span>
                            </div>
                        )}
                        <button
                            onClick={toggleSidebar}
                            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-dim)',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                borderRadius: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#f8fafc')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                        >
                            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                        </button>
                    </div>

                    {/* Nav links */}
                    <nav
                        className="sidebar-nav-menu"
                        style={{
                            padding: sidebarCollapsed ? '0.5rem 0.35rem' : undefined,
                        }}
                    >
                        {TOP_NAV.map(({ href, label, icon: Icon, disabled }) => {
                            const isActive = !disabled && (href === '/' ? pathname === '/' || pathname.startsWith('/projects') : pathname.startsWith(href));
                            return (
                                <Link
                                    key={label}
                                    href={disabled ? '#' : href}
                                    className={`nav-link${isActive ? ' active' : ''}${disabled ? ' nav-link--disabled' : ''}`}
                                    title={sidebarCollapsed ? label : undefined}
                                    onClick={disabled ? (e: React.MouseEvent) => e.preventDefault() : undefined}
                                    style={{
                                        ...(sidebarCollapsed ? {
                                            justifyContent: 'center',
                                            padding: '0.625rem',
                                        } : {}),
                                        ...(disabled ? {
                                            opacity: 0.35,
                                            pointerEvents: 'none' as const,
                                            cursor: 'default',
                                        } : {}),
                                    }}
                                >
                                    <Icon size={18} />
                                    {!sidebarCollapsed && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                            {label}
                                            {disabled && (
                                                <span style={{
                                                    fontSize: '0.5625rem',
                                                    color: 'var(--text-dim)',
                                                    background: 'rgba(100,116,139,0.15)',
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '9999px',
                                                    fontWeight: 500,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.03em',
                                                    marginLeft: 'auto',
                                                }}>Soon</span>
                                            )}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ── Sidebar bottom: Credits + Profile ── */}
                    {!sidebarCollapsed && (
                        <div style={{
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            marginTop: 'auto', padding: '0.75rem',
                        }}>
                            <div style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '0.75rem',
                                padding: '0.75rem',
                            }}>
                                {/* Credit info — clickable → /pricing */}
                                {planData && (
                                    <Link
                                        href="/pricing"
                                        style={{
                                            display: 'block', textDecoration: 'none',
                                            cursor: 'pointer',
                                            borderRadius: '0.5rem', padding: '0.375rem',
                                            margin: '-0.375rem', marginBottom: '0.25rem',
                                            transition: 'background 0.15s ease',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        {/* Row: Tier badge left, credits right */}
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', marginBottom: '0.625rem',
                                        }}>
                                            <span style={{
                                                fontSize: '0.625rem', fontWeight: 700,
                                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                                color: planData.tier === 'free' ? '#94a3b8'
                                                    : planData.tier === 'pro' ? '#a78bfa' : '#38bdf8',
                                                background: planData.tier === 'free' ? 'rgba(148,163,184,0.12)'
                                                    : planData.tier === 'pro' ? 'rgba(167,139,250,0.12)' : 'rgba(56,189,248,0.12)',
                                                padding: '0.125rem 0.5rem', borderRadius: '9999px',
                                                border: `1px solid ${planData.tier === 'free' ? 'rgba(148,163,184,0.2)'
                                                    : planData.tier === 'pro' ? 'rgba(167,139,250,0.2)' : 'rgba(56,189,248,0.2)'}`,
                                            }}>
                                                {planData.tier}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <span style={{
                                                    fontSize: '0.8125rem', fontWeight: 700,
                                                    color: planData.credits.total / planData.credits.max > 0.2
                                                        ? 'var(--text-primary)'
                                                        : planData.credits.total / planData.credits.max > 0.05
                                                            ? '#fbbf24' : '#f87171',
                                                }}>
                                                    {planData.credits.total}/{planData.credits.max}
                                                </span>
                                                <Zap size={11} style={{
                                                    color: planData.credits.total / planData.credits.max > 0.2
                                                        ? '#d97706' : '#f87171',
                                                }} />
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div style={{
                                            height: '0.1875rem', borderRadius: '9999px',
                                            background: 'rgba(255,255,255,0.06)',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%', borderRadius: '9999px',
                                                width: `${Math.min(100, (planData.credits.total / planData.credits.max) * 100)}%`,
                                                background: planData.credits.total / planData.credits.max > 0.2
                                                    ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                                                    : planData.credits.total / planData.credits.max > 0.05
                                                        ? '#fbbf24' : '#f87171',
                                                transition: 'width 0.3s ease',
                                            }} />
                                        </div>
                                    </Link>
                                )}

                                {/* Profile — below credits */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                                    paddingTop: planData ? '0.5rem' : '0',
                                    borderTop: planData ? '1px solid var(--border-light)' : 'none',
                                }}>
                                    <div style={{
                                        width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                                        background: 'linear-gradient(to top right, #6366f1, #a855f7)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.625rem', fontWeight: 700, color: '#fff',
                                        flexShrink: 0,
                                    }}>LB</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            display: 'block',
                                        }}>Lucas Braci</span>
                                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)' }}>BSA Lead</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Collapsed: avatar only */}
                    {sidebarCollapsed && (
                        <div style={{
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            marginTop: 'auto', padding: '0.75rem 0',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: '0.5rem',
                        }}>
                            {planData && (
                                <Link
                                    href="/pricing"
                                    title={`${planData.credits.total}/${planData.credits.max} credits`}
                                    style={{
                                        width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(99,102,241,0.15)',
                                        fontSize: '0.5625rem', fontWeight: 700,
                                        color: 'var(--primary)', textDecoration: 'none',
                                    }}
                                >{planData.credits.total}</Link>
                            )}
                            <div style={{
                                width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                                background: 'linear-gradient(to top right, #6366f1, #a855f7)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.625rem', fontWeight: 700, color: '#fff',
                            }}>LB</div>
                        </div>
                    )}
                </aside>

                {/* Main content */}
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    {children}
                </main>
            </body>
        </html >
    );
}
