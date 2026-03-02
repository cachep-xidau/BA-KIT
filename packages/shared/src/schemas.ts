import { z } from 'zod';

// --- ID Validation (Prisma cuid format: 25 alphanumeric chars) ---
export const idSchema = z.string().regex(/^[a-z0-9]{25}$/, 'Invalid ID format');

// --- Project Schemas ---
export const createProjectSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
});

export const updateProjectSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    prdContent: z.string().optional(),
});

// --- MCP Connection Schemas ---
export const mcpConnectionSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['figma', 'confluence', 'github', 'notion', 'jira', 'linear', 'sentry', 'google-docs']),
    config: z.record(z.string()),
});

// --- Pipeline Schemas ---
export const generateArtifactsSchema = z.object({
    functionId: idSchema,
    artifactTypes: z
        .array(z.enum(['user-story', 'function-list', 'srs', 'erd', 'sql',
            'flowchart', 'sequence-diagram', 'use-case-diagram', 'activity-diagram',
            'screen-description']))
        .min(1),
});

// --- Environment Validation ---
export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().min(1),
    API_PORT: z.coerce.number().default(3001),
    ANTHROPIC_API_KEY: z.string().optional(),
    ANTHROPIC_BASE_URL: z.string().url().optional().or(z.literal('')),
    ANTHROPIC_MODEL: z.string().optional(),
    GOOGLE_AI_API_KEY: z.string().optional(),
    FIGMA_PERSONAL_ACCESS_TOKEN: z.string().optional(),
    CONFLUENCE_BASE_URL: z.string().url().optional().or(z.literal('')),
    CONFLUENCE_USERNAME: z.string().optional(),
    CONFLUENCE_API_TOKEN: z.string().optional(),
    ENCRYPTION_KEY: z.string().optional(),
    // SePay Payment Gateway
    SEPAY_BASE_URL: z.string().url().default('https://pgapi-sandbox.sepay.vn'),
    SEPAY_MERCHANT_ID: z.string().optional(),
    SEPAY_SECRET_KEY: z.string().optional(),
    // Turso (production database)
    TURSO_DATABASE_URL: z.string().optional(),
    TURSO_AUTH_TOKEN: z.string().optional(),
}).superRefine((data, ctx) => {
    // Require ENCRYPTION_KEY in production for credential storage
    if (data.NODE_ENV === 'production' && !data.ENCRYPTION_KEY) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'ENCRYPTION_KEY is required in production for secure credential storage',
            path: ['ENCRYPTION_KEY'],
        });
    }
    // Validate encryption key format if provided (64 hex chars = 32 bytes)
    if (data.ENCRYPTION_KEY && !/^[a-f0-9]{64}$/i.test(data.ENCRYPTION_KEY)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'ENCRYPTION_KEY must be 64 hex characters (32 bytes)',
            path: ['ENCRYPTION_KEY'],
        });
    }
});

export type Env = z.infer<typeof envSchema>;

// Inferred types from schemas
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type MCPConnectionInput = z.infer<typeof mcpConnectionSchema>;
export type GenerateArtifactsInput = z.infer<typeof generateArtifactsSchema>;

