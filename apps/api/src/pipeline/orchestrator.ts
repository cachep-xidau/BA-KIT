import type { ArtifactType, PipelineStatus } from '@bsa-kit/shared';
import { createHash } from 'crypto';
import { aiRouter } from '@bsa-kit/ai-engine';
import { prisma } from '../db.js';
import { buildArtifactRequest, addTraceability } from './generators.js';

interface PipelineResult {
    id: string;
    status: PipelineStatus;
    artifacts: Array<{
        type: ArtifactType;
        id: string;
        status: 'success' | 'failed';
        error?: string;
    }>;
    progress: number;
    startedAt: Date;
    completedAt?: Date;
}

/** Max number of pipeline runs to keep in memory */
const MAX_RUNS = 100;
/** How long to keep completed runs before cleanup (ms) */
const RUN_TTL_MS = 30 * 60 * 1000; // 30 minutes
/** Timeout for a single AI generation call */
const AI_CALL_TIMEOUT_MS = 120_000; // 2 minutes

/**
 * Pipeline Orchestrator — runs artifact generation with progress tracking.
 * Generates artifacts sequentially, building on previous results
 * (e.g., ERD feeds into SQL generation).
 */
export class PipelineOrchestrator {
    private runs: Map<string, PipelineResult> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Periodic cleanup of old runs
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000); // every 5 min
        // Allow process to exit if this is the only active timer
        if (this.cleanupInterval.unref) {
            this.cleanupInterval.unref();
        }
    }

    /**
     * Remove expired runs to prevent memory leak.
     */
    private cleanup(): void {
        const now = Date.now();
        const expired: string[] = [];

        for (const [id, run] of this.runs) {
            const age = now - run.startedAt.getTime();
            if (age > RUN_TTL_MS && run.status !== 'running') {
                expired.push(id);
            }
        }

        // Also remove oldest if over limit
        if (this.runs.size - expired.length > MAX_RUNS) {
            const sorted = Array.from(this.runs.entries())
                .sort((a, b) => a[1].startedAt.getTime() - b[1].startedAt.getTime());
            const toRemove = sorted.slice(0, this.runs.size - MAX_RUNS);
            for (const [id] of toRemove) {
                if (!expired.includes(id)) expired.push(id);
            }
        }

        for (const id of expired) {
            this.runs.delete(id);
        }

        if (expired.length > 0) {
            console.log(`🧹 Pipeline: Cleaned up ${expired.length} expired runs`);
        }
    }

    /**
     * Run the artifact generation pipeline for a project.
     */
    async run(
        functionId: string,
        artifactTypes: ArtifactType[],
        prdContent: string,
        context?: string,
        mcpSources?: string[],
    ): Promise<PipelineResult> {
        const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const result: PipelineResult = {
            id: runId,
            status: 'running',
            artifacts: [],
            progress: 0,
            startedAt: new Date(),
        };
        this.runs.set(runId, result);

        let erdContent: string | undefined;
        const total = artifactTypes.length;
        const sourceHash = createHash('sha256').update(prdContent).digest('hex');

        for (let i = 0; i < total; i++) {
            const type = artifactTypes[i];
            try {
                // Build the AI request
                const aiContext = type === 'sql' && erdContent ? erdContent : context;
                const request = buildArtifactRequest(type, prdContent, aiContext);

                // Execute via AI router (with timeout)
                // NOTE: Full AbortController support requires updating AIRouter.execute signature.
                // Current Promise.race pattern may leak memory for abandoned fetches, but cleanup
                // is handled by node's fetch implementation and provider timeout handling.
                const response = await Promise.race([
                    aiRouter.execute(request),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error(`AI call timed out after ${AI_CALL_TIMEOUT_MS / 1000}s`)), AI_CALL_TIMEOUT_MS),
                    ),
                ]);

                // Add traceability
                const content = addTraceability(response.content, type, functionId, response.provider, mcpSources);

                // Determine next version number
                const existing = await prisma.artifact.count({
                    where: { functionId, type },
                });

                // Store artifact
                const artifact = await prisma.artifact.create({
                    data: {
                        type,
                        content,
                        version: existing + 1,
                        functionId,
                        sourceHash,
                    },
                });

                // Cache ERD for SQL generation
                if (type === 'erd') {
                    erdContent = response.content;
                }

                result.artifacts.push({ type, id: artifact.id, status: 'success' });
                console.log(
                    `✅ Pipeline [${runId}]: ${type} generated (${response.tokensUsed.input + response.tokensUsed.output} tokens, ${response.latencyMs}ms)`,
                );
            } catch (err) {
                result.artifacts.push({
                    type,
                    id: '',
                    status: 'failed',
                    error: err instanceof Error ? err.message : String(err),
                });
                console.error(`❌ Pipeline [${runId}]: ${type} failed —`, (err as Error).message);
            }

            result.progress = Math.round(((i + 1) / total) * 100);
        }

        result.status = result.artifacts.some((a) => a.status === 'failed') ? 'failed' : 'completed';
        result.completedAt = new Date();

        console.log(
            `🏁 Pipeline [${runId}]: ${result.status} — ${result.artifacts.filter((a) => a.status === 'success').length}/${total} artifacts`,
        );

        return result;
    }

    /**
     * Get pipeline run status.
     */
    getRunStatus(runId: string): PipelineResult | undefined {
        return this.runs.get(runId);
    }

    /**
     * Get count of running pipelines.
     */
    getActivePipelineCount(): number {
        return Array.from(this.runs.values()).filter(r => r.status === 'running').length;
    }

    /**
     * Stop cleanup interval (for graceful shutdown).
     */
    shutdown(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.runs.clear();
    }
}

export const pipeline = new PipelineOrchestrator();
