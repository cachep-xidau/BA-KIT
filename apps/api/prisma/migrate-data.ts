/**
 * Data Migration Script
 * Migrates existing artifacts from flat (projectId) to tree (functionId) structure.
 * Creates a "Default Feature" + "Default Function" per project and reassigns artifacts.
 *
 * Run with: npx tsx prisma/migrate-data.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌳 Starting data migration: flat → tree structure...\n');

    // 1. Get all projects
    const projects = await prisma.project.findMany();
    console.log(`Found ${projects.length} projects to migrate.\n`);

    for (const project of projects) {
        // 2. Check for existing artifacts using raw query (old schema had projectId on Artifact)
        const artifacts: Array<{ id: string; type: string }> = await prisma.$queryRaw`
            SELECT id, type FROM Artifact WHERE projectId = ${project.id}
        `.catch(() => []);

        if (artifacts.length === 0) {
            console.log(`  📁 ${project.name}: No artifacts, creating empty tree.`);
        } else {
            console.log(`  📁 ${project.name}: ${artifacts.length} artifacts to migrate.`);
        }

        // 3. Create default Feature for this project
        const feature = await prisma.feature.create({
            data: {
                name: 'Chưa phân loại',
                description: `Artifacts chưa được phân loại của ${project.name}`,
                order: 0,
                projectId: project.id,
            },
        });
        console.log(`    ✅ Created Feature: "${feature.name}" (${feature.id})`);

        // 4. Create default Function under that Feature
        const func = await prisma.function.create({
            data: {
                name: 'Chưa phân loại',
                description: `Functions chưa được phân loại của ${project.name}`,
                order: 0,
                featureId: feature.id,
            },
        });
        console.log(`    ✅ Created Function: "${func.name}" (${func.id})`);

        // 5. Reassign all artifacts to this function
        if (artifacts.length > 0) {
            const count = await prisma.$executeRaw`
                UPDATE Artifact SET functionId = ${func.id} WHERE projectId = ${project.id}
            `.catch(() => 0);
            console.log(`    ✅ Migrated ${count} artifacts → Function "${func.name}"\n`);
        }
    }

    console.log('\n🎉 Migration complete!');
}

main()
    .catch((e) => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
