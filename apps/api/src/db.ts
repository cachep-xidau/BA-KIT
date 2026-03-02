import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

async function createPrismaClient(): Promise<PrismaClient> {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    // Prisma always needs DATABASE_URL even with driver adapters
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = 'file:./placeholder.db';
    }

    // Production: use Turso (libsql://) via driver adapter
    if (tursoUrl && tursoToken) {
        const libsqlModule = await import('@libsql/client');
        const adapterModule = await import('@prisma/adapter-libsql');

        const createClient = libsqlModule.createClient || (libsqlModule as any).default?.createClient;
        const PrismaLibSql = adapterModule.PrismaLibSql || (adapterModule as any).default?.PrismaLibSql || (adapterModule as any).default;

        const libsql = createClient({
            url: tursoUrl,
            authToken: tursoToken,
        });

        const adapter = new PrismaLibSql(libsql);
        return new PrismaClient({ adapter } as any);
    }

    // Development: use local SQLite file (DATABASE_URL=file:./dev.db)
    return new PrismaClient();
}

// Use top-level await or IIFE to initialize
let prismaInstance: PrismaClient;

async function getPrisma(): Promise<PrismaClient> {
    if (!prismaInstance) {
        if (globalForPrisma.prisma) {
            prismaInstance = globalForPrisma.prisma;
        } else {
            prismaInstance = await createPrismaClient();
            if (process.env.NODE_ENV !== 'production') {
                globalForPrisma.prisma = prismaInstance;
            }
        }
    }
    return prismaInstance;
}

// Initialize eagerly
const prismaPromise = getPrisma();

// Export a proxy that works synchronously after init
export const prisma = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        if (!prismaInstance) {
            throw new Error('Prisma not initialized yet. Await prismaReady first.');
        }
        return (prismaInstance as any)[prop];
    },
});

export const prismaReady = prismaPromise;
