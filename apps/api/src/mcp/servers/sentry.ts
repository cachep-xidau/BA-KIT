import type { MCPServerConfig } from '../types.js';

/**
 * Create Sentry MCP server configuration.
 * Uses the official MCP Sentry server via npx.
 *
 * @see https://github.com/modelcontextprotocol/servers/tree/main/src/sentry
 */
export function createSentryConfig(name: string, authToken: string, org: string): MCPServerConfig {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return {
        id: `sentry-${slug}`,
        name: `Sentry ${name}`,
        type: 'sentry',
        transport: {
            type: 'stdio',
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-sentry', '--auth-token', authToken],
            env: {
                SENTRY_ORG: org,
            },
        },
    };
}
