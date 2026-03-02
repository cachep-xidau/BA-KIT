import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AIResponse } from '@bsa-kit/shared';
import { BaseProvider } from './base.js';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export interface ClaudeProviderConfig {
    apiKey: string;
    baseURL?: string;
    model?: string;
}

export class ClaudeProvider extends BaseProvider {
    readonly name: AIProvider = 'claude';
    private client: Anthropic;
    private model: string;

    constructor(config: ClaudeProviderConfig) {
        super();
        this.model = config.model || DEFAULT_MODEL;
        this.client = new Anthropic({
            apiKey: config.apiKey,
            ...(config.baseURL ? { baseURL: config.baseURL } : {}),
        });
    }

    async generate(prompt: string, context?: string): Promise<AIResponse> {
        const startMs = Date.now();

        const systemMessage = context
            ? `You are an expert Business Systems Analyst. Use the following context to inform your analysis:\n\n${context}`
            : 'You are an expert Business Systems Analyst. Generate precise, structured artifacts.';

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 8192,
            system: systemMessage,
            messages: [{ role: 'user', content: prompt }],
        });

        const textBlock = response.content.find((b) => b.type === 'text');
        const content = textBlock && 'text' in textBlock ? textBlock.text : '';

        return {
            content,
            provider: 'claude',
            tokensUsed: {
                input: response.usage.input_tokens,
                output: response.usage.output_tokens,
            },
            latencyMs: Date.now() - startMs,
        };
    }

    async countTokens(text: string): Promise<number> {
        const result = await this.client.messages.countTokens({
            model: this.model,
            messages: [{ role: 'user', content: text }],
        });
        return result.input_tokens;
    }
}

