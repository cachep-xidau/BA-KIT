import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type {
    MCPServerConfig,
    MCPTool,
    MCPToolCallResult,
    MCPConnectionState,
    MCPContent,
} from './types.js';

/**
 * MCP Client wrapper — manages a single MCP server connection.
 * Handles lifecycle, tool discovery, and tool execution.
 */
export class MCPClient {
    private client: Client | null = null;
    private transport: StdioClientTransport | null = null;
    private _state: MCPConnectionState;

    constructor(private config: MCPServerConfig) {
        this._state = {
            serverId: config.id,
            serverName: config.name,
            status: 'disconnected',
            tools: [],
        };
    }

    get state(): MCPConnectionState {
        return { ...this._state };
    }

    get isConnected(): boolean {
        return this._state.status === 'connected';
    }

    /**
     * Connect to the MCP server and discover available tools.
     */
    async connect(): Promise<void> {
        if (this.isConnected) return;

        try {
            this._state.status = 'connecting';

            const transportConfig = this.config.transport;

            if (transportConfig.type === 'stdio') {
                this.transport = new StdioClientTransport({
                    command: transportConfig.command,
                    args: transportConfig.args,
                    env: { ...process.env, ...transportConfig.env } as Record<string, string>,
                });
            } else {
                throw new Error(`Transport type "${transportConfig.type}" not yet supported in MVP`);
            }

            this.client = new Client(
                { name: 'bsa-kit', version: '0.1.0' },
                { capabilities: {} },
            );

            await this.client.connect(this.transport);

            // Discover tools (extended timeout for npx first-run download)
            const toolsResult = await this.client.listTools(undefined, { timeout: 120_000 });
            this._state.tools = (toolsResult.tools || []).map((t) => ({
                name: t.name,
                description: t.description,
                inputSchema: t.inputSchema as Record<string, unknown>,
                serverName: this.config.name,
            }));

            this._state.status = 'connected';
            this._state.connectedAt = new Date();
            this._state.error = undefined;

            console.log(
                `✅ MCP [${this.config.name}]: Connected — ${this._state.tools.length} tools discovered`,
            );
        } catch (err) {
            this._state.status = 'error';
            this._state.error = err instanceof Error ? err.message : String(err);
            console.error(`❌ MCP [${this.config.name}]: Connection failed —`, this._state.error);
            throw err;
        }
    }

    /**
     * Execute a tool call on this MCP server.
     */
    async callTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolCallResult> {
        if (!this.client || !this.isConnected) {
            throw new Error(`MCP [${this.config.name}] not connected`);
        }

        const tool = this._state.tools.find((t) => t.name === toolName);
        if (!tool) {
            throw new Error(`Tool "${toolName}" not found on server "${this.config.name}"`);
        }

        try {
            const result = await this.client.callTool({ name: toolName, arguments: args });
            return {
                content: (result.content as MCPContent[]) || [],
                isError: result.isError as boolean | undefined,
            };
        } catch (err) {
            return {
                content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
                isError: true,
            };
        }
    }

    /**
     * Disconnect from the MCP server.
     */
    async disconnect(): Promise<void> {
        try {
            if (this.client) {
                await this.client.close();
            }
        } catch (err) {
            // Log close errors for debugging but don't throw
            console.debug(`🔌 MCP [${this.config.name}]: Close error (ignored) —`, err instanceof Error ? err.message : err);
        } finally {
            this.client = null;
            this.transport = null;
            this._state.status = 'disconnected';
            this._state.tools = [];
            this._state.error = undefined;
            console.log(`🔌 MCP [${this.config.name}]: Disconnected`);
        }
    }
}
