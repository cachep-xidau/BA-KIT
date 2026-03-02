/**
 * Push local SQLite schema to Turso cloud database.
 * Usage: npx tsx scripts/turso-push.ts
 */
import { createClient } from '@libsql/client';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
        process.exit(1);
    }

    const client = createClient({ url, authToken });
    const migrationsDir = join(__dirname, '..', 'prisma', 'migrations');

    const migrationDirs = readdirSync(migrationsDir)
        .filter((d: string) => !d.startsWith('.') && d !== 'migration_lock.toml')
        .sort();

    console.log(`🚀 Pushing ${migrationDirs.length} migration(s) to Turso...`);
    console.log(`   URL: ${url}\n`);

    for (const dir of migrationDirs) {
        const sqlPath = join(migrationsDir, dir, 'migration.sql');
        try {
            const sql = readFileSync(sqlPath, 'utf-8');
            const statements = sql.split(';').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

            for (const stmt of statements) {
                try {
                    await client.execute(stmt);
                } catch (err: any) {
                    if (err.message?.includes('already exists')) continue;
                    throw err;
                }
            }
            console.log(`   ✅ ${dir}`);
        } catch (err: any) {
            if (err.code === 'ENOENT') {
                console.log(`   ⏭️  ${dir} (no migration.sql)`);
            } else {
                console.error(`   ❌ ${dir}: ${err.message}`);
            }
        }
    }

    console.log('\n📋 Verifying tables...');
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    const tables = result.rows.map((r: any) => r.name).filter((n: string) => !n.startsWith('_') && !n.startsWith('sqlite'));
    console.log(`   Tables: ${tables.join(', ')}`);
    console.log('\n✅ Done!');
    client.close();
}

main().catch((err) => {
    console.error('❌ Fatal:', err);
    process.exit(1);
});
