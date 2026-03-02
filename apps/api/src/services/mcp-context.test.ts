import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCPContextService } from './mcp-context.js';

// Mock dependencies
vi.mock('../db.js', () => ({
    prisma: {
        mCPConnection: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock('../mcp/index.js', () => ({
    supervisor: {
        getServerState: vi.fn(),
        callTool: vi.fn(),
    },
}));

import { prisma } from '../db.js';
import { supervisor } from '../mcp/index.js';

describe('MCPContextService', () => {
    let service: MCPContextService;

    beforeEach(() => {
        service = new MCPContextService();
        vi.clearAllMocks();
    });

    it('returns empty result when no connections exist', async () => {
        vi.mocked(prisma.mCPConnection.findMany).mockResolvedValue([]);

        const result = await service.fetchForProject('project-1');

        expect(result.context).toBe('');
        expect(result.sources).toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    it('returns warning when connection is disconnected', async () => {
        vi.mocked(prisma.mCPConnection.findMany).mockResolvedValue([
            { id: 'conn-1', name: 'My Figma', type: 'figma', projectId: 'p1', status: 'disconnected', config: '{}', createdAt: new Date(), updatedAt: new Date() },
        ] as any);
        vi.mocked(supervisor.getServerState).mockReturnValue(undefined);

        const result = await service.fetchForProject('project-1');

        expect(result.context).toBe('');
        expect(result.sources).toEqual([]);
        expect(result.warnings).toContainEqual(
            expect.stringContaining('disconnected'),
        );
    });

    it('fetches context from connected MCP server', async () => {
        vi.mocked(prisma.mCPConnection.findMany).mockResolvedValue([
            { id: 'conn-1', name: 'Design System', type: 'figma', projectId: 'p1', status: 'connected', config: '{}', createdAt: new Date(), updatedAt: new Date() },
        ] as any);
        vi.mocked(supervisor.getServerState).mockReturnValue({
            serverId: 'conn-1',
            serverName: 'Design System',
            status: 'connected',
            tools: [{ name: 'get_file', description: 'Get file', inputSchema: {}, serverName: 'Design System' }],
        });
        vi.mocked(supervisor.callTool).mockResolvedValue({
            content: [{ type: 'text', text: 'Figma frame data here' }],
            isError: false,
        });

        const result = await service.fetchForProject('project-1');

        expect(result.context).toContain('Figma frame data here');
        expect(result.context).toContain('[MCP Context: figma');
        expect(result.sources).toEqual(['figma:Design System']);
        expect(result.warnings).toEqual([]);
    });

    it('handles tool call error gracefully', async () => {
        vi.mocked(prisma.mCPConnection.findMany).mockResolvedValue([
            { id: 'conn-1', name: 'My Figma', type: 'figma', projectId: 'p1', status: 'connected', config: '{}', createdAt: new Date(), updatedAt: new Date() },
        ] as any);
        vi.mocked(supervisor.getServerState).mockReturnValue({
            serverId: 'conn-1',
            serverName: 'My Figma',
            status: 'connected',
            tools: [{ name: 'get_file', description: 'Get file', inputSchema: {}, serverName: 'My Figma' }],
        });
        vi.mocked(supervisor.callTool).mockResolvedValue({
            content: [{ type: 'text', text: 'Tool execution failed' }],
            isError: true,
        });

        const result = await service.fetchForProject('project-1');

        expect(result.context).toBe('');
        expect(result.sources).toEqual([]);
        expect(result.warnings).toContainEqual(
            expect.stringContaining('tool call failed'),
        );
    });

    it('handles exception during tool call gracefully', async () => {
        vi.mocked(prisma.mCPConnection.findMany).mockResolvedValue([
            { id: 'conn-1', name: 'My Figma', type: 'figma', projectId: 'p1', status: 'connected', config: '{}', createdAt: new Date(), updatedAt: new Date() },
        ] as any);
        vi.mocked(supervisor.getServerState).mockReturnValue({
            serverId: 'conn-1',
            serverName: 'My Figma',
            status: 'connected',
            tools: [{ name: 'get_file', description: 'Get file', inputSchema: {}, serverName: 'My Figma' }],
        });
        vi.mocked(supervisor.callTool).mockRejectedValue(new Error('Network timeout'));

        const result = await service.fetchForProject('project-1');

        expect(result.context).toBe('');
        expect(result.warnings).toContainEqual(
            expect.stringContaining('Network timeout'),
        );
    });

    it('adds general warning when all connections fail', async () => {
        vi.mocked(prisma.mCPConnection.findMany).mockResolvedValue([
            { id: 'conn-1', name: 'My Figma', type: 'figma', projectId: 'p1', status: 'connected', config: '{}', createdAt: new Date(), updatedAt: new Date() },
        ] as any);
        vi.mocked(supervisor.getServerState).mockReturnValue(undefined);

        const result = await service.fetchForProject('project-1');

        expect(result.warnings).toContainEqual(
            expect.stringContaining('MCP sources unavailable'),
        );
    });

    it('concatenates multiple source contexts', async () => {
        vi.mocked(prisma.mCPConnection.findMany).mockResolvedValue([
            { id: 'conn-1', name: 'Figma', type: 'figma', projectId: 'p1', status: 'connected', config: '{}', createdAt: new Date(), updatedAt: new Date() },
            { id: 'conn-2', name: 'Confluence', type: 'confluence', projectId: 'p1', status: 'connected', config: '{}', createdAt: new Date(), updatedAt: new Date() },
        ] as any);

        vi.mocked(supervisor.getServerState)
            .mockReturnValueOnce({
                serverId: 'conn-1', serverName: 'Figma', status: 'connected',
                tools: [{ name: 'get_file', description: '', inputSchema: {}, serverName: 'Figma' }],
            })
            .mockReturnValueOnce({
                serverId: 'conn-2', serverName: 'Confluence', status: 'connected',
                tools: [{ name: 'search', description: '', inputSchema: {}, serverName: 'Confluence' }],
            });

        vi.mocked(supervisor.callTool)
            .mockResolvedValueOnce({
                content: [{ type: 'text', text: 'Figma data' }], isError: false,
            })
            .mockResolvedValueOnce({
                content: [{ type: 'text', text: 'Confluence data' }], isError: false,
            });

        const result = await service.fetchForProject('project-1');

        expect(result.sources).toEqual(['figma:Figma', 'confluence:Confluence']);
        expect(result.context).toContain('Figma data');
        expect(result.context).toContain('Confluence data');
        expect(result.context).toContain('---'); // separator
    });
});
