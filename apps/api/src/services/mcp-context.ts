import { prisma } from '../db.js';
import { supervisor } from '../mcp/index.js';

/**
 * Result of fetching MCP context for a project.
 */
export interface MCPContextResult {
    /** Concatenated MCP data formatted for AI prompt injection */
    context: string;
    /** Source identifiers, e.g. ["figma:Design System", "confluence:API Docs"] */
    sources: string[];
    /** Graceful degradation warnings */
    warnings: string[];
}

/**
 * Default MCP tool names to call for each server type.
 * These are discovery/listing tools that provide broad context.
 */
const DEFAULT_TOOLS: Record<string, string> = {
    figma: 'get_file',
    confluence: 'search',
    notion: 'search',
    jira: 'search_issues',
    github: 'search_repositories',
    linear: 'search_issues',
    sentry: 'list_issues',
    'google-docs': 'list_documents',
};

/**
 * MCPContextService — fetches context from connected MCP servers for a project.
 *
 * This service bridges MCP connections and the artifact generation pipeline,
 * providing enriched context from Figma designs, Confluence docs, and other
 * connected sources. Handles graceful degradation when connections are unavailable.
 *
 * Used by: generate route, prd-chat route, artifact-chat route, prd-validate route.
 */
export class MCPContextService {
    /**
     * Fetch MCP context for a project.
     * Queries the project's connections, calls connected MCP tools,
     * and returns formatted context with graceful degradation.
     */
    async fetchForProject(projectId: string): Promise<MCPContextResult> {
        const result: MCPContextResult = {
            context: '',
            sources: [],
            warnings: [],
        };

        // 1. Get project connections from DB
        const connections = await prisma.mCPConnection.findMany({
            where: { projectId },
        });

        if (connections.length === 0) {
            return result; // No connections — return empty (not a warning, just no MCP data)
        }

        // 2. Check each connection and fetch context
        const contextParts: string[] = [];

        for (const conn of connections) {
            const serverState = supervisor.getServerState(conn.id);

            // Connection exists in DB but not connected to supervisor
            if (!serverState || serverState.status !== 'connected') {
                result.warnings.push(
                    `MCP source "${conn.name}" (${conn.type}) is disconnected — skipped`,
                );
                continue;
            }

            // Attempt to fetch context via MCP tool call
            try {
                const toolName = DEFAULT_TOOLS[conn.type];
                if (!toolName) {
                    result.warnings.push(
                        `MCP source "${conn.name}" (${conn.type}) — no default tool configured`,
                    );
                    continue;
                }

                // Check if tool is available on server
                const hasTool = serverState.tools.some((t) => t.name === toolName);
                if (!hasTool) {
                    // Try listing available tools as fallback
                    const availableTools = serverState.tools.map((t) => t.name);
                    result.warnings.push(
                        `MCP source "${conn.name}": tool "${toolName}" not found. Available: [${availableTools.slice(0, 5).join(', ')}]`,
                    );
                    continue;
                }

                const toolResult = await supervisor.callTool(toolName, {});

                if (toolResult.isError) {
                    result.warnings.push(
                        `MCP source "${conn.name}": tool call failed — ${toolResult.content[0]?.type === 'text' ? toolResult.content[0].text : 'unknown error'}`,
                    );
                    continue;
                }

                // Extract text content from result
                const textContent = toolResult.content
                    .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
                    .map((c) => c.text)
                    .join('\n');

                if (textContent) {
                    contextParts.push(
                        `[MCP Context: ${conn.type} — ${conn.name}]\n${textContent}`,
                    );
                    result.sources.push(`${conn.type}:${conn.name}`);
                }
            } catch (err) {
                result.warnings.push(
                    `MCP source "${conn.name}" (${conn.type}): ${err instanceof Error ? err.message : 'fetch failed'}`,
                );
            }
        }

        // 3. Build final context string
        if (contextParts.length > 0) {
            result.context = contextParts.join('\n\n---\n\n');
        } else if (connections.length > 0 && result.sources.length === 0) {
            result.warnings.push(
                'MCP sources unavailable — generating with PRD content only',
            );
        }

        return result;
    }
}

/** Singleton instance */
export const mcpContext = new MCPContextService();
