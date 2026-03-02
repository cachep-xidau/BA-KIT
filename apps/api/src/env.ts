import { envSchema } from '@bsa-kit/shared';
import dotenv from 'dotenv';

dotenv.config();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;
