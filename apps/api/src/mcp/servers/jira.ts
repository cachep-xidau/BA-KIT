import type { MCPServerConfig } from '../types.js';

/**
 * Create Jira MCP server configuration.
 * Uses mcp-atlassian via uvx (same package as Confluence).
 *
 * @see https://github.com/sooperset/mcp-atlassian
 */
export function createJiraConfig(
    name: string,
    baseUrl: string,
    username: string,
    apiToken: string,
): MCPServerConfig {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
        id: `jira-${slug}`,
        name: `Jira ${name}`,
        type: 'jira',
        transport: {
            type: 'stdio',
            command: 'uvx',
            args: ['mcp-atlassian', '--transport', 'stdio'],
            env: {
                JIRA_URL: baseUrl,
                JIRA_USERNAME: username,
                JIRA_API_TOKEN: apiToken,
            },
        },
    };
}
