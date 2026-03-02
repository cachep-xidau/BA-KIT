import type { MCPServerConfig } from '../types.js';

/**
 * Create Confluence MCP server configuration.
 * Uses mcp-atlassian via uvx (Python).
 *
 * @see https://github.com/sooperset/mcp-atlassian
 */
export function createConfluenceConfig(
    name: string,
    baseUrl: string,
    username: string,
    apiToken: string,
): MCPServerConfig {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
        id: `confluence-${slug}`,
        name: `Confluence ${name}`,
        type: 'confluence',
        transport: {
            type: 'stdio',
            command: 'uvx',
            args: ['mcp-atlassian', '--transport', 'stdio'],
            env: {
                CONFLUENCE_URL: baseUrl,
                CONFLUENCE_USERNAME: username,
                CONFLUENCE_API_TOKEN: apiToken,
            },
        },
    };
}
