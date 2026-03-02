// MCP-related types for BSA Kit

export interface MCPServerConfig {
    id: string;
    name: string;
    type: string;
    transport: MCPTransportConfig;
}

export type MCPTransportConfig =
    | { type: 'stdio'; command: string; args?: string[]; env?: Record<string, string> }
    | { type: 'streamable-http'; url: string; headers?: Record<string, string> };

export interface MCPTool {
    name: string;
    description?: string;
    inputSchema: Record<string, unknown>;
    serverName: string;
}

export interface MCPToolCallResult {
    content: MCPContent[];
    isError?: boolean;
}

export type MCPContent =
    | { type: 'text'; text: string }
    | { type: 'image'; data: string; mimeType: string }
    | { type: 'resource'; resource: { uri: string; text?: string; blob?: string } };

export interface MCPConnectionState {
    serverId: string;
    serverName: string;
    status: 'connecting' | 'connected' | 'disconnected' | 'error';
    tools: MCPTool[];
    error?: string;
    connectedAt?: Date;
}
