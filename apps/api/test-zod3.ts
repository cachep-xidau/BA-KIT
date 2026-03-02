import { z } from 'zod';
const idSchema = z.string().regex(/^[a-z0-9]{25}$/, 'Invalid ID format');
const connectSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.string().min(1).max(50),
    projectId: idSchema.optional(),
    credentials: z.record(z.string()),
});
const result = connectSchema.safeParse({ name: "Figma", type: "figma", credentials: { token: "figd_xxx"} });
console.log("Empty object result:", JSON.stringify(result, null, 2));

const result2 = connectSchema.safeParse({ name: "Figma", type: "figma", projectId: "", credentials: { token: "figd_xxx"} });
console.log("Empty string result:", JSON.stringify(result2, null, 2));

const result3 = connectSchema.safeParse({ name: "Figma", type: "figma", projectId: "default", credentials: { token: "figd_xxx"} });
console.log("Default string result:", JSON.stringify(result3, null, 2));
