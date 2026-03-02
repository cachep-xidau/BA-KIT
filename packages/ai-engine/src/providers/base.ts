import type { AIProvider, AIResponse } from '@bsa-kit/shared';

/**
 * Abstract base for all AI providers.
 */
export abstract class BaseProvider {
    abstract readonly name: AIProvider;

    abstract generate(prompt: string, context?: string): Promise<AIResponse>;
    abstract countTokens(text: string): Promise<number>;
}
