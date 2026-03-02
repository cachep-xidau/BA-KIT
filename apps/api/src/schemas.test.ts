import { describe, it, expect } from 'vitest';
import {
    createProjectSchema,
    updateProjectSchema,
    mcpConnectionSchema,
    generateArtifactsSchema,
} from '@bsa-kit/shared';

describe('createProjectSchema', () => {
    it('accepts valid payload', () => {
        const result = createProjectSchema.safeParse({ name: 'UpFit' });
        expect(result.success).toBe(true);
    });

    it('accepts name + description', () => {
        const result = createProjectSchema.safeParse({
            name: 'UpFit',
            description: 'Health app',
        });
        expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
        const result = createProjectSchema.safeParse({ name: '' });
        expect(result.success).toBe(false);
    });

    it('rejects missing name', () => {
        const result = createProjectSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it('rejects name over 200 chars', () => {
        const result = createProjectSchema.safeParse({ name: 'A'.repeat(201) });
        expect(result.success).toBe(false);
    });

    it('rejects description over 2000 chars', () => {
        const result = createProjectSchema.safeParse({
            name: 'OK',
            description: 'X'.repeat(2001),
        });
        expect(result.success).toBe(false);
    });
});

describe('updateProjectSchema', () => {
    it('accepts partial update (name only)', () => {
        const result = updateProjectSchema.safeParse({ name: 'New Name' });
        expect(result.success).toBe(true);
    });

    it('accepts empty object (all optional)', () => {
        const result = updateProjectSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('accepts prdContent', () => {
        const result = updateProjectSchema.safeParse({ prdContent: '# PRD\nSome content' });
        expect(result.success).toBe(true);
    });
});

describe('mcpConnectionSchema', () => {
    it('accepts valid Figma connection', () => {
        const result = mcpConnectionSchema.safeParse({
            name: 'UpFit',
            type: 'figma',
            config: { token: 'figd_xxx' },
        });
        expect(result.success).toBe(true);
    });

    it('accepts valid Confluence connection', () => {
        const result = mcpConnectionSchema.safeParse({
            name: 'SofiaMedix',
            type: 'confluence',
            config: { baseUrl: 'https://x.atlassian.net/wiki', username: 'a@b.c', apiToken: 'xxx' },
        });
        expect(result.success).toBe(true);
    });

    it('rejects missing name', () => {
        const result = mcpConnectionSchema.safeParse({ type: 'figma', config: {} });
        expect(result.success).toBe(false);
    });

    it('accepts additional MCP types', () => {
        const result = mcpConnectionSchema.safeParse({
            name: 'Test',
            type: 'jira',
            config: {},
        });
        expect(result.success).toBe(true);
    });

    it('rejects name over 100 chars', () => {
        const result = mcpConnectionSchema.safeParse({
            name: 'A'.repeat(101),
            type: 'figma',
            config: {},
        });
        expect(result.success).toBe(false);
    });
});

describe('generateArtifactsSchema', () => {
    it('accepts valid artifact generation', () => {
        const result = generateArtifactsSchema.safeParse({
            functionId: 'abcdefghijklmnopqrstuvwxy',
            artifactTypes: ['user-story', 'erd'],
        });
        expect(result.success).toBe(true);
    });

    it('rejects empty artifact types', () => {
        const result = generateArtifactsSchema.safeParse({
            functionId: 'abcdefghijklmnopqrstuvwxy',
            artifactTypes: [],
        });
        expect(result.success).toBe(false);
    });

    it('rejects invalid artifact type', () => {
        const result = generateArtifactsSchema.safeParse({
            functionId: 'abcdefghijklmnopqrstuvwxy',
            artifactTypes: ['invalid-type'],
        });
        expect(result.success).toBe(false);
    });

    it('rejects missing functionId', () => {
        const result = generateArtifactsSchema.safeParse({
            artifactTypes: ['srs'],
        });
        expect(result.success).toBe(false);
    });

    it('accepts all 10 artifact types', () => {
        const result = generateArtifactsSchema.safeParse({
            functionId: 'abcdefghijklmnopqrstuvwxy',
            artifactTypes: ['user-story', 'function-list', 'srs', 'erd', 'sql',
                'flowchart', 'sequence-diagram', 'use-case-diagram', 'activity-diagram',
                'screen-description'],
        });
        expect(result.success).toBe(true);
    });
});
