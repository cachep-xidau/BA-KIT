/**
 * Creates a clean Express app for testing — no listen(), no AI init.
 * Mounts ALL routes matching production index.ts.
 */
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.js';
import projectRoutes from './routes/projects.js';
import featureRoutes from './routes/features.js';
import functionRoutes from './routes/functions.js';
import mcpRoutes from './routes/mcp.js';
import generateRoutes from './routes/generate.js';
import prdChatRoutes from './routes/prd-chat.js';
import prdValidateRoutes from './routes/prd-validate.js';
import prdFixRoutes from './routes/prd-fix.js';
import analysisRoutes from './routes/analysis.js';
import artifactChatRoutes from './routes/artifact-chat.js';
import webhooksRoutes from './routes/webhooks.js';

export function createTestApp(): Express {
    const app = express();

    app.use(cors());
    app.use(express.json({ limit: '10mb' }));

    app.use('/api/health', healthRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/features', featureRoutes);
    app.use('/api/functions', functionRoutes);
    app.use('/api/mcp', mcpRoutes);
    app.use('/api/generate', generateRoutes);
    app.use('/api/prd-chat', prdChatRoutes);
    app.use('/api/prd-validate', prdValidateRoutes);
    app.use('/api/prd-fix', prdFixRoutes);
    app.use('/api/analysis', analysisRoutes);
    app.use('/api/artifact-chat', artifactChatRoutes);
    app.use('/api/webhooks', webhooksRoutes);

    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error('Test error:', err.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    });

    return app;
}
