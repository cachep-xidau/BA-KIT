import http from 'node:http';
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './env.js';
import { aiRouter } from '@bsa-kit/ai-engine';
import { prisma, prismaReady } from './db.js';
import { supervisor } from './mcp/index.js';
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
import skillsRoutes from './routes/skills.js';
import webhooksRoutes from './routes/webhooks.js';
import checkoutRoutes from './routes/checkout.js';
import planRoutes from './routes/plan.js';
import { pipeline } from './pipeline/index.js';

const app: Express = express();

// Middleware
app.use(helmet());

// CORS configuration - never allow '*' with credentials (browsers reject this)
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
    origin: corsOrigin || false,
    credentials: !!corsOrigin,
}));

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

app.use(express.json({ limit: '1mb' })); // Default 1mb

// Larger body limit for PRD content routes
app.use('/api/projects', express.json({ limit: '10mb' }));
app.use('/api/prd-chat', express.json({ limit: '10mb' }));

// Rate limiting
const generalRateLimit = Number(process.env.RATE_LIMIT_GENERAL || 100);
const generateRateLimit = Number(process.env.RATE_LIMIT_GENERATE || 10);

app.use('/api/', rateLimit({
    windowMs: 60 * 1000,
    max: generalRateLimit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later' },
}));

// Stricter rate limit for AI generation endpoint
app.use('/api/generate', rateLimit({
    windowMs: 60 * 1000,
    max: generateRateLimit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Generation rate limit exceeded' },
}));

// Routes
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
app.use('/api/skills', skillsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/plan', planRoutes);

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start using http.createServer for Express 5 compatibility
const PORT = env.API_PORT;
const server = http.createServer(app);

// Graceful shutdown handler
async function shutdown(signal: string) {
    console.log(`\n📡 ${signal} received, shutting down gracefully...`);

    // Check for active pipelines and adjust timeout
    const activePipelines = pipeline.getActivePipelineCount();
    const HARD_TIMEOUT = 5 * 60 * 1000; // 5 minutes for AI work
    const GRACE_PERIOD = activePipelines > 0 ? HARD_TIMEOUT : 10000;

    if (activePipelines > 0) {
        console.log(`⏳ Waiting for ${activePipelines} active pipeline(s)...`);
    }

    // Close MCP connections
    try {
        await supervisor.shutdown();
        console.log('✅ MCP connections closed');
    } catch (e) {
        console.error('⚠️ Error closing MCP connections:', e);
    }

    // Disconnect Prisma
    try {
        await prisma.$disconnect();
        console.log('✅ Database disconnected');
    } catch (e) {
        console.error('⚠️ Error disconnecting database:', e);
    }

    // Close HTTP server
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });

    // Extended timeout based on active work
    setTimeout(() => {
        console.error(`⚠️ Forced shutdown after timeout (${activePipelines > 0 ? '5 minutes with active pipelines' : '10 seconds'})`);
        process.exit(1);
    }, GRACE_PERIOD);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Initialize Prisma (async for ESM dynamic imports) then start server
prismaReady.then(() => {
    server.listen(PORT, () => {
        // Initialize AI providers (non-blocking — keys are optional)
        aiRouter.init({
            anthropicApiKey: process.env.ANTHROPIC_API_KEY,
            anthropicBaseURL: process.env.ANTHROPIC_BASE_URL,
            anthropicModel: process.env.ANTHROPIC_MODEL,
            googleApiKey: process.env.GOOGLE_AI_API_KEY,
        });

        console.log(`🚀 BSA Kit API running on http://localhost:${PORT}`);
        console.log(`   Health: http://localhost:${PORT}/api/health`);
    });
}).catch((err: Error) => {
    console.error('❌ Failed to initialize Prisma:', err);
    process.exit(1);
});

export default app;
