'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    X,
    Loader,
    AlertCircle,
    ExternalLink,
    RefreshCw,
    Eye,
    EyeOff,
    Check,
    ArrowRight,
    Search,
} from 'lucide-react';
import type { MCPServerEntry } from './mcp-registry';

// --- Sync Capabilities (decorative) ---
const SYNC_CAPABILITIES = [
    {
        id: 'read-prds',
        label: 'Read Project Requirements (PRDs)',
        description: 'Allow importing text content from files.',
        defaultChecked: true,
    },
    {
        id: 'write-artifacts',
        label: 'Write/Update Artifacts',
        description: 'Enable bi-directional sync for comments.',
        defaultChecked: true,
    },
    {
        id: 'sync-diagrams',
        label: 'Sync Visual Diagrams',
        description: 'Access vector data for diagram generation.',
        defaultChecked: false,
    },
];

// --- Types ---
interface ConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (serverId: string, name: string, credentials: Record<string, string>) => Promise<void>;
    servers: MCPServerEntry[];
    initialServerId?: string;
    connectError?: string;
    connecting?: boolean;
}

interface TestResult {
    status: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
}

// --- Component ---
export default function ConnectModal({
    isOpen,
    onClose,
    onConnect,
    servers,
    initialServerId,
    connectError,
    connecting,
}: ConnectModalProps) {
    const [selectedProvider, setSelectedProvider] = useState<MCPServerEntry | null>(null);
    const [connectionName, setConnectionName] = useState('');
    const [credentialValues, setCredentialValues] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
    const [syncCapabilities, setSyncCapabilities] = useState<Record<string, boolean>>(() => {
        const defaults: Record<string, boolean> = {};
        SYNC_CAPABILITIES.forEach((c) => { defaults[c.id] = c.defaultChecked; });
        return defaults;
    });
    const [testResult, setTestResult] = useState<TestResult>({ status: 'idle' });
    const [searchQuery, setSearchQuery] = useState('');

    // Pre-select provider from prop
    useEffect(() => {
        if (isOpen && initialServerId) {
            const server = servers.find((s) => s.id === initialServerId);
            if (server) setSelectedProvider(server);
        }
    }, [isOpen, initialServerId, servers]);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setSelectedProvider(null);
            setConnectionName('');
            setCredentialValues({});
            setShowPassword({});
            setTestResult({ status: 'idle' });
            setSearchQuery('');
            setSyncCapabilities(() => {
                const defaults: Record<string, boolean> = {};
                SYNC_CAPABILITIES.forEach((c) => { defaults[c.id] = c.defaultChecked; });
                return defaults;
            });
        }
    }, [isOpen]);

    const handleSelectProvider = useCallback((server: MCPServerEntry) => {
        setSelectedProvider(server);
        setConnectionName('');
        setCredentialValues({});
        setShowPassword({});
        setTestResult({ status: 'idle' });
    }, []);

    const handleTestConnection = useCallback(async () => {
        if (!selectedProvider || !connectionName.trim()) return;
        setTestResult({ status: 'testing' });

        try {
            // Build validation request based on provider
            const creds = credentialValues;
            let testUrl = '';
            let headers: Record<string, string> = {};

            switch (selectedProvider.id) {
                case 'figma':
                    testUrl = 'https://api.figma.com/v1/me';
                    headers = { 'X-Figma-Token': creds.token || '' };
                    break;
                case 'github':
                    testUrl = 'https://api.github.com/user';
                    headers = { Authorization: `Bearer ${creds.token || ''}`, Accept: 'application/vnd.github+json' };
                    break;
                case 'linear':
                    testUrl = 'https://api.linear.app/graphql';
                    break;
                case 'sentry':
                    testUrl = `https://sentry.io/api/0/organizations/`;
                    headers = { Authorization: `Bearer ${creds.authToken || ''}` };
                    break;
                case 'confluence':
                    testUrl = `${creds.baseUrl || ''}/wiki/api/v2/spaces?limit=1`;
                    headers = { Authorization: `Basic ${btoa(`${creds.username || ''}:${creds.apiToken || ''}`)}` };
                    break;
                case 'jira':
                    testUrl = `${creds.baseUrl || ''}/rest/api/3/myself`;
                    headers = { Authorization: `Basic ${btoa(`${creds.username || ''}:${creds.apiToken || ''}`)}` };
                    break;
                case 'notion':
                    testUrl = 'https://api.notion.com/v1/users/me';
                    headers = { Authorization: `Bearer ${creds.apiKey || ''}`, 'Notion-Version': '2022-06-28' };
                    break;
                default:
                    // Google Docs/Sheets/Power BI — simulate validation (OAuth flow not testable via simple fetch)
                    await new Promise((r) => setTimeout(r, 800));
                    const hasAllRequired = selectedProvider.credentials
                        .filter(c => c.required)
                        .every(c => creds[c.key]?.trim());
                    if (hasAllRequired) {
                        setTestResult({ status: 'success', message: 'Credentials format validated' });
                    } else {
                        setTestResult({ status: 'error', message: 'Missing required credentials' });
                    }
                    return;
            }

            // Special case: Linear uses GraphQL POST
            let res: Response;
            if (selectedProvider.id === 'linear') {
                res = await fetch(testUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: creds.apiKey || '' },
                    body: JSON.stringify({ query: '{ viewer { id name } }' }),
                });
            } else {
                res = await fetch(testUrl, { headers });
            }

            if (res.ok) {
                setTestResult({ status: 'success', message: 'Connection verified successfully' });
            } else if (res.status === 401 || res.status === 403) {
                setTestResult({ status: 'error', message: `Authentication failed (${res.status}) — check your credentials` });
            } else {
                setTestResult({ status: 'error', message: `API returned ${res.status} — verify your configuration` });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            setTestResult({ status: 'error', message: `Connection failed — ${msg}` });
        }
    }, [selectedProvider, connectionName, credentialValues]);

    const handleSaveAndConnect = useCallback(async () => {
        if (!selectedProvider || !connectionName.trim()) return;
        await onConnect(selectedProvider.id, connectionName, credentialValues);
    }, [selectedProvider, connectionName, credentialValues, onConnect]);

    const togglePassword = useCallback((key: string) => {
        setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const toggleCapability = useCallback((id: string) => {
        setSyncCapabilities((prev) => ({ ...prev, [id]: !prev[id] }));
    }, []);

    if (!isOpen) return null;

    const filteredProviders = searchQuery.trim()
        ? servers.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : servers;
    const canSubmit = selectedProvider && connectionName.trim() && !connecting;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="glass-panel"
                style={{
                    width: '100%', maxWidth: '800px', maxHeight: '90vh',
                    overflowY: 'auto', borderRadius: '0.75rem',
                    boxShadow: 'var(--shadow-xl)',
                    display: 'flex', flexDirection: 'column',
                    animation: 'modal-in 200ms ease-out',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                    <div>
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>
                            Connect MCP Server
                        </h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1rem', fontWeight: 400, marginTop: '0.25rem' }}>
                            Configure your provider to sync artifacts and diagrams.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            color: 'var(--text-dim)', background: 'transparent', border: 'none',
                            padding: '0.25rem', borderRadius: '0.25rem', cursor: 'pointer',
                            transition: 'color 0.2s, background 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--primary-bg)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {/* Step 1: Provider Selection */}
                    <div style={{ padding: '1.5rem 2rem 0.5rem 2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                                    background: 'var(--primary)', color: 'var(--primary-fg)',
                                    fontSize: '1rem', fontWeight: 700,
                                }}>1</span>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Select Provider
                                </h3>
                                <span style={{ fontSize: '1rem', color: 'var(--text-dim)', fontWeight: 400 }}>({servers.length})</span>
                            </div>
                            {/* Quick Search */}
                            <div style={{ position: 'relative', width: '200px' }}>
                                <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search providers..."
                                    style={{
                                        width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
                                        color: 'var(--text-primary)', fontSize: '1rem', borderRadius: '0.5rem',
                                        padding: '0.4rem 0.625rem 0.4rem 2rem',
                                        outline: 'none', transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                />
                            </div>
                        </div>

                        {/* Horizontal scrollable provider list */}
                        <div style={{
                            display: 'flex', gap: '0.75rem', overflowX: 'auto',
                            paddingBottom: '0.5rem',
                            scrollSnapType: 'x mandatory',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}>
                            {filteredProviders.length === 0 ? (
                                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9375rem', width: '100%' }}>
                                    No providers match &ldquo;{searchQuery}&rdquo;
                                </div>
                            ) : filteredProviders.map((server) => {
                                const Icon = server.icon;
                                const isSelected = selectedProvider?.id === server.id;
                                return (
                                    <button
                                        key={server.id}
                                        onClick={() => handleSelectProvider(server)}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            padding: '0.75rem', borderRadius: '0.75rem',
                                            minWidth: '7rem', height: '6rem', flexShrink: 0,
                                            scrollSnapAlign: 'start',
                                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                            background: isSelected ? 'var(--primary-bg)' : 'var(--bg-card)',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            position: 'relative',
                                        }}
                                        onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--primary-light)'; } }}
                                        onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border)'; } }}
                                    >
                                        <Icon size={24} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-dim)', marginBottom: '0.5rem' }} />
                                        <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{server.name}</span>
                                        {isSelected && (
                                            <div style={{ position: 'absolute', top: '0.375rem', right: '0.375rem', color: 'var(--primary)' }}>
                                                <Check size={12} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Authentication & Permissions */}
                    {selectedProvider && (
                        <div style={{ padding: '1.5rem 2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                                    background: 'var(--text-dim)', color: 'var(--bg-elevated)',
                                    fontSize: '1rem', fontWeight: 700,
                                }}>2</span>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Authentication & Permissions
                                </h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {/* Left Column: Inputs */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Connection Name */}
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500 }}>Connection Name</span>
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
                                                color: 'var(--text-primary)', fontSize: '1rem', borderRadius: '0.5rem',
                                                padding: '0.75rem', outline: 'none', transition: 'border-color 0.2s',
                                            }}
                                            placeholder={`My ${selectedProvider.name} workspace`}
                                            value={connectionName}
                                            onChange={(e) => setConnectionName(e.target.value)}
                                            onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                            autoFocus
                                        />
                                    </label>

                                    {/* Dynamic credential fields */}
                                    {selectedProvider.credentials.map((cred) => (
                                        <label key={cred.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <span style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500 }}>
                                                {cred.label} {cred.required && <span style={{ color: '#f87171' }}>*</span>}
                                            </span>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={cred.type === 'password' && !showPassword[cred.key] ? 'password' : 'text'}
                                                    style={{
                                                        width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
                                                        color: 'var(--text-primary)', fontSize: '1rem', borderRadius: '0.5rem',
                                                        padding: '0.75rem', paddingRight: cred.type === 'password' ? '2.5rem' : '0.75rem',
                                                        outline: 'none', transition: 'border-color 0.2s',
                                                    }}
                                                    placeholder={cred.placeholder}
                                                    value={credentialValues[cred.key] || ''}
                                                    onChange={(e) => setCredentialValues((prev) => ({ ...prev, [cred.key]: e.target.value }))}
                                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                                    autoComplete="off"
                                                />
                                                {cred.type === 'password' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePassword(cred.key)}
                                                        style={{
                                                            position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                                            color: 'var(--text-dim)', background: 'transparent', border: 'none',
                                                            cursor: 'pointer', transition: 'color 0.2s',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                                                    >
                                                        {showPassword[cred.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                )}
                                            </div>
                                            {cred.type === 'password' && (
                                                <p style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>
                                                    Token must have <span style={{ color: 'var(--text-primary)' }}>read:project</span> scope enabled.
                                                </p>
                                            )}
                                        </label>
                                    ))}

                                    {/* Docs link */}
                                    {selectedProvider.docsUrl && (
                                        <a
                                            href={selectedProvider.docsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                                fontSize: '1rem', fontWeight: 500, color: 'var(--primary)',
                                                textDecoration: 'none', transition: 'color 0.2s',
                                            }}
                                        >
                                            <ExternalLink size={12} />
                                            How to get credentials
                                        </a>
                                    )}
                                </div>

                                {/* Right Column: Sync Capabilities */}
                                <div style={{
                                    background: 'var(--bg-code)', borderRadius: '0.75rem',
                                    border: '1px solid var(--border)', padding: '1.25rem',
                                }}>
                                    <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Sync Capabilities</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {SYNC_CAPABILITIES.map((cap) => (
                                            <label
                                                key={cap.id}
                                                style={{
                                                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                                    padding: '0.5rem', borderRadius: '0.5rem',
                                                    cursor: 'pointer', transition: 'background 0.2s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div
                                                    onClick={() => toggleCapability(cap.id)}
                                                    style={{
                                                        width: '1.25rem', height: '1.25rem', marginTop: '0.125rem',
                                                        borderRadius: '0.25rem',
                                                        border: `1px solid ${syncCapabilities[cap.id] ? 'var(--primary)' : 'var(--border)'}`,
                                                        background: syncCapabilities[cap.id] ? 'var(--primary)' : 'var(--bg-input)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s',
                                                    }}
                                                >
                                                    {syncCapabilities[cap.id] && (
                                                        <Check size={12} style={{ color: 'var(--primary-fg)' }} />
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 500, lineHeight: 1.3 }}>
                                                        {cap.label}
                                                    </span>
                                                    <span style={{ color: 'var(--text-dim)', fontSize: '1rem', marginTop: '0.125rem', lineHeight: 1.4 }}>
                                                        {cap.description}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error */}
                {connectError && (
                    <div style={{
                        margin: '0 2rem 1rem', background: 'var(--error-bg)',
                        border: '1px solid var(--error-border)', borderRadius: '0.5rem',
                        padding: '0.75rem', color: '#f87171',
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9375rem',
                    }}>
                        <AlertCircle size={16} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                        <span>{connectError}</span>
                    </div>
                )}

                {/* Test result */}
                {testResult.status !== 'idle' && testResult.status !== 'testing' && (
                    <div style={{
                        margin: '0 2rem 1rem', borderRadius: '0.5rem', padding: '0.75rem',
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9375rem',
                        background: testResult.status === 'success' ? 'rgba(16,185,129,0.1)' : 'var(--error-bg)',
                        border: `1px solid ${testResult.status === 'success' ? 'rgba(16,185,129,0.2)' : 'var(--error-border)'}`,
                        color: testResult.status === 'success' ? '#34d399' : '#f87171',
                    }}>
                        {testResult.status === 'success' ? <Check size={16} style={{ marginTop: '0.125rem', flexShrink: 0 }} /> : <AlertCircle size={16} style={{ marginTop: '0.125rem', flexShrink: 0 }} />}
                        <span>{testResult.message}</span>
                    </div>
                )}

                {/* Footer */}
                <div style={{
                    padding: '1.25rem 2rem', borderTop: '1px solid var(--border)',
                    background: 'var(--bg-code)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    {/* Test Connection */}
                    <button
                        onClick={handleTestConnection}
                        disabled={!canSubmit || testResult.status === 'testing'}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.625rem 1rem', borderRadius: '0.5rem',
                            fontSize: '1rem', fontWeight: 500,
                            color: 'var(--text-dim)', background: 'transparent', border: 'none',
                            cursor: canSubmit && testResult.status !== 'testing' ? 'pointer' : 'not-allowed',
                            opacity: canSubmit && testResult.status !== 'testing' ? 1 : 0.4,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (canSubmit) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--primary-bg)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                        {testResult.status === 'testing' ? (
                            <Loader size={18} className="animate-spin" />
                        ) : (
                            <RefreshCw size={18} />
                        )}
                        Test Connection
                    </button>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '0.625rem 1.25rem', borderRadius: '0.5rem',
                                fontSize: '1rem', fontWeight: 500,
                                color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border)',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--primary-light)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveAndConnect}
                            disabled={!canSubmit}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                background: 'var(--primary)', color: 'var(--primary-fg)',
                                padding: '0.625rem 1.5rem', borderRadius: '0.5rem',
                                fontSize: '1rem', fontWeight: 700, border: 'none',
                                boxShadow: 'var(--shadow-glow)',
                                cursor: canSubmit ? 'pointer' : 'not-allowed',
                                opacity: canSubmit ? 1 : 0.5,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { if (canSubmit) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                        >
                            {connecting ? (
                                <Loader size={16} className="animate-spin" />
                            ) : (
                                <>
                                    <span>Save & Connect</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes modal-in {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
