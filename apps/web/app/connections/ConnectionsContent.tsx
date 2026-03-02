'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Loader,
    MoreHorizontal,
    RefreshCw,
    Plus,
    AlertTriangle,
    CheckCircle2,
    AlertCircle,
    Link as LinkIcon,
    ChevronDown,
    ChevronRight,
    Trash2,
    ArrowRight,
} from 'lucide-react';
import {
    MCP_SERVERS,
    getServerById,
    type MCPServerEntry,
} from './mcp-registry';
import ConnectModal from './ConnectModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ServerConnection {
    serverId: string;
    serverName: string;
    type: string;
    status: ConnectionStatus;
    toolCount: number;
    error?: string;
    connectedAt?: string;
}

interface MCPActivity {
    id: string;
    source: string;
    action: string;
    status: string;
    details?: string | null;
    createdAt: string;
}

interface ProjectConnection {
    id: string;
    name: string;
    type: string;
    status: string;
    toolCount: number;
    createdAt: string;
    updatedAt: string;
}

/* ── Provider visual config ── */
interface ProviderVisual {
    logo: string;
    iconBg: string;
    iconBorder: string;
    invert?: boolean;
    grayscaleWhenOff?: boolean;
    smallLogo?: string;
}

const PROVIDER_VISUALS: Record<string, ProviderVisual> = {
    figma: {
        logo: '/providers/figma.png',
        smallLogo: '/providers/figma.png',
        iconBg: 'bg-[#2D313A]',
        iconBorder: 'border-white/10',
    },
    confluence: {
        logo: '/providers/confluence.png',
        smallLogo: '/providers/confluence.png',
        iconBg: 'bg-[#0052CC]/20',
        iconBorder: 'border-[#0052CC]/30',
    },
    notion: {
        logo: '/providers/notion.png',
        smallLogo: '/providers/notion.png',
        iconBg: 'bg-slate-800',
        iconBorder: 'border-white/10',
        grayscaleWhenOff: true,
    },
    github: {
        logo: '/providers/github.png',
        smallLogo: '/providers/github.png',
        iconBg: 'bg-black/40',
        iconBorder: 'border-white/10',
        invert: true,
    },
    jira: {
        logo: '/providers/jira.png',
        smallLogo: '/providers/jira.png',
        iconBg: 'bg-[#0052CC]/20',
        iconBorder: 'border-[#0052CC]/30',
    },
    linear: {
        logo: '',
        smallLogo: '',
        iconBg: 'bg-[#5E6AD2]/20',
        iconBorder: 'border-[#5E6AD2]/30',
        grayscaleWhenOff: true,
    },
};

export default function ConnectionsContent({ projectId }: { projectId?: string | null }) {
    const [connections, setConnections] = useState<ServerConnection[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalInitialServerId, setModalInitialServerId] = useState<string | undefined>();
    const [connectError, setConnectError] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [activities, setActivities] = useState<MCPActivity[]>([]);
    const [projectConns, setProjectConns] = useState<ProjectConnection[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const STORAGE_KEY = 'bsa-kit-mcp-connections';

    const loadLocalConnections = useCallback((): ServerConnection[] => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }, []);

    const saveLocalConnections = useCallback((conns: ServerConnection[]) => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(conns)); } catch { /* */ }
    }, []);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/mcp/status`);
            const data = await res.json();
            if (data.success && data.data) {
                setConnections(data.data.map((s: Record<string, unknown>) => ({
                    serverId: s.serverId as string,
                    serverName: s.serverName as string,
                    type: inferType(s.serverId as string),
                    status: s.status as ConnectionStatus,
                    toolCount: s.toolCount as number,
                    error: s.error as string | undefined,
                    connectedAt: s.connectedAt as string | undefined,
                })));
                return;
            }
        } catch { /* API not available */ }
        setConnections(loadLocalConnections());
    }, [loadLocalConnections]);

    useEffect(() => { fetchStatus(); fetchActivities(); if (projectId) fetchProjectConnections(); }, [fetchStatus]);

    const ACTIVITY_STORAGE_KEY = 'bsa-kit-mcp-activities';

    const fetchActivities = async () => {
        try {
            const res = await fetch(`${API_URL}/api/mcp/activities?limit=10`);
            const data = await res.json();
            if (data.success && data.data) {
                setActivities(data.data);
                return;
            }
        } catch { /* API not available */ }
        try {
            const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
            if (raw) setActivities(JSON.parse(raw));
        } catch { /* */ }
    };

    const logLocalActivity = (source: string, action: string, status: string, details?: string) => {
        const entry: MCPActivity = {
            id: `local-${Date.now()}`,
            source,
            action,
            status,
            details,
            createdAt: new Date().toISOString(),
        };
        setActivities(prev => {
            const next = [entry, ...prev].slice(0, 20);
            try { localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(next)); } catch { /* */ }
            return next;
        });
    };

    const fetchProjectConnections = async () => {
        if (!projectId) return;
        try {
            const res = await fetch(`${API_URL}/api/mcp/connections?projectId=${projectId}`);
            const data = await res.json();
            if (data.success && data.data) {
                setProjectConns(data.data);
                // Auto-expand groups that have connections
                const types = new Set<string>(data.data.map((c: { type: string }) => c.type));
                setExpandedGroups(types);
            }
        } catch { /* API not available */ }
    };

    const handleRemoveConnection = async (connId: string) => {
        try {
            await fetch(`${API_URL}/api/mcp/connections/${connId}`, { method: 'DELETE' });
        } catch { /* */ }
        setProjectConns(prev => prev.filter(c => c.id !== connId));
        fetchStatus();
    };

    const toggleGroup = (type: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    };

    function inferType(serverId: string): string {
        for (const s of MCP_SERVERS) if (serverId.startsWith(s.id)) return s.id;
        return 'unknown';
    }

    function getConn(serverId: string) {
        return connections.find((c) => c.type === serverId);
    }

    function timeAgo(iso?: string): string {
        if (!iso) return 'Never synced';
        const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins} mins ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
        return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? 's' : ''} ago`;
    }

    const openConnectModal = (id?: string) => { setModalInitialServerId(id); setConnectError(''); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setModalInitialServerId(undefined); setConnectError(''); };

    const handleConnect = async (serverId: string, name: string, creds: Record<string, string>) => {
        setConnecting(true); setConnectError('');
        try {
            const payload: Record<string, unknown> = { name: name.trim(), type: serverId, credentials: creds };
            if (projectId) payload.projectId = projectId;
            const res = await fetch(`${API_URL}/api/mcp/connect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.success) {
                const entry: ServerConnection = { serverId: data.data.serverId, serverName: data.data.serverName, type: serverId, status: 'connected', toolCount: data.data.toolCount, connectedAt: new Date().toISOString() };
                setConnections((prev) => {
                    const idx = prev.findIndex((c) => c.serverId === data.data.serverId);
                    const next = idx >= 0 ? prev.map((c, i) => i === idx ? entry : c) : [...prev, entry];
                    saveLocalConnections(next);
                    return next;
                });
                closeModal();
            } else { setConnectError(typeof data.error === 'string' ? data.error : JSON.stringify(data.error) || 'Connection failed'); }
        } catch {
            const serverInfo = MCP_SERVERS.find(s => s.id === serverId);
            const entry: ServerConnection = {
                serverId: `${serverId}-${Date.now()}`,
                serverName: name.trim(),
                type: serverId,
                status: 'connected',
                toolCount: serverInfo?.credentials.length || 0,
                connectedAt: new Date().toISOString(),
            };
            setConnections((prev) => {
                const idx = prev.findIndex((c) => c.type === serverId);
                const next = idx >= 0 ? prev.map((c, i) => i === idx ? entry : c) : [...prev, entry];
                saveLocalConnections(next);
                return next;
            });
            logLocalActivity(serverId, `Connected '${name.trim()}'`, 'success');
            closeModal();
            if (projectId) setTimeout(fetchProjectConnections, 500);
            setTimeout(fetchActivities, 500);
        }
        finally { setConnecting(false); }
    };

    const handleDisconnect = async (sid: string) => {
        try { await fetch(`${API_URL}/api/mcp/disconnect/${sid}`, { method: 'DELETE' }); } catch { /* */ }
        setConnections((prev) => {
            const next = prev.filter((c) => c.serverId !== sid);
            saveLocalConnections(next);
            return next;
        });
        logLocalActivity(sid.split('-')[0] || sid, 'Disconnected', 'info');
        setOpenMenuId(null);
        if (projectId) setTimeout(fetchProjectConnections, 500);
        setTimeout(fetchActivities, 500);
    };

    /* ── Grouped servers ── */
    const designServers = MCP_SERVERS.filter((s) => s.displayGroup === 'design-docs');
    const devServers = MCP_SERVERS.filter((s) => s.displayGroup === 'dev-issues');

    const renderCard = (server: MCPServerEntry) => {
        const conn = getConn(server.id);
        const vis = PROVIDER_VISUALS[server.id] || { logo: '', iconBg: 'bg-slate-700', iconBorder: 'border-white/10' };
        const isConnected = conn?.status === 'connected';
        const isError = conn?.status === 'error';
        const isDisconnected = conn?.status === 'disconnected' || !conn;
        const Icon = server.icon;

        return (
            <div
                key={server.id}
                className={`app-card ${isError ? 'border-red-500/30' : ''} ${isDisconnected && !isError ? 'opacity-90' : ''}`}
            >
                {/* 3-dot menu */}
                {isConnected && (
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.5, transition: 'opacity 0.2s' }} className="group-hover:opacity-100">
                        <button onClick={() => setOpenMenuId(openMenuId === server.id ? null : server.id)}>
                            <MoreHorizontal style={{ width: '1.25rem', height: '1.25rem', color: 'var(--text-dim)', cursor: 'pointer' }} />
                        </button>
                        {openMenuId === server.id && (
                            <div style={{ position: 'absolute', right: 0, top: '2rem', width: '9rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '0.25rem 0', zIndex: 20 }}>
                                <button onClick={() => conn && handleDisconnect(conn.serverId)} style={{ width: '100%', textAlign: 'left', padding: '0.375rem 0.75rem', fontSize: '1rem', color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer' }}>Disconnect</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Icon + Name */}
                <div className="card-header">
                    <div className={`card-icon ${vis.iconBg} ${vis.iconBorder}`} style={{ border: '1px solid var(--border)' }}>
                        {vis.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img alt={server.name} src={vis.logo} style={{ opacity: 0.9 }} className={vis.invert ? 'invert' : ''} />
                        ) : server.id === 'linear' ? (
                            <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', border: '2px solid #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: '0.75rem', height: '0.75rem', background: 'var(--text-dim)', borderRadius: '50%' }} />
                            </div>
                        ) : (
                            <Icon style={{ width: '1.5rem', height: '1.5rem', color: 'var(--text-primary)' }} />
                        )}
                    </div>
                    <div>
                        <h4 className="card-title" style={isDisconnected && !isError ? { color: 'var(--text-secondary)' } : undefined}>{server.name}</h4>
                        <p className="card-subtitle" style={isDisconnected ? { color: 'var(--text-dim)' } : undefined}>{server.subtitle}</p>
                    </div>
                </div>

                {/* Status + sync info */}
                <div className="card-body">
                    <div className="card-status">
                        {isConnected && (
                            <span className="status-badge status-connected">
                                <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: '#34d399', marginRight: '0.5rem' }} /> Connected
                            </span>
                        )}
                        {isError && (
                            <span className="status-badge status-error">
                                <AlertTriangle style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} /> Auth Error
                            </span>
                        )}
                        {isDisconnected && !isError && !conn && (
                            <span className="status-badge status-disconnected">Not Configured</span>
                        )}
                        {conn?.status === 'disconnected' && (
                            <span className="status-badge status-disconnected">Disconnected</span>
                        )}
                    </div>
                    {isError && conn?.error && (
                        <p style={{ fontSize: '1rem', color: 'rgba(248,113,113,0.8)' }}>{conn.error}</p>
                    )}
                    {!isError && (
                        <p className="card-sync">
                            {conn?.connectedAt ? `Last synced: ${timeAgo(conn.connectedAt)}` : 'Never synced'}
                        </p>
                    )}
                </div>

                {/* Action buttons */}
                <div className="card-footer">
                    {isConnected ? (
                        <div className="card-footer-actions">
                            <button className="glass-button" style={{ flex: 1, padding: '0.5rem', color: 'var(--text-primary)' }}>Manage</button>
                            <button className="glass-button" style={{ color: 'var(--text-dim)', padding: '0.5rem' }} title="Sync Now" onClick={() => fetchStatus()}>
                                <RefreshCw style={{ width: '1rem', height: '1rem' }} />
                            </button>
                        </div>
                    ) : isError ? (
                        <button onClick={() => openConnectModal(server.id)} style={{ width: '100%', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}>Fix Connection</button>
                    ) : conn?.status === 'disconnected' ? (
                        <button onClick={() => openConnectModal(server.id)} className="glass-button" style={{ width: '100%', padding: '0.5rem', color: 'var(--text-primary)', borderStyle: 'dashed', borderColor: 'var(--border)' }}>Reconnect</button>
                    ) : (
                        <button onClick={() => openConnectModal(server.id)} className="glass-button" style={{ width: '100%', padding: '0.5rem', color: 'var(--text-primary)', borderStyle: 'dashed', borderColor: 'var(--border)' }}>Connect</button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* MCP Instruction */}
            <div className="glass-panel" style={{ borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LinkIcon size={18} style={{ color: 'var(--color-primary, #3B82F6)' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--card-title-color)' }}>MCP Connections</h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--card-subtitle-color)', lineHeight: 1.6, maxWidth: '48rem' }}>
                    Connect external tools like Figma, Confluence, GitHub via Model Context Protocol. AI agents use these connections to read designs, docs, and code directly from your sources.
                </p>
            </div>

            {/* Single Add Source */}
            <button
                onClick={() => openConnectModal()}
                className="app-card app-card--action clickable"
                style={{ maxWidth: '20rem' }}
            >
                <div>
                    <div className="card-icon"><Plus size={20} /></div>
                    <div className="card-info">
                        <h3>Add New Source</h3>
                        <p>Connect Figma, Confluence, GitHub, and more.</p>
                    </div>
                </div>
                <div className="card-action-label">Connect <ArrowRight size={12} /></div>
            </button>

            {/* ── Project Connections ── */}
            {projectId && projectConns.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>Project Connections</h3>
                    </div>
                    <div className="glass-panel" style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-input)', fontSize: '0.8125rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Source</th>
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Name</th>
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Tools</th>
                                    <th style={{ padding: '1rem', fontWeight: 500 }}>Updated</th>
                                    <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '1rem' }}>
                                {projectConns.map(conn => {
                                    const vis = PROVIDER_VISUALS[conn.type] || { logo: '', iconBg: 'bg-slate-700', iconBorder: 'border-white/10' };
                                    const server = MCP_SERVERS.find(s => s.id === conn.type);
                                    const statusColor = conn.status === 'connected' ? '#34d399' : conn.status === 'error' ? '#f87171' : '#f59e0b';
                                    const statusBg = conn.status === 'connected' ? 'rgba(52,211,153,0.1)' : conn.status === 'error' ? 'rgba(248,113,113,0.1)' : 'rgba(245,158,11,0.1)';
                                    const statusLabel = conn.status === 'connected' ? 'CONNECTED' : conn.status === 'error' ? 'ERROR' : conn.status === 'retrying' ? 'RETRYING' : conn.status.toUpperCase();

                                    return (
                                        <tr key={conn.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-input)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                            {/* Source */}
                                            <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {vis.logo ? (
                                                    <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', background: 'var(--bg-code)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img alt={conn.type} style={{ width: '0.75rem', height: '0.75rem', opacity: 0.9, ...(vis.invert ? { filter: 'invert(1)' } : {}) }} src={vis.logo} />
                                                    </div>
                                                ) : (
                                                    <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', background: 'var(--bg-code)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>
                                                        <LinkIcon size={10} style={{ color: 'var(--text-dim)' }} />
                                                    </div>
                                                )}
                                                <span style={{ color: 'var(--text-secondary)' }}>{server?.name || conn.type}</span>
                                            </td>
                                            {/* Name */}
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{conn.name}</td>
                                            {/* Status */}
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '1rem', color: statusColor, background: statusBg, padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 500, textTransform: 'uppercase' }}>
                                                    <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: statusColor }} />
                                                    {statusLabel}
                                                </span>
                                            </td>
                                            {/* Tools */}
                                            <td style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '1rem' }}>{conn.toolCount > 0 ? `${conn.toolCount} tools` : '—'}</td>
                                            {/* Updated */}
                                            <td style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '1rem' }}>{timeAgo(conn.updatedAt)}</td>
                                            {/* Actions */}
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => fetchStatus()} title="Refresh" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><RefreshCw size={16} /></button>
                                                    <button onClick={() => handleRemoveConnection(conn.id)} title="Remove" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#f87171')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Connect Modal ── */}
            <ConnectModal
                isOpen={showModal}
                onClose={closeModal}
                onConnect={handleConnect}
                servers={MCP_SERVERS}
                initialServerId={modalInitialServerId}
                connectError={connectError}
                connecting={connecting}
            />
        </div>
    );
}
