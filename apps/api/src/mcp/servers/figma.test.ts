import { describe, it, expect } from 'vitest';
import { createFigmaConfig } from './figma.js';

describe('createFigmaConfig', () => {
    it('generates correct id and name', () => {
        const config = createFigmaConfig('UpFit', 'figd_test123');
        expect(config.id).toBe('figma-upfit');
        expect(config.name).toBe('Figma UpFit');
        expect(config.type).toBe('figma');
    });

    it('slugifies special characters', () => {
        const config = createFigmaConfig('My Project!', 'tok');
        expect(config.id).toBe('figma-my-project');
    });

    it('slugifies spaces and uppercase', () => {
        const config = createFigmaConfig('Walking Art Queue', 'tok');
        expect(config.id).toBe('figma-walking-art-queue');
    });

    it('strips leading/trailing dashes', () => {
        const config = createFigmaConfig('---test---', 'tok');
        expect(config.id).toBe('figma-test');
    });

    it('sets FIGMA_API_KEY in env', () => {
        const config = createFigmaConfig('X', 'my-secret-token');
        expect(config.transport.type).toBe('stdio');
        if (config.transport.type === 'stdio') {
            expect(config.transport.env?.FIGMA_API_KEY).toBe('my-secret-token');
        }
    });

    it('uses npx with figma-developer-mcp', () => {
        const config = createFigmaConfig('X', 'tok');
        if (config.transport.type === 'stdio') {
            expect(config.transport.command).toBe('npx');
            expect(config.transport.args).toContain('figma-developer-mcp');
        }
    });
});
