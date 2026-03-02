'use client';

import { useState, useRef, useCallback, type ChangeEvent, type DragEvent, type TextareaHTMLAttributes } from 'react';
import { Upload, X, FileText } from 'lucide-react';

const ACCEPTED_EXTENSIONS = ['.txt', '.md', '.markdown'];
const ACCEPTED_MIME = ['text/plain', 'text/markdown', 'text/x-markdown'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileUploadTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    /** Current textarea value */
    value: string;
    /** Called when value changes (typing or file upload) */
    onChange: (value: string) => void;
    /** Optional label displayed above the textarea */
    label?: string;
    /** Show char count below textarea. Default: true */
    showCharCount?: boolean;
    /** Custom class for the textarea */
    textareaClassName?: string;
    /** Called after a file is loaded: (filename, content) */
    onFileLoad?: (filename: string, content: string) => void;
}

export default function FileUploadTextarea({
    value,
    onChange,
    label,
    showCharCount = true,
    textareaClassName,
    onFileLoad,
    className,
    ...textareaProps
}: FileUploadTextareaProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const pendingContent = useRef<{ name: string; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    const validateFile = useCallback((file: File): string | null => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ACCEPTED_EXTENSIONS.includes(ext) && !ACCEPTED_MIME.includes(file.type)) {
            return `Unsupported file type. Accepted: ${ACCEPTED_EXTENSIONS.join(', ')}`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 10MB`;
        }
        return null;
    }, []);

    const applyContent = useCallback((name: string, text: string) => {
        onChange(text);
        setUploadedFile(name);
        setError(null);
        onFileLoad?.(name, text);
    }, [onChange, onFileLoad]);

    const processFile = useCallback((file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (value.trim().length > 0) {
                // Content exists — ask for confirmation
                pendingContent.current = { name: file.name, text };
                setShowConfirm(true);
            } else {
                applyContent(file.name, text);
            }
        };
        reader.onerror = () => setError('Failed to read file');
        reader.readAsText(file, 'utf-8');
    }, [validateFile, value, applyContent]);

    const handleConfirmReplace = useCallback(() => {
        if (pendingContent.current) {
            applyContent(pendingContent.current.name, pendingContent.current.text);
            pendingContent.current = null;
        }
        setShowConfirm(false);
    }, [applyContent]);

    const handleCancelReplace = useCallback(() => {
        pendingContent.current = null;
        setShowConfirm(false);
    }, []);

    // --- Drag & Drop ---
    const handleDragEnter = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.types.includes('Files')) {
            setIsDragging(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    // --- File Input ---
    const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        // Reset so same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [processFile]);

    const handleClear = useCallback(() => {
        onChange('');
        setUploadedFile(null);
        setError(null);
    }, [onChange]);

    return (
        <div className={`fut-root ${className || ''}`}>
            {/* Label row with upload button */}
            {(label || true) && (
                <div className="fut-header">
                    {label && <label className="fut-label">{label}</label>}
                    <div className="fut-actions">
                        {uploadedFile && (
                            <span className="fut-file-badge">
                                <FileText size={12} />
                                {uploadedFile}
                                <button onClick={handleClear} className="fut-file-badge-x" aria-label="Clear" type="button">
                                    <X size={10} />
                                </button>
                            </span>
                        )}
                        <button
                            type="button"
                            className="fut-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Upload .md or .txt file"
                        >
                            <Upload size={14} />
                            Upload
                        </button>
                    </div>
                </div>
            )}

            {/* Drop zone wrapper */}
            <div
                className={`fut-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {isDragging && (
                    <div className="fut-drop-overlay">
                        <Upload size={24} />
                        <span>Drop .md or .txt file</span>
                    </div>
                )}
                <textarea
                    {...textareaProps}
                    className={`fut-textarea ${textareaClassName || ''}`}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        if (uploadedFile) setUploadedFile(null);
                    }}
                />
            </div>

            {/* Footer: error / char count */}
            <div className="fut-footer">
                {error && <span className="fut-error">{error}</span>}
                {showCharCount && (
                    <span className="fut-char-count">{value.length.toLocaleString()} characters</span>
                )}
            </div>

            {/* Replace confirmation dialog */}
            {showConfirm && (
                <div className="fut-confirm-overlay" onClick={handleCancelReplace}>
                    <div className="fut-confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <p className="fut-confirm-text">
                            Replace existing content with <strong>{pendingContent.current?.name}</strong>?
                        </p>
                        <div className="fut-confirm-actions">
                            <button className="btn btn-primary btn-sm" onClick={handleConfirmReplace}>Replace</button>
                            <button className="btn btn-ghost btn-sm" onClick={handleCancelReplace}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS.join(',')}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                aria-hidden="true"
            />
        </div>
    );
}
