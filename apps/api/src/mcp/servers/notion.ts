import type { MCPServerConfig } from '../types.js';

/**
 * Create Notion MCP server configuration.
 * Uses the official Notion MCP server via npx.
 *
 * @see https://github.com/makenotion/notion-mcp-server
 */
export function createNotionConfig(name: string, apiKey: string): MCPServerConfig {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
        id: `notion-${slug}`,
        name: `Notion ${name}`,
        type: 'notion',
        transport: {
            type: 'stdio',
            command: 'npx',
            args: ['-y', '@notionhq/notion-mcp-server'],
            env: {
                OPENAPI_MCP_HEADERS: JSON.stringify({
                    Authorization: `Bearer ${apiKey}`,
                    'Notion-Version': '2022-06-28',
                }),
            },
        },
    };
}
