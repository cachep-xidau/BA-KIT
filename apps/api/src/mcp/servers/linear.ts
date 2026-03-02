import type { MCPServerConfig } from '../types.js';

/**
 * Create Linear MCP server configuration.
 * Uses mcp-linear via npx.
 *
 * @see https://github.com/jerhadf/linear-mcp-server
 */
export function createLinearConfig(name: string, apiKey: string): MCPServerConfig {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
        id: `linear-${slug}`,
        name: `Linear ${name}`,
        type: 'linear',
        transport: {
            type: 'stdio',
            command: 'npx',
            args: ['-y', 'mcp-linear'],
            env: {
                LINEAR_API_KEY: apiKey,
            },
        },
    };
}
