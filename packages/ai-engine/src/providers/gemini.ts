import { GoogleGenAI } from '@google/genai';
import type { AIProvider, AIResponse } from '@bsa-kit/shared';
import { BaseProvider } from './base.js';

const MODEL = 'gemini-2.5-flash';

export class GeminiProvider extends BaseProvider {
    readonly name: AIProvider = 'gemini';
    private client: GoogleGenAI;

    constructor(apiKey: string) {
        super();
        this.client = new GoogleGenAI({ apiKey });
    }

    async generate(prompt: string, context?: string): Promise<AIResponse> {
        const startMs = Date.now();

        const systemInstruction = context
            ? `You are an expert Business Systems Analyst. Use the following context to inform your analysis:\n\n${context}`
            : 'You are an expert Business Systems Analyst. Generate precise, structured artifacts.';

        const fullPrompt = `${systemInstruction}\n\n${prompt}`;

        const response = await this.client.models.generateContent({
            model: MODEL,
            contents: fullPrompt,
        });

        const content = response.text ?? '';
        const usage = response.usageMetadata;

        return {
            content,
            provider: 'gemini',
            tokensUsed: {
                input: usage?.promptTokenCount ?? 0,
                output: usage?.candidatesTokenCount ?? 0,
            },
            latencyMs: Date.now() - startMs,
        };
    }

    async countTokens(text: string): Promise<number> {
        const result = await this.client.models.countTokens({
            model: MODEL,
            contents: text,
        });
        return result.totalTokens ?? 0;
    }
}
