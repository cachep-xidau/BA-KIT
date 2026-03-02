'use client';

import FileUploadTextarea from '../../components/FileUploadTextarea';
import ConnectionsContent from '../../connections/ConnectionsContent';
import AnalysisSlider from '../../components/AnalysisSlider';
import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import plantumlEncoder from 'plantuml-encoder';
import {
    FolderOpen,
    FileText,
    Link2,
    ClipboardList,
    Settings2,
    FileCode,
    Database,
    Code,
    GitBranch,
    ArrowRightLeft,
    Users,
    Activity,
    Edit3,
    Trash2,
    Upload,
    ChevronDown,
    ChevronRight,
    Sparkles,
    ExternalLink,
    Clock,
    X,
    Check,
    Loader,
    Send,
    MessageSquare,
    Bot,
    User,
    CheckCircle2,
    ArrowRight,
    FileOutput,
    ShieldCheck,
    AlertTriangle,
    AlertCircle,
    Lightbulb,
    TrendingUp,
    Building2,
    Wrench,
    Briefcase,
    BarChart3,
    Eye,
    Save,
    Pencil,
    Layers,
    Monitor,
    Palette,
    Plus,
    Download,
    BookOpen,
    Zap,
    Copy,
} from 'lucide-react';

/** Enhanced markdown renderer — headings, bold, italic, code, lists, hr */
function renderMarkdown(text: string) {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let listType: 'ol' | 'ul' | null = null;

    const flushList = () => {
        if (listItems.length > 0 && listType) {
            const Tag = listType;
            elements.push(<Tag key={`list-${elements.length}`} className="prd-md-list">{listItems}</Tag>);
            listItems = [];
            listType = null;
        }
    };

    const inlineFormat = (str: string, lineKey: number) => {
        // Bold, italic, code inline formatting
        const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={`${lineKey}-${i}`}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                return <em key={`${lineKey}-${i}`}>{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={`${lineKey}-${i}`} className="prd-md-code">{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trimStart();

        // Headings
        const h3Match = trimmed.match(/^###\s+(.*)/);
        const h2Match = trimmed.match(/^##\s+(.*)/);
        const h1Match = trimmed.match(/^#\s+(.*)/);
        // Horizontal rule
        if (/^[-*_]{3,}\s*$/.test(trimmed)) {
            flushList();
            elements.push(<hr key={`hr-${idx}`} className="prd-md-hr" />);
            return;
        }
        if (h3Match) {
            flushList();
            elements.push(<h3 key={`h3-${idx}`} className="prd-md-h3">{inlineFormat(h3Match[1], idx)}</h3>);
            return;
        }
        if (h2Match) {
            flushList();
            elements.push(<h2 key={`h2-${idx}`} className="prd-md-h2">{inlineFormat(h2Match[1], idx)}</h2>);
            return;
        }
        if (h1Match) {
            flushList();
            elements.push(<h1 key={`h1-${idx}`} className="prd-md-h1">{inlineFormat(h1Match[1], idx)}</h1>);
            return;
        }

        // Ordered list: 1. / 2. etc
        const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        // Unordered list: - item
        const ulMatch = trimmed.match(/^[-*]\s+(.*)/);

        if (olMatch) {
            if (listType !== 'ol') { flushList(); listType = 'ol'; }
            listItems.push(<li key={`li-${idx}`}>{inlineFormat(olMatch[2], idx)}</li>);
        } else if (ulMatch) {
            if (listType !== 'ul') { flushList(); listType = 'ul'; }
            listItems.push(<li key={`li-${idx}`}>{inlineFormat(ulMatch[1], idx)}</li>);
        } else {
            flushList();
            if (trimmed === '') {
                elements.push(<div key={`br-${idx}`} className="prd-md-break" />);
            } else {
                elements.push(<p key={`p-${idx}`} className="prd-md-para">{inlineFormat(trimmed, idx)}</p>);
            }
        }
    });
    flushList();
    return <>{elements}</>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const ARTIFACT_ICONS: Record<string, typeof FileText> = {
    'user-story': ClipboardList,
    'function-list': Settings2,
    'srs': FileCode,
    'erd': Database,
    'sql': Code,
    'flowchart': GitBranch,
    'sequence-diagram': ArrowRightLeft,
    'use-case-diagram': Users,
    'activity-diagram': Activity,
    'screen-description': Monitor,
};

const ARTIFACT_LABELS: Record<string, string> = {
    'user-story': 'User Stories',
    'function-list': 'Function List',
    'srs': 'SRS',
    'erd': 'ERD',
    'sql': 'SQL',
    'flowchart': 'Flowchart',
    'sequence-diagram': 'Sequence Diagram',
    'use-case-diagram': 'Use Case Diagram',
    'activity-diagram': 'Activity Diagram',
    'screen-description': 'Screen Description',
};

const GENERATE_ARTIFACT_TYPES = [
    { value: 'user-story', label: 'User Stories' },
    { value: 'function-list', label: 'Function List' },
    { value: 'srs', label: 'SRS' },
    { value: 'erd', label: 'ERD (DBML)' },
    { value: 'screen-description', label: 'Screen Description' },
    { value: 'use-case-diagram', label: 'Use Case Diagram' },
    { value: 'sequence-diagram', label: 'Sequence Diagram' },
    { value: 'flowchart', label: 'Flowchart' },
    { value: 'sql', label: 'SQL' },
    { value: 'activity-diagram', label: 'Activity Diagram' },
];

// BSA Standard User Story Sections
const STORY_SECTIONS = [
    'User Story Description',
    'Reference',
    'Pre-condition',
    'Business Rules',
    'Acceptance Criteria',
    'Exception Handling',
];

const STORY_TEMPLATE = STORY_SECTIONS.map(s => {
    const placeholders: Record<string, string> = {
        'User Story Description': 'As a [role], I want [action], so that [benefit].',
        'Reference': 'REF-001: ...',
        'Pre-condition': '- User must be logged in\n- ...',
        'Business Rules': '- BR-001: ...',
        'Acceptance Criteria': '- **Given** [precondition] **When** [action] **Then** [expected outcome]',
        'Exception Handling': '- If [error condition], then [expected behavior]',
    };
    return `## ${s}\n${placeholders[s] || '...'}\n`;
}).join('\n');

function parseStorySections(content: string): { title: string; body: string }[] {
    if (!content || !content.includes('## ')) {
        return [{ title: 'Content', body: content || '' }];
    }
    const sections: { title: string; body: string }[] = [];
    const parts = content.split(/^## /m).filter(Boolean);
    for (const part of parts) {
        const newlineIdx = part.indexOf('\n');
        if (newlineIdx === -1) {
            sections.push({ title: part.trim(), body: '' });
        } else {
            sections.push({
                title: part.slice(0, newlineIdx).trim(),
                body: part.slice(newlineIdx + 1).trim(),
            });
        }
    }
    return sections;
}

function normalizeUploadedStoryContent(raw: string): string {
    // Detect common section headers and normalize to ## format
    const headerAliases: Record<string, string[]> = {
        'User Story Description': ['user story description', 'description', 'story description', 'user story', 'mô tả'],
        'Reference': ['reference', 'references', 'ref', 'tài liệu tham chiếu'],
        'Pre-condition': ['pre-condition', 'precondition', 'pre condition', 'prerequisites', 'điều kiện tiên quyết'],
        'Business Rules': ['business rules', 'business rule', 'quy tắc nghiệp vụ'],
        'Acceptance Criteria': ['acceptance criteria', 'acceptance criterion', 'ac', 'tiêu chí chấp nhận'],
        'Exception Handling': ['exception handling', 'exceptions', 'error handling', 'xử lý ngoại lệ'],
    };
    let normalized = raw;
    for (const [standard, aliases] of Object.entries(headerAliases)) {
        for (const alias of aliases) {
            // Match ## alias or # alias (case-insensitive)
            const regex = new RegExp(`^#{1,3}\\s*${alias.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\s*$`, 'gmi');
            normalized = normalized.replace(regex, `## ${standard}`);
        }
    }
    // If no ## headers found after normalization, wrap in User Story Description
    if (!normalized.includes('## ')) {
        normalized = `## User Story Description\n${normalized}`;
    }
    return normalized;
}

interface Artifact {
    id: string;
    type: string;
    title: string;
    content: string;
    version: number;
    status: string;
    createdAt: string;
    storyArtifacts?: StoryArtifactItem[];
}

interface StoryArtifactItem {
    id: string;
    type: string;
    title: string;
    version: number;
    status: string;
    createdAt: string;
}

interface EpicItem {
    id: string;
    type: string;
    title: string;
    content: string;
    status: string;
    createdAt: string;
    stories: Artifact[];
}

interface FunctionItem {
    id: string;
    name: string;
    artifacts: Artifact[];
    _count?: { artifacts: number };
}

interface Feature {
    id: string;
    name: string;
    functions: FunctionItem[];
}

interface ProjectConnection {
    id: string;
    name: string;
    type: string;
    status: string;
    createdAt: string;
}

interface Project {
    id: string;
    name: string;
    description: string | null;
    prdContent: string | null;
    createdAt: string;
    updatedAt: string;
    features: Feature[];
    connections: ProjectConnection[];
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface StepInfo {
    step: number;
    name: string;
}

interface ChatAction {
    type: 'button' | 'multi';
    label: string;
    value: string;
}

interface AnalysisDoc {
    id: string;
    type: string;
    title: string;
    content?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

type AnalysisType = 'brainstorm' | 'market-research' | 'domain-research' | 'technical-research' | 'product-brief';

const ANALYSIS_CARDS: { type: AnalysisType; name: string; icon: typeof Lightbulb; desc: string }[] = [
    { type: 'brainstorm', name: 'Brainstorming', icon: Lightbulb, desc: 'Generate & organize ideas' },
    { type: 'market-research', name: 'Market Research', icon: TrendingUp, desc: 'Market size, competition' },
    { type: 'domain-research', name: 'Domain Research', icon: Building2, desc: 'Industry deep-dive' },
    { type: 'technical-research', name: 'Technical Research', icon: Wrench, desc: 'Architecture & tech stack' },
    { type: 'product-brief', name: 'Product Brief', icon: Briefcase, desc: 'Vision, users, features' },
];

type GuideKey = 'prd' | 'generate' | 'connect' | 'chat' | 'validate' | 'skills';

const GUIDE_CONTENT: Record<GuideKey, { title: string; icon: typeof FileText; intro: string; steps: { emoji: string; heading: string; body: string }[]; tip?: string; ctaLabel: string; ctaTab?: 'prd' | 'artifacts' | 'settings' | 'analysis'; ctaHref?: string }> = {
    prd: {
        title: 'Paste PRD đầu tiên',
        icon: FileText,
        intro: 'PRD (Product Requirements Document) là tài liệu mô tả yêu cầu sản phẩm. BSA Kit sử dụng PRD làm nguồn đầu vào để sinh ra các artifacts chất lượng.',
        steps: [
            { emoji: '📋', heading: 'Chuẩn bị PRD', body: 'Copy nội dung PRD từ Google Docs, Confluence, Notion hoặc bất kỳ nguồn nào. Hỗ trợ plain text và Markdown.' },
            { emoji: '📝', heading: 'Paste vào Editor', body: 'Chuyển sang tab PRD và dán nội dung vào ô soạn thảo. Không cần format đặc biệt — AI sẽ tự hiểu.' },
            { emoji: '✅', heading: 'Lưu và kiểm tra', body: 'Nhấn Save để lưu PRD. Hệ thống sẽ hiển thị trạng thái "Ready" trên Overview.' },
        ],
        tip: 'Sử dụng Markdown (## headings, - bullet points) để AI phân tích chính xác hơn.',
        ctaLabel: 'Mở PRD Editor →',
        ctaTab: 'prd',
    },
    generate: {
        title: 'Generate Artifacts',
        icon: Sparkles,
        intro: 'Từ PRD, BSA Kit sinh ra 5 loại tài liệu kỹ thuật: User Stories, Function List, SRS, ERD (DBML) và SQL Scripts.',
        steps: [
            { emoji: '🎯', heading: 'Chọn loại Artifact', body: 'Chọn 1 hoặc nhiều loại: User Stories, Function List, SRS, ERD, SQL. Mỗi loại phục vụ mục đích khác nhau.' },
            { emoji: '⚡', heading: 'Single vs Batch', body: 'Single: tạo từng loại (8 credits). Batch: tạo 5 loại cùng lúc (30 credits). Free tier được 1 lần batch trial miễn phí!' },
            { emoji: '🔍', heading: 'Review kết quả', body: 'Xem artifacts đã sinh ở tab Artifacts. Mỗi artifact có YAML traceability header và version tracking.' },
            { emoji: '🔄', heading: 'Re-generate', body: 'Chưa hài lòng? Nhấn Re-generate để tạo phiên bản mới. Hệ thống tự động tăng version.' },
        ],
        ctaLabel: 'Bắt đầu tạo Artifacts →',
        ctaTab: 'artifacts',
    },
    connect: {
        title: 'Kết nối Figma / Confluence',
        icon: Link2,
        intro: 'MCP (Model Context Protocol) cho phép BSA Kit kết nối trực tiếp với Figma và Confluence để lấy design và docs context.',
        steps: [
            { emoji: '🔑', heading: 'Lấy Figma Access Token', body: 'Vào Figma → Account Settings → Personal Access Tokens → Generate new token. Copy và lưu lại.' },
            { emoji: '📚', heading: 'Lấy Confluence API Key', body: 'Vào Atlassian → API tokens → Create API token. Cần cả email và base URL của Confluence space.' },
            { emoji: '🔗', heading: 'Kết nối trong BSA Kit', body: 'Vào tab Project Settings → nhập credentials → Connect. Hệ thống tự discover available tools.' },
            { emoji: '✅', heading: 'Xác minh kết nối', body: 'Sau khi connect thành công, trạng thái hiển "Connected". Thử call một MCP tool để verify.' },
        ],
        tip: 'Credentials được mã hóa AES-256-GCM. An toàn tuyệt đối.',
        ctaLabel: 'Mở Connections →',
        ctaTab: 'settings',
    },
    chat: {
        title: 'Chat với AI về PRD',
        icon: MessageSquare,
        intro: 'Hỏi AI về PRD để phát hiện thiếu sót, edge cases, mâu thuẫn logic và nhận gợi ý cải thiện.',
        steps: [
            { emoji: '💬', heading: 'Mở PRD Chat', body: 'Chuyển sang tab Analysis. Hệ thống sẽ load nội dung PRD làm context cho AI.' },
            { emoji: '❓', heading: 'Hỏi câu hỏi', body: 'Ví dụ: "Có edge cases nào thiếu không?", "Logic thanh toán có mâu thuẫn gì?", "Gợi ý cải thiện acceptance criteria".' },
            { emoji: '💡', heading: 'Nhận gợi ý', body: 'AI phân tích và trả lời có cấu trúc, reference cụ thể tới từng section của PRD.' },
        ],
        tip: 'Chat không tốn credits! Free: 10 msg/ngày, Pro: 50 msg/ngày, Team: unlimited.',
        ctaLabel: 'Bắt đầu Chat →',
        ctaTab: 'analysis',
    },
    validate: {
        title: 'Validate chất lượng PRD',
        icon: ShieldCheck,
        intro: 'AI đánh giá chất lượng PRD theo 3 tiêu chí: Completeness, Clarity và Consistency.',
        steps: [
            { emoji: '📊', heading: 'Quality Score', body: 'AI chấm điểm PRD từ 0-100. Trên 70 là tốt, trên 85 là xuất sắc.' },
            { emoji: '⚠️', heading: 'Phân loại issues', body: 'Vấn đề được nhóm theo mức độ: Critical (phải sửa), Warning (nên sửa), Info (tùy chọn).' },
            { emoji: '🛠️', heading: 'Gợi ý cải thiện', body: 'Mỗi issue kèm gợi ý cụ thể cách sửa. Sửa xong → re-validate để kiểm tra lại.' },
        ],
        tip: 'Validate tốn 5 credits. Khuyến khích validate trước khi generate artifacts.',
        ctaLabel: 'Validate PRD ngay →',
        ctaTab: 'analysis',
    },
    skills: {
        title: 'Khám phá Skills Library',
        icon: Zap,
        intro: 'BSA Kit có 17 skills, workflows và agents sẵn sàng hỗ trợ mọi quy trình phân tích.',
        steps: [
            { emoji: '⚙️', heading: '3 loại công cụ', body: 'Skills (chạy nhanh), Workflows (nhiều bước), Agents (chat chuyên sâu). Mỗi loại có trigger khác nhau.' },
            { emoji: '🎨', heading: '4 categories', body: 'Analysis (phân tích), PRD (tài liệu), Utility (công cụ), Advisor (tư vấn). Lọc theo nhu cầu.' },
            { emoji: '🚀', heading: 'Sử dụng', body: 'Click vào skill → chọn project → chạy. Kết quả lưu vào project tương ứng.' },
        ],
        tip: 'Free tier được 3 basic skills. Upgrade Pro để dùng tất cả 17 skills.',
        ctaLabel: 'Khám phá Skills →',
        ctaHref: '/skills',
    },
};

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Tab navigation state (GitHub-style)
    const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'prd' | 'artifacts' | 'settings'>('overview');
    const [selectedGuide, setSelectedGuide] = useState<GuideKey | null>(null);

    // Close guide slider on Escape key
    useEffect(() => {
        if (!selectedGuide) return;
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedGuide(null); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [selectedGuide]);

    // Section collapse states (kept for backward compat)
    const [prdExpanded, setPrdExpanded] = useState(true);
    const [artifactsExpanded, setArtifactsExpanded] = useState(true);
    const [connectionsExpanded, setConnectionsExpanded] = useState(true);

    // Artifact Chat state (Epics & Stories)
    const [artifactChatOpen, setArtifactChatOpen] = useState(false);
    const [artifactChatMessages, setArtifactChatMessages] = useState<ChatMessage[]>([]);
    const [artifactChatInput, setArtifactChatInput] = useState('');
    const [artifactChatLoading, setArtifactChatLoading] = useState(false);
    const [artifactChatStep, setArtifactChatStep] = useState(0);
    const [artifactChatSteps, setArtifactChatSteps] = useState<StepInfo[]>([]);
    const [artifactChatFinalized, setArtifactChatFinalized] = useState(false);
    const [artifactPrdSources, setArtifactPrdSources] = useState<{ id: string; title: string; preview: string; source: string; status: string; wordCount: number }[]>([]);
    const [artifactSelectedPrd, setArtifactSelectedPrd] = useState<string | null>(null);
    const [artifactChatActions, setArtifactChatActions] = useState<ChatAction[]>([]);
    const [artifactMultiSelected, setArtifactMultiSelected] = useState<Set<string>>(new Set());
    const artifactChatEndRef = useRef<HTMLDivElement>(null);
    const artifactChatInputRef = useRef<HTMLTextAreaElement>(null);

    // Epics state (project-level)
    const [epics, setEpics] = useState<EpicItem[]>([]);
    const [epicsFetched, setEpicsFetched] = useState(false);
    const [editingArtifactId, setEditingArtifactId] = useState<string | null>(null);
    const [editingArtifactTitle, setEditingArtifactTitle] = useState('');
    const [editingArtifactContent, setEditingArtifactContent] = useState('');
    const [addingStoryToEpic, setAddingStoryToEpic] = useState<string | null>(null);
    const [newStoryTitle, setNewStoryTitle] = useState('');
    const [newStoryContent, setNewStoryContent] = useState('');

    // Story Draft Side Panel state (Jira-style)
    const [storyDraft, setStoryDraft] = useState<{ epicId: string; title: string; content: string } | null>(null);
    const [storyDraftSaving, setStoryDraftSaving] = useState(false);
    const [storyDraftMode, setStoryDraftMode] = useState<'editor' | 'upload'>('editor');
    const storyDraftFileInputRef = useRef<HTMLInputElement>(null);

    // Story expand state
    const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
    const [storyViewMode, setStoryViewMode] = useState<'inline' | 'drawer'>('inline');
    const [storyArtifacts, setStoryArtifacts] = useState<StoryArtifactItem[]>([]);
    const [storyArtifactsLoading, setStoryArtifactsLoading] = useState(false);
    const [storyDrawerOpen, setStoryDrawerOpen] = useState(false);
    const [drawerStory, setDrawerStory] = useState<Artifact | null>(null);
    const [drawerWidth, setDrawerWidth] = useState(1000);
    const isResizingDrawer = useRef(false);
    const [drawerViewMode, setDrawerViewMode] = useState<'bricks' | 'raw' | 'preview'>('bricks');
    const [drawerCopied, setDrawerCopied] = useState(false);

    // Artifact Viewer Drawer states
    const [artViewerOpen, setArtViewerOpen] = useState(false);
    const [artViewerData, setArtViewerData] = useState<{ id: string; type: string; title: string; content: string; version: number } | null>(null);
    const [artViewerMode, setArtViewerMode] = useState<'bricks' | 'raw' | 'preview'>('preview');
    const [artViewerLoading, setArtViewerLoading] = useState(false);
    const [artViewerCopied, setArtViewerCopied] = useState(false);
    const [artRawEditing, setArtRawEditing] = useState(false);
    const [artRawContent, setArtRawContent] = useState('');
    const [artSaving, setArtSaving] = useState(false);
    const [expandedArtifactStoryId, setExpandedArtifactStoryId] = useState<string | null>(null);

    // Open artifact viewer: fetch full content from API
    const openArtifactViewer = useCallback(async (artifactId: string) => {
        setArtViewerOpen(true);
        setArtViewerLoading(true);
        setArtViewerMode('preview');
        setArtRawEditing(false);
        try {
            const res = await fetch(`${API_URL}/api/generate/artifact/${artifactId}`);
            const data = await res.json();
            if (data.success) {
                setArtViewerData(data.data);
            }
        } catch { /* ignore */ }
        setArtViewerLoading(false);
    }, []);

    // Drawer inline editing states
    const [editingBlockIdx, setEditingBlockIdx] = useState<number | null>(null);
    const [editBlockBody, setEditBlockBody] = useState('');
    const [editBlockTitle, setEditBlockTitle] = useState('');
    const [rawEditing, setRawEditing] = useState(false);
    const [rawEditContent, setRawEditContent] = useState('');
    const [addingSectionTitle, setAddingSectionTitle] = useState('');
    const [addingSectionBody, setAddingSectionBody] = useState('');
    const [showAddSection, setShowAddSection] = useState(false);
    const [drawerSaving, setDrawerSaving] = useState(false);

    // Save drawer content (reconstructed from sections or raw)
    const saveDrawerContent = async (newContent: string) => {
        if (!drawerStory) return;
        setDrawerSaving(true);
        try {
            await fetch(`${API_URL}/api/artifact-chat/story/${drawerStory.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: drawerStory.title, content: newContent }),
            });
            setDrawerStory({ ...drawerStory, content: newContent });
            fetchEpics();
        } finally {
            setDrawerSaving(false);
        }
    };

    // Save a single block edit in Block Bricks mode
    const saveBrickBlock = async (idx: number, newTitle: string, newBody: string) => {
        if (!drawerStory) return;
        const sections = parseStorySections(drawerStory.content || '');
        sections[idx] = { title: newTitle, body: newBody };
        const rebuilt = sections.map(s => `## ${s.title}\n${s.body}`).join('\n\n');
        await saveDrawerContent(rebuilt);
        setEditingBlockIdx(null);
    };

    // Add new section
    const addNewSection = async () => {
        if (!drawerStory || !addingSectionTitle.trim()) return;
        const existing = drawerStory.content || '';
        const newSection = `\n\n## ${addingSectionTitle.trim()}\n${addingSectionBody.trim()}`;
        await saveDrawerContent(existing + newSection);
        setShowAddSection(false);
        setAddingSectionTitle('');
        setAddingSectionBody('');
    };

    // Save raw edit
    const saveRawEdit = async () => {
        await saveDrawerContent(rawEditContent);
        setRawEditing(false);
    };

    // Generate Artifact modal state
    const [generateModalOpen, setGenerateModalOpen] = useState(false);
    const [genSelectedEpic, setGenSelectedEpic] = useState('');
    const [genSelectedStory, setGenSelectedStory] = useState('');
    const [genSelectedTypes, setGenSelectedTypes] = useState<string[]>([]);
    const [genLoading, setGenLoading] = useState(false);
    const [genBatchResults, setGenBatchResults] = useState<{ success: boolean; type: string; content?: string; error?: string }[]>([]);
    const [genActiveTab, setGenActiveTab] = useState(0);
    const [genSaving, setGenSaving] = useState(false);
    const [genContextName, setGenContextName] = useState('');
    const [genConfluenceUrl, setGenConfluenceUrl] = useState('');
    const [genFigmaUrls, setGenFigmaUrls] = useState<{ url: string; description: string }[]>([{ url: '', description: '' }]);

    // Add Epic slider state
    const [addEpicSliderOpen, setAddEpicSliderOpen] = useState(false);
    const [addEpicMode, setAddEpicMode] = useState<'manual' | 'upload'>('manual');
    const [manualEpicTitle, setManualEpicTitle] = useState('');
    const [manualEpicContent, setManualEpicContent] = useState('');
    const [manualStories, setManualStories] = useState<{ title: string; content: string }[]>([]);
    const [addEpicSaving, setAddEpicSaving] = useState(false);
    const [uploadFileName, setUploadFileName] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [uploadParsedEpics, setUploadParsedEpics] = useState<{ title: string; content: string; stories: { title: string; content: string }[] }[]>([]);
    const [uploadImporting, setUploadImporting] = useState(false);
    const epicFileInputRef = useRef<HTMLInputElement>(null);

    // Edit states
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [saving, setSaving] = useState(false);

    // Delete state
    const [confirmDelete, setConfirmDelete] = useState(false);

    // PRD edit
    const [editingPrd, setEditingPrd] = useState(false);
    const [prdDraft, setPrdDraft] = useState('');
    const [savingPrd, setSavingPrd] = useState(false);
    const prdFileInputRef = useRef<HTMLInputElement>(null);
    // PRD Preview Panel
    const [prdPreviewOpen, setPrdPreviewOpen] = useState(false);
    const [prdPreviewEditing, setPrdPreviewEditing] = useState(false);

    // PRD standalone file upload handler
    const handlePrdFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!['.txt', '.md', '.markdown'].includes(ext)) return;
        if (file.size > 10 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            setPrdDraft(text);
            setPrdPreviewEditing(true);
            setPrdPreviewOpen(true);
        };
        reader.readAsText(file, 'utf-8');
        if (prdFileInputRef.current) prdFileInputRef.current.value = '';
    }, []);

    // Shared panel width + resize (for all prd-chat-panels)
    const [panelWidth, setPanelWidth] = useState(1000);
    const isResizingPanel = useRef(false);
    const startPanelResize = (e: React.MouseEvent) => {
        e.preventDefault();
        isResizingPanel.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        const onMove = (ev: MouseEvent) => {
            if (!isResizingPanel.current) return;
            const newWidth = Math.max(380, Math.min(window.innerWidth * 0.95, window.innerWidth - ev.clientX));
            setPanelWidth(newWidth);
        };
        const onUp = () => {
            isResizingPanel.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    // PRD Chat state
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatStep, setChatStep] = useState(1);
    const [chatSteps, setChatSteps] = useState<StepInfo[]>([]);
    const [chatFinalized, setChatFinalized] = useState(false);
    const [chatMode, setChatMode] = useState<'create' | 'edit'>('create');
    const [chatActions, setChatActions] = useState<ChatAction[]>([]);
    const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
    const [prdSelectedSources, setPrdSelectedSources] = useState<Set<string>>(new Set());
    const [prdAvailableTypes, setPrdAvailableTypes] = useState<string[]>([]);
    const [savingFinalPrd, setSavingFinalPrd] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLTextAreaElement>(null);

    // PRD Validate state
    const [validateOpen, setValidateOpen] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validateResult, setValidateResult] = useState<{
        overallStatus: string;
        holisticScore: number;
        checks: { name: string; status: string; score?: number; findings: string[]; recommendation: string }[];
        strengths: string[];
        topImprovements: string[];
        summary: string;
    } | null>(null);
    const [validateError, setValidateError] = useState('');

    // PRD Fix state
    const [fixingCheck, setFixingCheck] = useState<string | null>(null); // which check is being fixed
    const [fixingAll, setFixingAll] = useState(false);
    const [fixResult, setFixResult] = useState<{ improvedPrd: string; changesSummary: string } | null>(null);

    // Analysis state
    const [analysisExpanded, setAnalysisExpanded] = useState(true);
    const [analysisDocs, setAnalysisDocs] = useState<AnalysisDoc[]>([]);
    const [analysisDocsFetched, setAnalysisDocsFetched] = useState(false);
    // Analysis slider (replaces old modal)
    const [analysisSliderOpen, setAnalysisSliderOpen] = useState(false);
    const [analysisSliderType, setAnalysisSliderType] = useState<AnalysisType>('brainstorm');
    // Analysis preview
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewDocId, setPreviewDocId] = useState('');
    const [previewEditing, setPreviewEditing] = useState(false);
    const [previewEditContent, setPreviewEditContent] = useState('');
    const [previewSaving, setPreviewSaving] = useState(false);

    const fetchProject = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/projects/${projectId}`);
            const data = await res.json();
            if (data.success) {
                setProject(data.data);
            } else {
                setError('Project not found');
            }
        } catch {
            setError('Failed to load project');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, chatLoading]);


    // Fetch analysis docs when section expands
    const fetchAnalysisDocs = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/analysis/${projectId}`);
            const data = await res.json();
            if (data.success) {
                setAnalysisDocs(data.data);
                setAnalysisDocsFetched(true);
            }
        } catch { /* ignore */ }
    }, [projectId]);

    useEffect(() => {
        if (analysisExpanded && !analysisDocsFetched) fetchAnalysisDocs();
    }, [analysisExpanded, analysisDocsFetched, fetchAnalysisDocs]);

    // Fetch epics when artifacts section expands
    const fetchEpics = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/artifact-chat/epics/${projectId}`);
            const data = await res.json();
            if (data.success) setEpics(data.data || []);
        } catch { /* ignore */ }
        setEpicsFetched(true);
    }, [projectId]);

    useEffect(() => {
        if (artifactsExpanded && !epicsFetched) fetchEpics();
    }, [artifactsExpanded, epicsFetched, fetchEpics]);

    // Initialize artifact chat when opened
    useEffect(() => {
        if (!artifactChatOpen || artifactChatMessages.length > 0) return;
        setArtifactChatLoading(true);
        fetch(`${API_URL}/api/artifact-chat/init/${projectId}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setArtifactChatMessages([{ role: 'assistant', content: data.data.content }]);
                    setArtifactChatSteps(data.data.steps || []);
                    setArtifactPrdSources(data.data.prdSources || []);
                    setArtifactChatStep(data.data.step || 0);
                }
            })
            .catch(() => {
                setArtifactChatMessages([{ role: 'assistant', content: 'Lỗi kết nối.' }]);
            })
            .finally(() => setArtifactChatLoading(false));
    }, [artifactChatOpen]);

    // Fetch story artifacts when a story is expanded
    const fetchStoryArtifacts = useCallback(async (storyId: string) => {
        setStoryArtifactsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/generate/story-artifacts/${storyId}`);
            const data = await res.json();
            if (data.success) setStoryArtifacts(data.data || []);
        } catch { setStoryArtifacts([]); }
        setStoryArtifactsLoading(false);
    }, []);

    const handleStoryExpand = useCallback((story: Artifact) => {
        if (storyViewMode === 'drawer') {
            setDrawerStory(story);
            setStoryDrawerOpen(true);
            fetchStoryArtifacts(story.id);
        } else {
            if (expandedStoryId === story.id) {
                setExpandedStoryId(null);
            } else {
                setExpandedStoryId(story.id);
                fetchStoryArtifacts(story.id);
            }
        }
    }, [storyViewMode, expandedStoryId, fetchStoryArtifacts]);

    const handleGenerateForStory = useCallback((storyId: string) => {
        const parentEpic = epics.find(e => e.stories.some(s => s.id === storyId));
        setGenSelectedEpic(parentEpic?.id || '');
        setGenSelectedStory(storyId);
        setGenSelectedTypes([]);
        setGenerateModalOpen(true);
    }, [epics]);

    // Count artifacts (function-scoped + project-level epics/stories)
    const totalFunctionArtifacts = project?.features.reduce((sum, f) =>
        sum + f.functions.reduce((fSum, fn) =>
            fSum + (fn.artifacts?.length || fn._count?.artifacts || 0), 0), 0) || 0;
    const totalEpics = epics.length;
    const totalStories = epics.reduce((sum, e) => sum + e.stories.length, 0);
    const totalArtifacts = totalFunctionArtifacts + totalEpics + totalStories;

    // CRUD helpers
    const saveArtifactEdit = async (id: string, type: 'epic' | 'story') => {
        const endpoint = type === 'epic' ? 'epic' : 'story';
        await fetch(`${API_URL}/api/artifact-chat/${endpoint}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: editingArtifactTitle, content: editingArtifactContent }),
        });
        setEditingArtifactId(null);
        fetchEpics();
    };

    const [deletePendingId, setDeletePendingId] = useState<string | null>(null);

    const deleteArtifact = async (id: string) => {
        await fetch(`${API_URL}/api/artifact-chat/artifact/${id}`, { method: 'DELETE' });
        setDeletePendingId(null);
        fetchEpics();
    };

    const [isAddingStory, setIsAddingStory] = useState(false);

    const addStoryToEpic = async (epicId: string) => {
        if (!newStoryTitle.trim() || isAddingStory) return;
        setIsAddingStory(true);
        try {
            await fetch(`${API_URL}/api/artifact-chat/story`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ epicId, title: newStoryTitle, content: newStoryContent }),
            });
            setAddingStoryToEpic(null);
            setNewStoryTitle('');
            setNewStoryContent('');
            fetchEpics();
        } finally {
            setIsAddingStory(false);
        }
    };

    // --- Add Epic slider helpers ---
    const resetAddEpicSlider = () => {
        setManualEpicTitle('');
        setManualEpicContent('');
        setManualStories([]);
        setUploadFileName('');
        setUploadError('');
        setUploadParsedEpics([]);
        setAddEpicMode('manual');
    };

    const saveManualEpic = async () => {
        if (!manualEpicTitle.trim() || addEpicSaving) return;
        setAddEpicSaving(true);
        try {
            await fetch(`${API_URL}/api/artifact-chat/epic`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    title: manualEpicTitle,
                    content: manualEpicContent,
                    stories: manualStories.filter(s => s.title.trim()),
                }),
            });
            resetAddEpicSlider();
            setAddEpicSliderOpen(false);
            fetchEpics();
        } catch { /* ignore */ }
        setAddEpicSaving(false);
    };

    const parseUploadedFile = (file: File) => {
        setUploadFileName(file.name);
        setUploadError('');
        setUploadParsedEpics([]);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                if (file.name.endsWith('.json')) {
                    const parsed = JSON.parse(text);
                    const epicsArr = parsed.epics || (Array.isArray(parsed) ? parsed : [parsed]);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mapped = epicsArr.map((ep: any) => ({
                        title: ep.title || ep.name || 'Untitled Epic',
                        content: ep.content || ep.description || '',
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        stories: (ep.stories || []).map((s: any) => ({
                            title: s.title || s.name || 'Untitled Story',
                            content: s.content || s.description || '',
                        })),
                    }));
                    setUploadParsedEpics(mapped);
                } else {
                    // Parse markdown: ## Epic: Title ... ### Story: Title
                    const lines = text.split('\n');
                    const epics: { title: string; content: string; stories: { title: string; content: string }[] }[] = [];
                    let currentEpic: { title: string; content: string; stories: { title: string; content: string }[] } | null = null;
                    let currentStory: { title: string; content: string } | null = null;
                    let buffer: string[] = [];

                    const flushBuffer = () => {
                        const txt = buffer.join('\n').trim();
                        if (currentStory) currentStory.content = txt;
                        else if (currentEpic) currentEpic.content = txt;
                        buffer = [];
                    };

                    for (const line of lines) {
                        const epicMatch = line.match(/^##\s+(?:Epic[:\s]*)?(.+)$/i);
                        const storyMatch = line.match(/^###\s+(?:(?:Story|US)[:\s-]*)?(.+)$/i);
                        if (epicMatch) {
                            flushBuffer();
                            if (currentStory && currentEpic) { currentEpic.stories.push(currentStory); currentStory = null; }
                            if (currentEpic) epics.push(currentEpic);
                            currentEpic = { title: epicMatch[1].trim(), content: '', stories: [] };
                            currentStory = null;
                        } else if (storyMatch && currentEpic) {
                            flushBuffer();
                            if (currentStory) currentEpic.stories.push(currentStory);
                            currentStory = { title: storyMatch[1].trim(), content: '' };
                        } else {
                            buffer.push(line);
                        }
                    }
                    flushBuffer();
                    if (currentStory && currentEpic) currentEpic.stories.push(currentStory);
                    if (currentEpic) epics.push(currentEpic);

                    if (epics.length === 0) {
                        setUploadError('No epics found. Use ## Epic: Title and ### Story: Title format.');
                    } else {
                        setUploadParsedEpics(epics);
                    }
                }
            } catch {
                setUploadError('Failed to parse file. Check format and try again.');
            }
        };
        reader.readAsText(file);
    };

    const importUploadedEpics = async () => {
        if (uploadParsedEpics.length === 0 || uploadImporting) return;
        setUploadImporting(true);
        try {
            await fetch(`${API_URL}/api/artifact-chat/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, epics: uploadParsedEpics }),
            });
            resetAddEpicSlider();
            setAddEpicSliderOpen(false);
            fetchEpics();
        } catch { /* ignore */ }
        setUploadImporting(false);
    };

    const handleSave = async () => {
        if (!editName.trim() || saving) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, description: editDesc || undefined }),
            });
            const data = await res.json();
            if (data.success) {
                setProject((prev) => prev ? { ...prev, name: editName, description: editDesc || null } : prev);
                setEditing(false);
            }
        } catch { /* ignore */ } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await fetch(`${API_URL}/api/projects/${projectId}`, { method: 'DELETE' });
            router.push('/');
        } catch { /* ignore */ }
    };

    const handleSavePrd = async () => {
        setSavingPrd(true);
        try {
            await fetch(`${API_URL}/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prdContent: prdDraft }),
            });
            setProject((prev) => prev ? { ...prev, prdContent: prdDraft } : prev);
            setEditingPrd(false);
        } catch { /* ignore */ } finally { setSavingPrd(false); }
    };

    // --- PRD Chat Handlers ---
    const initChat = async (mode: 'create' | 'edit' = 'create') => {
        setChatMode(mode);
        setChatOpen(true);
        setChatMessages([]);
        setChatStep(1);
        setChatFinalized(false);
        setChatLoading(true);
        setPrdSelectedSources(new Set());
        setPrdAvailableTypes([]);

        try {
            const res = await fetch(`${API_URL}/api/prd-chat/init/${projectId}?mode=${mode}`);
            const data = await res.json();
            if (data.success) {
                setChatMessages([{ role: 'assistant', content: data.data.content }]);
                setChatSteps(data.data.steps || []);
                setChatStep(data.data.step ?? 1);
                if (data.data.availableAnalysisTypes) {
                    setPrdAvailableTypes(data.data.availableAnalysisTypes);
                }
            }
        } catch {
            setChatMessages([{ role: 'assistant', content: 'Xin lỗi, không thể khởi tạo chat. Vui lòng thử lại.' }]);
        } finally {
            setChatLoading(false);
            setTimeout(() => chatInputRef.current?.focus(), 100);
        }
    };

    const sendMessage = async () => {
        if (!chatInput.trim() || chatLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
        const newMessages = [...chatMessages, userMsg];
        setChatMessages(newMessages);
        setChatInput('');
        setChatLoading(true);
        setChatActions([]);
        setMultiSelected(new Set());

        try {
            const res = await fetch(`${API_URL}/api/prd-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    messages: newMessages,
                    step: chatStep,
                    selectedSources: prdSelectedSources.size > 0 ? Array.from(prdSelectedSources) : undefined,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setChatMessages([...newMessages, { role: 'assistant', content: data.data.content }]);
                if (data.data.actions?.length) setChatActions(data.data.actions);
                if (data.data.isComplete) {
                    setChatFinalized(true);
                }
            }
        } catch {
            setChatMessages([...newMessages, { role: 'assistant', content: 'Lỗi kết nối. Vui lòng thử lại.' }]);
        } finally {
            setChatLoading(false);
            setTimeout(() => chatInputRef.current?.focus(), 100);
        }
    };

    const nextStep = async () => {
        const next = chatStep + 1;
        const totalSteps = chatSteps.length;
        setChatStep(next);
        setChatLoading(true);

        if (next > totalSteps) {
            // Compile PRD
            try {
                const res = await fetch(`${API_URL}/api/prd-chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectId,
                        messages: chatMessages,
                        step: totalSteps + 1,
                        mode: chatMode,
                    }),
                });
                const data = await res.json();
                if (data.success) {
                    setChatMessages((prev) => [...prev, { role: 'assistant', content: chatMode === 'edit' ? 'PRD đã được cập nhật thành công. Bạn có thể xem và lưu bên dưới.' : 'PRD đã được compile thành công. Bạn có thể xem và lưu bên dưới.' }]);
                    setChatFinalized(true);
                    setPrdDraft(data.data.content);
                }
            } catch {
                setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Lỗi khi compile PRD. Vui lòng thử lại.' }]);
            } finally {
                setChatLoading(false);
            }
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/prd-chat/next-step`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ step: next, mode: chatMode }),
            });
            const data = await res.json();
            if (data.success) {
                setChatMessages((prev) => [...prev, { role: 'assistant', content: data.data.content }]);
            }
        } catch {
            setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Lỗi kết nối.' }]);
        } finally {
            setChatLoading(false);
            setTimeout(() => chatInputRef.current?.focus(), 100);
        }
    };

    const saveFinalPrd = async () => {
        setSavingFinalPrd(true);
        try {
            await fetch(`${API_URL}/api/prd-chat/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, prdContent: prdDraft }),
            });
            setProject((prev) => prev ? { ...prev, prdContent: prdDraft } : prev);
            setChatOpen(false);
            setChatMessages([]);
        } catch { /* ignore */ } finally {
            setSavingFinalPrd(false);
        }
    };

    const handleChatKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // --- PRD Validate Handler ---
    // --- Validate Progress ---
    const [validatePhase, setValidatePhase] = useState(-1);
    const [validateProgress, setValidateProgress] = useState(0);
    const validateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const VALIDATE_CHECKS = [
        'Information Density',
        'Measurability',
        'Traceability',
        'Implementation Leakage',
        'SMART Compliance',
        'Completeness',
    ];

    const startValidateProgress = () => {
        setValidatePhase(0);
        setValidateProgress(0);
        let elapsed = 0;
        validateTimerRef.current = setInterval(() => {
            elapsed += 400;
            const totalChecks = 6;
            // Each check takes ~3-5s, total ~18-30s
            const perCheck = 4000;
            const currentCheck = Math.min(Math.floor(elapsed / perCheck), totalChecks - 1);
            const checkProgress = (elapsed % perCheck) / perCheck;
            const baseProgress = (currentCheck / totalChecks) * 100;
            const phaseContribution = (checkProgress / totalChecks) * 100;
            setValidatePhase(currentCheck);
            setValidateProgress(Math.min(95, baseProgress + phaseContribution));
        }, 400);
    };

    const stopValidateProgress = () => {
        if (validateTimerRef.current) {
            clearInterval(validateTimerRef.current);
            validateTimerRef.current = null;
        }
        setValidatePhase(-1);
        setValidateProgress(0);
    };

    const validatePrd = async () => {
        setValidateOpen(true);
        setValidating(true);
        setValidateResult(null);
        setValidateError('');
        startValidateProgress();

        try {
            const res = await fetch(`${API_URL}/api/prd-validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId }),
            });
            const data = await res.json();
            setValidateProgress(100);
            setValidatePhase(5);
            await new Promise(r => setTimeout(r, 400));
            if (data.success) {
                setValidateResult(data.data);
            } else {
                setValidateError(data.error || 'Validation failed');
            }
        } catch {
            setValidateError('Connection error. Please try again.');
        } finally {
            stopValidateProgress();
            setValidating(false);
        }
    };

    // --- PRD Fix Handlers ---
    const [fixError, setFixError] = useState('');
    const [fixPhase, setFixPhase] = useState(-1); // -1 = idle, 0-3 = phases
    const [fixProgress, setFixProgress] = useState(0);
    const fixTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const FIX_PHASES = [
        'Đọc PRD hiện tại',
        'Phân tích issue',
        'Viết lại nội dung',
        'Kiểm tra chất lượng',
    ];

    const startFixProgress = () => {
        setFixPhase(0);
        setFixProgress(0);
        let elapsed = 0;
        fixTimerRef.current = setInterval(() => {
            elapsed += 500;
            // Phase transitions: 0-2s → 2-5s → 5-25s → 25s+
            if (elapsed < 2000) {
                setFixPhase(0);
                setFixProgress(Math.min(15, (elapsed / 2000) * 15));
            } else if (elapsed < 5000) {
                setFixPhase(1);
                setFixProgress(15 + ((elapsed - 2000) / 3000) * 20);
            } else if (elapsed < 25000) {
                setFixPhase(2);
                setFixProgress(35 + ((elapsed - 5000) / 20000) * 45);
            } else {
                setFixPhase(3);
                // Slow crawl from 80% to 95% max
                setFixProgress(Math.min(95, 80 + ((elapsed - 25000) / 30000) * 15));
            }
        }, 500);
    };

    const stopFixProgress = () => {
        if (fixTimerRef.current) {
            clearInterval(fixTimerRef.current);
            fixTimerRef.current = null;
        }
        setFixPhase(-1);
        setFixProgress(0);
    };

    const fixCheck = async (check: { name: string; recommendation: string; findings: string[] }) => {
        setFixingCheck(check.name);
        setFixResult(null);
        setFixError('');
        startFixProgress();
        try {
            const res = await fetch(`${API_URL}/api/prd-fix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    checkName: check.name,
                    recommendation: check.recommendation,
                    findings: check.findings,
                }),
            });
            const data = await res.json();
            // Flash to 100% before showing result
            setFixProgress(100);
            setFixPhase(3);
            await new Promise(r => setTimeout(r, 400));
            if (data.success) {
                setFixResult(data.data);
            } else {
                setFixError(data.error || 'Fix failed');
            }
        } catch { setFixError('Connection error. Please try again.'); }
        finally { stopFixProgress(); setFixingCheck(null); }
    };

    const fixAll = async () => {
        if (!validateResult) return;
        setFixingAll(true);
        setFixResult(null);
        setFixError('');
        startFixProgress();
        try {
            const res = await fetch(`${API_URL}/api/prd-fix/all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    checks: validateResult.checks,
                    topImprovements: validateResult.topImprovements,
                }),
            });
            const data = await res.json();
            setFixProgress(100);
            setFixPhase(3);
            await new Promise(r => setTimeout(r, 400));
            if (data.success) {
                setFixResult(data.data);
            } else {
                setFixError(data.error || 'Auto-fix failed');
            }
        } catch { setFixError('Connection error. Please try again.'); }
        finally { stopFixProgress(); setFixingAll(false); }
    };

    const applyFix = async () => {
        if (!fixResult) return;
        try {
            await fetch(`${API_URL}/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prdContent: fixResult.improvedPrd }),
            });
            setProject((prev) => prev ? { ...prev, prdContent: fixResult.improvedPrd } : prev);
            setFixResult(null);
            // Re-validate after applying fix
            validatePrd();
        } catch { setFixError('Failed to save. Please try again.'); }
    };

    // --- Analysis Handlers ---
    const startAnalysis = (type: AnalysisType) => {
        setAnalysisSliderType(type);
        setAnalysisSliderOpen(true);
    };

    const previewDoc = async (docId: string) => {
        setPreviewOpen(true);
        setPreviewLoading(true);
        setPreviewDocId(docId);
        setPreviewEditing(false);
        try {
            const res = await fetch(`${API_URL}/api/analysis/doc/${docId}`);
            const data = await res.json();
            if (data.success) {
                setPreviewTitle(data.data.title);
                setPreviewContent(data.data.content || '');
                setPreviewEditContent(data.data.content || '');
            }
        } catch { /* ignore */ } finally {
            setPreviewLoading(false);
        }
    };

    const savePreviewDoc = async () => {
        if (!previewDocId) return;
        setPreviewSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/analysis/doc/${previewDocId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: previewEditContent }),
            });
            const data = await res.json();
            if (data.success) {
                setPreviewContent(previewEditContent);
                setPreviewEditing(false);
                fetchAnalysisDocs();
            }
        } catch { /* ignore */ } finally {
            setPreviewSaving(false);
        }
    };

    const deleteDoc = async (docId: string) => {
        try {
            await fetch(`${API_URL}/api/analysis/doc/${docId}`, { method: 'DELETE' });
            setAnalysisDocs((prev) => prev.filter((d) => d.id !== docId));
        } catch { /* ignore */ }
    };



    if (loading) {
        return (
            <div className="fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
                <Loader className="spin" size={28} style={{ color: 'var(--primary)' }} />
                <p style={{ color: 'var(--text-dim)', marginTop: '1rem', fontSize: '1rem' }}>Loading project...</p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>{error || 'Project not found'}</p>
                <Link href="/" style={{ color: 'var(--primary)', fontSize: '1rem' }}>← Back to Dashboard</Link>
            </div>
        );
    }

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="overflow-auto h-full" style={{ padding: '2rem' }}>
            {/* ── Flat Header (Skills-style) ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <FolderOpen size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
                    {project.description && (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', background: 'var(--bg-input)', padding: '0.2rem 0.6rem', borderRadius: '9999px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '20rem' }}>{project.description}</span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> {timeAgo(project.updatedAt)}</span>
                    <button
                        onClick={() => { setEditName(project.name); setEditDesc(project.description || ''); setEditing(true); }}
                        title="Edit"
                        style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.3rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                    >
                        <Edit3 size={12} /> Edit
                    </button>
                    {confirmDelete ? (
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button onClick={handleDelete} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', padding: '0.3rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.8125rem' }}>Confirm</button>
                            <button onClick={() => setConfirmDelete(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.3rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.8125rem' }}>Cancel</button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            title="Delete"
                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.3rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'color 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Bar (Skills underline style) */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                {([
                    { id: 'overview' as const, label: 'Overview', icon: <FolderOpen size={15} /> },
                    { id: 'analysis' as const, label: 'Analysis', icon: <Lightbulb size={15} /> },
                    { id: 'prd' as const, label: 'PRD', icon: <FileText size={15} /> },
                    { id: 'artifacts' as const, label: 'Artifacts', icon: <Layers size={15} />, badge: totalArtifacts > 0 ? totalArtifacts : undefined },
                    { id: 'settings' as const, label: 'Project Settings', icon: <Settings2 size={15} />, badge: project.connections.length > 0 ? project.connections.length : undefined },
                ]).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.6rem 1rem',
                            fontSize: '0.9375rem',
                            fontWeight: activeTab === tab.id ? 700 : 500,
                            color: 'var(--text-primary)',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap',
                            opacity: activeTab === tab.id ? 1 : 0.6,
                        }}
                        onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.opacity = '0.85'; }}
                        onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.opacity = '0.6'; }}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.badge !== undefined && (
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 600,
                                background: activeTab === tab.id ? 'var(--primary-bg)' : 'transparent',
                                color: 'var(--primary)',
                                padding: '0.05rem 0.4rem',
                                borderRadius: '9999px',
                                minWidth: '1.25rem', textAlign: 'center',
                            }}>{tab.badge}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Content ── */}
            <div>
                {/* Inline edit bar */}
                {editing && (
                    <div className="github-edit-bar" style={{ marginBottom: '1.5rem' }}>
                        <input type="text" className="input" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSave()} style={{ fontSize: '1rem', fontWeight: 600 }} placeholder="Project name" />
                        <input type="text" className="input" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description (optional)" style={{ fontSize: '0.9375rem' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? <Loader size={12} className="spin" /> : <Check size={12} />} Save</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={12} /> Cancel</button>
                        </div>
                    </div>
                )}

                {/* ============= OVERVIEW TAB ============= */}
                {activeTab === 'overview' && (
                    <div className="fade-in" style={{ maxWidth: '80rem', margin: '0 auto' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Project Info Card */}
                            <div className="glass-panel" style={{ borderRadius: '0.75rem', padding: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{project.name}</h2>
                                <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.6 }}>{project.description || 'No description provided. Click Edit to add one.'}</p>
                            </div>

                            {/* ===== USER GUIDE SECTION ===== */}
                            {(() => {
                                const guideHidden = typeof window !== 'undefined' && localStorage.getItem(`guide-hidden-${project.id}`) === 'true';
                                const hasPRD = !!project.prdContent;
                                const hasArtifacts = totalArtifacts > 0;
                                const hasConnections = project.connections.length > 0;
                                const allDone = hasPRD && hasArtifacts && hasConnections;

                                if (guideHidden) return null;

                                const guideCards = [
                                    { key: 'prd' as GuideKey, icon: FileText, title: 'Paste PRD đầu tiên', desc: 'Dán nội dung PRD để bắt đầu phân tích yêu cầu', action: () => setSelectedGuide('prd'), actionLabel: 'Xem cách paste PRD', done: hasPRD },
                                    { key: 'generate' as GuideKey, icon: Sparkles, title: 'Generate Artifacts', desc: 'Tạo User Stories, FL, SRS, ERD, SQL từ PRD', action: () => setSelectedGuide('generate'), actionLabel: 'Xem cách generate', done: hasArtifacts },
                                    { key: 'connect' as GuideKey, icon: Link2, title: 'Kết nối Figma / Confluence', desc: 'Lấy design & docs context qua MCP Protocol', action: () => setSelectedGuide('connect'), actionLabel: 'Xem cách kết nối', done: hasConnections },
                                    { key: 'chat' as GuideKey, icon: MessageSquare, title: 'Chat với AI về PRD', desc: 'Hỏi đáp, phát hiện thiếu sót, gợi ý cải thiện', action: () => setSelectedGuide('chat'), actionLabel: 'Xem cách chat AI', done: false },
                                    { key: 'validate' as GuideKey, icon: ShieldCheck, title: 'Validate chất lượng PRD', desc: 'AI đánh giá completeness, clarity, consistency', action: () => setSelectedGuide('validate'), actionLabel: 'Xem cách validate', done: false },
                                    { key: 'skills' as GuideKey, icon: Zap, title: 'Khám phá Skills Library', desc: '17 skills, workflows, và agents sẵn sàng hỗ trợ', action: () => setSelectedGuide('skills'), actionLabel: 'Khám phá skills', done: false },
                                ];
                                const completedCount = guideCards.filter(c => c.done).length;

                                return (
                                    <div className="glass-panel" style={{ borderRadius: '0.75rem', padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <BookOpen size={18} style={{ color: 'var(--primary)' }} />
                                                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Hướng dẫn sử dụng</span>
                                            </div>
                                            <button
                                                onClick={() => { localStorage.setItem(`guide-hidden-${project.id}`, 'true'); window.location.reload(); }}
                                                title="Ẩn hướng dẫn"
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.375rem', transition: 'color 0.15s', lineHeight: 0 }}
                                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                            {guideCards.map(card => {
                                                const Icon = card.icon;
                                                return (
                                                    <button
                                                        key={card.key}
                                                        onClick={card.action}
                                                        style={{
                                                            background: 'var(--bg-card)',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: '1rem',
                                                            padding: '1.25rem',
                                                            minHeight: '140px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'space-between',
                                                            cursor: 'pointer',
                                                            textAlign: 'left',
                                                            transition: 'all 0.2s ease',
                                                            boxShadow: 'var(--shadow-card)',
                                                        }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                                            e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.transform = 'none';
                                                            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                                                            e.currentTarget.style.borderColor = 'var(--border)';
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                                <Icon size={20} style={{ color: 'var(--primary)' }} />
                                                            </div>
                                                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{card.title}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{card.desc}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, marginTop: '0.75rem' }}>
                                                            {card.actionLabel}
                                                            <ArrowRight size={12} />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                {[
                                    { label: 'Analysis Docs', value: analysisDocs.length, icon: BarChart3, tab: 'analysis' as const },
                                    { label: 'PRD', value: project.prdContent ? 'Available' : '—', icon: FileText, tab: 'prd' as const },
                                    { label: 'Artifacts', value: totalArtifacts, icon: Layers, tab: 'artifacts' as const },
                                    { label: 'Connections', value: project.connections.length || 0, icon: Link2, tab: 'settings' as const },
                                ].map(card => {
                                    const CardIcon = card.icon;
                                    return (
                                        <button
                                            key={card.label}
                                            className="glass-panel"
                                            onClick={() => setActiveTab(card.tab)}
                                            style={{
                                                borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                                                cursor: 'pointer', border: '1px solid var(--border)', textAlign: 'left',
                                                transition: 'all 0.2s ease', position: 'relative',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', background: 'var(--accent-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <CardIcon size={16} style={{ color: 'var(--primary)' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>{card.label}</span>
                                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{card.value}</span>
                                            </div>
                                            <ArrowRight size={14} style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)', color: 'var(--text-dim)', opacity: 0.5 }} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ============= ANALYSIS TAB ============= */}
                {activeTab === 'analysis' && (
                    <div className="github-tab-panel fade-in">
                        <div className="github-tab-panel-header">
                            <h2>Analysis</h2>
                            <p className="github-tab-panel-subtitle">Phase 1 — Brainstorming & Research</p>
                        </div>

                        {/* Analysis Cards — Connection-style grid */}
                        <div className="app-card-grid">
                            {ANALYSIS_CARDS.map((card) => {
                                const CardIcon = card.icon;
                                return (
                                    <button key={card.type} className="app-card app-card--action clickable" onClick={() => startAnalysis(card.type)}>
                                        <div>
                                            <div className="card-icon"><CardIcon size={20} /></div>
                                            <div className="card-info">
                                                <h3>{card.name}</h3>
                                                <p>{card.desc}</p>
                                            </div>
                                        </div>
                                        <div className="card-action-label">Bắt đầu <ArrowRight size={12} /></div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Documents Table */}
                        {analysisDocs.length > 0 && (
                            <div style={{ marginTop: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>Documents</h3>
                                </div>
                                <div className="glass-panel" style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-input)', fontSize: '0.8125rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <th style={{ padding: '1rem', fontWeight: 500 }}>Title</th>
                                                <th style={{ padding: '1rem', fontWeight: 500 }}>Type</th>
                                                <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                                                <th style={{ padding: '1rem', fontWeight: 500 }}>Updated</th>
                                                <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ fontSize: '1rem' }}>
                                            {(() => {
                                                const titleCounts = new Map<string, number>();
                                                const titleIdx = new Map<string, number>();
                                                analysisDocs.forEach(d => titleCounts.set(d.title, (titleCounts.get(d.title) || 0) + 1));
                                                return analysisDocs.map((doc) => {
                                                    const typeCard = ANALYSIS_CARDS.find((c) => c.type === doc.type);
                                                    const DocIcon = typeCard?.icon || FileText;
                                                    const cnt = titleCounts.get(doc.title) || 1;
                                                    const idx = (titleIdx.get(doc.title) || 0) + 1;
                                                    titleIdx.set(doc.title, idx);
                                                    const displayTitle = cnt > 1 ? `${doc.title} (#${idx})` : doc.title;
                                                    return (
                                                        <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-input)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                            <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', background: 'var(--bg-code)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
                                                                    <DocIcon size={12} style={{ color: 'var(--text-dim)' }} />
                                                                </div>
                                                                <span style={{ color: 'var(--text-secondary)' }}>{displayTitle}</span>
                                                            </td>
                                                            <td style={{ padding: '1rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{doc.type?.replace(/_/g, ' ') || '—'}</td>
                                                            <td style={{ padding: '1rem' }}>
                                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '1rem', color: (doc.status === 'completed' || doc.status === 'final') ? '#34d399' : '#f59e0b', background: (doc.status === 'completed' || doc.status === 'final') ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 500, textTransform: 'uppercase' }}>
                                                                    {(doc.status === 'completed' || doc.status === 'final') ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                                                                    {doc.status || 'draft'}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '1rem' }}>{timeAgo(doc.updatedAt || doc.createdAt)}</td>
                                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                                    <button onClick={() => previewDoc(doc.id)} title="View" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Eye size={16} /></button>
                                                                    <button onClick={() => { previewDoc(doc.id); setTimeout(() => setPreviewEditing(true), 300); }} title="Edit" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Pencil size={16} /></button>
                                                                    <button onClick={() => { const content = doc.content || doc.title; const blob = new Blob([content], { type: 'text/markdown' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${doc.title.replace(/\s+/g, '_')}.md`; a.click(); URL.revokeObjectURL(url); }} title="Download" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Download size={16} /></button>
                                                                    <button onClick={() => deleteDoc(doc.id)} title="Delete" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#f87171')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Trash2 size={16} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ============= PRD TAB ============= */}
                {activeTab === 'prd' && (
                    <div className="github-tab-panel fade-in">
                        <div className="github-tab-panel-header">
                            <h2>PRD Content</h2>
                            <p className="github-tab-panel-subtitle">Phase 2 — Product Requirements Document</p>
                        </div>

                        {/* PRD Action Cards */}
                        <div className="app-card-grid" style={{ marginBottom: '1.5rem' }}>
                            <button className="app-card app-card--action clickable" onClick={() => initChat('create')}>
                                <div>
                                    <div className="card-icon"><Plus size={20} /></div>
                                    <div className="card-info">
                                        <h3>Create PRD</h3>
                                        <p>Create comprehensive PRD</p>
                                    </div>
                                </div>
                                <div className="card-action-label">Bắt đầu tạo <ArrowRight size={12} /></div>
                            </button>
                            <button
                                className="app-card app-card--action clickable"
                                onClick={validatePrd}
                            >
                                <div>
                                    <div className="card-icon"><ShieldCheck size={20} /></div>
                                    <div className="card-info">
                                        <h3>Validate PRD</h3>
                                        <p>Check against BMAD standards</p>
                                    </div>
                                </div>
                                <div className="card-action-label">Kiểm tra <ArrowRight size={12} /></div>
                            </button>
                            <button
                                className="app-card app-card--action clickable"
                                onClick={() => initChat('edit')}
                            >
                                <div>
                                    <div className="card-icon"><Edit3 size={20} /></div>
                                    <div className="card-info">
                                        <h3>Edit PRD</h3>
                                        <p>AI-guided BMAD workflow</p>
                                    </div>
                                </div>
                                <div className="card-action-label">Chỉnh sửa <ArrowRight size={12} /></div>
                            </button>
                        </div>

                        {/* PRD Document Table */}
                        {project.prdContent && (
                            <div style={{ marginTop: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>Document</h3>
                                </div>
                                <div className="glass-panel" style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-input)', fontSize: '0.8125rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <th style={{ padding: '1rem', fontWeight: 500 }}>Title</th>
                                                <th style={{ padding: '1rem', fontWeight: 500 }}>Type</th>
                                                <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                                                <th style={{ padding: '1rem', fontWeight: 500 }}>Updated</th>
                                                <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ fontSize: '1rem' }}>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-input)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', background: 'var(--bg-code)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
                                                        <FileText size={12} style={{ color: 'var(--text-dim)' }} />
                                                    </div>
                                                    <span style={{ color: 'var(--text-secondary)' }}>{project.name} — PRD</span>
                                                </td>
                                                <td style={{ padding: '1rem', color: 'var(--text-dim)' }}>PRD</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '1rem', color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 500, textTransform: 'uppercase' }}>
                                                        <CheckCircle2 size={11} /> COMPLETED
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '1rem' }}>{timeAgo(project.updatedAt)}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                        <button onClick={() => setPrdPreviewOpen(true)} title="View" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Eye size={16} /></button>
                                                        <button onClick={() => { setPrdPreviewOpen(true); setPrdPreviewEditing(true); setPrdDraft(project.prdContent || ''); }} title="Edit" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Pencil size={16} /></button>
                                                        <button onClick={() => { const blob = new Blob([project.prdContent || ''], { type: 'text/markdown' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${project.name.replace(/\s+/g, '_')}_PRD.md`; a.click(); URL.revokeObjectURL(url); }} title="Download" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Download size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* PRD Guidance Tip */}
                        {project.prdContent && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-dim)', fontSize: '0.9375rem' }}>
                                <Lightbulb size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />
                                <span>Tip: Use <strong style={{ color: 'var(--text-secondary)' }}>Validate PRD</strong> to check quality against BMAD standards, or <strong style={{ color: 'var(--text-secondary)' }}>Edit PRD</strong> for AI-guided improvements.</span>
                            </div>
                        )}

                        {/* Validate result */}
                        {validateOpen && validateResult && (
                            <div className="github-docs-section" style={{ marginTop: '1.5rem' }}>
                                <h3 className="github-docs-title">Validation Result</h3>
                                <div className="prd-validate-score-row">
                                    <div className="prd-validate-score-ring" style={{ '--score': validateResult.overallScore } as React.CSSProperties}>
                                        <span className="prd-validate-score-num">{validateResult.overallScore}</span>
                                    </div>
                                    <div className="prd-validate-score-text">
                                        <span className="prd-validate-score-label">BMAD Score</span>
                                        <span className="prd-validate-score-desc">
                                            {validateResult.overallScore >= 80 ? 'Excellent' : validateResult.overallScore >= 60 ? 'Good' : 'Needs Work'}
                                        </span>
                                    </div>
                                </div>
                                {validateResult.checks?.map((check, ci) => (
                                    <div key={ci} className={`prd-validate-check-card ${check.status}`}>
                                        <div className="prd-validate-check-header">
                                            {check.status === 'pass' ? <CheckCircle2 size={14} /> : check.status === 'warning' ? <AlertTriangle size={14} /> : <AlertCircle size={14} />}
                                            <span className="prd-validate-check-name">{check.name}</span>
                                            {check.recommendation && (
                                                <button className="prd-validate-fix-btn" onClick={() => fixCheck(check)} disabled={!!fixingCheck || fixingAll}>
                                                    {fixingCheck === check.name ? <Loader size={12} className="spin" /> : <Wrench size={12} />} Fix
                                                </button>
                                            )}
                                        </div>
                                        {check.findings?.length > 0 && (
                                            <ul className="prd-validate-findings">
                                                {check.findings.map((f, fi) => <li key={fi}>{f}</li>)}
                                            </ul>
                                        )}
                                        {check.recommendation && <div className="prd-validate-recommend"><ArrowRight size={12} /> {check.recommendation}</div>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* File upload input (hidden) */}
                        <input ref={prdFileInputRef} type="file" accept=".txt,.md,.markdown" onChange={handlePrdFileUpload} style={{ display: 'none' }} aria-hidden="true" />
                    </div>
                )}

                {/* ============= ARTIFACTS TAB ============= */}
                {activeTab === 'artifacts' && (
                    <div className="github-tab-panel fade-in">
                        <div className="github-tab-panel-header">
                            <h2>Artifacts</h2>
                            <p className="github-tab-panel-subtitle">Phase 3 — Epics, Stories & Generated Documents</p>
                        </div>

                        {/* Action Cards */}
                        <div className="app-card-grid" style={{ marginBottom: '1.5rem' }}>
                            <button className="app-card app-card--action clickable" onClick={() => { setArtifactChatOpen(true); setArtifactChatMessages([]); setArtifactChatStep(0); setArtifactChatSteps([]); setArtifactChatFinalized(false); setArtifactPrdSources([]); setArtifactSelectedPrd(null); }}>
                                <div>
                                    <div className="card-icon"><Plus size={20} /></div>
                                    <div className="card-info">
                                        <h3>Generate Epics</h3>
                                        <p>AI-powered epic & story creation</p>
                                    </div>
                                </div>
                                <div className="card-action-label">Bắt đầu <ArrowRight size={12} /></div>
                            </button>
                            <button
                                className="app-card app-card--action clickable"
                                onClick={() => setGenerateModalOpen(true)}
                            >
                                <div>
                                    <div className="card-icon"><FileOutput size={20} /></div>
                                    <div className="card-info">
                                        <h3>Generate Artifacts</h3>
                                        <p>SRS, ERD, user stories & more</p>
                                    </div>
                                </div>
                                <div className="card-action-label">Tạo artifacts <ArrowRight size={12} /></div>
                            </button>
                        </div>

                        {/* Epics & Stories Header (always visible) */}
                        <div style={{ marginTop: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>Epics & Stories</h3>
                                <button
                                    className="btn btn-sm"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', padding: '0.375rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                                    onClick={() => { resetAddEpicSlider(); setAddEpicSliderOpen(true); }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                >
                                    <Plus size={14} /> Add Epic
                                </button>
                            </div>
                        </div>

                        {/* Epics & Stories Table */}
                        {epics.length > 0 && (
                            <div>
                                <div className="glass-panel" style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-input)', fontSize: '0.8125rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <th style={{ padding: '1rem', fontWeight: 500 }}>Epic / Story</th>
                                                <th style={{ padding: '1rem', fontWeight: 500 }}>Stories</th>
                                                <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ fontSize: '1rem' }}>
                                            {epics.map((epic) => (
                                                <Fragment key={epic.id}>
                                                    {/* Epic Row */}
                                                    <tr
                                                        style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.15s' }}
                                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-input)')}
                                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                                    >
                                                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => setExpandedStoryId(expandedStoryId === epic.id ? null : epic.id)}>
                                                            {editingArtifactId === epic.id ? (
                                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                    <input type="text" className="input" value={editingArtifactTitle} onChange={(e) => setEditingArtifactTitle(e.target.value)} style={{ fontSize: '1rem', fontWeight: 600 }} />
                                                                    <textarea className="input" rows={4} value={editingArtifactContent} onChange={(e) => setEditingArtifactContent(e.target.value)} style={{ fontSize: '0.9375rem', fontFamily: 'monospace', minHeight: '80px' }} />
                                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                        <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); saveArtifactEdit(epic.id, 'epic'); }}><Check size={12} /> Save</button>
                                                                        <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setEditingArtifactId(null); }}><X size={12} /> Cancel</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', background: 'var(--bg-code)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
                                                                        <Layers size={12} style={{ color: 'var(--text-dim)' }} />
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        {expandedStoryId === epic.id ? <ChevronDown size={14} style={{ color: 'var(--text-dim)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />}
                                                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{epic.title}</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '1rem' }}>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '1rem', color: '#60a5fa', background: 'rgba(96,165,250,0.1)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 500 }}>
                                                                {epic.stories?.length || 0}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                                <button onClick={(e) => { e.stopPropagation(); setEditingArtifactId(epic.id); setEditingArtifactTitle(epic.title); setEditingArtifactContent(epic.content || ''); }} title="Edit" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Pencil size={14} /></button>
                                                                <button onClick={(e) => { e.stopPropagation(); setAddingStoryToEpic(epic.id); }} title="Add Story" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Plus size={14} /></button>
                                                                {deletePendingId === epic.id ? (
                                                                    <>
                                                                        <button onClick={(e) => { e.stopPropagation(); deleteArtifact(epic.id); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 500 }}>Xoá?</button>
                                                                        <button onClick={(e) => { e.stopPropagation(); setDeletePendingId(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}><X size={14} /></button>
                                                                    </>
                                                                ) : (
                                                                    <button onClick={(e) => { e.stopPropagation(); setDeletePendingId(epic.id); }} title="Delete" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#f87171')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Trash2 size={14} /></button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {/* Expanded Story Rows */}
                                                    {expandedStoryId === epic.id && epic.stories?.map((story) => (
                                                        <Fragment key={story.id}>
                                                            <tr
                                                                onClick={() => { setDrawerStory(story); setStoryDrawerOpen(true); fetchStoryArtifacts(story.id); }}
                                                                style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-code)', transition: 'background 0.15s', cursor: 'pointer' }}
                                                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-input)')}
                                                                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-code)')}
                                                            >
                                                                <td style={{ padding: '0.75rem 1rem 0.75rem 3.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                    <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.25rem', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                        <FileText size={12} style={{ color: 'var(--text-dim)' }} />
                                                                    </div>
                                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{story.title}</span>
                                                                    {/* Artifact count badge */}
                                                                    {story.storyArtifacts && story.storyArtifacts.length > 0 && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setExpandedArtifactStoryId(prev => prev === story.id ? null : story.id); }}
                                                                            title={`${story.storyArtifacts.length} artifacts — click to ${expandedArtifactStoryId === story.id ? 'collapse' : 'expand'}`}
                                                                            style={{
                                                                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.5rem',
                                                                                background: expandedArtifactStoryId === story.id ? 'var(--primary-bg)' : 'rgba(99,102,241,0.08)',
                                                                                border: expandedArtifactStoryId === story.id ? '1px solid var(--primary-border)' : '1px solid transparent',
                                                                                color: 'var(--primary-light)', cursor: 'pointer',
                                                                                padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500,
                                                                                transition: 'all 0.15s'
                                                                            }}
                                                                        >
                                                                            <Layers size={11} />
                                                                            <span>{story.storyArtifacts.length}</span>
                                                                            {expandedArtifactStoryId === story.id ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                                                        </button>
                                                                    )}
                                                                </td>
                                                                <td style={{ padding: '0.75rem 1rem' }}></td>
                                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                                                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                                        <button onClick={(e) => { e.stopPropagation(); setDrawerStory(story); setStoryDrawerOpen(true); fetchStoryArtifacts(story.id); }} title="View" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Eye size={16} /></button>
                                                                        <button onClick={(e) => { e.stopPropagation(); setEditingArtifactId(story.id); setEditingArtifactTitle(story.title); setEditingArtifactContent(story.content || ''); }} title="Edit" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Pencil size={16} /></button>
                                                                        {deletePendingId === story.id ? (
                                                                            <>
                                                                                <button onClick={(e) => { e.stopPropagation(); deleteArtifact(story.id); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 500 }}>Xoá?</button>
                                                                                <button onClick={(e) => { e.stopPropagation(); setDeletePendingId(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem' }}><X size={14} /></button>
                                                                            </>
                                                                        ) : (
                                                                            <button onClick={(e) => { e.stopPropagation(); setDeletePendingId(story.id); }} title="Delete" style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.25rem', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#f87171')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}><Trash2 size={16} /></button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {/* Expanded Artifact Cards */}
                                                            {expandedArtifactStoryId === story.id && story.storyArtifacts && story.storyArtifacts.length > 0 && (
                                                                <tr style={{ background: 'var(--bg-code)' }}>
                                                                    <td colSpan={3} style={{ padding: '0.5rem 1rem 0.75rem 3.25rem' }}>
                                                                        <div style={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                                                            gap: '0.5rem',
                                                                        }}>
                                                                            {story.storyArtifacts.map(a => {
                                                                                const label = ARTIFACT_LABELS[a.type] || a.type.replace(/-/g, ' ');
                                                                                return (
                                                                                    <div
                                                                                        key={a.id}
                                                                                        onClick={(e) => { e.stopPropagation(); openArtifactViewer(a.id); }}
                                                                                        className="artifact-expand-card"
                                                                                        style={{
                                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                            padding: '0.45rem 0.75rem', borderRadius: '0.375rem', cursor: 'pointer',
                                                                                            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                                                                                            transition: 'all 0.2s'
                                                                                        }}
                                                                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--primary-border)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
                                                                                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                                                    >
                                                                                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </Fragment>
                                                    ))}
                                                    {/* Add Story Form Row */}
                                                    {addingStoryToEpic === epic.id && (
                                                        <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-code)' }}>
                                                            <td colSpan={3} style={{ padding: '0.75rem 1rem 0.75rem 3.25rem' }}>
                                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                    <input type="text" className="input" placeholder="Story title... (Enter to open editor)" value={newStoryTitle} onChange={(e) => setNewStoryTitle(e.target.value)} onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' && newStoryTitle.trim()) {
                                                                            setStoryDraft({ epicId: epic.id, title: newStoryTitle, content: '' });
                                                                            setStoryDraftMode('editor');
                                                                            setAddingStoryToEpic(null);
                                                                            setNewStoryTitle('');
                                                                        }
                                                                    }} style={{ fontSize: '0.9375rem', flex: 1 }} autoFocus />
                                                                    <button className="btn btn-primary btn-sm" onClick={() => {
                                                                        if (newStoryTitle.trim()) {
                                                                            setStoryDraft({ epicId: epic.id, title: newStoryTitle, content: '' });
                                                                            setStoryDraftMode('editor');
                                                                            setAddingStoryToEpic(null);
                                                                            setNewStoryTitle('');
                                                                        }
                                                                    }}><ArrowRight size={11} /></button>
                                                                    <button className="btn btn-ghost btn-sm" onClick={() => { setAddingStoryToEpic(null); setNewStoryTitle(''); }}><X size={11} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ============= PROJECT SETTINGS TAB ============= */}
                {activeTab === 'settings' && (
                    <div className="github-tab-panel fade-in">
                        <ConnectionsContent projectId={projectId} />
                    </div>
                )}
            </div>


            {/* PRD Chat Panel — Premium Slide-in */}
            {chatOpen && (
                <div className="prd-chat-overlay" onClick={() => setChatOpen(false)}>
                    <div className="prd-chat-panel" onClick={(e) => e.stopPropagation()} style={{ width: panelWidth }}>
                        <div className="panel-resize-handle" onMouseDown={startPanelResize} />
                        {/* Header */}
                        <div className="prd-chat-header">
                            <div className="prd-chat-header-left">
                                <div className="prd-chat-header-icon">
                                    {chatMode === 'edit' ? <Edit3 size={18} /> : <Sparkles size={18} />}
                                </div>
                                <div>
                                    <div className="prd-chat-header-title">{chatMode === 'edit' ? 'PRD Editor' : 'PRD Builder'}</div>
                                    <div className="prd-chat-header-subtitle">{chatMode === 'edit' ? 'BMAD Edit Workflow' : 'BMAD Method'}</div>
                                </div>
                            </div>
                            <div className="prd-chat-header-actions">
                                <button
                                    className="prd-chat-close"
                                    onClick={() => setChatOpen(false)}
                                    aria-label="Close chat"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>



                        {/* Messages */}
                        <div className="prd-chat-messages">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`prd-chat-bubble ${msg.role}`}>
                                    <div className="prd-chat-bubble-avatar">
                                        {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className="prd-chat-bubble-content">
                                        {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="prd-chat-bubble assistant">
                                    <div className="prd-chat-bubble-avatar">
                                        <Bot size={16} />
                                    </div>
                                    <div className="prd-chat-bubble-content">
                                        <div className="prd-chat-typing">
                                            <span /><span /><span />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 0: Analysis Source Selection for PRD Creation */}
                            {chatStep === 0 && prdAvailableTypes.length > 0 && !chatLoading && (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', padding: '0 0.5rem' }}>
                                        {ANALYSIS_CARDS.map((card) => {
                                            const isSelected = prdSelectedSources.has(card.type);
                                            return (
                                                <button
                                                    key={card.type}
                                                    className="app-card clickable"
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                        padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                                        cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                                                        border: isSelected ? '2px solid var(--primary)' : '2px solid var(--border)',
                                                        background: isSelected ? 'var(--primary-bg)' : 'var(--bg-input)',
                                                        color: 'var(--text-secondary)', transition: 'all 0.15s',
                                                    }}
                                                    onClick={() => {
                                                        setPrdSelectedSources(prev => {
                                                            const next = new Set(prev);
                                                            if (next.has(card.type)) next.delete(card.type);
                                                            else next.add(card.type);
                                                            return next;
                                                        });
                                                    }}
                                                >
                                                    <div style={{ width: '1rem', height: '1rem', borderRadius: '0.2rem', border: isSelected ? '2px solid var(--primary)' : '2px solid var(--border)', background: isSelected ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                                        {isSelected && <Check size={10} style={{ color: '#fff' }} />}
                                                    </div>
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', padding: '0 0.5rem' }}>
                                        <button
                                            className="btn btn-primary"
                                            disabled={prdSelectedSources.size === 0}
                                            style={{ flex: 1, opacity: prdSelectedSources.size === 0 ? 0.5 : 1 }}
                                            onClick={async () => {
                                                const selectedList = Array.from(prdSelectedSources).map(t => ANALYSIS_CARDS.find(c => c.type === t)?.name || t).join(', ');
                                                const userMsg: ChatMessage = { role: 'user', content: `Sử dụng tài liệu Analysis: **${selectedList}**` };
                                                const newMsgs = [...chatMessages, userMsg];
                                                setChatMessages(newMsgs);
                                                setChatStep(1);
                                                setChatLoading(true);
                                                try {
                                                    const r = await fetch(`${API_URL}/api/prd-chat`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ projectId, messages: newMsgs, step: 1, selectedSources: Array.from(prdSelectedSources) }),
                                                    });
                                                    const data = await r.json();
                                                    if (data.success) {
                                                        setChatMessages([...newMsgs, { role: 'assistant', content: data.data.content }]);
                                                        setChatActions(data.data.actions || []);
                                                    } else {
                                                        setChatMessages([...newMsgs, { role: 'assistant', content: `⚠️ Lỗi: ${data.error || 'Unknown'}` }]);
                                                    }
                                                } catch {
                                                    setChatMessages([...newMsgs, { role: 'assistant', content: 'Lỗi kết nối.' }]);
                                                } finally {
                                                    setChatLoading(false);
                                                }
                                            }}
                                        >
                                            Bắt đầu với {prdSelectedSources.size} tài liệu
                                        </button>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={async () => {
                                                setChatStep(1);
                                                setChatLoading(true);
                                                const userMsg: ChatMessage = { role: 'user', content: 'Bỏ qua — bắt đầu không dùng Analysis docs' };
                                                const newMsgs = [...chatMessages, userMsg];
                                                setChatMessages(newMsgs);
                                                try {
                                                    const r = await fetch(`${API_URL}/api/prd-chat`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ projectId, messages: newMsgs, step: 1 }),
                                                    });
                                                    const data = await r.json();
                                                    if (data.success) {
                                                        setChatMessages([...newMsgs, { role: 'assistant', content: data.data.content }]);
                                                        setChatActions(data.data.actions || []);
                                                    }
                                                } catch {
                                                    setChatMessages([...newMsgs, { role: 'assistant', content: 'Lỗi kết nối.' }]);
                                                } finally {
                                                    setChatLoading(false);
                                                }
                                            }}
                                        >
                                            Bỏ qua
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Quick Action Buttons */}
                            {chatActions.length > 0 && !chatLoading && !chatFinalized && (() => {
                                const hasMulti = chatActions.some(a => a.type === 'multi');
                                const buttons = chatActions.filter(a => a.type === 'button');
                                const multis = chatActions.filter(a => a.type === 'multi');
                                return (
                                    <div className="chat-actions-container">
                                        {buttons.length > 0 && (
                                            <div className="chat-actions-row">
                                                {buttons.map((action, idx) => (
                                                    <button
                                                        key={idx}
                                                        className="chat-action-btn"
                                                        onClick={() => {
                                                            setChatInput(action.value);
                                                            setTimeout(() => {
                                                                const userMsg: ChatMessage = { role: 'user', content: action.value };
                                                                const newMsgs = [...chatMessages, userMsg];
                                                                setChatMessages(newMsgs);
                                                                setChatInput('');
                                                                setChatLoading(true);
                                                                setChatActions([]);
                                                                fetch(`${API_URL}/api/prd-chat`, {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ projectId, messages: newMsgs, step: chatStep }),
                                                                }).then(r => r.json()).then(data => {
                                                                    if (data.success) {
                                                                        setChatMessages([...newMsgs, { role: 'assistant', content: data.data.content }]);
                                                                        if (data.data.actions?.length) setChatActions(data.data.actions);
                                                                        if (data.data.isComplete) setChatFinalized(true);
                                                                    }
                                                                }).catch(() => {
                                                                    setChatMessages([...newMsgs, { role: 'assistant', content: 'Lỗi kết nối.' }]);
                                                                }).finally(() => setChatLoading(false));
                                                            }, 0);
                                                        }}
                                                    >
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {hasMulti && (
                                            <div className="chat-actions-multi">
                                                {multis.map((action, idx) => (
                                                    <label key={idx} className="chat-action-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={multiSelected.has(action.value)}
                                                            onChange={(e) => {
                                                                const next = new Set(multiSelected);
                                                                e.target.checked ? next.add(action.value) : next.delete(action.value);
                                                                setMultiSelected(next);
                                                            }}
                                                        />
                                                        <span>{action.label}</span>
                                                    </label>
                                                ))}
                                                {multiSelected.size > 0 && (
                                                    <button
                                                        className="chat-action-btn chat-action-submit"
                                                        onClick={() => {
                                                            const val = Array.from(multiSelected).join(', ');
                                                            const userMsg: ChatMessage = { role: 'user', content: val };
                                                            const newMsgs = [...chatMessages, userMsg];
                                                            setChatMessages(newMsgs);
                                                            setChatLoading(true);
                                                            setChatActions([]);
                                                            setMultiSelected(new Set());
                                                            fetch(`${API_URL}/api/prd-chat`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ projectId, messages: newMsgs, step: chatStep }),
                                                            }).then(r => r.json()).then(data => {
                                                                if (data.success) {
                                                                    setChatMessages([...newMsgs, { role: 'assistant', content: data.data.content }]);
                                                                    if (data.data.actions?.length) setChatActions(data.data.actions);
                                                                    if (data.data.isComplete) setChatFinalized(true);
                                                                }
                                                            }).catch(() => {
                                                                setChatMessages([...newMsgs, { role: 'assistant', content: 'Lỗi kết nối.' }]);
                                                            }).finally(() => setChatLoading(false));
                                                        }}
                                                    >
                                                        ✅ Submit ({multiSelected.size})
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Actions area */}
                        {chatFinalized ? (
                            <div className="prd-chat-finalize">
                                <div className="prd-chat-finalize-inner">
                                    <CheckCircle2 size={28} className="prd-chat-finalize-icon" />
                                    <p className="prd-chat-finalize-text">PRD compiled successfully</p>
                                    <button
                                        className="btn btn-primary btn-block prd-chat-finalize-btn"
                                        onClick={saveFinalPrd}
                                        disabled={savingFinalPrd}
                                    >
                                        {savingFinalPrd ? (
                                            <><Loader size={14} className="spin" /> Saving...</>
                                        ) : (
                                            <><FileOutput size={14} /> Save PRD to Project</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="prd-chat-input-area">
                                <div className="prd-chat-input-container">
                                    <textarea
                                        ref={chatInputRef}
                                        className="prd-chat-textarea"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={handleChatKeyDown}
                                        placeholder="Type your response..."
                                        rows={2}
                                        disabled={chatLoading}
                                    />
                                    <button
                                        className="prd-chat-send"
                                        onClick={sendMessage}
                                        disabled={!chatInput.trim() || chatLoading}
                                        aria-label="Send message"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            {/* PRD Validate Panel — Slide-in */}
            {
                validateOpen && (
                    <div className="prd-chat-overlay" onClick={() => setValidateOpen(false)}>
                        <div className="prd-chat-panel" onClick={(e) => e.stopPropagation()} style={{ width: panelWidth }}>
                            <div className="panel-resize-handle" onMouseDown={startPanelResize} />
                            {/* Header */}
                            <div className="prd-chat-header">
                                <div className="prd-chat-header-left">
                                    <div className="prd-chat-header-icon" style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
                                        <ShieldCheck size={18} style={{ color: '#0284c7' }} />
                                    </div>
                                    <div>
                                        <div className="prd-chat-header-title">PRD Validator</div>
                                        <div className="prd-chat-header-subtitle">BMAD Quality Check</div>
                                    </div>
                                </div>
                                <div className="prd-chat-header-actions">
                                    <button
                                        className="prd-chat-close"
                                        onClick={() => setValidateOpen(false)}
                                        aria-label="Close"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="prd-chat-messages" style={{ padding: '1.5rem' }}>
                                {validating && (
                                    <div className="prd-validate-loading">
                                        <div className="prd-fix-progress-card" style={{ width: '100%', maxWidth: '360px' }}>
                                            <div className="prd-fix-progress-header">
                                                <ShieldCheck size={14} />
                                                <span>Đang phân tích PRD theo BMAD standards...</span>
                                            </div>
                                            <div className="prd-fix-progress-phases">
                                                {VALIDATE_CHECKS.map((name, i) => (
                                                    <div key={name} className={`prd-fix-phase ${i < validatePhase ? 'done' : i === validatePhase ? 'active' : 'pending'}`}>
                                                        <span className="prd-fix-phase-icon">
                                                            {i < validatePhase ? <CheckCircle2 size={13} /> :
                                                                i === validatePhase ? <Loader size={13} className="spin" /> :
                                                                    <span className="prd-fix-phase-dot" />}
                                                        </span>
                                                        <span>{name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="prd-fix-progress-bar-wrap">
                                                <div className="prd-fix-progress-bar" style={{ width: `${validateProgress}%` }} />
                                            </div>
                                            <div className="prd-fix-progress-pct">{Math.round(validateProgress)}%</div>
                                        </div>
                                    </div>
                                )}

                                {validateError && (
                                    <div className="prd-validate-error">
                                        <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                                        <p>{validateError}</p>
                                        <button className="btn btn-primary btn-sm" onClick={validatePrd}>
                                            Retry Validation
                                        </button>
                                    </div>
                                )}

                                {validateResult && (
                                    <div className="prd-validate-report">
                                        {/* Overall Score Card */}
                                        <div className={`prd-validate-score-card ${validateResult.overallStatus.toLowerCase()}`}>
                                            <div className="prd-validate-score-header">
                                                <div className="prd-validate-score-status">
                                                    {validateResult.overallStatus === 'Pass' && <CheckCircle2 size={22} />}
                                                    {validateResult.overallStatus === 'Warning' && <AlertTriangle size={22} />}
                                                    {validateResult.overallStatus === 'Critical' && <X size={22} />}
                                                    <span>{validateResult.overallStatus}</span>
                                                </div>
                                                <div className="prd-validate-score-number">
                                                    {validateResult.holisticScore}<span>/5</span>
                                                </div>
                                            </div>
                                            <p className="prd-validate-score-summary">{validateResult.summary}</p>
                                        </div>

                                        {/* Individual Checks */}
                                        <div className="prd-validate-checks">
                                            <h3 className="prd-validate-section-title">Validation Checks</h3>
                                            {validateResult.checks.map((check, i) => (
                                                <div key={i} className={`prd-validate-check-card ${check.status.toLowerCase()}`}>
                                                    <div className="prd-validate-check-header">
                                                        <span className="prd-validate-check-name">{check.name}</span>
                                                        <span className={`prd-validate-check-badge ${check.status.toLowerCase()}`}>
                                                            {check.status}
                                                        </span>
                                                    </div>
                                                    {check.findings.length > 0 && (
                                                        <ul className="prd-validate-findings">
                                                            {check.findings.slice(0, 3).map((f, j) => (
                                                                <li key={j}>{f}</li>
                                                            ))}
                                                            {check.findings.length > 3 && (
                                                                <li className="prd-validate-more">+{check.findings.length - 3} more</li>
                                                            )}
                                                        </ul>
                                                    )}
                                                    <p className="prd-validate-recommendation">{check.recommendation}</p>
                                                    {check.status !== 'Pass' && (
                                                        <button
                                                            className="prd-validate-fix-btn"
                                                            onClick={() => fixCheck(check)}
                                                            disabled={!!fixingCheck || fixingAll}
                                                        >
                                                            {fixingCheck === check.name ? (
                                                                <><Loader size={12} className="spin" /> Fixing...</>
                                                            ) : (
                                                                <><Wrench size={12} /> Fix This</>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Strengths */}
                                        {validateResult.strengths.length > 0 && (
                                            <div className="prd-validate-section">
                                                <h3 className="prd-validate-section-title">Strengths</h3>
                                                <div className="prd-validate-check-card pass">
                                                    <ul className="prd-validate-findings">
                                                        {validateResult.strengths.map((s, i) => (
                                                            <li key={i}>{s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* Top Improvements */}
                                        {validateResult.topImprovements.length > 0 && (
                                            <div className="prd-validate-section">
                                                <h3 className="prd-validate-section-title">Top Improvements</h3>
                                                <div className="prd-validate-check-card warning">
                                                    <ul className="prd-validate-findings">
                                                        {validateResult.topImprovements.map((imp, i) => (
                                                            <li key={i}>
                                                                <div className="prd-validate-improvement-item">
                                                                    <span>{imp}</span>
                                                                    <button
                                                                        className="prd-validate-fix-btn-inline"
                                                                        onClick={() => fixCheck({ name: `Improvement ${i + 1}`, recommendation: imp, findings: [] })}
                                                                        disabled={!!fixingCheck || fixingAll}
                                                                        title="Fix this improvement"
                                                                    >
                                                                        <Wrench size={11} />
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* Fix Progress Card */}
                                        {fixPhase >= 0 && (
                                            <div className="prd-fix-progress-card">
                                                <div className="prd-fix-progress-header">
                                                    <Sparkles size={14} />
                                                    <span>AI đang {fixingAll ? 'sửa tất cả issues' : `sửa ${fixingCheck || 'PRD'}`}...</span>
                                                </div>
                                                <div className="prd-fix-progress-phases">
                                                    {FIX_PHASES.map((phase, i) => (
                                                        <div key={i} className={`prd-fix-phase ${i < fixPhase ? 'done' : i === fixPhase ? 'active' : 'pending'}`}>
                                                            <span className="prd-fix-phase-icon">
                                                                {i < fixPhase ? <CheckCircle2 size={13} /> :
                                                                    i === fixPhase ? <Loader size={13} className="spin" /> :
                                                                        <span className="prd-fix-phase-dot" />}
                                                            </span>
                                                            <span>{phase}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="prd-fix-progress-bar-wrap">
                                                    <div className="prd-fix-progress-bar" style={{ width: `${fixProgress}%` }} />
                                                </div>
                                                <div className="prd-fix-progress-pct">{Math.round(fixProgress)}%</div>
                                            </div>
                                        )}

                                        {/* Fix Error */}
                                        {fixError && (
                                            <div className="prd-validate-fix-error">
                                                <AlertTriangle size={14} /> {fixError}
                                            </div>
                                        )}

                                        {/* Fix Result Preview */}
                                        {fixResult && (
                                            <div className="prd-validate-fix-result">
                                                <h3 className="prd-validate-section-title">
                                                    <Sparkles size={14} /> AI Fix Ready
                                                </h3>
                                                <p className="prd-validate-fix-summary">{fixResult.changesSummary}</p>
                                                <div className="prd-validate-fix-actions">
                                                    <button className="btn btn-primary btn-sm" onClick={applyFix}>
                                                        <Check size={14} /> Apply & Re-validate
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => setFixResult(null)}>
                                                        Discard
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Bottom Action Bar */}
                                        <div className="prd-validate-bottom-actions">
                                            {validateResult.checks.some(c => c.status !== 'Pass') && (
                                                <button
                                                    className="btn btn-primary btn-sm prd-validate-fixall-btn"
                                                    onClick={fixAll}
                                                    disabled={!!fixingCheck || fixingAll}
                                                >
                                                    {fixingAll ? (
                                                        <><Loader size={14} className="spin" /> Fixing All...</>
                                                    ) : (
                                                        <><Sparkles size={14} /> Auto-Fix All Issues</>
                                                    )}
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => {
                                                    setValidateOpen(false);
                                                    initChat('edit');
                                                }}
                                            >
                                                <Edit3 size={14} /> Edit PRD
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* PRD Preview Panel — Slide-in */}
            {
                prdPreviewOpen && (
                    <div className="prd-chat-overlay" onClick={() => setPrdPreviewOpen(false)}>
                        <div className="prd-chat-panel" onClick={(e) => e.stopPropagation()} style={{ width: panelWidth }}>
                            <div className="panel-resize-handle" onMouseDown={startPanelResize} />
                            <div className="prd-chat-header">
                                <div className="prd-chat-header-left">
                                    <div className="prd-chat-header-icon" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
                                        {prdPreviewEditing ? <Pencil size={18} style={{ color: '#2563eb' }} /> : <Eye size={18} style={{ color: '#2563eb' }} />}
                                    </div>
                                    <div>
                                        <div className="prd-chat-header-title">{project?.name} — PRD</div>
                                        <div className="prd-chat-header-subtitle">{prdPreviewEditing ? 'Source Markdown' : 'Preview'}</div>
                                    </div>
                                </div>
                                <div className="prd-chat-header-actions">
                                    <button
                                        className={`btn btn-ghost btn-sm ${prdPreviewEditing ? '' : 'active'}`}
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.9375rem', gap: '0.25rem' }}
                                        onClick={() => { setPrdPreviewEditing(false); }}
                                    >
                                        <Eye size={13} /> Preview
                                    </button>
                                    <button
                                        className={`btn btn-ghost btn-sm ${prdPreviewEditing ? 'active' : ''}`}
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.9375rem', gap: '0.25rem' }}
                                        onClick={() => { if (!prdPreviewEditing) setPrdDraft(project?.prdContent || ''); setPrdPreviewEditing(true); }}
                                    >
                                        <Pencil size={13} /> Source
                                    </button>
                                    {prdPreviewEditing && (
                                        <>
                                            <button className="fut-upload-btn" onClick={() => prdFileInputRef.current?.click()} title="Upload .md or .txt file" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                                <Upload size={12} /> Upload
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.9375rem', gap: '0.25rem' }}
                                                onClick={handleSavePrd}
                                                disabled={savingPrd}
                                            >
                                                {savingPrd ? <Loader size={13} className="spin" /> : <Save size={13} />} Save
                                            </button>
                                        </>
                                    )}
                                    <button className="prd-chat-close" onClick={() => setPrdPreviewOpen(false)} aria-label="Close"><X size={18} /></button>
                                </div>
                            </div>
                            <div className="prd-chat-messages" style={{ padding: prdPreviewEditing ? '0' : '1.5rem' }}>
                                {prdPreviewEditing ? (
                                    <FileUploadTextarea
                                        value={prdDraft}
                                        onChange={setPrdDraft}
                                        label="PRD Content"
                                        placeholder="Paste PRD or upload a .md / .txt file..."
                                        spellCheck={false}
                                        textareaClassName="analysis-edit-textarea"
                                    />
                                ) : (
                                    <div className="analysis-preview-content" dangerouslySetInnerHTML={{
                                        __html: (project?.prdContent || '')
                                            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                                            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                                            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                                            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\*(.+?)\*/g, '<em>$1</em>')
                                            .replace(/^- (.+)$/gm, '<li>$1</li>')
                                            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
                                            .replace(/<\/ul>\s*<ul>/g, '')
                                            .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
                                            .replace(/\n\n/g, '<br/><br/>')
                                            .replace(/\n/g, '<br/>')
                                            .replace(/---/g, '<hr/>')
                                    }} />
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Analysis Slider — Right-side chat panel for all analysis types */}
            <AnalysisSlider
                projectId={projectId}
                projectName={project?.name || 'Project'}
                analysisType={analysisSliderType}
                open={analysisSliderOpen}
                onClose={() => setAnalysisSliderOpen(false)}
                onSessionSaved={() => fetchAnalysisDocs()}
            />

            {/* Analysis Preview Panel */}
            {
                previewOpen && (
                    <div className="prd-chat-overlay" onClick={() => setPreviewOpen(false)}>
                        <div className="prd-chat-panel" onClick={(e) => e.stopPropagation()} style={{ width: panelWidth }}>
                            <div className="panel-resize-handle" onMouseDown={startPanelResize} />
                            <div className="prd-chat-header">
                                <div className="prd-chat-header-left">
                                    <div className="prd-chat-header-icon" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
                                        {previewEditing ? <Pencil size={18} style={{ color: '#059669' }} /> : <Eye size={18} style={{ color: '#059669' }} />}
                                    </div>
                                    <div>
                                        <div className="prd-chat-header-title">{previewTitle || 'Document Preview'}</div>
                                        <div className="prd-chat-header-subtitle">{previewEditing ? 'Editing Markdown' : 'Analysis Report'}</div>
                                    </div>
                                </div>
                                <div className="prd-chat-header-actions">
                                    {!previewLoading && (
                                        <button
                                            className={`modal-action-btn modal-action-btn--ghost ${previewEditing ? '' : ''}`}
                                            onClick={() => { setPreviewEditing(!previewEditing); if (!previewEditing) setPreviewEditContent(previewContent); }}
                                        >
                                            {previewEditing ? <><Eye size={13} /> Preview</> : <><Pencil size={13} /> Edit</>}
                                        </button>
                                    )}
                                    {previewEditing && (
                                        <button
                                            className="modal-action-btn modal-action-btn--primary"
                                            onClick={savePreviewDoc}
                                            disabled={previewSaving}
                                        >
                                            {previewSaving ? <Loader size={13} className="spin" /> : <Save size={13} />} Save
                                        </button>
                                    )}
                                    <button className="prd-chat-close" onClick={() => setPreviewOpen(false)} aria-label="Close"><X size={18} /></button>
                                </div>
                            </div>
                            <div className="prd-chat-messages" style={{ padding: previewEditing ? '0' : '1.5rem' }}>
                                {previewLoading ? (
                                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                                        <Loader size={24} className="spin" style={{ color: 'var(--primary)' }} />
                                    </div>
                                ) : previewEditing ? (
                                    <FileUploadTextarea
                                        value={previewEditContent}
                                        onChange={setPreviewEditContent}
                                        label="Document Content"
                                        placeholder="Edit content or upload a .md / .txt file..."
                                        spellCheck={false}
                                        textareaClassName="analysis-edit-textarea"
                                    />
                                ) : (
                                    <div className="analysis-preview-content" dangerouslySetInnerHTML={{
                                        __html: previewContent
                                            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                                            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                                            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                                            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\*(.+?)\*/g, '<em>$1</em>')
                                            .replace(/^- (.+)$/gm, '<li>$1</li>')
                                            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
                                            .replace(/<\/ul>\s*<ul>/g, '')
                                            .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
                                            .replace(/\n\n/g, '<br/><br/>')
                                            .replace(/\n/g, '<br/>')
                                            .replace(/---/g, '<hr/>')
                                    }} />
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Artifact Chat Panel — Epics & Stories */}
            {
                artifactChatOpen && (
                    <div className="prd-chat-overlay" onClick={() => setArtifactChatOpen(false)}>
                        <div className="prd-chat-panel" onClick={(e) => e.stopPropagation()} style={{ width: panelWidth }}>
                            <div className="panel-resize-handle" onMouseDown={startPanelResize} />
                            <div className="prd-chat-header">
                                <div className="prd-chat-header-left">
                                    <div className="prd-chat-header-icon" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                                        <Layers size={18} style={{ color: '#d97706' }} />
                                    </div>
                                    <div>
                                        <div className="prd-chat-header-title">Epics & Stories</div>
                                        <div className="prd-chat-header-subtitle">BMAD Methodology</div>
                                    </div>
                                </div>
                                <div className="prd-chat-header-actions">
                                    <button className="prd-chat-close" onClick={() => setArtifactChatOpen(false)} aria-label="Close"><X size={18} /></button>
                                </div>
                            </div>





                            {/* Messages */}
                            <div className="prd-chat-messages">
                                {artifactChatMessages.map((msg, i) => (
                                    <div key={i} className={`prd-chat-bubble ${msg.role}`}>
                                        <div className="prd-chat-bubble-avatar">
                                            {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                                        </div>
                                        <div className="prd-chat-bubble-content">
                                            {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                                        </div>
                                    </div>
                                ))}
                                {artifactChatLoading && (
                                    <div className="prd-chat-bubble assistant">
                                        <div className="prd-chat-bubble-avatar"><Bot size={16} /></div>
                                        <div className="prd-chat-bubble-content">
                                            <div className="prd-chat-typing"><span /><span /><span /></div>
                                        </div>
                                    </div>
                                )}

                                {/* PRD Selection Cards (Step 0) */}
                                {artifactChatStep === 0 && !artifactSelectedPrd && artifactPrdSources.length > 0 && !artifactChatLoading && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 0.5rem' }}>
                                        {artifactPrdSources.map((prd) => (
                                            <button
                                                key={prd.id}
                                                className="app-card app-card--action clickable"
                                                style={{ textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '0.75rem' }}
                                                onClick={async () => {
                                                    setArtifactSelectedPrd(prd.id);
                                                    setArtifactChatStep(1);
                                                    const userMsg: ChatMessage = { role: 'user', content: `Sử dụng tài liệu: **${prd.title}**` };
                                                    const newMsgs = [...artifactChatMessages, userMsg];
                                                    setArtifactChatMessages(newMsgs);
                                                    setArtifactChatLoading(true);
                                                    try {
                                                        const r = await fetch(`${API_URL}/api/artifact-chat`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ projectId, messages: newMsgs, step: 1, selectedPrdId: prd.id }),
                                                        });
                                                        const data = await r.json();
                                                        if (data.success) {
                                                            setArtifactChatMessages([...newMsgs, { role: 'assistant', content: data.data.content }]);
                                                            if (data.data.step && data.data.step > 1) setArtifactChatStep(data.data.step);
                                                        } else {
                                                            setArtifactChatMessages([...newMsgs, { role: 'assistant', content: `⚠️ Lỗi: ${data.error || 'Unknown'}` }]);
                                                        }
                                                    } catch {
                                                        setArtifactChatMessages([...newMsgs, { role: 'assistant', content: 'Lỗi kết nối.' }]);
                                                    } finally {
                                                        setArtifactChatLoading(false);
                                                    }
                                                }}
                                            >
                                                <div className="card-icon" style={{ width: '2rem', height: '2rem' }}>
                                                    <FileText size={16} />
                                                </div>
                                                <div className="card-info" style={{ flex: 1, minWidth: 0 }}>
                                                    <h3 style={{ fontSize: '0.9375rem', margin: 0 }}>{prd.title}</h3>
                                                    <p style={{ fontSize: '0.8125rem', margin: '0.15rem 0 0', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {prd.source === 'prd-tab' ? '📋 PRD Tab' : prd.source.startsWith('analysis-') ? `📊 Analysis · ${prd.source.replace('analysis-', '').replace(/_/g, ' ')}` : `📝 ${prd.source}`} · {prd.wordCount.toLocaleString()} words · {prd.status}
                                                    </p>
                                                </div>
                                                <ArrowRight size={14} className="card-arrow" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Quick Action Buttons */}
                                {artifactChatActions.length > 0 && !artifactChatLoading && !artifactChatFinalized && (() => {
                                    const hasMulti = artifactChatActions.some(a => a.type === 'multi');
                                    const buttons = artifactChatActions.filter(a => a.type === 'button');
                                    const multis = artifactChatActions.filter(a => a.type === 'multi');
                                    return (
                                        <div className="chat-actions-container">
                                            {buttons.length > 0 && (
                                                <div className="chat-actions-row">
                                                    {buttons.map((action, idx) => (
                                                        <button
                                                            key={idx}
                                                            className="chat-action-btn"
                                                            onClick={() => {
                                                                const userMsg: ChatMessage = { role: 'user', content: action.value };
                                                                const newMsgs = [...artifactChatMessages, userMsg];
                                                                setArtifactChatMessages(newMsgs);
                                                                setArtifactChatLoading(true);
                                                                setArtifactChatActions([]);
                                                                fetch(`${API_URL}/api/artifact-chat`, {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ projectId, messages: newMsgs, step: artifactChatStep, selectedPrdId: artifactSelectedPrd }),
                                                                }).then(r => r.json()).then(data => {
                                                                    if (data.success) {
                                                                        setArtifactChatMessages([...newMsgs, { role: 'assistant', content: data.data.content }]);
                                                                        if (data.data.actions?.length) setArtifactChatActions(data.data.actions);
                                                                        if (data.data.isComplete) setArtifactChatFinalized(true);
                                                                        if (data.data.step && data.data.step > artifactChatStep) setArtifactChatStep(data.data.step);
                                                                    }
                                                                }).catch(() => {
                                                                    setArtifactChatMessages([...newMsgs, { role: 'assistant', content: 'Lỗi kết nối.' }]);
                                                                }).finally(() => setArtifactChatLoading(false));
                                                            }}
                                                        >
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {hasMulti && (
                                                <div className="chat-actions-multi">
                                                    {multis.map((action, idx) => (
                                                        <label key={idx} className="chat-action-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={artifactMultiSelected.has(action.value)}
                                                                onChange={(e) => {
                                                                    const next = new Set(artifactMultiSelected);
                                                                    e.target.checked ? next.add(action.value) : next.delete(action.value);
                                                                    setArtifactMultiSelected(next);
                                                                }}
                                                            />
                                                            <span>{action.label}</span>
                                                        </label>
                                                    ))}
                                                    {artifactMultiSelected.size > 0 && (
                                                        <button
                                                            className="chat-action-btn chat-action-submit"
                                                            onClick={() => {
                                                                const val = Array.from(artifactMultiSelected).join(', ');
                                                                const userMsg: ChatMessage = { role: 'user', content: val };
                                                                const newMsgs = [...artifactChatMessages, userMsg];
                                                                setArtifactChatMessages(newMsgs);
                                                                setArtifactChatLoading(true);
                                                                setArtifactChatActions([]);
                                                                setArtifactMultiSelected(new Set());
                                                                fetch(`${API_URL}/api/artifact-chat`, {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ projectId, messages: newMsgs, step: artifactChatStep, selectedPrdId: artifactSelectedPrd }),
                                                                }).then(r => r.json()).then(data => {
                                                                    if (data.success) {
                                                                        setArtifactChatMessages([...newMsgs, { role: 'assistant', content: data.data.content }]);
                                                                        if (data.data.actions?.length) setArtifactChatActions(data.data.actions);
                                                                        if (data.data.isComplete) setArtifactChatFinalized(true);
                                                                        if (data.data.step && data.data.step > artifactChatStep) setArtifactChatStep(data.data.step);
                                                                    }
                                                                }).catch(() => {
                                                                    setArtifactChatMessages([...newMsgs, { role: 'assistant', content: 'Lỗi kết nối.' }]);
                                                                }).finally(() => setArtifactChatLoading(false));
                                                            }}
                                                        >
                                                            ✅ Submit ({artifactMultiSelected.size})
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                <div ref={artifactChatEndRef} />
                            </div>

                            {/* Input */}
                            <div className="prd-chat-input-area">
                                {!artifactChatFinalized ? (
                                    <div className="prd-chat-input-container">
                                        <textarea
                                            ref={artifactChatInputRef}
                                            className="prd-chat-textarea"
                                            value={artifactChatInput}
                                            onChange={(e) => setArtifactChatInput(e.target.value)}
                                            placeholder="Type your response..."
                                            rows={1}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    if (!artifactChatInput.trim() || artifactChatLoading) return;
                                                    const userMsg: ChatMessage = { role: 'user', content: artifactChatInput.trim() };
                                                    const newMsgs = [...artifactChatMessages, userMsg];
                                                    setArtifactChatMessages(newMsgs);
                                                    setArtifactChatInput('');
                                                    setArtifactChatLoading(true);
                                                    setArtifactChatActions([]);
                                                    setArtifactMultiSelected(new Set());
                                                    fetch(`${API_URL}/api/artifact-chat`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ projectId, messages: newMsgs, step: artifactChatStep, selectedPrdId: artifactSelectedPrd }),
                                                    }).then(r => r.json()).then(data => {
                                                        if (data.success) {
                                                            setArtifactChatMessages([...newMsgs, { role: 'assistant', content: data.data.content }]);
                                                            if (data.data.actions?.length) setArtifactChatActions(data.data.actions);
                                                            if (data.data.isComplete) setArtifactChatFinalized(true);
                                                            if (data.data.step && data.data.step > artifactChatStep) setArtifactChatStep(data.data.step);
                                                        } else {
                                                            setArtifactChatMessages([...newMsgs, { role: 'assistant', content: `⚠️ Lỗi: ${data.error || 'Unknown error'}` }]);
                                                        }
                                                    }).catch(() => {
                                                        setArtifactChatMessages([...newMsgs, { role: 'assistant', content: 'Lỗi kết nối.' }]);
                                                    }).finally(() => {
                                                        setArtifactChatLoading(false);
                                                        setTimeout(() => artifactChatInputRef.current?.focus(), 100);
                                                    });
                                                }
                                            }}
                                        />
                                        <button
                                            className="prd-chat-send"
                                            disabled={!artifactChatInput.trim() || artifactChatLoading}
                                            onClick={() => {
                                                if (!artifactChatInput.trim() || artifactChatLoading) return;
                                                const userMsg: ChatMessage = { role: 'user', content: artifactChatInput.trim() };
                                                const newMsgs = [...artifactChatMessages, userMsg];
                                                setArtifactChatMessages(newMsgs);
                                                setArtifactChatInput('');
                                                setArtifactChatLoading(true);
                                                setArtifactChatActions([]);
                                                setArtifactMultiSelected(new Set());
                                                fetch(`${API_URL}/api/artifact-chat`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ projectId, messages: newMsgs, step: artifactChatStep, selectedPrdId: artifactSelectedPrd }),
                                                }).then(r => r.json()).then(data => {
                                                    if (data.success) {
                                                        setArtifactChatMessages([...newMsgs, { role: 'assistant', content: data.data.content }]);
                                                        if (data.data.actions?.length) setArtifactChatActions(data.data.actions);
                                                        if (data.data.isComplete) setArtifactChatFinalized(true);
                                                        if (data.data.step && data.data.step > artifactChatStep) setArtifactChatStep(data.data.step);
                                                    } else {
                                                        setArtifactChatMessages([...newMsgs, { role: 'assistant', content: `⚠️ Lỗi: ${data.error || 'Unknown error'}` }]);
                                                    }
                                                }).catch(() => {
                                                    setArtifactChatMessages([...newMsgs, { role: 'assistant', content: 'Lỗi kết nối.' }]);
                                                }).finally(() => {
                                                    setArtifactChatLoading(false);
                                                    setTimeout(() => artifactChatInputRef.current?.focus(), 100);
                                                });
                                            }}
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="prd-chat-finalized">
                                        <CheckCircle2 size={16} /> Stories compiled successfully
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Generate Artifact Modal */}
            {
                generateModalOpen && (
                    <div className="prd-chat-overlay" onClick={() => setGenerateModalOpen(false)}>
                        <div className="prd-chat-panel" onClick={(e) => e.stopPropagation()} style={{ width: panelWidth }}>
                            <div className="panel-resize-handle" onMouseDown={startPanelResize} />
                            <div className="prd-chat-header">
                                <div className="prd-chat-header-left">
                                    <div className="prd-chat-header-icon">
                                        <Sparkles size={18} />
                                    </div>
                                    <div>
                                        <div className="prd-chat-header-title">Generate Artifact</div>
                                        <div className="prd-chat-header-subtitle">Story-Scoped BSA Artifact</div>
                                    </div>
                                </div>
                                <div className="prd-chat-header-actions">
                                    <button className="prd-chat-close" onClick={() => setGenerateModalOpen(false)} aria-label="Close"><X size={18} /></button>
                                </div>
                            </div>

                            <div className="prd-chat-messages" style={{ padding: '1.5rem' }}>
                                {/* Step 1: Select Epic & Story */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                                        Select Scope
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <select
                                            className="input"
                                            value={genSelectedEpic}
                                            onChange={(e) => {
                                                setGenSelectedEpic(e.target.value);
                                                setGenSelectedStory('');
                                            }}
                                            style={{ fontSize: '1rem', flex: 1 }}
                                        >
                                            <option value="">-- All Epics --</option>
                                            {epics.map(epic => (
                                                <option key={epic.id} value={epic.id}>{epic.title}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="input"
                                            value={genSelectedStory}
                                            onChange={(e) => setGenSelectedStory(e.target.value)}
                                            style={{ fontSize: '1rem', flex: 1 }}
                                        >
                                            <option value="">-- Choose story --</option>
                                            {(genSelectedEpic
                                                ? epics.filter(e => e.id === genSelectedEpic)
                                                : epics
                                            ).map(epic => (
                                                <optgroup key={epic.id} label={epic.title}>
                                                    {epic.stories.map(s => (
                                                        <option key={s.id} value={s.id}>{s.title}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Step 2: Select Types (Multi-select pills — 4 col) */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                                        Artifact Types
                                    </label>
                                    <div className="artifact-type-grid">
                                        {GENERATE_ARTIFACT_TYPES.map(t => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                className={`artifact-type-pill ${genSelectedTypes.includes(t.value) ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setGenSelectedTypes(prev =>
                                                        prev.includes(t.value)
                                                            ? prev.filter(v => v !== t.value)
                                                            : [...prev, t.value]
                                                    );
                                                }}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                    {genSelectedTypes.length > 0 && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                                            {genSelectedTypes.length} type{genSelectedTypes.length > 1 ? 's' : ''} selected
                                        </div>
                                    )}
                                </div>

                                {/* Step 3: Context Links */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                                        Context Links <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(optional)</span>
                                    </label>
                                    <div className="context-url-input">
                                        <span className="context-url-icon"><FileText size={14} /></span>
                                        <input
                                            type="url"
                                            className="input"
                                            placeholder="Confluence URL (e.g. https://site.atlassian.net/wiki/...)"
                                            value={genConfluenceUrl}
                                            onChange={(e) => setGenConfluenceUrl(e.target.value)}
                                        />
                                    </div>
                                    <div className="figma-url-repeater">
                                        {genFigmaUrls.map((item, idx) => (
                                            <div key={idx} className="figma-url-group" style={{ marginTop: idx > 0 ? '0.5rem' : '0.4rem' }}>
                                                <div className="context-url-input">
                                                    <span className="context-url-icon"><Palette size={14} /></span>
                                                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dim)', minWidth: '1.8rem' }}>S{idx + 1}</span>
                                                    <input
                                                        type="url"
                                                        className="input"
                                                        placeholder={`Figma URL — Step ${idx + 1}`}
                                                        value={item.url}
                                                        onChange={(e) => {
                                                            const updated = [...genFigmaUrls];
                                                            updated[idx] = { ...updated[idx], url: e.target.value };
                                                            setGenFigmaUrls(updated);
                                                        }}
                                                    />
                                                    {genFigmaUrls.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="figma-url-remove"
                                                            onClick={() => setGenFigmaUrls(prev => prev.filter((_, i) => i !== idx))}
                                                            title="Remove"
                                                        >×</button>
                                                    )}
                                                </div>
                                                <textarea
                                                    className="input figma-desc"
                                                    placeholder="Mô tả nội dung màn hình (optional)"
                                                    rows={2}
                                                    value={item.description}
                                                    onChange={(e) => {
                                                        const updated = [...genFigmaUrls];
                                                        updated[idx] = { ...updated[idx], description: e.target.value };
                                                        setGenFigmaUrls(updated);
                                                    }}
                                                    style={{ marginTop: '0.25rem', marginLeft: '3.3rem', width: 'calc(100% - 3.3rem)', fontSize: '0.875rem', resize: 'vertical' }}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="figma-url-add"
                                            onClick={() => setGenFigmaUrls(prev => [...prev, { url: '', description: '' }])}
                                        >
                                            + Add Figma Link
                                        </button>
                                    </div>
                                </div>

                                {/* Generate button */}
                                <button
                                    className="btn btn-primary btn-sm"
                                    style={{ width: '100%', marginBottom: '1rem' }}
                                    disabled={!genSelectedStory || genSelectedTypes.length === 0 || genLoading}
                                    onClick={async () => {
                                        setGenLoading(true);
                                        setGenBatchResults([]);
                                        setGenActiveTab(0);
                                        try {
                                            const res = await fetch(`${API_URL}/api/generate/batch`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    storyId: genSelectedStory,
                                                    types: genSelectedTypes,
                                                    projectId,
                                                    confluenceUrl: genConfluenceUrl || undefined,
                                                    figmaUrls: genFigmaUrls.filter(f => f.url.trim()).map(f => ({ url: f.url.trim(), description: f.description.trim() })) || undefined,
                                                }),
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                setGenBatchResults(data.data);
                                                setGenContextName(data.data[0]?.contextName || '');
                                            } else {
                                                setGenBatchResults([{ success: false, type: 'error', error: data.error || 'Generation failed' }]);
                                            }
                                        } catch {
                                            setGenBatchResults([{ success: false, type: 'error', error: 'Connection error. Please try again.' }]);
                                        } finally {
                                            setGenLoading(false);
                                        }
                                    }}
                                >
                                    {genLoading ? <><Loader size={14} className="spin" /> Generating {genSelectedTypes.length} artifact{genSelectedTypes.length > 1 ? 's' : ''}...</> : <><Sparkles size={14} /> Generate {genSelectedTypes.length > 0 ? `(${genSelectedTypes.length})` : ''}</>}
                                </button>

                                {/* Batch Preview with tabs */}
                                {genBatchResults.length > 0 && (
                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                        {/* Tab pills */}
                                        {genBatchResults.length > 1 && (
                                            <div className="batch-preview-tabs">
                                                {genBatchResults.map((r, i) => (
                                                    <button
                                                        key={i}
                                                        className={`batch-tab ${genActiveTab === i ? 'active' : ''} ${r.success ? '' : 'error'}`}
                                                        onClick={() => setGenActiveTab(i)}
                                                    >
                                                        {r.type.toUpperCase()}
                                                        {r.success ? ' ✓' : ' ✗'}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Active tab content */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                                            <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                                                Preview — {genBatchResults[genActiveTab]?.type?.toUpperCase()} {genContextName && `(${genContextName})`}
                                            </span>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                disabled={genSaving || genBatchResults.every(r => !r.success)}
                                                onClick={async () => {
                                                    setGenSaving(true);
                                                    try {
                                                        const savePromises = genBatchResults
                                                            .filter(r => r.success && r.content)
                                                            .map(r =>
                                                                fetch(`${API_URL}/api/generate/save-single`, {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ storyId: genSelectedStory, type: r.type, content: r.content, projectId }),
                                                                }).then(res => res.json())
                                                            );
                                                        await Promise.all(savePromises);
                                                        setGenerateModalOpen(false);
                                                        setGenBatchResults([]);
                                                        setGenSelectedTypes([]);
                                                        setGenConfluenceUrl('');
                                                        setGenFigmaUrls([{ url: '', description: '' }]);
                                                        fetchProject();
                                                        fetchEpics();
                                                        fetchStoryArtifacts(genSelectedStory);
                                                    } catch { /* noop */ } finally {
                                                        setGenSaving(false);
                                                    }
                                                }}
                                            >
                                                {genSaving ? <><Loader size={13} className="spin" /> Saving...</> : <><Save size={13} /> Save All ({genBatchResults.filter(r => r.success).length})</>}
                                            </button>
                                        </div>

                                        {genBatchResults[genActiveTab]?.success ? (
                                            <pre className="project-prd-viewer" style={{ maxHeight: '400px', overflow: 'auto', fontSize: '1rem' }}>
                                                {genBatchResults[genActiveTab]?.content}
                                            </pre>
                                        ) : (
                                            <div style={{ color: 'var(--danger)', fontSize: '0.9375rem', padding: '0.5rem' }}>
                                                Error: {genBatchResults[genActiveTab]?.error}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add Epic Slider */}
            {
                addEpicSliderOpen && (
                    <div className="prd-chat-overlay" onClick={() => setAddEpicSliderOpen(false)}>
                        <div className="prd-chat-panel" onClick={(e) => e.stopPropagation()} style={{ width: panelWidth }}>
                            <div className="panel-resize-handle" onMouseDown={startPanelResize} />
                            <div className="prd-chat-header">
                                <div className="prd-chat-header-left">
                                    <div className="prd-chat-header-icon"><Plus size={18} /></div>
                                    <div>
                                        <div className="prd-chat-header-title">Add Epic</div>
                                        <div className="prd-chat-header-subtitle">Manual creation or file import</div>
                                    </div>
                                </div>
                                <div className="prd-chat-header-actions">
                                    <button className="prd-chat-close" onClick={() => setAddEpicSliderOpen(false)} aria-label="Close"><X size={18} /></button>
                                </div>
                            </div>

                            {/* Tab switcher */}
                            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 1.5rem' }}>
                                {(['manual', 'upload'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setAddEpicMode(tab)}
                                        style={{
                                            flex: 1, padding: '0.75rem 0', fontSize: '0.875rem', fontWeight: 600,
                                            background: 'transparent', border: 'none', cursor: 'pointer',
                                            color: addEpicMode === tab ? 'var(--accent)' : 'var(--text-dim)',
                                            borderBottom: addEpicMode === tab ? '2px solid var(--accent)' : '2px solid transparent',
                                            transition: 'all 0.15s ease',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                                        }}
                                    >
                                        {tab === 'manual' ? <><Edit3 size={14} /> Manual</> : <><Upload size={14} /> Upload</>}
                                    </button>
                                ))}
                            </div>

                            <div className="prd-chat-messages" style={{ padding: '1.5rem' }}>
                                {addEpicMode === 'manual' ? (
                                    <>
                                        {/* Epic Title */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
                                                Epic Title <span style={{ color: 'var(--danger)' }}>*</span>
                                            </label>
                                            <input
                                                className="input"
                                                placeholder="e.g. User Authentication & Account Management"
                                                value={manualEpicTitle}
                                                onChange={(e) => setManualEpicTitle(e.target.value)}
                                                style={{ fontSize: '0.9375rem' }}
                                                autoFocus
                                            />
                                        </div>

                                        {/* Epic Description */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
                                                Description <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span>
                                            </label>
                                            <textarea
                                                className="input"
                                                placeholder="Epic description or goals..."
                                                value={manualEpicContent}
                                                onChange={(e) => setManualEpicContent(e.target.value)}
                                                rows={4}
                                                style={{ fontSize: '0.875rem', resize: 'vertical', minHeight: '80px' }}
                                            />
                                        </div>

                                        {/* Stories */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                                Stories <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>({manualStories.length})</span>
                                            </label>
                                            {manualStories.map((story, idx) => (
                                                <div key={idx} style={{
                                                    background: 'var(--bg-input)', borderRadius: '0.5rem', padding: '0.75rem',
                                                    marginBottom: '0.5rem', border: '1px solid var(--border-light)',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', minWidth: '2rem' }}>S{idx + 1}</span>
                                                        <input
                                                            className="input"
                                                            placeholder="Story title"
                                                            value={story.title}
                                                            onChange={(e) => {
                                                                const updated = [...manualStories];
                                                                updated[idx] = { ...updated[idx], title: e.target.value };
                                                                setManualStories(updated);
                                                            }}
                                                            style={{ flex: 1, fontSize: '0.8125rem', padding: '0.375rem 0.5rem' }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setManualStories(prev => prev.filter((_, i) => i !== idx))}
                                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0.25rem' }}
                                                            title="Remove story"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        className="input"
                                                        placeholder="As a [role], I want [action], so that [benefit]..."
                                                        value={story.content}
                                                        onChange={(e) => {
                                                            const updated = [...manualStories];
                                                            updated[idx] = { ...updated[idx], content: e.target.value };
                                                            setManualStories(updated);
                                                        }}
                                                        rows={2}
                                                        style={{ fontSize: '0.8125rem', resize: 'vertical', marginLeft: '2.5rem', width: 'calc(100% - 2.5rem)' }}
                                                    />
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setManualStories(prev => [...prev, { title: '', content: '' }])}
                                                style={{
                                                    background: 'transparent', border: '1px dashed var(--border-light)',
                                                    borderRadius: '0.5rem', padding: '0.5rem', width: '100%',
                                                    fontSize: '0.8125rem', color: 'var(--text-dim)', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                                                    transition: 'all 0.15s ease',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
                                            >
                                                <Plus size={14} /> Add Story
                                            </button>
                                        </div>

                                        {/* Save button */}
                                        <button
                                            className="btn btn-primary btn-sm"
                                            style={{ width: '100%' }}
                                            disabled={!manualEpicTitle.trim() || addEpicSaving}
                                            onClick={saveManualEpic}
                                        >
                                            {addEpicSaving ? <><Loader size={13} className="spin" /> Saving...</> : <><Save size={13} /> Save Epic</>}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Upload drop zone */}
                                        <div
                                            style={{
                                                border: '2px dashed var(--border-light)', borderRadius: '0.75rem',
                                                padding: '2rem', textAlign: 'center', cursor: 'pointer',
                                                transition: 'all 0.15s ease', marginBottom: '1rem',
                                                background: 'var(--bg-input)',
                                            }}
                                            onClick={() => epicFileInputRef.current?.click()}
                                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.style.borderColor = 'var(--border-light)';
                                                const file = e.dataTransfer.files?.[0];
                                                if (file) parseUploadedFile(file);
                                            }}
                                        >
                                            <Upload size={28} style={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }} />
                                            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                                {uploadFileName || 'Drop file here or click to browse'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                                Accepts .md and .json files
                                            </div>
                                        </div>

                                        {/* Format hint */}
                                        <div style={{
                                            fontSize: '0.75rem', color: 'var(--text-dim)', background: 'var(--bg-input)',
                                            borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem',
                                            border: '1px solid var(--border-light)',
                                        }}>
                                            <strong>Markdown format:</strong> Use <code>## Epic: Title</code> and <code>### Story: Title</code>
                                            <br />
                                            <strong>JSON format:</strong> <code>{'{ "epics": [{ "title": "...", "stories": [...] }] }'}</code>
                                        </div>

                                        {uploadError && (
                                            <div style={{ color: 'var(--danger)', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <AlertCircle size={14} /> {uploadError}
                                            </div>
                                        )}

                                        {/* Preview parsed epics */}
                                        {uploadParsedEpics.length > 0 && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                                    Preview ({uploadParsedEpics.length} epic{uploadParsedEpics.length > 1 ? 's' : ''})
                                                </div>
                                                {uploadParsedEpics.map((ep, idx) => (
                                                    <div key={idx} style={{
                                                        background: 'var(--bg-input)', borderRadius: '0.5rem', padding: '0.625rem 0.75rem',
                                                        marginBottom: '0.375rem', border: '1px solid var(--border-light)',
                                                    }}>
                                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ep.title}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                                            {ep.stories.length} stor{ep.stories.length === 1 ? 'y' : 'ies'}
                                                            {ep.stories.length > 0 && ': ' + ep.stories.map(s => s.title).join(', ')}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Import button */}
                                        <button
                                            className="btn btn-primary btn-sm"
                                            style={{ width: '100%' }}
                                            disabled={uploadParsedEpics.length === 0 || uploadImporting}
                                            onClick={importUploadedEpics}
                                        >
                                            {uploadImporting ? <><Loader size={13} className="spin" /> Importing...</> : <><Upload size={13} /> Import {uploadParsedEpics.length} Epic{uploadParsedEpics.length !== 1 ? 's' : ''}</>}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Hidden file input for epic upload */}
            <input
                ref={epicFileInputRef}
                type="file"
                accept=".md,.markdown,.json"
                onChange={(e) => { const file = e.target.files?.[0]; if (file) parseUploadedFile(file); e.target.value = ''; }}
                style={{ display: 'none' }}
                aria-hidden="true"
            />

            {/* Story Detail Drawer */}
            {
                storyDrawerOpen && drawerStory && (
                    <div className="story-drawer-overlay" onClick={() => setStoryDrawerOpen(false)}>
                        <div
                            className="story-detail-drawer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: drawerWidth }}
                        >
                            {/* Resize handle */}
                            <div
                                className="drawer-resize-handle"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    isResizingDrawer.current = true;
                                    document.body.style.cursor = 'col-resize';
                                    document.body.style.userSelect = 'none';
                                    const onMove = (ev: MouseEvent) => {
                                        if (!isResizingDrawer.current) return;
                                        const newWidth = Math.max(380, Math.min(window.innerWidth * 0.85, window.innerWidth - ev.clientX));
                                        setDrawerWidth(newWidth);
                                    };
                                    const onUp = () => {
                                        isResizingDrawer.current = false;
                                        document.body.style.cursor = '';
                                        document.body.style.userSelect = '';
                                        window.removeEventListener('mousemove', onMove);
                                        window.removeEventListener('mouseup', onUp);
                                    };
                                    window.addEventListener('mousemove', onMove);
                                    window.addEventListener('mouseup', onUp);
                                }}
                            />
                            <div className="drawer-header">
                                <div className="drawer-title">
                                    <span className="drawer-subtitle">Story Details</span>
                                    <h3>{drawerStory.title}</h3>
                                </div>
                                <button className="prd-chat-close" onClick={() => setStoryDrawerOpen(false)} aria-label="Close"><X size={18} /></button>
                            </div>
                            {/* Tab bar: Block Bricks | Raw | Preview + Copy */}
                            <div className="drawer-tab-bar">
                                <div className="drawer-tabs">
                                    <button
                                        className={`drawer-tab${drawerViewMode === 'bricks' ? ' active' : ''}`}
                                        onClick={() => setDrawerViewMode('bricks')}
                                    >
                                        <Layers size={13} /> Block Bricks
                                    </button>
                                    <button
                                        className={`drawer-tab${drawerViewMode === 'raw' ? ' active' : ''}`}
                                        onClick={() => setDrawerViewMode('raw')}
                                    >
                                        <FileText size={13} /> Raw
                                    </button>
                                    <button
                                        className={`drawer-tab${drawerViewMode === 'preview' ? ' active' : ''}`}
                                        onClick={() => setDrawerViewMode('preview')}
                                    >
                                        <Eye size={13} /> Preview
                                    </button>
                                </div>
                                <button
                                    className="drawer-copy-btn"
                                    onClick={() => {
                                        navigator.clipboard.writeText(drawerStory.content || '');
                                        setDrawerCopied(true);
                                        setTimeout(() => setDrawerCopied(false), 2000);
                                    }}
                                    title="Copy content"
                                >
                                    {drawerCopied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                                </button>
                            </div>
                            <div className="drawer-content">
                                {drawerViewMode === 'bricks' ? (
                                    /* Block Bricks mode: section cards with per-block edit */
                                    <>
                                        {(() => {
                                            const sections = parseStorySections(drawerStory.content || '');
                                            return sections.map((section, idx) => (
                                                <div key={idx} className="drawer-section">
                                                    <div className="drawer-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        {editingBlockIdx === idx ? (
                                                            <input
                                                                className="drawer-edit-title-input"
                                                                value={editBlockTitle}
                                                                onChange={(e) => setEditBlockTitle(e.target.value)}
                                                                placeholder="Section title"
                                                            />
                                                        ) : (
                                                            <span>{section.title}</span>
                                                        )}
                                                        <div className="drawer-block-actions">
                                                            {editingBlockIdx === idx ? (
                                                                <>
                                                                    <button className="drawer-action-btn save" onClick={() => saveBrickBlock(idx, editBlockTitle, editBlockBody)} disabled={drawerSaving}>
                                                                        {drawerSaving ? <Loader size={12} className="spin" /> : <Check size={12} />} Save
                                                                    </button>
                                                                    <button className="drawer-action-btn cancel" onClick={() => setEditingBlockIdx(null)}>
                                                                        <X size={12} /> Cancel
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button className="drawer-action-btn edit" onClick={() => { setEditingBlockIdx(idx); setEditBlockTitle(section.title); setEditBlockBody(section.body); }}>
                                                                    <Pencil size={12} /> Edit
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {editingBlockIdx === idx ? (
                                                        <textarea
                                                            className="drawer-edit-textarea"
                                                            value={editBlockBody}
                                                            onChange={(e) => setEditBlockBody(e.target.value)}
                                                            rows={8}
                                                            placeholder="Section content…"
                                                        />
                                                    ) : (
                                                        <pre className="project-prd-viewer" style={{ maxHeight: '250px', overflow: 'auto', fontSize: '0.9375rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{section.body || '—'}</pre>
                                                    )}
                                                </div>
                                            ));
                                        })()}
                                        {/* Add Section button */}
                                        {showAddSection ? (
                                            <div className="drawer-section drawer-add-section-form">
                                                <input
                                                    className="drawer-edit-title-input"
                                                    value={addingSectionTitle}
                                                    onChange={(e) => setAddingSectionTitle(e.target.value)}
                                                    placeholder="New section title…"
                                                    autoFocus
                                                />
                                                <textarea
                                                    className="drawer-edit-textarea"
                                                    value={addingSectionBody}
                                                    onChange={(e) => setAddingSectionBody(e.target.value)}
                                                    rows={5}
                                                    placeholder="Section content…"
                                                />
                                                <div className="drawer-block-actions" style={{ justifyContent: 'flex-end', padding: '0.5rem 0 0' }}>
                                                    <button className="drawer-action-btn save" onClick={addNewSection} disabled={drawerSaving || !addingSectionTitle.trim()}>
                                                        {drawerSaving ? <Loader size={12} className="spin" /> : <Check size={12} />} Add
                                                    </button>
                                                    <button className="drawer-action-btn cancel" onClick={() => { setShowAddSection(false); setAddingSectionTitle(''); setAddingSectionBody(''); }}>
                                                        <X size={12} /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button className="drawer-add-section-btn" onClick={() => setShowAddSection(true)}>
                                                <Plus size={14} /> Add Section
                                            </button>
                                        )}
                                    </>
                                ) : drawerViewMode === 'raw' ? (
                                    /* Raw mode: plain markdown source with edit toggle */
                                    <div className="drawer-section">
                                        <div className="drawer-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <div className="drawer-block-actions">
                                                {rawEditing ? (
                                                    <>
                                                        <button className="drawer-action-btn save" onClick={saveRawEdit} disabled={drawerSaving}>
                                                            {drawerSaving ? <Loader size={12} className="spin" /> : <Check size={12} />} Save
                                                        </button>
                                                        <button className="drawer-action-btn cancel" onClick={() => setRawEditing(false)}>
                                                            <X size={12} /> Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="drawer-action-btn edit" onClick={() => { setRawEditing(true); setRawEditContent(drawerStory.content || ''); }}>
                                                        <Pencil size={12} /> Edit
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {rawEditing ? (
                                            <textarea
                                                className="drawer-edit-textarea drawer-raw-textarea"
                                                value={rawEditContent}
                                                onChange={(e) => setRawEditContent(e.target.value)}
                                                rows={20}
                                                placeholder="Markdown content…"
                                            />
                                        ) : (
                                            <pre className="project-prd-viewer" style={{ overflow: 'auto', fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6, fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace' }}>{drawerStory.content || '—'}</pre>
                                        )}
                                    </div>
                                ) : (
                                    /* Preview mode: VS Code-style rendered markdown */
                                    <div className="drawer-section drawer-preview-content vscode-markdown-preview">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {drawerStory.content || ''}
                                        </ReactMarkdown>
                                    </div>
                                )}
                                <div className="drawer-section">
                                    <div className="drawer-section-title">
                                        <span>Artifacts</span>
                                        <button className="story-generate-btn" onClick={() => handleGenerateForStory(drawerStory.id)}>
                                            + Generate
                                        </button>
                                    </div>
                                    {storyArtifactsLoading ? (
                                        <div className="story-artifacts-loading">Loading...</div>
                                    ) : storyArtifacts.length === 0 ? (
                                        <div className="story-artifacts-empty">
                                            <span>No artifacts yet</span>
                                        </div>
                                    ) : (
                                        storyArtifacts.map(a => (
                                            <div key={a.id} className="story-artifact-row" style={{ cursor: 'pointer' }} onClick={() => openArtifactViewer(a.id)}>
                                                <span className={`artifact-type-chip ${a.type}`}>{a.type.toUpperCase()}</span>
                                                <span className="story-artifact-title">{a.title}</span>
                                                <span className="story-artifact-version">v{a.version}</span>
                                                <span className="story-artifact-time">{new Date(a.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ===== ARTIFACT VIEWER DRAWER ===== */}
            {artViewerOpen && (
                <div className="prd-chat-overlay" onClick={() => setArtViewerOpen(false)}>
                    <div className="prd-chat-panel" onClick={(e) => e.stopPropagation()} style={{ width: drawerWidth }}>
                        <div
                            className="panel-resize-handle"
                            onMouseDown={() => {
                                isResizingDrawer.current = true;
                                document.body.style.cursor = 'col-resize';
                                document.body.style.userSelect = 'none';
                                const onMove = (ev: MouseEvent) => {
                                    if (!isResizingDrawer.current) return;
                                    const newWidth = Math.max(380, Math.min(window.innerWidth * 0.85, window.innerWidth - ev.clientX));
                                    setDrawerWidth(newWidth);
                                };
                                const onUp = () => {
                                    isResizingDrawer.current = false;
                                    document.body.style.cursor = '';
                                    document.body.style.userSelect = '';
                                    window.removeEventListener('mousemove', onMove);
                                    window.removeEventListener('mouseup', onUp);
                                };
                                window.addEventListener('mousemove', onMove);
                                window.addEventListener('mouseup', onUp);
                            }}
                        />
                        <div className="drawer-header">
                            <div className="drawer-title">
                                <span className="drawer-subtitle">Artifact Viewer</span>
                                <h3>{artViewerData ? `${artViewerData.type.replace(/-/g, ' ').toUpperCase()} v${artViewerData.version}` : 'Loading...'}</h3>
                            </div>
                            <button className="prd-chat-close" onClick={() => setArtViewerOpen(false)} aria-label="Close"><X size={18} /></button>
                        </div>
                        {/* Tab bar */}
                        <div className="drawer-tab-bar">
                            <div className="drawer-tabs">
                                <button className={`drawer-tab${artViewerMode === 'bricks' ? ' active' : ''}`} onClick={() => setArtViewerMode('bricks')}>
                                    <Layers size={13} /> Block Bricks
                                </button>
                                <button className={`drawer-tab${artViewerMode === 'raw' ? ' active' : ''}`} onClick={() => setArtViewerMode('raw')}>
                                    <FileText size={13} /> Raw
                                </button>
                                <button className={`drawer-tab${artViewerMode === 'preview' ? ' active' : ''}`} onClick={() => setArtViewerMode('preview')}>
                                    <Eye size={13} /> Preview
                                </button>
                            </div>
                            <button
                                className="drawer-copy-btn"
                                onClick={() => {
                                    navigator.clipboard.writeText(artViewerData?.content || '');
                                    setArtViewerCopied(true);
                                    setTimeout(() => setArtViewerCopied(false), 2000);
                                }}
                                title="Copy content"
                            >
                                {artViewerCopied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                            </button>
                        </div>
                        <div className="drawer-content">
                            {artViewerLoading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}><Loader size={20} className="spin" /> Loading artifact...</div>
                            ) : !artViewerData ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>Artifact not found</div>
                            ) : artViewerMode === 'bricks' ? (
                                /* Block Bricks mode */
                                <>
                                    {parseStorySections(artViewerData.content || '').map((section, idx) => (
                                        <div key={idx} className="drawer-block">
                                            <div className="drawer-block-header">
                                                <span className="drawer-block-title">{section.title || `Block ${idx + 1}`}</span>
                                            </div>
                                            <div className="drawer-block-body">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.body}</ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : artViewerMode === 'raw' ? (
                                /* Raw mode */
                                <div className="drawer-section">
                                    <div className="drawer-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <div className="drawer-block-actions">
                                            {artRawEditing ? (
                                                <>
                                                    <button className="drawer-action-btn save" disabled={artSaving} onClick={async () => {
                                                        if (!artViewerData) return;
                                                        setArtSaving(true);
                                                        try {
                                                            await fetch(`${API_URL}/api/generate/artifact/${artViewerData.id}`, {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ content: artRawContent }),
                                                            });
                                                            setArtViewerData({ ...artViewerData, content: artRawContent });
                                                            setArtRawEditing(false);
                                                        } catch { /* ignore */ }
                                                        setArtSaving(false);
                                                    }}>
                                                        {artSaving ? <Loader size={12} className="spin" /> : <Check size={12} />} Save
                                                    </button>
                                                    <button className="drawer-action-btn cancel" onClick={() => setArtRawEditing(false)}>
                                                        <X size={12} /> Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="drawer-action-btn edit" onClick={() => { setArtRawEditing(true); setArtRawContent(artViewerData.content || ''); }}>
                                                    <Pencil size={12} /> Edit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {artRawEditing ? (
                                        <textarea
                                            className="drawer-edit-textarea drawer-raw-textarea"
                                            value={artRawContent}
                                            onChange={(e) => setArtRawContent(e.target.value)}
                                            rows={20}
                                            placeholder="Markdown content…"
                                        />
                                    ) : (
                                        <pre className="project-prd-viewer" style={{ overflow: 'auto', fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6, fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace' }}>{artViewerData.content || '—'}</pre>
                                    )}
                                </div>
                            ) : (
                                /* Preview mode — with special renderers for diagrams */
                                <div className="drawer-section drawer-preview-content vscode-markdown-preview">
                                    {artViewerData.type === 'erd' ? (
                                        /* ERD → dbdiagram.io embed */
                                        (() => {
                                            const dbmlContent = (artViewerData.content || '').replace(/^```(?:dbml)?\n?/m, '').replace(/\n?```$/m, '').trim();
                                            const encoded = btoa(unescape(encodeURIComponent(dbmlContent)));
                                            return (
                                                <div style={{ width: '100%', height: '600px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                    <iframe
                                                        src={`https://dbdiagram.io/embed?c=${encodeURIComponent(encoded)}`}
                                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                                        title="ERD Diagram"
                                                        sandbox="allow-scripts allow-same-origin"
                                                    />
                                                </div>
                                            );
                                        })()
                                    ) : ['sequence-diagram', 'use-case-diagram'].includes(artViewerData.type) ? (
                                        /* PlantUML diagrams → server-side SVG render */
                                        (() => {
                                            const umlContent = (artViewerData.content || '').replace(/^```(?:plantuml|puml)?\n?/m, '').replace(/\n?```$/m, '').trim();
                                            const encoded = plantumlEncoder.encode(umlContent);
                                            return (
                                                <div style={{ textAlign: 'center', padding: '1rem' }}>
                                                    <img
                                                        src={`https://www.plantuml.com/plantuml/svg/${encoded}`}
                                                        alt={`${artViewerData.type} diagram`}
                                                        style={{ maxWidth: '100%', borderRadius: '8px', background: '#fff', padding: '1rem' }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div style="color:var(--text-dim);padding:2rem">Failed to render PlantUML diagram. Check syntax.</div>';
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })()
                                    ) : ['flowchart', 'activity-diagram'].includes(artViewerData.type) ? (
                                        /* Mermaid diagrams → render via markdown code fence */
                                        (() => {
                                            const mermaidContent = (artViewerData.content || '').replace(/^```(?:mermaid)?\n?/m, '').replace(/\n?```$/m, '').trim();
                                            return (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {'```mermaid\n' + mermaidContent + '\n```'}
                                                </ReactMarkdown>
                                            );
                                        })()
                                    ) : (
                                        /* Standard markdown preview */
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {artViewerData.content || ''}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== ADD STORY SIDE PANEL (Jira-style Draft Mode) ===== */}
            {storyDraft && (
                <div className="prd-chat-overlay" onClick={() => setStoryDraft(null)}>
                    <div className="prd-chat-panel" onClick={(e) => e.stopPropagation()} style={{ width: panelWidth }}>
                        <div className="panel-resize-handle" onMouseDown={startPanelResize} />
                        {/* Header */}
                        <div className="prd-chat-header">
                            <div className="prd-chat-header-left">
                                <div className="prd-chat-header-icon"><FileText size={18} /></div>
                                <div>
                                    <div className="prd-chat-header-title">Add Story</div>
                                    <div className="prd-chat-header-subtitle">Draft — not saved yet</div>
                                </div>
                            </div>
                            <div className="prd-chat-header-actions">
                                <button className="prd-chat-close" onClick={() => setStoryDraft(null)} aria-label="Close"><X size={18} /></button>
                            </div>
                        </div>

                        {/* Tab switcher */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 1.5rem' }}>
                            {(['editor', 'upload'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setStoryDraftMode(tab)}
                                    style={{
                                        flex: 1, padding: '0.75rem 0', fontSize: '0.875rem', fontWeight: 600,
                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                        color: storyDraftMode === tab ? 'var(--accent)' : 'var(--text-dim)',
                                        borderBottom: storyDraftMode === tab ? '2px solid var(--accent)' : '2px solid transparent',
                                        transition: 'all 0.15s ease',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                                    }}
                                >
                                    {tab === 'editor' ? <><Edit3 size={14} /> Editor</> : <><Upload size={14} /> Upload</>}
                                </button>
                            ))}
                        </div>

                        {/* Panel Content */}
                        <div className="prd-chat-messages" style={{ padding: '1.5rem' }}>
                            {storyDraftMode === 'editor' ? (
                                <>
                                    {/* Title */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
                                            Story Title <span style={{ color: 'var(--danger)' }}>*</span>
                                        </label>
                                        <input
                                            className="input"
                                            placeholder="e.g. US-001: User Registration"
                                            value={storyDraft.title}
                                            onChange={(e) => setStoryDraft({ ...storyDraft, title: e.target.value })}
                                            style={{ fontSize: '0.9375rem' }}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Content Editor */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                Content <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(markdown)</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!storyDraft.content.trim() || confirm('Replace current content with template?')) {
                                                        setStoryDraft({ ...storyDraft, content: STORY_TEMPLATE });
                                                    }
                                                }}
                                                style={{
                                                    background: 'transparent', border: '1px solid var(--border-light)',
                                                    borderRadius: '0.375rem', padding: '0.25rem 0.5rem',
                                                    fontSize: '0.75rem', color: 'var(--text-dim)', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                    transition: 'all 0.15s ease',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
                                            >
                                                📋 Insert Template
                                            </button>
                                        </div>
                                        <textarea
                                            className="input"
                                            placeholder={'As a [role], I want [action], so that [benefit].\n\n**Acceptance Criteria:**\n- Given ... When ... Then ...'}
                                            value={storyDraft.content}
                                            onChange={(e) => setStoryDraft({ ...storyDraft, content: e.target.value })}
                                            rows={12}
                                            style={{ fontSize: '0.875rem', resize: 'vertical', minHeight: '200px', fontFamily: 'monospace' }}
                                        />
                                    </div>

                                    {/* Create Story button */}
                                    <button
                                        className="btn btn-primary btn-sm"
                                        style={{ width: '100%' }}
                                        disabled={!storyDraft.title.trim() || storyDraftSaving}
                                        onClick={async () => {
                                            if (!storyDraft.title.trim() || storyDraftSaving) return;
                                            setStoryDraftSaving(true);
                                            try {
                                                const res = await fetch(`${API_URL}/api/artifact-chat/story`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ epicId: storyDraft.epicId, title: storyDraft.title, content: storyDraft.content }),
                                                });
                                                const data = await res.json();
                                                setStoryDraft(null);
                                                setStoryDraftMode('editor');
                                                fetchEpics();
                                                // Auto-open drawer with newly created story
                                                if (data.success && data.data) {
                                                    setDrawerStory(data.data);
                                                    setStoryDrawerOpen(true);
                                                    fetchStoryArtifacts(data.data.id);
                                                }
                                            } finally {
                                                setStoryDraftSaving(false);
                                            }
                                        }}
                                    >
                                        {storyDraftSaving ? <><Loader size={13} className="spin" /> Creating...</> : <><Save size={13} /> Create Story</>}
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Upload drop zone */}
                                    <div
                                        style={{
                                            border: '2px dashed var(--border-light)', borderRadius: '0.75rem',
                                            padding: '2rem', textAlign: 'center', cursor: 'pointer',
                                            transition: 'all 0.15s ease', marginBottom: '1rem',
                                            background: 'var(--bg-input)',
                                        }}
                                        onClick={() => storyDraftFileInputRef.current?.click()}
                                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                        onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.style.borderColor = 'var(--border-light)';
                                            const file = e.dataTransfer.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    const text = ev.target?.result as string;
                                                    if (text) {
                                                        setStoryDraft({ ...storyDraft, content: normalizeUploadedStoryContent(text) });
                                                        setStoryDraftMode('editor');
                                                    }
                                                };
                                                reader.readAsText(file);
                                            }
                                        }}
                                    >
                                        <Upload size={28} style={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }} />
                                        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                            Drop file here or click to browse
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                            Accepts .md, .txt, and .doc files
                                        </div>
                                    </div>

                                    <input
                                        ref={storyDraftFileInputRef}
                                        type="file"
                                        accept=".md,.txt,.markdown,.doc"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    const text = ev.target?.result as string;
                                                    if (text) {
                                                        setStoryDraft({ ...storyDraft, content: normalizeUploadedStoryContent(text) });
                                                        setStoryDraftMode('editor');
                                                    }
                                                };
                                                reader.readAsText(file);
                                            }
                                        }}
                                    />

                                    <div style={{
                                        fontSize: '0.75rem', color: 'var(--text-dim)', background: 'var(--bg-input)',
                                        borderRadius: '0.5rem', padding: '0.75rem',
                                        border: '1px solid var(--border-light)',
                                    }}>
                                        <strong>Tip:</strong> File content will be loaded into the editor tab where you can review and edit before saving.
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== GUIDE SLIDER ===== */}
            {selectedGuide && GUIDE_CONTENT[selectedGuide] && (() => {
                const guide = GUIDE_CONTENT[selectedGuide];
                const Icon = guide.icon;
                return (
                    <div className="prd-chat-overlay" onClick={() => setSelectedGuide(null)}>
                        <div className="prd-chat-panel" onClick={(e) => e.stopPropagation()} style={{ width: panelWidth }}>
                            <div className="panel-resize-handle" onMouseDown={startPanelResize} />
                            {/* Header */}
                            <div className="prd-chat-header">
                                <div className="prd-chat-header-left">
                                    <div className="prd-chat-header-icon">
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <div className="prd-chat-header-title">{guide.title}</div>
                                        <div className="prd-chat-header-subtitle">Hướng dẫn sử dụng</div>
                                    </div>
                                </div>
                                <div className="prd-chat-header-actions">
                                    <button className="prd-chat-close" onClick={() => setSelectedGuide(null)}>
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                                {/* Intro */}
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{guide.intro}</p>

                                {/* Steps */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {guide.steps.map((step, i) => (
                                        <div key={i} style={{
                                            background: 'var(--bg-input)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0.75rem',
                                            padding: '1rem 1.25rem',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                                <span style={{ fontSize: '1.1rem' }}>{step.emoji}</span>
                                                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    Bước {i + 1}: {step.heading}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>{step.body}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Tip */}
                                {guide.tip && (
                                    <div style={{
                                        marginTop: '1.25rem',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(99,102,241,0.08)',
                                        borderRadius: '0.5rem',
                                        borderLeft: '3px solid var(--primary)',
                                    }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            💡 <strong>Tip:</strong> {guide.tip}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Footer CTA */}
                            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' }}>
                                <button
                                    onClick={() => {
                                        setSelectedGuide(null);
                                        if (guide.ctaTab) setActiveTab(guide.ctaTab);
                                        if (guide.ctaHref) window.location.href = guide.ctaHref;
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1.5rem',
                                        background: 'var(--primary)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'opacity 0.15s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                                >
                                    {guide.ctaLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div >
    );
}
