import type { MCPServerConfig } from '../types.js';

/**
 * Create GitHub MCP server configuration.
 * Uses the official MCP GitHub server via npx.
 *
 * @see https://github.com/modelcontextprotocol/servers/tree/main/src/github
 */
export function createGitHubConfig(name: string, token: string): MCPServerConfig {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
        id: `github-${slug}`,
        name: `GitHub ${name}`,
        type: 'github',
        transport: {
            type: 'stdio',
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-github'],
            env: {
                GITHUB_PERSONAL_ACCESS_TOKEN: token,
            },
        },
    };
}
