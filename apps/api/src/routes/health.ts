import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { prisma, prismaReady } from '../db.js';

const router: RouterType = Router();

// GET /api/health — Health check
router.get('/', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
    });
});

// GET /api/health/debug — Debug DB connection
router.get('/debug', async (_req: Request, res: Response) => {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const hasToken = !!process.env.TURSO_AUTH_TOKEN;
    
    let dbStatus = 'unknown';
    let tables: string[] = [];
    let error = '';
    
    try {
        await prismaReady;
        const projects = await prisma.project.findMany({ take: 1 });
        dbStatus = 'connected';
        tables.push(`projects: ${projects.length}`);
    } catch (err: any) {
        dbStatus = 'error';
        error = err.message || String(err);
    }
    
    res.json({
        tursoUrl: tursoUrl ? tursoUrl.substring(0, 30) + '...' : 'NOT SET',
        hasToken,
        dbStatus,
        tables,
        error: error || undefined,
        nodeEnv: process.env.NODE_ENV,
    });
});

export default router;
