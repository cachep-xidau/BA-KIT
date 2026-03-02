'use client';

import FileUploadTextarea from '../components/FileUploadTextarea';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ClipboardList,
    Settings2,
    FileCode,
    Database,
    Code,
    Package,
    Inbox,
    Download,
    X,
    Sparkles,
    Archive,
    RotateCcw,
    Trash2,
    AlertTriangle,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Eye,
    EyeOff,
    Plus,
    GitBranch,
    ArrowRightLeft,
    Users,
    Activity,
    FolderOpen,
    Puzzle,
    Check,
    RefreshCw,
    Wand2,
    Loader,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// --- Types ---
interface Artifact {
    id: string;
    type: string;
    content: string;
    version: number;
    status: string;
    sourceHash: string | null;
    functionId: string;
    archivedAt: string | null;
    createdAt: string;
    isStale?: boolean;
}

interface Func {
    id: string;
    name: string;
    description: string | null;
    order: number;
    featureId: string;
    artifacts: Artifact[];
}

interface Feature {
    id: string;
    name: string;
    description: string | null;
    order: number;
    projectId: string;
    functions: Func[];
}

interface Project {
    id: string;
    name: string;
    _count?: { features: number; connections: number };
}

const TYPE_META: Record<string, { icon: typeof ClipboardList; label: string; color: string }> = {
    'user-story': { icon: ClipboardList, label: 'User Story', color: '#6366f1' },
    'function-list': { icon: Settings2, label: 'Function List', color: '#06b6d4' },
    'srs': { icon: FileCode, label: 'SRS', color: '#f59e0b' },
    'erd': { icon: Database, label: 'ERD', color: '#10b981' },
    'sql': { icon: Code, label: 'SQL', color: '#ef4444' },
    'flowchart': { icon: GitBranch, label: 'Flowchart', color: '#8b5cf6' },
    'sequence-diagram': { icon: ArrowRightLeft, label: 'Sequence', color: '#ec4899' },
    'use-case-diagram': { icon: Users, label: 'Use Case', color: '#14b8a6' },
    'activity-diagram': { icon: Activity, label: 'Activity', color: '#f97316' },
};

export default function ArtifactsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [features, setFeatures] = useState<Feature[]>([]);
    const [showArchived, setShowArchived] = useState(false);
    const [selected, setSelected] = useState<Artifact | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [confirmDeleteFeature, setConfirmDeleteFeature] = useState<string | null>(null);
    const [confirmDeleteFunction, setConfirmDeleteFunction] = useState<string | null>(null);

    // Expand/collapse state
    const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
    const [expandedFunctions, setExpandedFunctions] = useState<Set<string>>(new Set());

    // Inline create state
    const [addingFeature, setAddingFeature] = useState(false);
    const [newFeatureName, setNewFeatureName] = useState('');
    const [addingFunctionTo, setAddingFunctionTo] = useState<string | null>(null);
    const [newFunctionName, setNewFunctionName] = useState('');

    // Extract from PRD state
    interface ExtractedFeature { name: string; description?: string; functions: Array<{ name: string; description?: string }> }
    const [showExtractModal, setShowExtractModal] = useState(false);
    const [extractPrd, setExtractPrd] = useState('');
    const [extracting, setExtracting] = useState(false);
    const [extractedStructure, setExtractedStructure] = useState<ExtractedFeature[] | null>(null);
    const [extractError, setExtractError] = useState('');

    // Fetch projects on mount
    useEffect(() => {
        fetch(`${API_URL}/api/projects`)
            .then((r) => r.json() as Promise<{ success: boolean; data: Project[] }>)
            .then((data) => {
                if (data.success && data.data.length > 0) {
                    setProjects(data.data);
                    setSelectedProject(data.data[0].id);
                } else {
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error('Failed to load projects:', err);
                setError(err.message || 'Failed to load projects');
                setLoading(false);
            });
    }, []);

    // Fetch tree when project changes
    const fetchTree = useCallback(async () => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            const statusParam = showArchived ? '' : '?status=current';
            const res = await fetch(`${API_URL}/api/generate/tree/${selectedProject}${statusParam}`);
            const data = await res.json() as { success: boolean; data: Feature[] };
            if (data.success) {
                setFeatures(data.data);
                // Auto-expand all features on first load
                if (data.data.length > 0) {
                    setExpandedFeatures(new Set(data.data.map((f) => f.id)));
                }
            }
        } catch (err) {
            console.error('Failed to load artifact tree:', err);
            setError(err instanceof Error ? err.message : 'Failed to load artifacts');
        }
        setLoading(false);
    }, [selectedProject, showArchived]);

    useEffect(() => {
        fetchTree();
    }, [fetchTree]);

    // --- Toggle helpers ---
    const toggleFeature = (id: string) => {
        setExpandedFeatures((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleFunction = (id: string) => {
        setExpandedFunctions((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // --- CRUD Handlers ---
    const handleAddFeature = async () => {
        if (!newFeatureName.trim() || !selectedProject) return;
        try {
            const res = await fetch(`${API_URL}/api/features`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: selectedProject, name: newFeatureName.trim() }),
            });
            const data = await res.json() as { success: boolean; data: Feature };
            if (data.success) {
                setNewFeatureName('');
                setAddingFeature(false);
                await fetchTree();
                setExpandedFeatures((prev) => new Set([...prev, data.data.id]));
            }
        } catch (err) {
            console.error('Failed to add feature:', err);
            setError(err instanceof Error ? err.message : 'Failed to add feature');
        }
    };

    const handleAddFunction = async (featureId: string) => {
        if (!newFunctionName.trim()) return;
        try {
            const res = await fetch(`${API_URL}/api/functions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featureId, name: newFunctionName.trim() }),
            });
            const data = await res.json() as { success: boolean; data: Func };
            if (data.success) {
                setNewFunctionName('');
                setAddingFunctionTo(null);
                await fetchTree();
                setExpandedFunctions((prev) => new Set([...prev, data.data.id]));
            }
        } catch (err) {
            console.error('Failed to add function:', err);
            setError(err instanceof Error ? err.message : 'Failed to add function');
        }
    };

    const handleDeleteFeature = async (id: string) => {
        try {
            await fetch(`${API_URL}/api/features/${id}`, { method: 'DELETE' });
            setConfirmDeleteFeature(null);
            await fetchTree();
        } catch (err) {
            console.error('Failed to delete feature:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete feature');
        }
    };

    const handleDeleteFunction = async (id: string) => {
        try {
            await fetch(`${API_URL}/api/functions/${id}`, { method: 'DELETE' });
            setConfirmDeleteFunction(null);
            await fetchTree();
        } catch (err) {
            console.error('Failed to delete function:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete function');
        }
    };

    const handleExportSingle = (artifact: Artifact) => {
        const blob = new Blob([artifact.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${artifact.type}-v${artifact.version}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportAll = async () => {
        if (!selectedProject) return;
        try {
            const res = await fetch(`${API_URL}/api/generate/export/${selectedProject}`);
            const data = await res.json() as {
                success: boolean;
                data: { projectName: string; tree: Array<{ feature: string; functions: Array<{ function: string; artifacts: Array<{ filename: string; content: string }> }> }> };
            };
            if (data.success) {
                for (const feat of data.data.tree) {
                    for (const fn of feat.functions) {
                        for (const art of fn.artifacts) {
                            const blob = new Blob([art.content], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${feat.feature}_${fn.function}_${art.filename}`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Failed to export all artifacts:', err);
            setError(err instanceof Error ? err.message : 'Failed to export artifacts');
        }
    };

    const handleArchiveToggle = async (artifactId: string) => {
        try {
            await fetch(`${API_URL}/api/generate/artifact/${artifactId}/archive`, { method: 'PATCH' });
            await fetchTree();
            if (selected?.id === artifactId) setSelected(null);
        } catch (err) {
            console.error('Failed to archive artifact:', err);
            setError(err instanceof Error ? err.message : 'Failed to archive artifact');
        }
    };

    const handleDelete = async (artifactId: string) => {
        try {
            await fetch(`${API_URL}/api/generate/artifact/${artifactId}`, { method: 'DELETE' });
            setConfirmDelete(null);
            await fetchTree();
            if (selected?.id === artifactId) setSelected(null);
        } catch (err) {
            console.error('Failed to delete artifact:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete artifact');
        }
    };

    const handleGenerate = (functionId: string) => {
        router.push(`/generate?functionId=${functionId}`);
    };

    // --- Extract from PRD ---
    const handleExtract = async () => {
        if (!extractPrd.trim() || !selectedProject) return;
        setExtracting(true);
        setExtractError('');
        setExtractedStructure(null);
        try {
            const res = await fetch(`${API_URL}/api/generate/extract-structure`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: selectedProject, prdContent: extractPrd }),
            });
            const data = await res.json();
            if (data.success && data.data?.features) {
                setExtractedStructure(data.data.features);
            } else {
                setExtractError(data.error || 'Extraction failed');
            }
        } catch {
            setExtractError('Network error');
        }
        setExtracting(false);
    };

    const handleApplyStructure = async () => {
        if (!extractedStructure || !selectedProject) return;
        setExtracting(true);
        try {
            const res = await fetch(`${API_URL}/api/generate/apply-structure`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: selectedProject, features: extractedStructure }),
            });
            const data = await res.json();
            if (data.success) {
                setShowExtractModal(false);
                setExtractedStructure(null);
                setExtractPrd('');
                await fetchTree();
            } else {
                setExtractError(data.error || 'Apply failed');
            }
        } catch {
            setExtractError('Network error');
        }
        setExtracting(false);
    };

    const removeExtractedFeature = (idx: number) => {
        if (!extractedStructure) return;
        setExtractedStructure(extractedStructure.filter((_, i) => i !== idx));
    };

    const removeExtractedFunction = (featIdx: number, fnIdx: number) => {
        if (!extractedStructure) return;
        const updated = [...extractedStructure];
        updated[featIdx] = { ...updated[featIdx], functions: updated[featIdx].functions.filter((_, i) => i !== fnIdx) };
        setExtractedStructure(updated);
    };

    // Count total artifacts
    const totalArtifacts = features.reduce(
        (sum, f) => sum + f.functions.reduce((s, fn) => s + fn.artifacts.length, 0),
        0,
    );

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Artifacts</h1>
                <p>Manage generated BSA artifacts in a tree structure.</p>
            </div>

            {/* Toolbar */}
            <div className="glass-card-static" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                    {/* Project Filter */}
                    <div className="flex-gap gap-sm">
                        <label htmlFor="project-filter" style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                            Project:
                        </label>
                        <div style={{ position: 'relative' }}>
                            <select
                                id="project-filter"
                                value={selectedProject}
                                onChange={(e) => { setSelectedProject(e.target.value); setSelected(null); }}
                                style={{
                                    padding: '0.4rem 2rem 0.4rem 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-card)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9375rem',
                                    fontWeight: 500,
                                    appearance: 'none',
                                    cursor: 'pointer',
                                    minWidth: '180px',
                                }}
                            >
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <ChevronDown style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-dim)', pointerEvents: 'none' }} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-gap gap-sm">
                        <button
                            onClick={() => { setShowExtractModal(true); setExtractedStructure(null); setExtractPrd(''); setExtractError(''); }}
                            className="btn btn-ghost btn-sm"
                            title="Extract Feature/Function structure from PRD using AI"
                            disabled={!selectedProject}
                        >
                            <Wand2 style={{ width: 14, height: 14 }} />
                            Extract from PRD
                        </button>
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`btn btn-ghost btn-sm ${showArchived ? 'active' : ''}`}
                            title={showArchived ? 'Hide archived' : 'Show archived'}
                        >
                            {showArchived ? <Eye style={{ width: 14, height: 14 }} /> : <EyeOff style={{ width: 14, height: 14 }} />}
                            {showArchived ? 'All' : 'Current'}
                        </button>
                        <button
                            onClick={handleExportAll}
                            className="btn btn-primary btn-sm"
                            disabled={totalArtifacts === 0}
                            title="Export all current artifacts"
                        >
                            <Download style={{ width: 14, height: 14 }} />
                            Export All
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex-col gap-sm">
                    <div className="skeleton skeleton-card" />
                    <div className="skeleton skeleton-card" />
                    <div className="skeleton skeleton-card" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="glass-card-static" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                    <AlertCircle style={{ width: '2rem', height: '2rem', margin: '0 auto 1rem' }} />
                    <p>{error}</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && projects.length === 0 && (
                <div className="glass-card-static empty-state">
                    <div className="empty-icon"><Inbox /></div>
                    <p>No projects yet. Create a project first.</p>
                    <Link href="/generate" className="btn btn-primary btn-sm">
                        <Sparkles /> Go to Generate
                    </Link>
                </div>
            )}

            {/* Main Content — Tree View */}
            {!loading && selectedProject && (
                <div style={{ display: 'grid', gridTemplateColumns: selected ? '420px 1fr' : '1fr', gap: '1.5rem' }}>
                    <div className="flex-col gap-sm">

                        {/* --- Feature Tree --- */}
                        {features.map((feature) => {
                            const isExpanded = expandedFeatures.has(feature.id);
                            const totalFnArtifacts = feature.functions.reduce((s, fn) => s + fn.artifacts.length, 0);

                            return (
                                <div key={feature.id} className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
                                    {/* Feature Header */}
                                    <div
                                        onClick={() => toggleFeature(feature.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '0.65rem 0.85rem', cursor: 'pointer',
                                            borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none',
                                            transition: 'background 0.15s',
                                        }}
                                        className="hover-bg"
                                    >
                                        <div className="flex-gap gap-sm" style={{ flex: 1 }}>
                                            {isExpanded
                                                ? <ChevronDown style={{ width: 16, height: 16, color: 'var(--text-dim)', flexShrink: 0 }} />
                                                : <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-dim)', flexShrink: 0 }} />
                                            }
                                            <FolderOpen style={{ width: 16, height: 16, color: '#6366f1', flexShrink: 0 }} />
                                            <span style={{ fontWeight: 600, fontSize: '1rem' }}>{feature.name}</span>
                                            <span className="badge badge-neutral" style={{ fontSize: '1rem' }}>
                                                {feature.functions.length} fn · {totalFnArtifacts} docs
                                            </span>
                                        </div>
                                        <div className="flex-gap" style={{ gap: '0.15rem' }} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => { setAddingFunctionTo(feature.id); setNewFunctionName(''); }}
                                                className="btn btn-ghost btn-sm"
                                                style={{ padding: '0.2rem', minWidth: 0 }}
                                                title="Add Function"
                                            >
                                                <Plus style={{ width: 14, height: 14, color: 'var(--primary-light)' }} />
                                            </button>
                                            {confirmDeleteFeature === feature.id ? (
                                                <div className="flex-gap" style={{ gap: '0.1rem' }}>
                                                    <button onClick={() => handleDeleteFeature(feature.id)} className="btn btn-sm" style={{ padding: '0.15rem 0.3rem', minWidth: 0, fontSize: '0.55rem', backgroundColor: 'var(--danger)', color: 'var(--text-primary)', borderRadius: '4px' }}>Yes</button>
                                                    <button onClick={() => setConfirmDeleteFeature(null)} className="btn btn-ghost btn-sm" style={{ padding: '0.15rem 0.3rem', minWidth: 0, fontSize: '0.55rem' }}>No</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmDeleteFeature(feature.id)}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ padding: '0.2rem', minWidth: 0 }}
                                                    title="Delete Feature"
                                                >
                                                    <Trash2 style={{ width: 12, height: 12, color: 'var(--danger)' }} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Functions */}
                                    {isExpanded && (
                                        <div style={{ padding: '0.25rem 0' }}>
                                            {feature.functions.map((fn) => {
                                                const isFnExpanded = expandedFunctions.has(fn.id);
                                                return (
                                                    <div key={fn.id}>
                                                        {/* Function Header */}
                                                        <div
                                                            onClick={() => toggleFunction(fn.id)}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                padding: '0.45rem 0.85rem 0.45rem 2rem', cursor: 'pointer',
                                                                transition: 'background 0.15s',
                                                            }}
                                                            className="hover-bg"
                                                        >
                                                            <div className="flex-gap gap-sm" style={{ flex: 1 }}>
                                                                {isFnExpanded
                                                                    ? <ChevronDown style={{ width: 14, height: 14, color: 'var(--text-dim)', flexShrink: 0 }} />
                                                                    : <ChevronRight style={{ width: 14, height: 14, color: 'var(--text-dim)', flexShrink: 0 }} />
                                                                }
                                                                <Puzzle style={{ width: 14, height: 14, color: '#06b6d4', flexShrink: 0 }} />
                                                                <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{fn.name}</span>
                                                                <span className="badge badge-neutral" style={{ fontSize: '0.55rem' }}>
                                                                    {fn.artifacts.length} docs
                                                                </span>
                                                            </div>
                                                            <div className="flex-gap" style={{ gap: '0.15rem' }} onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    onClick={() => handleGenerate(fn.id)}
                                                                    className="btn btn-ghost btn-sm"
                                                                    style={{ padding: '0.15rem 0.4rem', minWidth: 0, fontSize: '1rem' }}
                                                                    title="Generate artifacts for this function"
                                                                >
                                                                    <Sparkles style={{ width: 12, height: 12 }} /> Gen
                                                                </button>
                                                                {confirmDeleteFunction === fn.id ? (
                                                                    <div className="flex-gap" style={{ gap: '0.1rem' }}>
                                                                        <button onClick={() => handleDeleteFunction(fn.id)} className="btn btn-sm" style={{ padding: '0.15rem 0.3rem', minWidth: 0, fontSize: '0.55rem', backgroundColor: 'var(--danger)', color: 'var(--text-primary)', borderRadius: '4px' }}>Yes</button>
                                                                        <button onClick={() => setConfirmDeleteFunction(null)} className="btn btn-ghost btn-sm" style={{ padding: '0.15rem 0.3rem', minWidth: 0, fontSize: '0.55rem' }}>No</button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => setConfirmDeleteFunction(fn.id)}
                                                                        className="btn btn-ghost btn-sm"
                                                                        style={{ padding: '0.2rem', minWidth: 0 }}
                                                                        title="Delete Function"
                                                                    >
                                                                        <Trash2 style={{ width: 12, height: 12, color: 'var(--danger)' }} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Artifacts */}
                                                        {isFnExpanded && fn.artifacts.length > 0 && (
                                                            <div style={{ padding: '0.15rem 0.85rem 0.3rem 3.5rem' }}>
                                                                <div className="flex-col" style={{ gap: '0.2rem' }}>
                                                                    {fn.artifacts.map((a) => {
                                                                        const meta = TYPE_META[a.type] || { icon: Package, label: a.type, color: '#888' };
                                                                        const Icon = meta.icon;
                                                                        return (
                                                                            <div
                                                                                key={a.id}
                                                                                onClick={() => setSelected(a)}
                                                                                style={{
                                                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                                    padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer',
                                                                                    transition: 'all 0.15s ease',
                                                                                    backgroundColor: selected?.id === a.id ? 'var(--primary-ghost)' : 'transparent',
                                                                                    opacity: a.status === 'archived' ? 0.5 : 1,
                                                                                }}
                                                                                className="hover-bg"
                                                                            >
                                                                                <div className="flex-gap gap-sm" style={{ flex: 1, minWidth: 0 }}>
                                                                                    <Icon style={{ width: 14, height: 14, color: meta.color, flexShrink: 0 }} />
                                                                                    <span style={{ fontSize: '1rem', fontWeight: 500 }}>{meta.label}</span>
                                                                                    <span className="badge badge-neutral" style={{ fontSize: '0.55rem', padding: '0.05rem 0.3rem' }}>
                                                                                        v{a.version}
                                                                                    </span>
                                                                                    {a.isStale && a.status === 'current' && (
                                                                                        <span
                                                                                            className="badge"
                                                                                            style={{ fontSize: '0.55rem', padding: '0.05rem 0.3rem', backgroundColor: 'rgba(255,165,0,0.15)', color: '#e6a100' }}
                                                                                            title="PRD changed since generation"
                                                                                        >
                                                                                            <AlertTriangle style={{ width: 10, height: 10 }} /> Stale
                                                                                        </span>
                                                                                    )}
                                                                                    {a.status === 'archived' && (
                                                                                        <span className="badge" style={{ fontSize: '0.55rem', padding: '0.05rem 0.3rem', backgroundColor: 'rgba(128,128,128,0.15)', color: 'var(--text-dim)' }}>
                                                                                            <Archive style={{ width: 10, height: 10 }} />
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                <div className="flex-gap" style={{ gap: '0.1rem' }} onClick={(e) => e.stopPropagation()}>
                                                                                    <button onClick={() => handleArchiveToggle(a.id)} className="btn btn-ghost btn-sm" style={{ padding: '0.15rem', minWidth: 0 }} title={a.status === 'archived' ? 'Restore' : 'Archive'}>
                                                                                        {a.status === 'archived' ? <RotateCcw style={{ width: 11, height: 11 }} /> : <Archive style={{ width: 11, height: 11 }} />}
                                                                                    </button>
                                                                                    {confirmDelete === a.id ? (
                                                                                        <div className="flex-gap" style={{ gap: '0.1rem' }}>
                                                                                            <button onClick={() => handleDelete(a.id)} className="btn btn-sm" style={{ padding: '0.15rem 0.3rem', minWidth: 0, fontSize: '0.55rem', backgroundColor: 'var(--danger)', color: 'var(--text-primary)', borderRadius: '4px' }}>Yes</button>
                                                                                            <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost btn-sm" style={{ padding: '0.15rem 0.3rem', minWidth: 0, fontSize: '0.55rem' }}>No</button>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <button onClick={() => setConfirmDelete(a.id)} className="btn btn-ghost btn-sm" style={{ padding: '0.15rem', minWidth: 0 }} title="Delete">
                                                                                            <Trash2 style={{ width: 11, height: 11, color: 'var(--danger)' }} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Empty function */}
                                                        {isFnExpanded && fn.artifacts.length === 0 && (
                                                            <div style={{ padding: '0.3rem 0.85rem 0.5rem 3.5rem' }}>
                                                                <button
                                                                    onClick={() => handleGenerate(fn.id)}
                                                                    className="btn btn-ghost btn-sm"
                                                                    style={{ fontSize: '0.7rem', gap: '0.3rem' }}
                                                                >
                                                                    <Sparkles style={{ width: 12, height: 12 }} />
                                                                    Generate Artifacts →
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Add Function inline */}
                                            {addingFunctionTo === feature.id && (
                                                <div style={{ padding: '0.3rem 0.85rem 0.5rem 2rem' }}>
                                                    <div className="flex-gap gap-sm">
                                                        <input
                                                            type="text"
                                                            value={newFunctionName}
                                                            onChange={(e) => setNewFunctionName(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleAddFunction(feature.id)}
                                                            placeholder="Function name..."
                                                            autoFocus
                                                            style={{
                                                                padding: '0.3rem 0.5rem', borderRadius: '6px',
                                                                border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)',
                                                                color: 'var(--text-primary)', fontSize: '1rem', flex: 1,
                                                            }}
                                                        />
                                                        <button onClick={() => handleAddFunction(feature.id)} className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.5rem', minWidth: 0 }}>
                                                            <Check style={{ width: 12, height: 12 }} />
                                                        </button>
                                                        <button onClick={() => setAddingFunctionTo(null)} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem', minWidth: 0 }}>
                                                            <X style={{ width: 12, height: 12 }} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Empty feature */}
                                            {feature.functions.length === 0 && addingFunctionTo !== feature.id && (
                                                <div style={{ padding: '0.5rem 0.85rem 0.5rem 2rem' }}>
                                                    <button
                                                        onClick={() => { setAddingFunctionTo(feature.id); setNewFunctionName(''); }}
                                                        className="btn btn-ghost btn-sm"
                                                        style={{ fontSize: '0.7rem', gap: '0.3rem' }}
                                                    >
                                                        <Plus style={{ width: 12, height: 12 }} />
                                                        Add first function
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Add Feature */}
                        {addingFeature ? (
                            <div className="glass-card-static" style={{ padding: '0.65rem 0.85rem' }}>
                                <div className="flex-gap gap-sm">
                                    <FolderOpen style={{ width: 16, height: 16, color: '#6366f1', flexShrink: 0 }} />
                                    <input
                                        type="text"
                                        value={newFeatureName}
                                        onChange={(e) => setNewFeatureName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                                        placeholder="Feature name..."
                                        autoFocus
                                        style={{
                                            padding: '0.3rem 0.5rem', borderRadius: '6px',
                                            border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)',
                                            color: 'var(--text-primary)', fontSize: '0.9375rem', flex: 1,
                                        }}
                                    />
                                    <button onClick={handleAddFeature} className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.6rem', minWidth: 0 }}>
                                        <Check style={{ width: 14, height: 14 }} />
                                    </button>
                                    <button onClick={() => setAddingFeature(false)} className="btn btn-ghost btn-sm" style={{ padding: '0.3rem', minWidth: 0 }}>
                                        <X style={{ width: 14, height: 14 }} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setAddingFeature(true); setNewFeatureName(''); }}
                                className="btn btn-ghost"
                                style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', fontSize: '0.9375rem', gap: '0.4rem', border: '1px dashed var(--border-color)', borderRadius: '12px' }}
                            >
                                <Plus style={{ width: 16, height: 16 }} />
                                Add Feature
                            </button>
                        )}

                        {/* Empty State */}
                        {features.length === 0 && !addingFeature && (
                            <div className="glass-card-static empty-state" style={{ padding: '2rem' }}>
                                <div className="empty-icon"><FolderOpen /></div>
                                <p style={{ fontSize: '1rem' }}>No features yet. Add a feature to start organizing artifacts.</p>
                            </div>
                        )}
                    </div>

                    {/* Detail Viewer */}
                    {selected && (
                        <div className="glass-card-static artifact-viewer">
                            <div className="artifact-viewer-header">
                                <h3 className="flex-gap gap-sm" style={{ fontSize: '1rem', fontWeight: 600 }}>
                                    {(() => {
                                        const meta = TYPE_META[selected.type] || { icon: Package, label: selected.type, color: '#888' };
                                        const Icon = meta.icon;
                                        return (
                                            <>
                                                <Icon style={{ width: 18, height: 18, color: meta.color }} />
                                                {meta.label}
                                                <span className="badge badge-neutral">v{selected.version}</span>
                                                {selected.isStale && selected.status === 'current' && (
                                                    <span className="badge" style={{ backgroundColor: 'rgba(255,165,0,0.15)', color: '#e6a100', fontSize: '1rem' }}>
                                                        ⚠️ Outdated
                                                    </span>
                                                )}
                                            </>
                                        );
                                    })()}
                                </h3>
                                <div className="flex-gap gap-sm">
                                    <button
                                        onClick={() => handleGenerate(selected.functionId)}
                                        className="btn btn-ghost btn-sm"
                                        title="Re-generate"
                                    >
                                        <RefreshCw style={{ width: 14, height: 14 }} />
                                    </button>
                                    <button
                                        onClick={() => handleExportSingle(selected)}
                                        className="btn btn-primary btn-sm"
                                    >
                                        <Download style={{ width: 14, height: 14 }} />
                                        Export
                                    </button>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="btn btn-ghost btn-sm"
                                    >
                                        <X style={{ width: 14, height: 14 }} />
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-[600px] overflow-auto">
                                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: 1.6 }}>{selected.content}</pre>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Extract from PRD Modal */}
            {showExtractModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem',
                }} onClick={() => setShowExtractModal(false)}>
                    <div style={{
                        background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)',
                        maxWidth: '700px', width: '100%', maxHeight: '80vh', overflow: 'auto', padding: '1.5rem',
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Wand2 style={{ width: 18, height: 18, color: '#8b5cf6' }} />
                                Extract Structure from PRD
                            </h3>
                            <button onClick={() => setShowExtractModal(false)} className="btn btn-ghost btn-sm"><X style={{ width: 14, height: 14 }} /></button>
                        </div>

                        {!extractedStructure ? (
                            <>
                                <FileUploadTextarea
                                    value={extractPrd}
                                    onChange={setExtractPrd}
                                    label="PRD Content"
                                    placeholder="Paste your PRD content here or upload a .md/.txt file... AI will extract Feature → Function structure."
                                    rows={12}
                                />
                                {extractError && <p style={{ color: '#ef4444', fontSize: '0.9375rem', margin: '0 0 0.5rem' }}>{extractError}</p>}
                                <button
                                    onClick={handleExtract}
                                    className="btn btn-primary"
                                    disabled={extracting || !extractPrd.trim()}
                                    style={{ width: '100%' }}
                                >
                                    {extracting ? <><Loader style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Extracting...</> : <><Wand2 style={{ width: 14, height: 14 }} /> Extract Structure</>}
                                </button>
                            </>
                        ) : (
                            <>
                                <p style={{ fontSize: '0.9375rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                                    Review the extracted structure below. Remove any unwanted items, then click Apply.
                                </p>
                                <div className="flex-col gap-sm" style={{ marginBottom: '1rem' }}>
                                    {extractedStructure.map((feat, fi) => (
                                        <div key={fi} style={{
                                            border: '1px solid var(--border-color)', borderRadius: '8px',
                                            padding: '0.65rem', background: 'var(--bg-secondary)',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: feat.functions.length > 0 ? '0.5rem' : 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FolderOpen style={{ width: 14, height: 14, color: '#6366f1' }} />
                                                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{feat.name}</span>
                                                    {feat.description && <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>— {feat.description}</span>}
                                                </div>
                                                <button onClick={() => removeExtractedFeature(fi)} className="btn btn-ghost btn-sm" title="Remove">
                                                    <X style={{ width: 12, height: 12, color: '#ef4444' }} />
                                                </button>
                                            </div>
                                            {feat.functions.map((fn, fni) => (
                                                <div key={fni} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    paddingLeft: '1.5rem', paddingTop: '0.25rem',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Puzzle style={{ width: 12, height: 12, color: '#06b6d4' }} />
                                                        <span style={{ fontSize: '0.9375rem' }}>{fn.name}</span>
                                                        {fn.description && <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>— {fn.description}</span>}
                                                    </div>
                                                    <button onClick={() => removeExtractedFunction(fi, fni)} className="btn btn-ghost btn-sm" title="Remove">
                                                        <X style={{ width: 10, height: 10, color: '#ef4444' }} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {extractError && <p style={{ color: '#ef4444', fontSize: '0.9375rem', margin: '0 0 0.5rem' }}>{extractError}</p>}
                                <div className="flex-gap gap-sm">
                                    <button onClick={() => setExtractedStructure(null)} className="btn btn-ghost" style={{ flex: 1 }}>
                                        ← Back
                                    </button>
                                    <button
                                        onClick={handleApplyStructure}
                                        className="btn btn-primary"
                                        disabled={extracting || extractedStructure.length === 0}
                                        style={{ flex: 2 }}
                                    >
                                        {extracting ? <><Loader style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Applying...</> : <><Check style={{ width: 14, height: 14 }} /> Apply Structure</>}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
