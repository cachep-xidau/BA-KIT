'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Plus,
    FolderOpen,
    MoreHorizontal,
    Loader,
    X,
    Check,
    AlertCircle,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */
interface RepoProject {
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: {
        artifacts?: number;
        features?: number;
        connections?: number;
    };
}

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getProjectIcon() {
    return { Icon: FolderOpen, color: '#6366f1' };
}

/* ──────────────────────────────────────────────
   Project Card (Connections-style)
   ────────────────────────────────────────────── */
function ProjectCard({ project, index }: { project: RepoProject; index: number }) {
    const router = useRouter();
    const [openMenu, setOpenMenu] = useState(false);
    const { Icon, color } = getProjectIcon();

    const features = project._count?.features ?? 0;
    const artifacts = project._count?.artifacts ?? 0;
    const connections = project._count?.connections ?? 0;

    return (
        <div
            className="app-card clickable"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push(`/projects/${project.id}`)}
        >
            {/* 3-dot menu */}
            <div
                style={{
                    position: 'absolute', top: 0, right: 0, padding: '1rem',
                    opacity: 0.5, transition: 'opacity 0.2s',
                }}
                className="group-hover:opacity-100"
            >
                <button onClick={(e) => { e.stopPropagation(); setOpenMenu(!openMenu); }}>
                    <MoreHorizontal style={{ width: '1.25rem', height: '1.25rem', color: 'var(--text-dim)', cursor: 'pointer' }} />
                </button>
                {openMenu && (
                    <div style={{
                        position: 'absolute', right: 0, top: '2rem', width: '9rem',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: '0.5rem', boxShadow: 'var(--shadow-xl)',
                        padding: '0.25rem 0', zIndex: 20,
                    }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/projects/${project.id}`);
                            }}
                            style={{
                                width: '100%', textAlign: 'left', padding: '0.375rem 0.75rem',
                                fontSize: '1rem', color: 'var(--text-secondary)', background: 'transparent',
                                border: 'none', cursor: 'pointer',
                            }}
                        >
                            Open Project
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/generate?project=${project.id}`);
                            }}
                            style={{
                                width: '100%', textAlign: 'left', padding: '0.375rem 0.75rem',
                                fontSize: '1rem', color: 'var(--text-secondary)', background: 'transparent',
                                border: 'none', cursor: 'pointer',
                            }}
                        >
                            Generate Artifacts
                        </button>
                    </div>
                )}
            </div>

            {/* Icon + Name */}
            <div className="card-header">
                <div
                    className="card-icon"
                    style={{
                        background: `${color}20`,
                        border: `1px solid ${color}30`,
                    }}
                >
                    <Icon style={{ width: '1.5rem', height: '1.5rem', color }} />
                </div>
                <div>
                    <h4 className="card-title">{project.name}</h4>
                    <p className="card-subtitle">
                        {features} features · {artifacts} artifacts · {connections} connections
                    </p>
                </div>
            </div>

            {/* Description + sync info */}
            <div className="card-body">
                {project.description && (
                    <p style={{
                        marginTop: '0.25rem',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {project.description}
                    </p>
                )}
                <p className="card-sync" style={{ marginTop: project.description ? '0.75rem' : '0' }}>
                    Last updated: {timeAgo(project.updatedAt)}
                </p>
            </div>

            {/* Action button */}
            <div className="card-footer">
                <button
                    className="glass-button"
                    style={{ width: '100%', padding: '0.5rem' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/projects/${project.id}`);
                    }}
                >
                    Open
                </button>
            </div>
        </div >
    );
}

/* ──────────────────────────────────────────────
   Tab definitions
   ────────────────────────────────────────────── */
function RepoPageContent() {
    const router = useRouter();

    const [projects, setProjects] = useState<RepoProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Create project modal state
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/api/projects`)
            .then(r => r.json())
            .then(data => {
                if (data.success && data.data) {
                    setProjects(data.data);
                }
            })
            .catch((err) => {
                console.error('Failed to load projects:', err);
                setError(err.message || 'Failed to load projects');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async () => {
        if (!newName.trim() || creating) return;
        setCreating(true);
        try {
            const res = await fetch(`${API_URL}/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName }),
            });
            const data = await res.json();
            if (data.success) {
                setProjects(prev => [data.data, ...prev]);
                setNewName('');
                setShowCreate(false);
                router.push(`/projects/${data.data.id}`);
            }
        } catch (err) {
            console.error('Failed to create project:', err);
            setError(err instanceof Error ? err.message : 'Failed to create project');
        } finally {
            setCreating(false);
        }
    };

    // Split projects into groups
    const activeProjects = projects.filter(p => (p._count?.artifacts ?? 0) >= 1);
    const newProjects = projects.filter(p => (p._count?.artifacts ?? 0) === 0);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
            {/* ── Header (Skills-style flat) ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2rem 2rem 0 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FolderOpen size={24} style={{ color: 'var(--primary)' }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Projects Repository</h1>
                    {!loading && (
                        <span style={{
                            fontSize: '0.8125rem', color: 'var(--text-dim)',
                            background: 'var(--bg-input)', padding: '0.2rem 0.6rem', borderRadius: '9999px',
                        }}>
                            {projects.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    style={{
                        background: 'var(--primary)', color: 'var(--text-on-primary)',
                        padding: '0.5rem 1rem', borderRadius: '0.5rem',
                        fontSize: '1rem', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                    }}
                >
                    <Plus style={{ width: '1rem', height: '1rem' }} />
                    Create New Project
                </button>
            </div>

            {/* ── Content ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                {loading ? (
                    <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
                        <div className="app-card-grid app-card-grid--4col">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="app-card" style={{ minHeight: '220px' }}>
                                    <div className="card-header">
                                        <div style={{
                                            width: '3rem', height: '3rem', borderRadius: '0.5rem',
                                            background: 'var(--primary-bg)', animation: 'pulse 1.5s ease-in-out infinite',
                                        }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                height: '0.875rem', width: '60%', borderRadius: '0.25rem',
                                                background: 'var(--primary-bg)', marginBottom: '0.5rem',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }} />
                                            <div style={{
                                                height: '0.75rem', width: '80%', borderRadius: '0.25rem',
                                                background: 'var(--primary-bg)', opacity: 0.5,
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }} />
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div style={{
                                            height: '1.5rem', width: '5rem', borderRadius: '9999px',
                                            background: 'var(--primary-bg)', opacity: 0.4,
                                            animation: 'pulse 1.5s ease-in-out infinite',
                                        }} />
                                    </div>
                                    <div className="card-footer">
                                        <div style={{
                                            height: '2rem', borderRadius: '0.375rem',
                                            background: 'var(--primary-bg)', opacity: 0.3,
                                            animation: 'pulse 1.5s ease-in-out infinite',
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                        <AlertCircle style={{ width: '2rem', height: '2rem', margin: '0 auto 1rem' }} />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Active Projects */}
                        {activeProjects.length > 0 && (
                            <div>
                                <h3 style={{
                                    fontSize: '1rem', fontWeight: 500, color: 'var(--text-dim)',
                                    marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>
                                    Active Projects
                                </h3>
                                <div className="app-card-grid app-card-grid--4col">
                                    {activeProjects.map((project, idx) => (
                                        <ProjectCard key={project.id} project={project} index={idx} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New / Unconfigured Projects */}
                        <div>
                            <h3 style={{
                                fontSize: '1rem', fontWeight: 500, color: 'var(--text-dim)',
                                marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                                {activeProjects.length > 0 ? 'New Projects' : 'All Projects'}
                            </h3>
                            <div className="app-card-grid app-card-grid--4col">
                                {newProjects.map((project, idx) => (
                                    <ProjectCard key={project.id} project={project} index={activeProjects.length + idx} />
                                ))}

                                {/* Add New Project card */}
                                <div
                                    onClick={() => setShowCreate(true)}
                                    className="app-card app-card--dashed"
                                    style={{ minHeight: '220px' }}
                                >
                                    <div style={{
                                        width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
                                        background: 'linear-gradient(135deg, var(--primary-bg), var(--primary-glow))',
                                        border: '1px solid var(--primary-border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '0.75rem',
                                        transition: 'transform 0.2s',
                                    }}>
                                        <Plus style={{ color: 'var(--primary)', width: '1.5rem', height: '1.5rem' }} />
                                    </div>
                                    <h4 style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Start New Analysis</h4>
                                    <p style={{
                                        fontSize: '0.875rem', color: 'var(--text-dim)',
                                        marginTop: '0.375rem', textAlign: 'center', padding: '0 1rem',
                                        lineHeight: 1.5,
                                    }}>
                                        Create a BSA project with AI-powered artifact generation
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Create Project Modal ── */}
            {showCreate && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 100,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={() => setShowCreate(false)}
                >
                    <div
                        className="glass-panel"
                        style={{
                            borderRadius: '1rem',
                            padding: '2rem',
                            width: '100%',
                            maxWidth: '28rem',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', marginBottom: '1.5rem',
                        }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                Create New Project
                            </h3>
                            <button
                                onClick={() => setShowCreate(false)}
                                style={{
                                    background: 'transparent', border: 'none',
                                    color: 'var(--text-dim)', cursor: 'pointer',
                                    padding: '0.25rem', borderRadius: '0.25rem',
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <label style={{
                            display: 'block', fontSize: '0.9375rem',
                            fontWeight: 500, color: 'var(--text-dim)', marginBottom: '0.5rem',
                        }}>
                            Project Name
                        </label>
                        <input
                            type="text"
                            style={{
                                display: 'block', width: '100%',
                                padding: '0.625rem 0.875rem',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-primary)', fontSize: '1rem',
                                fontFamily: 'var(--font-sans)',
                                marginBottom: '1.5rem',
                                outline: 'none',
                            }}
                            placeholder="e.g. Payment Gateway API"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreate();
                                if (e.key === 'Escape') setShowCreate(false);
                            }}
                            autoFocus
                        />

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="glass-button"
                                style={{ padding: '0.5rem 1rem', color: 'var(--text-dim)', fontSize: '1rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newName.trim() || creating}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                    padding: '0.5rem 1.25rem', borderRadius: '0.5rem',
                                    background: 'var(--primary)', border: 'none', color: 'var(--text-on-primary)',
                                    cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
                                    opacity: (!newName.trim() || creating) ? 0.5 : 1,
                                    boxShadow: '0 10px 15px -3px rgba(79,70,229,0.2)',
                                }}
                            >
                                {creating ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                                <span>Create</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────
   Export with Suspense boundary
   ────────────────────────────────────────────── */
export default function RepoPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="animate-spin inline" /> Loading...</div>}>
            <RepoPageContent />
        </Suspense>
    );
}
