import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrate() {
    const prisma = new PrismaClient();

    try {
        console.log("Connecting to Supabase via Prisma...");
        const sqlPath = path.resolve(process.cwd(), 'local_db_backup.sql');
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`Migration failed: local_db_backup.sql not found at ${sqlPath}`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log("Reading SQL backup file...");

        // Split SQL by semicolon and execute in chunks if needed, but for now we'll try as one block
        // executeRawUnsafe allows multi-statement execution in PostgreSQL
        console.log("Executing SQL migration on Supabase...");
        await prisma.$executeRawUnsafe(sql);

        console.log("Migration SUCCESSFUL!");
    } catch (err) {
        console.error("Migration FAILED:");
        console.error(err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
