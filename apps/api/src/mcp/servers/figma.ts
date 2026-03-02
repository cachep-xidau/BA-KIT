import type { MCPServerConfig } from '../types.js';

/**
 * Create Figma MCP server configuration.
 * Uses the official Framelink Figma MCP server via npx.
 *
 * @see https://www.npmjs.com/package/figma-developer-mcp
 */
export function createFigmaConfig(name: string, token: string): MCPServerConfig {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
        id: `figma-${slug}`,
        name: `Figma ${name}`,
        type: 'figma',
        transport: {
            type: 'stdio',
            command: 'npx',
            args: ['-y', 'figma-developer-mcp', '--stdio'],
            env: {
                FIGMA_API_KEY: token,
            },
        },
    };
}
