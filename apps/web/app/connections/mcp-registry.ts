// MCP Server Registry — catalog of available servers organized by category

import type { LucideIcon } from 'lucide-react';
import {
    Figma,
    BookOpen,
    StickyNote,
    FileText,
    Sheet,
    SquareKanban,
    Zap,
    Github,
    Bug,
    Palette,
    ClipboardList,
    GitBranch,
    BarChart3,
    PieChart,
} from 'lucide-react';

// --- Types ---

export type MCPCategory =
    | 'design'
    | 'documentation'
    | 'project-management'
    | 'version-control'
    | 'monitoring';

/** Display groups for the unified Connections page view */
export type MCPDisplayGroup = 'design-docs' | 'dev-issues';

export interface CredentialField {
    key: string;
    label: string;
    type: 'text' | 'password' | 'url';
    placeholder: string;
    required: boolean;
}

export interface MCPServerEntry {
    id: string;
    name: string;
    subtitle: string;
    description: string;
    category: MCPCategory;
    displayGroup: MCPDisplayGroup;
    icon: LucideIcon;
    available: boolean;
    credentials: CredentialField[];
    docsUrl?: string;
}

export interface MCPCategoryInfo {
    id: MCPCategory;
    label: string;
    icon: LucideIcon;
}

export interface MCPDisplayGroupInfo {
    id: MCPDisplayGroup;
    label: string;
}

// --- Categories ---

export const MCP_CATEGORIES: MCPCategoryInfo[] = [
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'project-management', label: 'Project Management', icon: ClipboardList },
    { id: 'version-control', label: 'Version Control', icon: GitBranch },
    { id: 'monitoring', label: 'Monitoring', icon: BarChart3 },
];

export const MCP_DISPLAY_GROUPS: MCPDisplayGroupInfo[] = [
    { id: 'design-docs', label: 'DESIGN & DOCUMENTATION' },
    { id: 'dev-issues', label: 'DEVELOPMENT & ISSUES' },
];

// --- Server Catalog ---

export const MCP_SERVERS: MCPServerEntry[] = [
    // Design & Documentation
    {
        id: 'figma',
        name: 'Figma',
        subtitle: 'Design Context',
        description: 'Extract design data, layout info, and design tokens from Figma files',
        category: 'design',
        displayGroup: 'design-docs',
        icon: Figma,
        available: true,
        credentials: [
            { key: 'token', label: 'API Token', type: 'password', placeholder: 'figd_xxxxx', required: true },
        ],
        docsUrl: 'https://www.figma.com/developers/api',
    },
    {
        id: 'confluence',
        name: 'Confluence',
        subtitle: 'Architecture Docs',
        description: 'Access wiki pages, spaces, and documentation from Atlassian Confluence',
        category: 'documentation',
        displayGroup: 'design-docs',
        icon: BookOpen,
        available: true,
        credentials: [
            { key: 'baseUrl', label: 'Base URL', type: 'url', placeholder: 'https://yoursite.atlassian.net/wiki', required: true },
            { key: 'username', label: 'Username', type: 'text', placeholder: 'email@example.com', required: true },
            { key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Your API token', required: true },
        ],
        docsUrl: 'https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/',
    },
    {
        id: 'notion',
        name: 'Notion',
        subtitle: 'Knowledge Base',
        description: 'Sync documents, databases, and tasks from Notion workspaces',
        category: 'documentation',
        displayGroup: 'design-docs',
        icon: StickyNote,
        available: true,
        credentials: [
            { key: 'apiKey', label: 'Integration Token', type: 'password', placeholder: 'secret_xxxxx', required: true },
        ],
        docsUrl: 'https://www.notion.so/my-integrations',
    },

    // Development & Issues
    {
        id: 'github',
        name: 'GitHub',
        subtitle: 'Source Code',
        description: 'Access repos, PRs, issues, and source code for AI-powered analysis',
        category: 'version-control',
        displayGroup: 'dev-issues',
        icon: Github,
        available: true,
        credentials: [
            { key: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_xxxxx', required: true },
        ],
        docsUrl: 'https://github.com/settings/tokens',
    },
    {
        id: 'jira',
        name: 'Jira',
        subtitle: 'Issue Tracking',
        description: 'Fetch and push issues, track project progress, link artifacts to tickets',
        category: 'project-management',
        displayGroup: 'dev-issues',
        icon: SquareKanban,
        available: true,
        credentials: [
            { key: 'baseUrl', label: 'Jira URL', type: 'url', placeholder: 'https://yoursite.atlassian.net', required: true },
            { key: 'username', label: 'Email', type: 'text', placeholder: 'email@example.com', required: true },
            { key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Your API token', required: true },
        ],
        docsUrl: 'https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/',
    },
    {
        id: 'linear',
        name: 'Linear',
        subtitle: 'Issue Tracking',
        description: 'Modern project tracking with synced issues and team workflows',
        category: 'project-management',
        displayGroup: 'dev-issues',
        icon: Zap,
        available: true,
        credentials: [
            { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'lin_api_xxxxx', required: true },
        ],
        docsUrl: 'https://linear.app/settings/api',
    },

    // Monitoring (not shown in reference, but kept for completeness)
    {
        id: 'sentry',
        name: 'Sentry',
        subtitle: 'Error Tracking',
        description: 'Track errors, monitor performance, and debug production issues',
        category: 'monitoring',
        displayGroup: 'dev-issues',
        icon: Bug,
        available: true,
        credentials: [
            { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'sntrys_xxxxx', required: true },
            { key: 'org', label: 'Organization', type: 'text', placeholder: 'my-org', required: true },
        ],
        docsUrl: 'https://sentry.io/settings/auth-tokens/',
    },

    {
        id: 'google-docs',
        name: 'Google Docs',
        subtitle: 'Specifications',
        description: 'Read PRDs and specs from Google Docs',
        category: 'documentation',
        displayGroup: 'design-docs',
        icon: FileText,
        available: true,
        credentials: [
            { key: 'clientId', label: 'OAuth Client ID', type: 'text', placeholder: 'xxxx.apps.googleusercontent.com', required: true },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'GOCSPX-xxxxx', required: true },
            { key: 'refreshToken', label: 'Refresh Token', type: 'password', placeholder: '1//xxxxx', required: true },
        ],
        docsUrl: 'https://console.cloud.google.com/apis/credentials',
    },
    {
        id: 'google-sheets',
        name: 'Google Sheets',
        subtitle: 'Data & Reports',
        description: 'Read and write spreadsheet data for analysis and reporting',
        category: 'documentation',
        displayGroup: 'design-docs',
        icon: Sheet,
        available: true,
        credentials: [
            { key: 'clientId', label: 'OAuth Client ID', type: 'text', placeholder: 'xxxx.apps.googleusercontent.com', required: true },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'GOCSPX-xxxxx', required: true },
            { key: 'refreshToken', label: 'Refresh Token', type: 'password', placeholder: '1//xxxxx', required: true },
        ],
        docsUrl: 'https://console.cloud.google.com/apis/credentials',
    },
    {
        id: 'powerbi',
        name: 'Power BI',
        subtitle: 'Business Analytics',
        description: 'Query Power BI semantic models and generate insights from reports',
        category: 'monitoring',
        displayGroup: 'dev-issues',
        icon: PieChart,
        available: true,
        credentials: [
            { key: 'clientId', label: 'Application (Client) ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Your client secret value', required: true },
            { key: 'tenantId', label: 'Tenant (Directory) ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true },
            { key: 'workspaceId', label: 'Workspace ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: false },
        ],
        docsUrl: 'https://learn.microsoft.com/en-us/power-bi/developer/embedded/register-app',
    },
];

// --- Helpers ---

export function getServersByCategory(category: MCPCategory): MCPServerEntry[] {
    return MCP_SERVERS.filter((s) => s.category === category);
}

export function getServersByDisplayGroup(group: MCPDisplayGroup): MCPServerEntry[] {
    return MCP_SERVERS.filter((s) => s.displayGroup === group);
}

export function getServerById(id: string): MCPServerEntry | undefined {
    return MCP_SERVERS.find((s) => s.id === id);
}

export function getAvailableServers(): MCPServerEntry[] {
    return MCP_SERVERS.filter((s) => s.available);
}

export function searchServers(query: string): MCPServerEntry[] {
    const q = query.toLowerCase();
    return MCP_SERVERS.filter(
        (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.category.includes(q),
    );
}
