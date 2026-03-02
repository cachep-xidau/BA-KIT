export type Phase = 'Phase 1: Requirements' | 'Phase 2: Tech Specs' | 'Phase 3: Implementation';

export type Integration = 'jira' | 'confluence' | 'figma' | 'github';

export interface Project {
  id: string;
  phase: Phase;
  title: string;
  description: string;
  progress: number;
  integrations: Integration[];
  updatedAt: string;
}
