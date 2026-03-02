'use client';

import FileUploadTextarea from '../components/FileUploadTextarea';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ClipboardList,
    Settings2,
    FileCode,
    Database,
    Code,
    Sparkles,
    Loader,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    Zap,
    FolderOpen,
    Puzzle,
    Plus,
    Check,
    X,
    GitBranch,
    ArrowRightLeft,
    Users,
    Activity,
} from 'lucide-react';

// Validate API_URL is configured
const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
    console.warn('NEXT_PUBLIC_API_URL is not configured. API calls will fail.');
}

const ARTIFACT_TYPES = [
    { id: 'user-story', label: 'User Stories', icon: ClipboardList, desc: 'Structured user stories with acceptance criteria' },
    { id: 'function-list', label: 'Function List', icon: Settings2, desc: 'Comprehensive functional requirements table' },
    { id: 'srs', label: 'SRS', icon: FileCode, desc: 'IEEE 830 Software Requirements Specification' },
    { id: 'erd', label: 'ERD', icon: Database, desc: 'Entity-Relationship Diagram in DBML' },
    { id: 'sql', label: 'SQL', icon: Code, desc: 'Production DDL — MySQL + SQL Server' },
    { id: 'flowchart', label: 'Flowchart', icon: GitBranch, desc: 'Process flowcharts in Mermaid' },
    { id: 'sequence-diagram', label: 'Sequence Diagram', icon: ArrowRightLeft, desc: 'Interaction diagrams in PlantUML' },
    { id: 'use-case-diagram', label: 'Use Case Diagram', icon: Users, desc: 'Actor/use-case diagrams in PlantUML' },
    { id: 'activity-diagram', label: 'Activity Diagram', icon: Activity, desc: 'Workflow diagrams in Mermaid' },
] as const;

type GenerationStatus = 'idle' | 'generating' | 'done' | 'error';

interface Feature {
    id: string;
    name: string;
    functions: Array<{ id: string; name: string; _count?: { artifacts: number } }>;
}

export default function GeneratePage() {
    return (
        <Suspense>
            <GeneratePageInner />
        </Suspense>
    );
}

function GeneratePageInner() {
    const searchParams = useSearchParams();
    const [prdContent, setPrdContent] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [status, setStatus] = useState<GenerationStatus>('idle');
    const [result, setResult] = useState<{ artifacts: Array<{ type: string; id: string; status: string; content?: string; error?: string }> } | null>(null);
    const [error, setError] = useState('');
    const [expandedArtifacts, setExpandedArtifacts] = useState<Set<string>>(new Set());

    // Project selection
    const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
    const [projectId, setProjectId] = useState<string>(searchParams.get('projectId') || '');

    // Feature & Function selection
    const [features, setFeatures] = useState<Feature[]>([]);
    const [featureId, setFeatureId] = useState<string>('');
    const [functionId, setFunctionId] = useState<string>(searchParams.get('functionId') || '');

    // Inline create state
    const [addingFeature, setAddingFeature] = useState(false);
    const [newFeatureName, setNewFeatureName] = useState('');
    const [addingFunction, setAddingFunction] = useState(false);
    const [newFunctionName, setNewFunctionName] = useState('');

    // Loading states for initial fetch
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingFeatures, setLoadingFeatures] = useState(false);

    // Fetch projects on mount
    useEffect(() => {
        if (!API_URL) return;
        setLoadingProjects(true);
        fetch(`${API_URL}/api/projects`)
            .then((r) => r.json())
            .then((data) => {
                if (data.success && data.data) {
                    setProjects(data.data);
                    if (!projectId && data.data.length > 0) {
                        setProjectId(data.data[0].id);
                    }
                }
            })
            .catch((err) => {
                console.error('Failed to load projects:', err);
                setError(err.message || 'Failed to load projects');
            })
            .finally(() => setLoadingProjects(false));
    }, []);

    // Fetch features when project changes
    useEffect(() => {
        if (!projectId || !API_URL) { setFeatures([]); return; }
        setLoadingFeatures(true);
        fetch(`${API_URL}/api/features/${projectId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.success && data.data) {
                    setFeatures(data.data);
                    // Auto-select if functionId from URL
                    const urlFnId = searchParams.get('functionId');
                    if (urlFnId) {
                        for (const f of data.data) {
                            const fn = f.functions.find((fn: { id: string }) => fn.id === urlFnId);
                            if (fn) {
                                setFeatureId(f.id);
                                setFunctionId(urlFnId);
                                return;
                            }
                        }
                    }
                    // Default: select first feature/function
                    if (data.data.length > 0) {
                        setFeatureId(data.data[0].id);
                        if (data.data[0].functions.length > 0) {
                            setFunctionId(data.data[0].functions[0].id);
                        } else {
                            setFunctionId('');
                        }
                    } else {
                        setFeatureId('');
                        setFunctionId('');
                    }
                }
            })
            .catch((err) => {
                console.error('Failed to load features:', err);
                setError(err.message || 'Failed to load features');
            })
            .finally(() => setLoadingFeatures(false));
    }, [projectId]);

    // Update function when feature changes
    const selectedFeature = features.find((f) => f.id === featureId);
    const handleFeatureChange = (fid: string) => {
        setFeatureId(fid);
        const feat = features.find((f) => f.id === fid);
        if (feat && feat.functions.length > 0) {
            setFunctionId(feat.functions[0].id);
        } else {
            setFunctionId('');
        }
    };

    // Pre-select type from URL query param
    useEffect(() => {
        const type = searchParams.get('type');
        if (type && ARTIFACT_TYPES.some((t) => t.id === type)) {
            setSelected(new Set([type]));
        }
    }, [searchParams]);

    // Auto-load PRD when regenerating
    useEffect(() => {
        const regenerate = searchParams.get('regenerate');
        const pid = searchParams.get('projectId');
        if (regenerate === 'true' && pid && API_URL) {
            fetch(`${API_URL}/api/projects/${pid}`)
                .then((r) => r.json())
                .then((data) => {
                    if (data.success && data.data?.prdContent) {
                        setPrdContent(data.data.prdContent);
                    }
                })
                .catch((err) => {
                    console.error('Failed to load PRD:', err);
                    setError(err.message || 'Failed to load PRD');
                });
        }
    }, [searchParams]);

    const toggleType = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selected.size === ARTIFACT_TYPES.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(ARTIFACT_TYPES.map((t) => t.id)));
        }
    };

    // Create feature inline
    const handleAddFeature = async () => {
        if (!newFeatureName.trim() || !projectId || !API_URL) return;
        try {
            const res = await fetch(`${API_URL}/api/features`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, name: newFeatureName.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setNewFeatureName('');
                setAddingFeature(false);
                // Refresh features
                const featRes = await fetch(`${API_URL}/api/features/${projectId}`);
                const featData = await featRes.json();
                if (featData.success) {
                    setFeatures(featData.data);
                    setFeatureId(data.data.id);
                    setFunctionId('');
                }
            }
        } catch (err) {
            console.error('Failed to add feature:', err);
            setError(err instanceof Error ? err.message : 'Failed to add feature');
        }
    };

    // Create function inline
    const handleAddFunction = async () => {
        if (!newFunctionName.trim() || !featureId || !API_URL) return;
        try {
            const res = await fetch(`${API_URL}/api/functions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featureId, name: newFunctionName.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setNewFunctionName('');
                setAddingFunction(false);
                // Refresh features
                const featRes = await fetch(`${API_URL}/api/features/${projectId}`);
                const featData = await featRes.json();
                if (featData.success) {
                    setFeatures(featData.data);
                    setFunctionId(data.data.id);
                }
            }
        } catch (err) {
            console.error('Failed to add feature:', err);
            setError(err instanceof Error ? err.message : 'Failed to add feature');
        }
    };

    const handleGenerate = async () => {
        if (!prdContent.trim() || selected.size === 0) return;

        if (!API_URL) {
            setStatus('error');
            setError('API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
            return;
        }

        if (!functionId) {
            setStatus('error');
            setError('No function selected. Please create a Feature and Function first.');
            return;
        }

        setStatus('generating');
        setResult(null);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    functionId,
                    artifactTypes: Array.from(selected),
                    prdContent,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus('error');
                setError(data.error || `Request failed with status ${res.status}`);
                return;
            }

            if (data.success) {
                setStatus('done');
                const enrichedArtifacts = await Promise.all(
                    data.data.artifacts.map(async (a: { type: string; id: string; status: string; error?: string }) => {
                        if (a.status === 'success' && a.id) {
                            try {
                                const artRes = await fetch(`${API_URL}/api/generate/artifact/${a.id}`);
                                const artData = await artRes.json();
                                if (artData.success && artData.data) {
                                    return { ...a, content: artData.data.content };
                                }
                            } catch (err) {
                                console.error('Failed to load artifact content:', err);
                            }
                        }
                        return a;
                    })
                );
                setResult({ ...data.data, artifacts: enrichedArtifacts });
                const firstSuccess = enrichedArtifacts.find((a: { status: string }) => a.status === 'success');
                if (firstSuccess) setExpandedArtifacts(new Set([firstSuccess.type]));
            } else {
                setStatus('error');
                setError(data.error || 'Generation failed');
            }
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Network error - check if API server is running');
        }
    };

    const canGenerate = prdContent.trim().length > 0 && selected.size > 0 && !!functionId;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Generate Artifacts</h1>
                <p>Select a function, paste your PRD, choose artifact types, and generate.</p>
            </div>

            {/* Project + Feature + Function Selector */}
            <div className="section">
                <h2 className="section-title">
                    <FolderOpen />
                    Target Location
                </h2>
                <div className="glass-card-static" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        {/* Project */}
                        <div className="input-group">
                            <label htmlFor="project-select" className="input-label">
                                <FolderOpen style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle' }} /> Project
                            </label>
                            {loadingProjects ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', color: 'var(--text-dim)' }}>
                                    <Loader className="spinner" style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                                    Loading...
                                </div>
                            ) : projects.length > 0 ? (
                                <select id="project-select" className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ padding: '0.6rem 0.75rem', cursor: 'pointer' }}>
                                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>No projects found.</p>
                            )}
                        </div>

                        {/* Feature */}
                        <div className="input-group">
                            <label htmlFor="feature-select" className="input-label">
                                <FolderOpen style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', color: '#6366f1' }} /> Feature
                            </label>
                            {addingFeature ? (
                                <div className="flex-gap gap-sm">
                                    <input type="text" value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()} placeholder="Feature name..." autoFocus className="input" style={{ padding: '0.5rem 0.75rem', flex: 1 }} />
                                    <button onClick={handleAddFeature} className="btn btn-primary btn-sm" style={{ padding: '0.4rem' }}><Check style={{ width: 14, height: 14 }} /></button>
                                    <button onClick={() => setAddingFeature(false)} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }}><X style={{ width: 14, height: 14 }} /></button>
                                </div>
                            ) : loadingFeatures ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', color: 'var(--text-dim)' }}>
                                    <Loader className="spinner" style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                                    Loading...
                                </div>
                            ) : (
                                <div className="flex-gap gap-sm">
                                    <select id="feature-select" className="input" value={featureId} onChange={(e) => handleFeatureChange(e.target.value)} style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', flex: 1 }}>
                                        {features.length === 0 && <option value="">No features</option>}
                                        {features.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                    <button onClick={() => { setAddingFeature(true); setNewFeatureName(''); }} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }} title="Add Feature"><Plus style={{ width: 14, height: 14 }} /></button>
                                </div>
                            )}
                        </div>

                        {/* Function */}
                        <div className="input-group">
                            <label htmlFor="function-select" className="input-label">
                                <Puzzle style={{ width: 14, height: 14, display: 'inline', verticalAlign: 'middle', color: '#06b6d4' }} /> Function
                            </label>
                            {addingFunction ? (
                                <div className="flex-gap gap-sm">
                                    <input type="text" value={newFunctionName} onChange={(e) => setNewFunctionName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddFunction()} placeholder="Function name..." autoFocus className="input" style={{ padding: '0.5rem 0.75rem', flex: 1 }} />
                                    <button onClick={handleAddFunction} className="btn btn-primary btn-sm" style={{ padding: '0.4rem' }}><Check style={{ width: 14, height: 14 }} /></button>
                                    <button onClick={() => setAddingFunction(false)} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }}><X style={{ width: 14, height: 14 }} /></button>
                                </div>
                            ) : (
                                <div className="flex-gap gap-sm">
                                    <select id="function-select" className="input" value={functionId} onChange={(e) => setFunctionId(e.target.value)} style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', flex: 1 }} disabled={!featureId}>
                                        {(!selectedFeature || selectedFeature.functions.length === 0) && <option value="">No functions</option>}
                                        {selectedFeature?.functions.map((fn) => <option key={fn.id} value={fn.id}>{fn.name}</option>)}
                                    </select>
                                    <button onClick={() => { setAddingFunction(true); setNewFunctionName(''); }} className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }} title="Add Function" disabled={!featureId}><Plus style={{ width: 14, height: 14 }} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PRD Input */}
            <div className="section">
                <h2 className="section-title">
                    <FileText />
                    PRD Content
                </h2>
                <div className="glass-card-static" style={{ padding: '1.5rem' }}>
                    <FileUploadTextarea
                        value={prdContent}
                        onChange={setPrdContent}
                        label="Product Requirements Document"
                        placeholder="Paste your PRD here or upload a .md / .txt file..."
                        id="prd-input"
                    />
                </div>
            </div>

            {/* Artifact Types */}
            <div className="section">
                <div className="flex-between mb-md">
                    <h2 className="section-title" style={{ marginBottom: 0 }}>
                        <Zap />
                        Artifact Types
                    </h2>
                    <button
                        onClick={selectAll}
                        className="btn btn-ghost btn-sm"
                        aria-label={selected.size === ARTIFACT_TYPES.length ? 'Deselect all artifact types' : 'Select all artifact types'}
                    >
                        {selected.size === ARTIFACT_TYPES.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div className="grid-auto">
                    {ARTIFACT_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selected.has(type.id);
                        return (
                            <button
                                key={type.id}
                                onClick={() => toggleType(type.id)}
                                className={`artifact-select-card ${isSelected ? 'selected' : ''}`}
                                role="checkbox"
                                aria-checked={isSelected}
                                aria-label={`${type.label}: ${type.desc}`}
                            >
                                <div className="card-icon">
                                    <Icon />
                                </div>
                                <span className="card-title">{type.label}</span>
                                <span className="card-desc">{type.desc}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Generate Button */}
            <div className="flex-gap mb-lg">
                <button
                    onClick={handleGenerate}
                    disabled={status === 'generating' || !canGenerate}
                    className="btn btn-primary"
                    aria-label="Generate selected artifacts"
                >
                    {status === 'generating' ? (
                        <>
                            <Loader className="spinner" style={{ border: 'none', animation: 'spin 0.6s linear infinite' }} />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles />
                            Generate
                        </>
                    )}
                </button>

                {selected.size > 0 && (
                    <span className="selection-info">
                        {selected.size} artifact{selected.size !== 1 ? 's' : ''} selected
                    </span>
                )}
            </div>

            {/* Error */}
            {status === 'error' && (
                <div className="alert alert-error mb-md">
                    <AlertCircle />
                    {error}
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="section">
                    <div className="flex-between mb-md">
                        <h2 className="section-title" style={{ marginBottom: 0 }}>
                            <CheckCircle />
                            Results
                        </h2>
                        <Link href="/artifacts" className="btn btn-ghost btn-sm">
                            View All Artifacts →
                        </Link>
                    </div>
                    <div className="flex-col gap-sm">
                        {result.artifacts.map((a, i) => {
                            const isExpanded = expandedArtifacts.has(a.type);
                            return (
                                <div key={i} className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
                                    <button
                                        onClick={() => {
                                            setExpandedArtifacts(prev => {
                                                const next = new Set(prev);
                                                if (next.has(a.type)) next.delete(a.type);
                                                else next.add(a.type);
                                                return next;
                                            });
                                        }}
                                        className={`result-row ${a.status === 'success' ? 'success' : 'error'}`}
                                        style={{ width: '100%', cursor: 'pointer', padding: '1rem 1.5rem', border: 'none', background: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <span className="result-label">
                                            {a.status === 'success' ? <CheckCircle /> : <XCircle />}
                                            {a.type}
                                        </span>
                                        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                                            {a.content ? (isExpanded ? '▼ Collapse' : '▶ Expand') : ''}
                                        </span>
                                    </button>
                                    {a.error && (
                                        <div style={{ padding: '0 1.5rem 1rem', fontSize: '1rem', color: 'var(--error)' }}>{a.error}</div>
                                    )}
                                    {isExpanded && a.content && (
                                        <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--border)' }}>
                                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9375rem', lineHeight: 1.6, maxHeight: '500px', overflow: 'auto', margin: '1rem 0 0' }}>{a.content}</pre>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
