import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const targetEmails = [
    'nzotaemmanuel16@gmail.com',
    'emmanuel.nzota@laspa.lagos.gov.ng',
    'emmanuel.nzota@laspa.gov.ng',
  ];

  // Try by known emails first
  let user = null;
  for (const e of targetEmails) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    user = await prisma.user.findUnique({ where: { email: e } });
    if (user) break;
  }

  // Fallback: search by name
  if (!user) {
    user = await prisma.user.findFirst({ where: { firstName: 'Emmanuel', lastName: 'Nzota' } });
  }

  if (!user) {
    console.error('Could not find user Emmanuel Nzota. No changes made.');
    await prisma.$disconnect();
    process.exit(1);
  }

  // Update role to ADMIN
  const updated = await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
  console.log(`Updated user ${updated.email ?? `${updated.firstName} ${updated.lastName}`} to role: ${updated.role}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Error updating user role:', e);
  await prisma.$disconnect();
  process.exit(1);
});
