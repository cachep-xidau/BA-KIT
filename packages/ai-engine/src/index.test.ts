import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIRouter } from './index.js';

// Mock providers with proper class constructors
vi.mock('./providers/claude.js', () => {
    return {
        ClaudeProvider: class {
            name = 'claude';
            generate = vi.fn().mockResolvedValue({
                content: 'Claude response',
                provider: 'claude',
                tokensUsed: { input: 100, output: 200 },
                latencyMs: 500,
            });
            countTokens = vi.fn().mockResolvedValue(50);
        },
    };
});

vi.mock('./providers/gemini.js', () => {
    return {
        GeminiProvider: class {
            name = 'gemini';
            generate = vi.fn().mockResolvedValue({
                content: 'Gemini response',
                provider: 'gemini',
                tokensUsed: { input: 80, output: 150 },
                latencyMs: 300,
            });
            countTokens = vi.fn().mockResolvedValue(40);
        },
    };
});

describe('AIRouter', () => {
    let router: AIRouter;

    beforeEach(() => {
        vi.clearAllMocks();
        router = new AIRouter();
    });

    it('initializes with available API keys', () => {
        router.init({ anthropicApiKey: 'test-key' });
        expect(router.getAvailableProviders()).toContain('claude');
    });

    it('initializes both providers', () => {
        router.init({ anthropicApiKey: 'key1', googleApiKey: 'key2' });
        expect(router.getAvailableProviders()).toHaveLength(2);
    });

    it('routes reasoning tasks to claude', () => {
        expect(router.getPreferredProvider('prd-parsing')).toBe('claude');
        expect(router.getPreferredProvider('user-story-gen')).toBe('claude');
        expect(router.getPreferredProvider('srs-generation')).toBe('claude');
        expect(router.getPreferredProvider('erd-generation')).toBe('claude');
        expect(router.getPreferredProvider('sql-generation')).toBe('claude');
    });

    it('routes multimodal tasks to gemini', () => {
        expect(router.getPreferredProvider('figma-analysis')).toBe('gemini');
    });

    it('executes request and returns response', async () => {
        router.init({ anthropicApiKey: 'test-key' });

        const response = await router.execute({
            taskType: 'user-story-gen',
            prompt: 'Generate user stories',
        });

        expect(response.content).toBe('Claude response');
        expect(response.provider).toBe('claude');
    });

    it('tracks token usage after execution', async () => {
        router.init({ anthropicApiKey: 'test-key' });

        await router.execute({
            taskType: 'user-story-gen',
            prompt: 'test',
        });

        const stats = router.getStats();
        expect(stats.totalInput).toBe(100);
        expect(stats.totalOutput).toBe(200);
        expect(stats.byProvider.claude.calls).toBe(1);
    });

    it('falls back when primary provider fails', async () => {
        router.init({ anthropicApiKey: 'key1', googleApiKey: 'key2' });

        // Override Claude's generate to fail
        const claudeProvider = (router as any).providers.get('claude');
        claudeProvider.generate = vi.fn().mockRejectedValue(new Error('Claude down'));

        const response = await router.execute({
            taskType: 'prd-parsing',
            prompt: 'test',
        });

        expect(response.provider).toBe('gemini');
    });

    it('throws when no providers available', async () => {
        await expect(
            router.execute({ taskType: 'prd-parsing', prompt: 'test' }),
        ).rejects.toThrow('No AI providers available');
    });

    it('respects preferredProvider override', async () => {
        router.init({ anthropicApiKey: 'key1', googleApiKey: 'key2' });

        const response = await router.execute({
            taskType: 'prd-parsing',
            prompt: 'test',
            preferredProvider: 'gemini',
        });

        expect(response.provider).toBe('gemini');
    });

    it('returns cached response on second call', async () => {
        router.init({ anthropicApiKey: 'test-key' });

        const first = await router.execute({
            taskType: 'user-story-gen',
            prompt: 'identical prompt',
        });

        const second = await router.execute({
            taskType: 'user-story-gen',
            prompt: 'identical prompt',
        });

        expect(first).toEqual(second);
        expect(router.getStats().byProvider.claude.calls).toBe(1);
    });
});
