// === BSA Kit Shared Types ===

// --- Project ---
export interface Project {
    id: string;
    name: string;
    description?: string;
    prdContent?: string;
    createdAt: Date;
    updatedAt: Date;
}

// --- Artifact ---
export type ArtifactType = 'user-story' | 'function-list' | 'srs' | 'erd' | 'sql'
    | 'flowchart' | 'sequence-diagram' | 'use-case-diagram' | 'activity-diagram'
    | 'screen-description';

export interface Artifact {
    id: string;
    type: ArtifactType;
    content: string;
    version: number;
    projectId: string;
    createdAt: Date;
}

// --- MCP Connection ---
export type MCPServerType = 'figma' | 'confluence' | 'github' | 'notion' | 'jira' | 'linear' | 'sentry' | 'google-docs';
export type MCPConnectionStatus = 'connected' | 'disconnected' | 'error';

export interface MCPConnection {
    id: string;
    name: string;
    type: MCPServerType;
    config: string; // encrypted JSON
    status: MCPConnectionStatus;
    projectId: string;
}

// --- API Responses ---
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    page: number;
    pageSize: number;
}

// --- Pipeline ---
export type PipelineStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface PipelineRun {
    id: string;
    projectId: string;
    status: PipelineStatus;
    artifactTypes: ArtifactType[];
    progress: number; // 0-100
    startedAt: Date;
    completedAt?: Date;
}

// --- AI Engine ---
export type AIProvider = 'claude' | 'gemini';
export type AITaskType =
    | 'prd-parsing'
    | 'user-story-gen'
    | 'function-list-gen'
    | 'srs-generation'
    | 'figma-analysis'
    | 'erd-generation'
    | 'sql-generation'
    | 'flowchart-gen'
    | 'sequence-diagram-gen'
    | 'use-case-diagram-gen'
    | 'activity-diagram-gen'
    | 'screen-description-gen'
    | 'structure-extraction'
    | 'prd-generation'
    | 'prd-validation'
    | 'prd-fix'
    | 'analysis-chat';

export interface AIRequest {
    taskType: AITaskType;
    prompt: string;
    context?: string;
    preferredProvider?: AIProvider;
}

export interface AIResponse {
    content: string;
    provider: AIProvider;
    tokensUsed: {
        input: number;
        output: number;
    };
    latencyMs: number;
}
