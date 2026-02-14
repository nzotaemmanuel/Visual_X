"use server";

import { db } from "@/lib/db";

export async function getZones() {
    try {
        const result = await db.query('SELECT * FROM parking_zones ORDER BY zone_name ASC');
        return result.rows.map(z => ({
            ...z,
            zoneName: z.zone_name,
            zoneCode: z.zone_code,
            geographicalArea: z.geographical_area,
            id: z.id.toString()
        }));
    } catch (error: any) {
        console.error("Failed to fetch zones:", {
            message: error.message,
            code: error.code,
        });
        return [];
    }
}

export async function getRecentOperations(limit: number = 20) {
    try {
        const operations: any[] = [];

        // Fetch recent violations
        const violationsResult = await db.query(`
            SELECT 
                cv.*,
                v.plate_number,
                pz.zone_name,
                vt.description as violation_description
            FROM customer_violations cv
            JOIN vehicles v ON cv.vehicle_id = v.id
            JOIN parking_zones pz ON cv.zone_id = pz.id
            JOIN violation_types vt ON cv.violation_type_id = vt.id
            ORDER BY cv.violation_date DESC
            LIMIT $1
        `, [limit]);

        const violationOps = violationsResult.rows.map(v => ({
            id: `violation-${v.id}`,
            type: 'violation' as const,
            message: `Overstay detected: Plate ${v.plate_number} at ${v.zone_name}`,
            time: formatTime(v.violation_date),
            timestamp: v.violation_date,
        }));

        // Fetch recent tickets
        const ticketsResult = await db.query(`
            SELECT 
                pt.*,
                v.plate_number,
                c.first_name,
                c.last_name,
                pz.zone_name
            FROM parking_tickets pt
            JOIN vehicles v ON pt.vehicle_id = v.id
            JOIN customers c ON pt.customer_id = c.id
            JOIN parking_bays pb ON pt.bay_id = pb.id
            JOIN parking_zones pz ON pb.zone_id = pz.id
            ORDER BY pt.created_at DESC
            LIMIT $1
        `, [limit]);

        const ticketOps = ticketsResult.rows.map(t => ({
            id: `ticket-${t.id}`,
            type: 'payment' as const,
            message: `New Ticket: ${t.duration_hours}h session for Plate ${t.plate_number}`,
            time: formatTime(t.created_at),
            timestamp: t.created_at,
        }));

        // Fetch recent enforcement actions
        const actionsResult = await db.query(`
            SELECT 
                ea.*,
                v.plate_number,
                pz.zone_name
            FROM enforcement_actions ea
            JOIN customer_violations cv ON ea.violation_id = cv.id
            JOIN vehicles v ON cv.vehicle_id = v.id
            JOIN parking_zones pz ON cv.zone_id = pz.id
            ORDER BY ea.requested_at DESC
            LIMIT $1
        `, [limit]);

        const actionOps = actionsResult.rows.map(a => {
            const actionTypeLabel = a.action_type === 'CLAMP' ? 'CLAMPED' : a.action_type === 'TOW' ? 'TOWED' : 'IMPOUNDED';
            return {
                id: `action-${a.id}`,
                type: 'alert' as const,
                message: `Vehicle ${actionTypeLabel}: Plate ${a.plate_number} at ${a.zone_name}`,
                time: formatTime(a.requested_at),
                timestamp: a.requested_at,
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
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
