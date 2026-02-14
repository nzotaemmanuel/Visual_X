import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
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

export async function getStaffList() {
    const staff = await prisma.staff.findMany({
        orderBy: { firstName: 'asc' },
        include: { zone: true }
    } as any);
    return staff;
}

export async function getRecentOperations(limit: number = 20) {
    const operations = [];

    // Fetch recent violations
    const recentViolations = await prisma.customerViolation.findMany({
        take: limit,
        orderBy: { violationDate: 'desc' },
        include: {
            vehicle: true,
            violationType: true,
            zone: true,
        },
    });

    const violationOps = recentViolations.map(v => ({
        id: `violation-${v.id}`,
        type: 'violation' as const,
        message: `Overstay detected: Plate ${v.vehicle.plateNumber} at ${v.zone.zoneName}`,
        time: new Date(v.violationDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: v.violationDate,
    }));

    // Fetch recent tickets
    const recentTickets = await prisma.parkingTicket.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            vehicle: true,
            customer: true,
            bay: true,
        },
    });

    const ticketOps = recentTickets.map(t => ({
        id: `ticket-${t.id}`,
        type: 'payment' as const,
        message: `New Ticket: ${t.durationHours}h session for Plate ${t.vehicle.plateNumber}`,
        time: new Date(t.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: t.createdAt,
    }));

    // Fetch recent enforcement actions
    const recentActions = await prisma.enforcementAction.findMany({
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
            violation: {
                include: {
                    vehicle: true,
                    zone: true,
                },
            },
        },
    });

    const actionOps = recentActions.map(a => {
        const actionTypeLabel = a.actionType === 'CLAMP' ? 'CLAMPED' : a.actionType === 'TOW' ? 'TOWED' : 'IMPOUNDED';
        return {
            id: `action-${a.id}`,
            type: 'alert' as const,
            message: `Vehicle ${actionTypeLabel}: Plate ${a.violation.vehicle.plateNumber} at ${a.violation.zone.zoneName}`,
            time: new Date(a.requestedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: a.requestedAt,
        };
    });

    // Combine and sort by timestamp, take most recent
    operations.push(...violationOps, ...ticketOps, ...actionOps);
    operations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return operations.slice(0, limit).map(({ timestamp, ...op }) => op);
}
