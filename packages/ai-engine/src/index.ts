import crypto from 'node:crypto';
import type { AIRequest, AIResponse, AIProvider, AITaskType } from '@bsa-kit/shared';
import { BaseProvider } from './providers/base.js';
import type { ClaudeProviderConfig } from './providers/claude.js';
import { ClaudeProvider } from './providers/claude.js';
import { GeminiProvider } from './providers/gemini.js';

/**
 * Model routing rules — maps task types to preferred providers.
 * Claude: reasoning, precision, long-form text.
 * Gemini: multimodal, speed, visual analysis.
 */
const ROUTING_RULES: Record<AITaskType, AIProvider> = {
    'prd-parsing': 'claude',
    'user-story-gen': 'claude',
    'function-list-gen': 'claude',
    'srs-generation': 'claude',
    'figma-analysis': 'gemini',
    'erd-generation': 'claude',
    'sql-generation': 'claude',
    'flowchart-gen': 'claude',
    'sequence-diagram-gen': 'claude',
    'use-case-diagram-gen': 'claude',
    'activity-diagram-gen': 'claude',
    'screen-description-gen': 'claude',
    'structure-extraction': 'claude',
    'prd-generation': 'claude',
    'prd-validation': 'claude',
    'prd-fix': 'claude',
    'analysis-chat': 'claude',
};

/**
 * Fallback order when primary provider fails.
 */
const FALLBACK: Record<AIProvider, AIProvider> = {
    claude: 'gemini',
    gemini: 'claude',
};

/**
 * In-memory response cache with proper SHA-256 hashing.
 * Prevents hash collisions that could return wrong cached responses.
 */
class ResponseCache {
    private cache: Map<string, { response: AIResponse; expiry: number }> = new Map();
    private ttlMs: number;
    private maxEntries: number;

    constructor(ttlMinutes: number = 30, maxEntries: number = 1000) {
        this.ttlMs = ttlMinutes * 60 * 1000;
        this.maxEntries = maxEntries;
    }

    private makeKey(prompt: string, provider: AIProvider): string {
        // Use SHA-256 for collision-resistant hashing
        return crypto
            .createHash('sha256')
            .update(`${provider}:${prompt}`)
            .digest('hex')
            .slice(0, 32); // 32 chars is sufficient for cache key uniqueness
    }

    get(prompt: string, provider: AIProvider): AIResponse | null {
        const key = this.makeKey(prompt, provider);
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        // Re-insert to move to end (LRU behavior)
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.response;
    }

    set(prompt: string, provider: AIProvider, response: AIResponse): void {
        // Evict oldest entries if cache is full
        if (this.cache.size >= this.maxEntries) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }
        const key = this.makeKey(prompt, provider);
        this.cache.set(key, { response, expiry: Date.now() + this.ttlMs });
    }

    clear(): void {
        this.cache.clear();
    }
}

/**
 * Token usage tracker — aggregates costs across providers.
 */
interface TokenStats {
    totalInput: number;
    totalOutput: number;
    byProvider: Record<AIProvider, { input: number; output: number; calls: number }>;
}

/**
 * AI Model Router — routes requests to providers with fallback.
 */
export class AIRouter {
    private providers: Map<AIProvider, BaseProvider> = new Map();
    private cache: ResponseCache = new ResponseCache();
    private stats: TokenStats = {
        totalInput: 0,
        totalOutput: 0,
        byProvider: {
            claude: { input: 0, output: 0, calls: 0 },
            gemini: { input: 0, output: 0, calls: 0 },
        },
    };

    /**
     * Initialize providers from API keys. Only initializes providers
     * for which keys are available.
     */
    init(config: {
        anthropicApiKey?: string;
        anthropicBaseURL?: string;
        anthropicModel?: string;
        googleApiKey?: string;
    }): void {
        // Clear cache on re-init to prevent stale cached responses
        this.cache.clear();

        if (config.anthropicApiKey) {
            const claudeConfig: ClaudeProviderConfig = {
                apiKey: config.anthropicApiKey,
                baseURL: config.anthropicBaseURL,
                model: config.anthropicModel,
            };
            this.providers.set('claude', new ClaudeProvider(claudeConfig));
        }
        if (config.googleApiKey) {
            this.providers.set('gemini', new GeminiProvider(config.googleApiKey));
        }

        const names = Array.from(this.providers.keys());
        if (names.length === 0) {
            console.warn('🤖 AI Router initialized with NO providers — set ANTHROPIC_API_KEY and/or GOOGLE_AI_API_KEY');
        } else {
            console.log(`🤖 AI Router initialized — providers: [${names.join(', ')}]`);
        }
    }

    /**
     * Execute an AI request with routing + fallback.
     */
    async execute(request: AIRequest): Promise<AIResponse> {
        const preferred = request.preferredProvider ?? ROUTING_RULES[request.taskType];

        // Check cache first
        const cached = this.cache.get(request.prompt, preferred);
        if (cached) {
            console.log(`⚡ Cache hit for ${request.taskType} → ${preferred}`);
            return cached;
        }

        // Try preferred provider
        const primary = this.providers.get(preferred);
        let primaryError: Error | null = null;
        if (primary) {
            try {
                const response = await primary.generate(request.prompt, request.context);
                this.trackUsage(preferred, response);
                this.cache.set(request.prompt, preferred, response);
                return response;
            } catch (err) {
                primaryError = err as Error;
                console.warn(`⚠️ ${preferred} failed, trying fallback:`, primaryError.message);
            }
        }

        // Try fallback provider
        const fallbackName = FALLBACK[preferred];
        const fallback = this.providers.get(fallbackName);
        if (fallback) {
            try {
                const response = await fallback.generate(request.prompt, request.context);
                this.trackUsage(fallbackName, response);
                this.cache.set(request.prompt, fallbackName, response);
                return response;
            } catch (err) {
                const fallbackError = err as Error;
                throw new Error(
                    `Both providers failed. ${preferred}: ${primaryError?.message || 'unavailable'}, ${fallbackName}: ${fallbackError.message}`,
                );
            }
        }

        throw new Error('No AI providers available. Check API keys.');
    }

    /**
     * Get preferred provider for a task type.
     */
    getPreferredProvider(taskType: AITaskType): AIProvider {
        return ROUTING_RULES[taskType];
    }

    /**
     * Get usage statistics.
     */
    getStats(): TokenStats {
        return { ...this.stats };
    }

    /**
     * Get list of available provider names.
     */
    getAvailableProviders(): AIProvider[] {
        return Array.from(this.providers.keys());
    }

    private trackUsage(provider: AIProvider, response: AIResponse): void {
        this.stats.totalInput += response.tokensUsed.input;
        this.stats.totalOutput += response.tokensUsed.output;
        this.stats.byProvider[provider].input += response.tokensUsed.input;
        this.stats.byProvider[provider].output += response.tokensUsed.output;
        this.stats.byProvider[provider].calls += 1;
    }
}

// Singleton
export const aiRouter = new AIRouter();

// Re-exports
export { BaseProvider } from './providers/base.js';
export { ClaudeProvider } from './providers/claude.js';
export { GeminiProvider } from './providers/gemini.js';
export { ROUTING_RULES };
export type { AIRequest, AIResponse, AIProvider, AITaskType };
