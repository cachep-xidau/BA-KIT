import { Project } from './types';

export const projects: Project[] = [
  {
    id: '1',
    phase: 'Phase 2: Tech Specs',
    title: 'Payment Gateway API',
    description: 'Integration specifications for Stripe and PayPal recurring billing modules.',
    progress: 65,
    integrations: ['jira', 'confluence'],
    updatedAt: 'Updated 2h ago'
  },
  {
    id: '2',
    phase: 'Phase 1: Requirements',
    title: 'Customer Portal Redesign',
    description: 'Initial gathering of business requirements for the new self-service dashboard.',
    progress: 15,
    integrations: ['figma'],
    updatedAt: 'Updated 5h ago'
  },
  {
    id: '3',
    phase: 'Phase 3: Implementation',
    title: 'Legacy Data Migration',
    description: 'Migration scripts and validation procedures for the Q3 data move.',
    progress: 92,
    integrations: ['github', 'jira'],
    updatedAt: 'Updated 1d ago'
  },
  {
    id: '4',
    phase: 'Phase 2: Tech Specs',
    title: 'Mobile App Auth Flow',
    description: 'Revamping OAuth2 implementation for iOS and Android clients.',
    progress: 45,
    integrations: ['confluence'],
    updatedAt: 'Updated 2d ago'
  },
  {
    id: '5',
    phase: 'Phase 1: Requirements',
    title: 'Inventory System V2',
    description: 'Scoping requirements for multi-warehouse support.',
    progress: 10,
    integrations: ['jira', 'figma'],
    updatedAt: 'Updated 3d ago'
  }
];
