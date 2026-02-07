"use server";

import { prisma } from "@/lib/db";

export async function getZones() {
    try {
        const rawZones = await prisma.parkingZone.findMany({
            orderBy: {
                zoneName: 'asc'
            }
        });
        return rawZones.map(z => ({
            ...z,
            id: z.id.toString()
        }));
    } catch (error: any) {
        console.error("Failed to fetch zones:", {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
        return [];
    }
}

export async function getRecentOperations(limit: number = 20) {
    try {
        const operations: any[] = [];

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
            time: formatTime(v.violationDate),
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
            time: formatTime(t.createdAt),
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
                time: formatTime(a.requestedAt),
                timestamp: a.requestedAt,
            };
        });

        // Combine and sort by timestamp, take most recent
        operations.push(...violationOps, ...ticketOps, ...actionOps);
        operations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        return operations.slice(0, limit).map(({ timestamp, ...op }) => op);
    } catch (error: any) {
        console.error("Failed to fetch recent operations:", {
            message: error.message,
            code: error.code,
        });
        return [];
    }
}

function formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
