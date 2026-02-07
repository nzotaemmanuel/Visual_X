import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getZones() {
    const rawZones = await prisma.parkingZone.findMany({
        orderBy: { zoneName: 'asc' }
    });
    return rawZones.map(z => ({
        ...z,
        id: z.id.toString()
    }));
}
