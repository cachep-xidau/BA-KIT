'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Zap,
    Search,
    Lightbulb,
    TrendingUp,
    Building2,
    Wrench,
    Briefcase,
    FilePlus,
    FileEdit,
    Layers,
    Grid3x3,
    BarChart3,
    Users,
    ListChecks,
    Download,
    ShieldCheck,
    Bot,
    MessageSquareText,
    Cpu,
    Play,
    MessageCircle,
    X,
    Workflow,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Map icon names from DB to components
const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
    Lightbulb, TrendingUp, Building2, Wrench, Briefcase,
    FilePlus, FileEdit, Layers, Grid3x3, BarChart3,
    Users, ListChecks, Download, ShieldCheck, Bot,
    MessageSquareText, Cpu, Zap,
};

interface Skill {
    id: string;
    name: string;
    description: string;
    type: 'skill' | 'workflow' | 'agent';
    category: string;
    icon: string;
    triggerType: 'navigate' | 'modal' | 'chat';
    triggerConfig: string;
    enabled: boolean;
    builtIn: boolean;
}

interface Project {
    id: string;
    name: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ size?: number }> }> = {
    skill: { label: 'Skill', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: Wrench },
    workflow: { label: 'Workflow', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Workflow },
    agent: { label: 'Agent', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: Bot },
};

const CATEGORY_TABS = [
    { key: 'all', label: 'All' },
];

export default function SkillsPage() {
    const router = useRouter();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeType, setActiveType] = useState('all');

    // Project picker
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerSkill, setPickerSkill] = useState<Skill | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoaded, setProjectsLoaded] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/api/skills`)
            .then(r => r.json())
            .then(data => {
                if (data.success) setSkills(data.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const loadProjects = async () => {
        if (projectsLoaded) return;
        try {
            const r = await fetch(`${API_URL}/api/projects`);
            const data = await r.json();
            if (data.success) {
                setProjects(data.data);
                setProjectsLoaded(true);
            }
        } catch { }
    };

    const handleRun = async (skill: Skill) => {
        if (skill.triggerType === 'navigate') {
            await loadProjects();
            setPickerSkill(skill);
            setPickerOpen(true);
        } else if (skill.triggerType === 'chat') {
            await loadProjects();
            setPickerSkill(skill);
            setPickerOpen(true);
        } else if (skill.triggerType === 'modal') {
            await loadProjects();
            setPickerSkill(skill);
            setPickerOpen(true);
        }
    };

    const handleProjectSelect = (projectId: string) => {
        if (!pickerSkill) return;
        const config = JSON.parse(pickerSkill.triggerConfig || '{}');

        if (pickerSkill.triggerType === 'navigate') {
            const params = new URLSearchParams();
            if (config.tab) params.set('tab', config.tab);
            if (config.type) params.set('type', config.type);
            if (config.action) params.set('action', config.action);
            router.push(`/projects/${projectId}${params.toString() ? '?' + params.toString() : ''}`);
        } else {
            // For modal/chat — navigate with skill context
            router.push(`/projects/${projectId}?skill=${pickerSkill.id}`);
        }

        setPickerOpen(false);
        setPickerSkill(null);
    };

    // Filter skills
    const filtered = skills.filter(s => {
        if (activeType !== 'all' && s.type !== activeType) return false;
        if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const runLabel = (type: string) => {
        switch (type) {
            case 'agent': return 'Chat';
            case 'workflow': return 'Start';
            default: return 'Run';
        }
    };

    return (
        <div className="overflow-auto h-full" style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Zap size={24} style={{ color: 'var(--primary)' }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Skills Library</h1>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', background: 'var(--bg-input)', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                        {filtered.length !== skills.length ? `${filtered.length}/${skills.length}` : skills.length}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.4rem 0.75rem', width: '16rem' }}>
                    <Search size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search skills..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8125rem', width: '100%' }}
                    />
                </div>
            </div>

            {/* Type filter tabs — matching project page tab bar style */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                {[{ key: 'all', label: 'All', icon: Zap }, { key: 'skill', label: 'Skills', icon: Wrench }, { key: 'workflow', label: 'Workflows', icon: Workflow }, { key: 'agent', label: 'Agents', icon: Bot }].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveType(tab.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.6rem 1rem',
                            fontSize: '0.9375rem',
                            fontWeight: activeType === tab.key ? 700 : 500,
                            color: 'var(--text-primary)',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeType === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap',
                            opacity: activeType === tab.key ? 1 : 0.6,
                        }}
                        onMouseEnter={e => { if (activeType !== tab.key) e.currentTarget.style.opacity = '0.85'; }}
                        onMouseLeave={e => { if (activeType !== tab.key) e.currentTarget.style.opacity = '0.6'; }}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Skills Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{
                            height: '12rem', borderRadius: '0.75rem',
                            border: '1px solid var(--border)',
                            background: 'linear-gradient(110deg, var(--bg-input) 30%, var(--bg-card) 50%, var(--bg-input) 70%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s ease-in-out infinite',
                        }} />
                    ))}
                    <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '4rem 2rem', color: 'var(--text-dim)' }}>
                    <Search size={32} style={{ opacity: 0.4 }} />
                    <span style={{ fontSize: '0.9375rem' }}>No skills match your filters</span>
                    <button
                        onClick={() => { setSearch(''); setActiveType('all'); }}
                        style={{ fontSize: '0.8125rem', color: 'var(--primary)', background: 'none', border: '1px solid var(--primary)', borderRadius: '0.375rem', padding: '0.35rem 0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--primary)'; }}
                    >Clear Filters</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                    {filtered.map(skill => {
                        const IconComp = ICON_MAP[skill.icon] || Zap;
                        const typeMeta = TYPE_LABELS[skill.type] || TYPE_LABELS.skill;

                        return (
                            <div
                                key={skill.id}
                                className="app-card clickable"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleRun(skill)}
                            >
                                {/* Icon + Name (Repo card-header style) */}
                                <div className="card-header">
                                    <div
                                        className="card-icon"
                                        style={{
                                            background: `${typeMeta.color}20`,
                                            border: `1px solid ${typeMeta.color}30`,
                                        }}
                                    >
                                        <IconComp size={18} style={{ color: typeMeta.color }} />
                                    </div>
                                    <div>
                                        <h4 className="card-title">{skill.name}</h4>
                                        <p className="card-subtitle">
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                                fontSize: '0.6875rem', fontWeight: 600,
                                                color: typeMeta.color,
                                            }}>
                                                <typeMeta.icon size={11} />
                                                {typeMeta.label}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Description (Repo card-body style) */}
                                <div className="card-body">
                                    <p style={{
                                        fontSize: '0.8125rem', color: 'var(--text-secondary)',
                                        margin: 0, lineHeight: 1.4,
                                        display: '-webkit-box', WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                                    }}>
                                        {skill.description}
                                    </p>
                                </div>

                                {/* Run button (Repo card-footer style) */}
                                <div className="card-footer">
                                    <button
                                        className="glass-button"
                                        style={{ width: '100%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRun(skill);
                                        }}
                                    >
                                        {skill.type === 'agent' ? <MessageCircle size={14} /> : <Play size={14} />}
                                        {runLabel(skill.type)}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Project Picker Modal */}
            {pickerOpen && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    }}
                    onClick={() => { setPickerOpen(false); setPickerSkill(null); }}
                >
                    <div
                        className="glass-panel"
                        style={{
                            width: '24rem', maxHeight: '28rem', borderRadius: '1rem',
                            border: '1px solid var(--border)', overflow: 'hidden',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
                        }}>
                            <div>
                                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Select Project</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '0.25rem 0 0' }}>
                                    {pickerSkill?.name}
                                </p>
                            </div>
                            <button
                                onClick={() => { setPickerOpen(false); setPickerSkill(null); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0.25rem' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Project list */}
                        <div style={{ padding: '0.5rem', maxHeight: '20rem', overflowY: 'auto' }}>
                            {projects.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
                                    No projects found
                                </div>
                            ) : (
                                projects.map(p => (
                                    <button
                                        key={p.id}
                                        className="clickable"
                                        onClick={() => handleProjectSelect(p.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem',
                                            border: 'none', background: 'transparent',
                                            color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500,
                                            cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{
                                            width: '2rem', height: '2rem', borderRadius: '0.5rem',
                                            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                                        }}>
                                            {p.name.charAt(0).toUpperCase()}
                                        </div>
                                        {p.name}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
