import { describe, it, expect } from 'vitest';
import { createConfluenceConfig } from './confluence.js';

describe('createConfluenceConfig', () => {
    it('generates correct id and name', () => {
        const config = createConfluenceConfig('SofiaMedix', 'https://x.atlassian.net/wiki', 'user@test.com', 'api-token');
        expect(config.id).toBe('confluence-sofiamedix');
        expect(config.name).toBe('Confluence SofiaMedix');
        expect(config.type).toBe('confluence');
    });

    it('slugifies special characters', () => {
        const config = createConfluenceConfig('My Wiki Space', 'url', 'u', 't');
        expect(config.id).toBe('confluence-my-wiki-space');
    });

    it('sets all 3 env vars', () => {
        const config = createConfluenceConfig('Test', 'https://example.com', 'admin', 'secret');
        if (config.transport.type === 'stdio') {
            expect(config.transport.env?.CONFLUENCE_URL).toBe('https://example.com');
            expect(config.transport.env?.CONFLUENCE_USERNAME).toBe('admin');
            expect(config.transport.env?.CONFLUENCE_API_TOKEN).toBe('secret');
        }
    });

    it('uses uvx for Python MCP server', () => {
        const config = createConfluenceConfig('X', 'url', 'u', 't');
        if (config.transport.type === 'stdio') {
            expect(config.transport.command).toBe('uvx');
            expect(config.transport.args).toContain('mcp-atlassian');
        }
    });
});
