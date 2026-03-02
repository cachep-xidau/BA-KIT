import type { MCPServerConfig } from '../types.js';

/**
 * Create Google Docs MCP server configuration.
 * Uses @anthropics/mcp-gdocs via npx.
 *
 * @see https://github.com/anthropics/anthropic-quickstarts/tree/main/mcp-gdocs
 */
export function createGoogleDocsConfig(name: string): MCPServerConfig {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
        id: `google-docs-${slug}`,
        name: `Google Docs ${name}`,
        type: 'google-docs',
        transport: {
            type: 'stdio',
            command: 'npx',
            args: ['-y', '@anthropics/mcp-gdocs'],
            env: {},
        },
    };
}
