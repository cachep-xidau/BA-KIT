'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    X,
    Send,
    Bot,
    User,
    Sparkles,
    Plus,
    FolderOpen,
    Loader,
    Lightbulb,
    TrendingUp,
    Building2,
    Wrench,
    Briefcase,
    Trash2,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

type AnalysisType = 'brainstorm' | 'market-research' | 'domain-research' | 'technical-research' | 'product-brief';

const ANALYSIS_META: Record<AnalysisType, { name: string; icon: typeof Lightbulb; greeting: string }> = {
    'brainstorm': {
        name: 'Brainstorming',
        icon: Lightbulb,
        greeting: `Chào bạn! 🧠 Tôi là **BMAD Brainstorming Facilitator** — sẽ hỗ trợ bạn khám phá ý tưởng bằng các kỹ thuật sáng tạo đa dạng.

Phiên brainstorming tốt nhất khi chúng ta vượt qua những ý tưởng hiển nhiên để đến vùng đất mới. Tôi có **30+ kỹ thuật sáng tạo** sẵn sàng — từ SCAMPER, Six Thinking Hats đến Reverse Brainstorming, Chaos Engineering...

**Hãy bắt đầu:**
1. **Chủ đề / vấn đề** bạn muốn brainstorm là gì?
2. **Mục tiêu cụ thể** — bạn muốn đạt được gì từ phiên này?`,
    },
    'market-research': {
        name: 'Market Research',
        icon: TrendingUp,
        greeting: `Chào bạn! 📊 Tôi là **BMAD Market Research Facilitator** — chúng ta sẽ cùng nghiên cứu thị trường như hai đồng nghiệp, bạn mang kiến thức domain, tôi mang phương pháp nghiên cứu.

**Hãy bắt đầu với:**
1. **Thị trường / ngành** bạn muốn nghiên cứu?
2. **Mục tiêu** nghiên cứu (đánh giá cơ hội, phân tích đối thủ, sizing)?
3. **Phạm vi** — toàn cầu, khu vực, hay quốc gia cụ thể?

Ví dụ: "Thị trường fintech tại Việt Nam", "E-commerce B2B tại SEA"`,
    },
    'domain-research': {
        name: 'Domain Research',
        icon: Building2,
        greeting: `Chào bạn! 🏭 Tôi là **BMAD Domain Research Facilitator** — sẽ giúp bạn deep-dive vào lĩnh vực mục tiêu với phương pháp nghiên cứu có cấu trúc.

**Hãy bắt đầu với:**
1. **Lĩnh vực / ngành** cần nghiên cứu sâu?
2. **Mục tiêu** — hiểu thuật ngữ, quy trình, quy định, hay best practices?
3. **Mức độ hiểu biết** hiện tại về domain này?

Ví dụ: "Healthcare SaaS", "Supply Chain Logistics", "EdTech K-12"`,
    },
    'technical-research': {
        name: 'Technical Research',
        icon: Wrench,
        greeting: `Chào bạn! 🏗️ Tôi là **BMAD Technical Research Facilitator** — sẽ giúp bạn đánh giá các lựa chọn kỹ thuật và đưa ra quyết định kiến trúc dựa trên evidence.

**Hãy bắt đầu với:**
1. **Chủ đề kỹ thuật** cần nghiên cứu?
2. **Bài toán** cần giải quyết?
3. **Constraints** — ràng buộc (budget, team size, timeline)?

Ví dụ: "Chọn database cho real-time analytics", "Kiến trúc microservices vs monolith"`,
    },
    'product-brief': {
        name: 'Product Brief',
        icon: Briefcase,
        greeting: `Chào bạn! 📝 Tôi là **BMAD Product Brief Facilitator** — chúng ta sẽ cùng xây dựng product brief như hai đồng nghiệp: bạn mang kiến thức domain, tôi mang structured thinking.

**Hãy bắt đầu với WHY trước WHAT:**
1. **Product Vision** — tầm nhìn sản phẩm?
2. **Problem Statement** — vấn đề cần giải quyết?
3. **Target Users** — người dùng mục tiêu?
4. **Value Proposition** — giá trị cốt lõi?`,
    },
};

/** Simple markdown renderer */
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
        const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={`${lineKey}-${i}`}>{part.slice(2, -2)}</strong>;
            if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={`${lineKey}-${i}`}>{part.slice(1, -1)}</em>;
            if (part.startsWith('`') && part.endsWith('`')) return <code key={`${lineKey}-${i}`} className="prd-md-code">{part.slice(1, -1)}</code>;
            return part;
        });
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trimStart();
        if (/^[-*_]{3,}\s*$/.test(trimmed)) { flushList(); elements.push(<hr key={`hr-${idx}`} className="prd-md-hr" />); return; }
        const h3 = trimmed.match(/^###\s+(.*)/); if (h3) { flushList(); elements.push(<h3 key={`h3-${idx}`} className="prd-md-h3">{inlineFormat(h3[1], idx)}</h3>); return; }
        const h2 = trimmed.match(/^##\s+(.*)/); if (h2) { flushList(); elements.push(<h2 key={`h2-${idx}`} className="prd-md-h2">{inlineFormat(h2[1], idx)}</h2>); return; }
        const h1 = trimmed.match(/^#\s+(.*)/); if (h1) { flushList(); elements.push(<h1 key={`h1-${idx}`} className="prd-md-h1">{inlineFormat(h1[1], idx)}</h1>); return; }
        const ol = trimmed.match(/^(\d+)\.\s+(.*)/);
        const ul = trimmed.match(/^[-*]\s+(.*)/);
        if (ol) { if (listType !== 'ol') { flushList(); listType = 'ol'; } listItems.push(<li key={`li-${idx}`}>{inlineFormat(ol[2], idx)}</li>); }
        else if (ul) { if (listType !== 'ul') { flushList(); listType = 'ul'; } listItems.push(<li key={`li-${idx}`}>{inlineFormat(ul[1], idx)}</li>); }
        else { flushList(); if (trimmed === '') { elements.push(<div key={`br-${idx}`} className="prd-md-break" />); } else { elements.push(<p key={`p-${idx}`} className="prd-md-para">{inlineFormat(trimmed, idx)}</p>); } }
    });
    flushList();
    return <>{elements}</>;
}

interface AnalysisSliderProps {
    projectId: string;
    projectName: string;
    analysisType: AnalysisType;
    open: boolean;
    onClose: () => void;
    onSessionSaved?: () => void;
}

export default function AnalysisSlider({ projectId, projectName, analysisType, open, onClose, onSessionSaved }: AnalysisSliderProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasMemory, setHasMemory] = useState(false);
    const [memoryLoaded, setMemoryLoaded] = useState(false);
    const [initialCheckDone, setInitialCheckDone] = useState(false);
    const [saving, setSaving] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const meta = ANALYSIS_META[analysisType];
    const Icon = meta.icon;

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Check for saved session on open
    useEffect(() => {
        if (!open) {
            setInitialCheckDone(false);
            return;
        }
        setInitialCheckDone(false);
        setMemoryLoaded(false);
        (async () => {
            try {
                const res = await fetch(`${API_URL}/api/analysis/memory/${projectId}/${analysisType}`);
                const data = await res.json();
                if (data.success && data.data && data.data.messages?.length > 0) {
                    setHasMemory(true);
                    // Auto-load the saved session
                    setMessages(data.data.messages);
                    setMemoryLoaded(true);
                } else {
                    setHasMemory(false);
                    // Start fresh
                    setMessages([{ role: 'assistant', content: meta.greeting }]);
                }
            } catch {
                setMessages([{ role: 'assistant', content: meta.greeting }]);
            }
            setInitialCheckDone(true);
            setTimeout(() => inputRef.current?.focus(), 150);
        })();
    }, [open, projectId, analysisType, meta.greeting]);

    // Auto-save (debounced)
    const saveSession = useCallback(async (msgs: ChatMessage[]) => {
        if (msgs.length <= 1) return; // Don't save just the greeting
        setSaving(true);
        try {
            await fetch(`${API_URL}/api/analysis/memory/${projectId}/${analysisType}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: msgs }),
            });
            onSessionSaved?.();
        } catch { /* ignore */ }
        setSaving(false);
    }, [projectId, analysisType, onSessionSaved]);

    const debouncedSave = useCallback((msgs: ChatMessage[]) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => saveSession(msgs), 1500);
    }, [saveSession]);

    // Save on close
    const handleClose = useCallback(() => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        if (messages.length > 1) {
            saveSession(messages);
        }
        onClose();
    }, [messages, saveSession, onClose]);

    // New session
    const startNewSession = useCallback(async () => {
        try {
            await fetch(`${API_URL}/api/analysis/memory/${projectId}/${analysisType}`, { method: 'DELETE' });
        } catch { /* ignore */ }
        setHasMemory(false);
        setMemoryLoaded(false);
        setMessages([{ role: 'assistant', content: meta.greeting }]);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [projectId, analysisType, meta.greeting]);

    // Send message
    const sendMessage = useCallback(async () => {
        if (!input.trim() || loading) return;
        const userMsg: ChatMessage = { role: 'user', content: input.trim() };
        const newMsgs = [...messages, userMsg];
        setMessages(newMsgs);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/analysis/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    messages: newMsgs,
                    step: 0,
                    type: analysisType,
                }),
            });
            const data = await res.json();
            if (data.success) {
                const withResponse = [...newMsgs, { role: 'assistant' as const, content: data.data.content }];
                setMessages(withResponse);
                debouncedSave(withResponse);
            } else {
                const withError = [...newMsgs, { role: 'assistant' as const, content: `⚠️ Lỗi: ${data.error || 'Unknown error'}` }];
                setMessages(withError);
            }
        } catch {
            setMessages([...newMsgs, { role: 'assistant', content: 'Lỗi kết nối. Vui lòng thử lại.' }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [input, loading, messages, projectId, analysisType, debouncedSave]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!open) return null;

    return (
        <div className="analysis-slider-overlay" onClick={handleClose}>
            <div className="analysis-slider-panel" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="analysis-slider-header">
                    <div className="analysis-slider-header-left">
                        <div className="analysis-slider-header-icon">
                            <Icon size={20} />
                        </div>
                        <div>
                            <h2 className="analysis-slider-title">AI {meta.name}</h2>
                            <p className="analysis-slider-subtitle">{projectName}</p>
                        </div>
                    </div>
                    <div className="analysis-slider-header-actions">
                        <button
                            className="analysis-slider-action-btn"
                            onClick={startNewSession}
                            title="New Session"
                        >
                            <Plus size={14} /> New
                        </button>
                        {saving && (
                            <span className="analysis-slider-save-indicator">
                                <Loader size={12} className="spin" /> Saving...
                            </span>
                        )}
                        {memoryLoaded && !saving && (
                            <span className="analysis-slider-save-indicator saved">
                                ✓ Loaded
                            </span>
                        )}
                        <button
                            className="analysis-slider-close"
                            onClick={handleClose}
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="analysis-slider-messages">
                    {!initialCheckDone ? (
                        <div className="analysis-slider-loading-state">
                            <Loader size={24} className="spin" />
                            <p>Loading session...</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, i) => (
                                <div key={i} className={`analysis-slider-bubble ${msg.role}`}>
                                    <div className={`analysis-slider-avatar ${msg.role}`}>
                                        {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                                    </div>
                                    <div className="analysis-slider-bubble-wrap">
                                        <span className="analysis-slider-bubble-label">
                                            {msg.role === 'assistant' ? 'AI Assistant' : 'You'}
                                        </span>
                                        <div className={`analysis-slider-bubble-content ${msg.role}`}>
                                            {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="analysis-slider-bubble assistant">
                                    <div className="analysis-slider-avatar assistant"><Bot size={18} /></div>
                                    <div className="analysis-slider-bubble-wrap">
                                        <span className="analysis-slider-bubble-label">AI Assistant</span>
                                        <div className="analysis-slider-bubble-content assistant">
                                            <div className="prd-chat-typing"><span /><span /><span /></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input */}
                <div className="analysis-slider-input-area">
                    <div className="analysis-slider-input-wrap">
                        <textarea
                            ref={inputRef}
                            className="analysis-slider-textarea"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            rows={3}
                            disabled={loading || !initialCheckDone}
                        />
                        <div className="analysis-slider-input-footer">
                            <span className="analysis-slider-input-hint">AI can make mistakes. Verify critical requirements.</span>
                            <button
                                className="analysis-slider-send"
                                onClick={sendMessage}
                                disabled={!input.trim() || loading}
                                aria-label="Send"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
