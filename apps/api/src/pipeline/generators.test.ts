import { describe, it, expect } from 'vitest';
import { buildArtifactRequest, addTraceability } from '../pipeline/generators.js';

describe('buildArtifactRequest', () => {
    const prd = '# My PRD\n\nAs a user I want to login.';

    it('builds user-story request', () => {
        const req = buildArtifactRequest('user-story', prd);
        expect(req.taskType).toBe('user-story-gen');
        expect(req.prompt).toContain('PRD Content');
        expect(req.prompt).toContain(prd);
        expect(req.context).toContain('Business Systems Analyst');
    });

    it('builds function-list request with context', () => {
        const req = buildArtifactRequest('function-list', prd, 'Figma data here');
        expect(req.taskType).toBe('function-list-gen');
        expect(req.prompt).toContain('Figma data here');
    });

    it('builds srs request', () => {
        const req = buildArtifactRequest('srs', prd);
        expect(req.taskType).toBe('srs-generation');
        expect(req.context).toContain('IEEE 830');
    });

    it('builds erd request', () => {
        const req = buildArtifactRequest('erd', prd);
        expect(req.taskType).toBe('erd-generation');
        expect(req.context).toContain('DBML');
    });

    it('builds sql request with ERD context', () => {
        const erdContent = 'Table users { id integer [pk] }';
        const req = buildArtifactRequest('sql', prd, erdContent);
        expect(req.taskType).toBe('sql-generation');
        expect(req.prompt).toContain(erdContent);
    });

    it('builds sql request without ERD', () => {
        const req = buildArtifactRequest('sql', prd);
        expect(req.taskType).toBe('sql-generation');
        expect(req.prompt).toContain(prd);
    });
});

describe('addTraceability', () => {
    it('adds YAML frontmatter', () => {
        const content = '# User Stories\n\n## US-1';
        const result = addTraceability(content, 'user-story', 'proj-123', 'claude');

        expect(result).toContain('artifact_type: user-story');
        expect(result).toContain('project_id: proj-123');
        expect(result).toContain('generated_by: claude');
        expect(result).toContain('generated_at:');
        expect(result).toContain('---');
        expect(result).toContain(content);
    });

    it('preserves original content after frontmatter', () => {
        const content = 'original content here';
        const result = addTraceability(content, 'erd', 'p1', 'gemini');
        const parts = result.split('---');
        expect(parts[parts.length - 1].trim()).toContain(content);
    });
});
