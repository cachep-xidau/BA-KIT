import { MCPClient } from './client.js';
import type { MCPServerConfig, MCPTool, MCPToolCallResult, MCPConnectionState } from './types.js';

/**
 * MCP Supervisor — coordinates multiple MCP server connections.
 * Routes tool calls to the appropriate server and aggregates available tools.
 */
export class MCPSupervisor {
    private clients: Map<string, MCPClient> = new Map();
    private pendingConnections: Map<string, Promise<MCPConnectionState>> = new Map();

    /**
     * Register and connect to an MCP server.
     * Uses a mutex per server ID to prevent race conditions on concurrent calls.
     */
    async addServer(config: MCPServerConfig): Promise<MCPConnectionState> {
        // If connection is already in progress, wait for it
        const pending = this.pendingConnections.get(config.id);
        if (pending) {
            return pending;
        }

        // Start new connection
        const connectionPromise = this._doAddServer(config);
        this.pendingConnections.set(config.id, connectionPromise);

        try {
            const result = await connectionPromise;
            return result;
        } finally {
            this.pendingConnections.delete(config.id);
        }
    }

    private async _doAddServer(config: MCPServerConfig): Promise<MCPConnectionState> {
        // Disconnect existing if re-adding
        if (this.clients.has(config.id)) {
            await this.removeServer(config.id);
        }

        const client = new MCPClient(config);
        this.clients.set(config.id, client);

        await client.connect();
        return client.state;
    }

    /**
     * Disconnect and remove an MCP server.
     */
    async removeServer(serverId: string): Promise<void> {
        const client = this.clients.get(serverId);
        if (client) {
            await client.disconnect();
            this.clients.delete(serverId);
        }
    }

    /**
     * Get connection state for a specific server.
     */
    getServerState(serverId: string): MCPConnectionState | undefined {
        return this.clients.get(serverId)?.state;
    }

    /**
     * Get all server connection states.
     */
    getAllStates(): MCPConnectionState[] {
        return Array.from(this.clients.values()).map((c) => c.state);
    }

    /**
     * Get all available tools across all connected servers.
     */
    listAllTools(): MCPTool[] {
        const tools: MCPTool[] = [];
        for (const client of this.clients.values()) {
            if (client.isConnected) {
                tools.push(...client.state.tools);
            }
        }
        return tools;
    }

    /**
     * Execute a tool call, routing to the correct server.
     */
    async callTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolCallResult> {
        const matchingClients = Array.from(this.clients.values())
            .filter(c => c.isConnected && c.state.tools.some(t => t.name === toolName));

        if (matchingClients.length > 1) {
            console.warn(`⚠️ Tool "${toolName}" exists on ${matchingClients.length} servers, using first: ${matchingClients[0].state.serverName}`);
        }

        if (matchingClients.length === 0) {
            return {
                content: [{ type: 'text', text: `Tool "${toolName}" not found on any connected server` }],
                isError: true,
            };
        }

        return matchingClients[0].callTool(toolName, args);
    }

    /**
     * Disconnect all servers.
     */
    async shutdown(): Promise<void> {
        const disconnects = Array.from(this.clients.values()).map((c) => c.disconnect());
        await Promise.allSettled(disconnects);
        this.clients.clear();
    }
}

// Singleton supervisor instance
export const supervisor = new MCPSupervisor();
