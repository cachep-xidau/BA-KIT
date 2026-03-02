import { z } from 'zod';
const idSchema = z.string().regex(/^[a-z0-9]{25}$/, 'Invalid ID format');
const connectSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.string().min(1).max(50),
    projectId: idSchema.optional(),
    credentials: z.record(z.string()),
});
const reqBodyStr = '{"name":"Figma","type":"figma","credentials":{"token":"figd_your_token_here"}}';
const result = connectSchema.safeParse(JSON.parse(reqBodyStr));
console.log(JSON.stringify(result, null, 2));
