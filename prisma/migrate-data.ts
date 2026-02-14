import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const sqlPath = path.join(process.cwd(), 'local_db_backup.sql');
    console.log(`Reading SQL from ${sqlPath}...`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Splitting SQL into statements...");
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`Executing ${statements.length} SQL statements on Supabase via Prisma Client...`);

    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        try {
            // Some statements like 'SET' or 'SELECT' might not affect rows but are necessary
            await prisma.$executeRawUnsafe(statement);
            successCount++;
            if (successCount % 50 === 0) console.log(`Progress: ${successCount}/${statements.length}...`);
        } catch (err: any) {
            // Log error but continue for small non-critical issues (like schemas already existing)
            console.error(`Error at statement ${i + 1}:`);
            console.error(statement.substring(0, 100) + "...");
            console.error(err.message);
        }
    }

    console.log(`Migration complete. Successfully executed ${successCount}/${statements.length} statements.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
