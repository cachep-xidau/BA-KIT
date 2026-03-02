'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Palette, Info, ExternalLink, Cpu } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export default function SettingsPage() {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('bsa-kit-theme') as Theme | null;
        setTheme(saved || 'dark');
    }, []);

    const applyTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        let resolved = newTheme;
        if (newTheme === 'system') {
            resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', resolved);
        document.documentElement.className = resolved;
        localStorage.setItem('bsa-kit-theme', newTheme);
    };

    if (!mounted) return null;

    const themeOptions: { value: Theme; label: string; icon: typeof Sun; desc: string }[] = [
        { value: 'light', label: 'Light', icon: Sun, desc: 'Claude.ai inspired warm parchment' },
        { value: 'dark', label: 'Dark', icon: Moon, desc: 'Default dark glassmorphism' },
        { value: 'system', label: 'System', icon: Monitor, desc: 'Match your OS preference' },
    ];

    return (
        <div style={{ padding: '2rem 3rem', maxWidth: '800px', overflowY: 'auto', height: '100%' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Settings
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-dim)', marginBottom: '2.5rem' }}>
                Manage your workspace preferences
            </p>

            {/* Theme Section */}
            <section style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                    <div style={{
                        width: '2rem', height: '2rem', borderRadius: '0.5rem',
                        background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Palette size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                            Appearance
                        </h2>
                        <p style={{ fontSize: '1rem', color: 'var(--text-dim)', margin: 0 }}>
                            Customize how BSA Kit looks
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {themeOptions.map(({ value, label, icon: Icon, desc }) => {
                        const isActive = theme === value;
                        return (
                            <button
                                key={value}
                                onClick={() => applyTheme(value)}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                                    padding: '1.25rem 1rem',
                                    background: isActive ? 'var(--primary-bg)' : 'var(--bg-card)',
                                    border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border-light)'}`,
                                    borderRadius: '0.75rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    outline: 'none',
                                }}
                            >
                                {/* Theme preview mini card */}
                                <div style={{
                                    width: '100%', height: '4.5rem', borderRadius: '0.5rem', overflow: 'hidden',
                                    border: '1px solid var(--border-light)', position: 'relative',
                                    background: value === 'light' ? '#FAF9F5' : value === 'dark' ? '#0B1120' : 'linear-gradient(135deg, #FAF9F5 50%, #0B1120 50%)',
                                }}>
                                    {/* Mini sidebar */}
                                    <div style={{
                                        position: 'absolute', left: 0, top: 0, bottom: 0, width: '1.25rem',
                                        background: value === 'light' ? '#EEEDEA' : value === 'dark' ? '#1A2332' : 'linear-gradient(180deg, #EEEDEA 50%, #1A2332 50%)',
                                        borderRight: `1px solid ${value === 'light' ? 'rgba(31,30,29,0.08)' : 'rgba(255,255,255,0.08)'}`,
                                    }} />
                                    {/* Mini content lines */}
                                    <div style={{ position: 'absolute', left: '1.75rem', top: '0.5rem', right: '0.5rem' }}>
                                        <div style={{
                                            height: '0.25rem', width: '60%', borderRadius: '2px', marginBottom: '0.25rem',
                                            background: value === 'light' ? '#141413' : value === 'dark' ? '#E2E8F0' : '#888',
                                            opacity: 0.6,
                                        }} />
                                        <div style={{
                                            height: '0.25rem', width: '80%', borderRadius: '2px', marginBottom: '0.25rem',
                                            background: value === 'light' ? '#706F6C' : value === 'dark' ? '#94A3B8' : '#888',
                                            opacity: 0.4,
                                        }} />
                                        <div style={{
                                            height: '1.25rem', width: '100%', borderRadius: '3px', marginTop: '0.375rem',
                                            background: value === 'light' ? '#F3F2EE' : value === 'dark' ? 'rgba(30,41,59,0.7)' : 'linear-gradient(90deg, #F3F2EE 50%, rgba(30,41,59,0.7) 50%)',
                                        }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Icon size={16} style={{ color: isActive ? 'var(--primary)' : 'var(--text-dim)' }} />
                                    <span style={{
                                        fontSize: '0.9375rem', fontWeight: isActive ? 600 : 500,
                                        color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                                    }}>
                                        {label}
                                    </span>
                                </div>
                                <span style={{ fontSize: '1rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                                    {desc}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* AI Provider Section (placeholder) */}
            <section style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                    <div style={{
                        width: '2rem', height: '2rem', borderRadius: '0.5rem',
                        background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Cpu size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                            AI Provider
                        </h2>
                        <p style={{ fontSize: '1rem', color: 'var(--text-dim)', margin: 0 }}>
                            Configure AI model endpoints
                        </p>
                    </div>
                </div>
                <div style={{
                    padding: '1.25rem', borderRadius: '0.75rem',
                    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                }}>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-dim)', margin: 0 }}>
                        AI provider configuration is managed via environment variables. See <code style={{
                            background: 'var(--bg-code)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem',
                            fontSize: '1rem',
                        }}>.env.local</code> for API keys and endpoints.
                    </p>
                </div>
            </section>

            {/* About Section */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                    <div style={{
                        width: '2rem', height: '2rem', borderRadius: '0.5rem',
                        background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Info size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                            About
                        </h2>
                    </div>
                </div>
                <div style={{
                    padding: '1.25rem', borderRadius: '0.75rem',
                    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                    display: 'flex', flexDirection: 'column', gap: '0.75rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Version</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>0.1.0</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Stack</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Next.js 15 + Express + Prisma</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Light Theme</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Claude.ai Parchment</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
