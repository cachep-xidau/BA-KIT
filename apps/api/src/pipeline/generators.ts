import type { ArtifactType, AITaskType, AIRequest, AIResponse } from '@bsa-kit/shared';
import { TEMPLATES } from './templates.js';

/**
 * Maps artifact types to AI task types for routing.
 */
const ARTIFACT_TO_TASK: Record<ArtifactType, AITaskType> = {
    'user-story': 'user-story-gen',
    'function-list': 'function-list-gen',
    'srs': 'srs-generation',
    'erd': 'erd-generation',
    'sql': 'sql-generation',
    'flowchart': 'flowchart-gen',
    'sequence-diagram': 'sequence-diagram-gen',
    'use-case-diagram': 'use-case-diagram-gen',
    'activity-diagram': 'activity-diagram-gen',
    'screen-description': 'screen-description-gen',
};

/**
 * Generate a single artifact from PRD content.
 */
export function buildArtifactRequest(
    type: ArtifactType,
    prdContent: string,
    context?: string,
): AIRequest {
    const template = TEMPLATES[type];
    const taskType = ARTIFACT_TO_TASK[type];

    let prompt: string;
    if (type === 'sql') {
        prompt = template.prompt(prdContent, context); // context = ERD content for SQL
    } else if (type === 'function-list' || type === 'srs' || type === 'screen-description') {
        prompt = template.prompt(prdContent, context);
    } else {
        prompt = (template.prompt as (prd: string) => string)(prdContent);
    }

    return {
        taskType,
        prompt,
        context: template.system,
    };
}

/**
 * Add traceability header to generated content.
 */
export function addTraceability(
    content: string,
    artifactType: ArtifactType,
    projectId: string,
    provider: string,
    mcpSources?: string[],
): string {
    const header = `---
artifact_type: ${artifactType}
project_id: ${projectId}
generated_by: ${provider}
generated_at: ${new Date().toISOString()}
mcp_context: ${mcpSources?.length ? mcpSources.join(', ') : 'none'}
---

`;
    return header + content;
}
