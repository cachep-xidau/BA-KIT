import { describe, it, expect } from 'vitest';
import { TEMPLATES } from '../pipeline/templates.js';

describe('Prompt Templates', () => {
    it('has all 10 artifact types', () => {
        expect(Object.keys(TEMPLATES)).toEqual([
            'user-story',
            'function-list',
            'srs',
            'erd',
            'sql',
            'flowchart',
            'sequence-diagram',
            'use-case-diagram',
            'activity-diagram',
            'screen-description',
        ]);
    });

    it('user-story template has system and prompt', () => {
        const t = TEMPLATES['user-story'];
        expect(t.system).toContain('Business Systems Analyst');
        expect(t.system).toContain('Acceptance Criteria');
        expect(typeof t.prompt).toBe('function');
        expect(t.prompt('test PRD')).toContain('test PRD');
    });

    it('function-list template accepts context', () => {
        const t = TEMPLATES['function-list'];
        const withCtx = t.prompt('prd', 'figma data');
        expect(withCtx).toContain('figma data');
        const withoutCtx = t.prompt('prd');
        expect(withoutCtx).not.toContain('Additional Context');
    });

    it('srs template references IEEE 830', () => {
        expect(TEMPLATES.srs.system).toContain('IEEE 830');
    });

    it('erd template generates DBML', () => {
        expect(TEMPLATES.erd.system).toContain('DBML');
        expect(TEMPLATES.erd.system).toContain('dbdiagram.io');
    });

    it('sql template produces dual output', () => {
        expect(TEMPLATES.sql.system).toContain('MySQL');
        expect(TEMPLATES.sql.system).toContain('SQL Server');
    });

    it('sql prompt includes ERD when provided', () => {
        const prompt = TEMPLATES.sql.prompt('prd content', 'Table users {}');
        expect(prompt).toContain('Table users {}');
        expect(prompt).toContain('prd content');
    });
});
