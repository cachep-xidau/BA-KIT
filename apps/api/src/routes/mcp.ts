// @ts-nocheck
import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { supervisor } from '../mcp/index.js';
import { createFigmaConfig } from '../mcp/servers/figma.js';
import { createConfluenceConfig } from '../mcp/servers/confluence.js';
import { createNotionConfig } from '../mcp/servers/notion.js';
import { createJiraConfig } from '../mcp/servers/jira.js';
import { createGitHubConfig } from '../mcp/servers/github.js';
import { createLinearConfig } from '../mcp/servers/linear.js';
import { createSentryConfig } from '../mcp/servers/sentry.js';
import { createGoogleDocsConfig } from '../mcp/servers/google-docs.js';
import { prisma } from '../db.js';
import { encrypt } from '../services/crypto.js';
import { env } from '../env.js';
import { idSchema } from '@bsa-kit/shared';

const router: RouterType = Router();

// --- Activity Log Helper ---
async function logActivity(source: string, action: string, status: string, details?: string) {
    try {
        await prisma.mCPActivityLog.create({ data: { source, action, status, details } });
    } catch (err) {
        console.warn(`⚠️ Failed to log activity: ${err instanceof Error ? err.message : err}`);
    }
}

// --- Schemas ---
const connectSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.string().min(1).max(50),
    projectId: z.preprocess((val) => (val === '' || val === 'default' ? undefined : val), idSchema.optional()), // Optional: global connections don't need project binding
    credentials: z.record(z.string()),
});

const toolCallSchema = z.object({
    toolName: z.string().min(1),
    args: z.record(z.unknown()).default({}),
});

// POST /api/mcp/connect — Connect a named MCP server instance
router.post('/connect', async (req: Request, res: Response) => {
    const parsed = connectSchema.safeParse(req.body);
    if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        const errorMsg = Object.entries(fieldErrors)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
            .join('; ') || 'Validation failed';
        res.status(400).json({ success: false, error: errorMsg });
        return;
    }

    const { name, type, projectId, credentials } = parsed.data;

    // Require encryption in production - don't store plaintext credentials
    if (env.NODE_ENV === 'production' && !env.ENCRYPTION_KEY) {
        res.status(500).json({
            success: false,
            error: 'ENCRYPTION_KEY is required in production for secure credential storage',
        });
        return;
    }

    try {
        let serverConfig;

        if (type === 'figma') {
            if (!credentials.token) {
                res.status(400).json({ success: false, error: 'Figma token required' });
                return;
            }
            serverConfig = createFigmaConfig(name, credentials.token);
        } else if (type === 'confluence') {
            if (!credentials.baseUrl || !credentials.username || !credentials.apiToken) {
                res.status(400).json({
                    success: false,
                    error: 'Confluence baseUrl, username, and apiToken required',
                });
                return;
            }
            serverConfig = createConfluenceConfig(
                name,
                credentials.baseUrl,
                credentials.username,
                credentials.apiToken,
            );
        } else if (type === 'notion') {
            if (!credentials.apiKey) {
                res.status(400).json({ success: false, error: 'Notion integration token required' });
                return;
            }
            serverConfig = createNotionConfig(name, credentials.apiKey);
        } else if (type === 'jira') {
            if (!credentials.baseUrl || !credentials.username || !credentials.apiToken) {
                res.status(400).json({
                    success: false,
                    error: 'Jira baseUrl, username, and apiToken required',
                });
                return;
            }
            serverConfig = createJiraConfig(name, credentials.baseUrl, credentials.username, credentials.apiToken);
        } else if (type === 'github') {
            if (!credentials.token) {
                res.status(400).json({ success: false, error: 'GitHub personal access token required' });
                return;
            }
            serverConfig = createGitHubConfig(name, credentials.token);
        } else if (type === 'linear') {
            if (!credentials.apiKey) {
                res.status(400).json({ success: false, error: 'Linear API key required' });
                return;
            }
            serverConfig = createLinearConfig(name, credentials.apiKey);
        } else if (type === 'sentry') {
            if (!credentials.authToken || !credentials.org) {
                res.status(400).json({ success: false, error: 'Sentry authToken and org required' });
                return;
            }
            serverConfig = createSentryConfig(name, credentials.authToken, credentials.org);
        } else if (type === 'google-docs') {
            serverConfig = createGoogleDocsConfig(name);
        } else {
            res.status(400).json({ success: false, error: `Unsupported type: ${type}` });
            return;
        }

        // Connect via supervisor
        const connectionState = await supervisor.addServer(serverConfig);

        // Persist connection only if projectId is provided (project-scoped connections)
        if (projectId) {
            try {
                const encryptionKey = env.ENCRYPTION_KEY;
                // Always encrypt if key available, otherwise store as plaintext (dev only)
                const configJson = encryptionKey
                    ? encrypt(JSON.stringify(credentials), encryptionKey)
                    : JSON.stringify(credentials);

                if (!encryptionKey && env.NODE_ENV !== 'production') {
                    console.warn(`⚠️ MCP credentials stored unencrypted for ${name}. Set ENCRYPTION_KEY for secure storage.`);
                }

                await prisma.mCPConnection.upsert({
                    where: {
                        projectId_type_name: { projectId, type, name },
                    },
                    create: {
                        id: serverConfig.id,
                        name,
                        type,
                        config: configJson,
                        status: connectionState.status,
                        toolCount: connectionState.tools.length,
                        projectId,
                    },
                    update: {
                        config: configJson,
                        status: connectionState.status,
                        toolCount: connectionState.tools.length,
                    },
                });
            } catch (dbErr) {
                console.warn(`⚠️ MCP [${serverConfig.id}]: Connected but failed to persist — ${dbErr instanceof Error ? dbErr.message : dbErr}`);
            }
        }

        await logActivity(type, `Connected '${name}'`, 'success', `${connectionState.tools.length} tools available`);

        res.json({
            success: true,
            data: {
                serverId: connectionState.serverId,
                serverName: connectionState.serverName,
                status: connectionState.status,
                toolCount: connectionState.tools.length,
                tools: connectionState.tools.map((t) => ({ name: t.name, description: t.description })),
            },
        });
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Connection failed';
        await logActivity(type, `Connection failed`, 'error', errMsg);
        res.status(500).json({
            success: false,
            error: errMsg,
        });
    }
});

// GET /api/mcp/tools — List all available tools
router.get('/tools', (_req: Request, res: Response) => {
    try {
        const tools = supervisor.listAllTools();
        res.json({
            success: true,
            data: tools.map((t) => ({
                name: t.name,
                description: t.description,
                serverName: t.serverName,
            })),
        });
    } catch (err) {
        console.error('Failed to list MCP tools:', err);
        res.status(500).json({ success: false, error: 'Failed to list tools' });
    }
});

// POST /api/mcp/execute — Execute a tool call
router.post('/execute', async (req: Request, res: Response) => {
    const parsed = toolCallSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
        return;
    }

    const { toolName, args } = parsed.data;

    try {
        const result = await supervisor.callTool(toolName, args as Record<string, unknown>);
        res.json({ success: !result.isError, data: result });
    } catch (err) {
        console.error('MCP tool execution failed:', err);
        res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : 'Tool execution failed',
        });
    }
});

// GET /api/mcp/status — Get all connection states
router.get('/status', (_req: Request, res: Response) => {
    try {
        const states = supervisor.getAllStates();
        res.json({
            success: true,
            data: states.map((s) => ({
                serverId: s.serverId,
                serverName: s.serverName,
                status: s.status,
                toolCount: s.tools.length,
                connectedAt: s.connectedAt,
                error: s.error,
            })),
        });
    } catch (err) {
        console.error('Failed to get MCP status:', err);
        res.status(500).json({ success: false, error: 'Failed to get connection status' });
    }
});

// DELETE /api/mcp/disconnect/:serverId — Disconnect a named MCP server
router.delete('/disconnect/:serverId', async (req: Request, res: Response) => {
    const serverId = req.params.serverId;

    // Validate serverId format (should be non-empty string)
    if (!serverId || typeof serverId !== 'string') {
        res.status(400).json({ success: false, error: 'Invalid server ID' });
        return;
    }

    // Infer source type from serverId (e.g. 'figma-123' -> 'figma')
    const sourceType = serverId.split('-')[0] || serverId;

    try {
        await supervisor.removeServer(serverId);

        // Update DB status (best-effort)
        try {
            await prisma.mCPConnection.updateMany({
                where: { id: serverId },
                data: { status: 'disconnected' },
            });
        } catch {
            // ignore — connection may not be persisted
        }

        await logActivity(sourceType, 'Disconnected', 'info');

        res.json({ success: true });
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to disconnect server';
        console.error('Failed to disconnect MCP server:', err);
        await logActivity(sourceType, 'Disconnect failed', 'error', errMsg);
        res.status(500).json({
            success: false,
            error: errMsg,
        });
    }
});

// GET /api/mcp/activities — Recent activity logs
router.get('/activities', async (req: Request, res: Response) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const logs = await prisma.mCPActivityLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        res.json({ success: true, data: logs });
    } catch (err) {
        console.error('Failed to fetch activity logs:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch activity logs' });
    }
});

// GET /api/mcp/connections?projectId=xxx — Project-scoped connections
router.get('/connections', async (req: Request, res: Response) => {
    const projectId = req.query.projectId as string;
    if (!projectId) {
        res.status(400).json({ success: false, error: 'projectId query parameter is required' });
        return;
    }
    try {
        const connections = await prisma.mCPConnection.findMany({
            where: { projectId },
            orderBy: [{ type: 'asc' }, { name: 'asc' }],
        });
        res.json({ success: true, data: connections });
    } catch (err) {
        console.error('Failed to fetch project connections:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch connections' });
    }
});

// DELETE /api/mcp/connections/:id — Remove a project connection by DB id
router.delete('/connections/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ success: false, error: 'Connection id is required' });
        return;
    }
    try {
        const conn = await prisma.mCPConnection.findUnique({ where: { id } });
        if (!conn) {
            res.status(404).json({ success: false, error: 'Connection not found' });
            return;
        }
        // Try to disconnect from live supervisor
        try { await supervisor.removeServer(id); } catch { /* may not be live */ }
        await prisma.mCPConnection.delete({ where: { id } });
        await logActivity(conn.type, `Removed '${conn.name}'`, 'info');
        res.json({ success: true });
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to remove connection';
        res.status(500).json({ success: false, error: errMsg });
    }
});

export default router;
