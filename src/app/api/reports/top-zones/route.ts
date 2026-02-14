import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

function toCsv(rows: string[][]) {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT 
        pz.id,
        pz.zone_name,
        COALESCE(SUM(pt.amount_paid), 0) as revenue,
        COUNT(CASE WHEN ps.status = 'OCCUPIED' THEN 1 END) as occupied_slots,
        COUNT(ps.id) as total_slots
      FROM parking_zones pz
      LEFT JOIN parking_bays pb ON pb.zone_id = pz.id
      LEFT JOIN parking_tickets pt ON pt.bay_id = pb.id
      LEFT JOIN parking_slots ps ON ps.bay_id = pb.id
      GROUP BY pz.id, pz.zone_name
      ORDER BY pz.zone_name ASC
    `;
    // Note: The above query joins tickets and slots which causes Cartesian product if a bay has both.
    // Tickets are many per bay, slots are many per bay. This is bad.
    // We should use subqueries or separate aggregations.

    // Better query:
    const optimizedQuery = `
      WITH ZoneRevenue AS (
        SELECT 
          pb.zone_id, 
          SUM(pt.amount_paid) as revenue 
        FROM parking_tickets pt
        JOIN parking_bays pb ON pt.bay_id = pb.id
        GROUP BY pb.zone_id
      ),
      ZoneOccupancy AS (
        SELECT 
          pb.zone_id,
          COUNT(*) as total_slots,
          COUNT(CASE WHEN ps.status = 'OCCUPIED' THEN 1 END) as occupied_slots
        FROM parking_slots ps
        JOIN parking_bays pb ON ps.bay_id = pb.id
        GROUP BY pb.zone_id
      )
      SELECT 
        pz.id,
        pz.zone_name,
        COALESCE(zr.revenue, 0) as revenue,
        COALESCE(zo.total_slots, 0) as total_slots,
        COALESCE(zo.occupied_slots, 0) as occupied_slots
      FROM parking_zones pz
      LEFT JOIN ZoneRevenue zr ON pz.id = zr.zone_id
      LEFT JOIN ZoneOccupancy zo ON pz.id = zo.zone_id
      ORDER BY pz.zone_name ASC
    `;

    const result = await db.query(optimizedQuery);
    const zones = result.rows;

    const zoneMetrics = zones.map((z) => {
      const revenue = Number(z.revenue);
      const totalSlots = Number(z.total_slots);
      const occupiedSlots = Number(z.occupied_slots);
      const occupancy = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

      return {
        id: z.id,
        name: z.zone_name,
        revenueRaw: revenue,
        revenue: revenue,
        occupancy: Math.floor(occupancy),
        totalSlots,
        occupiedSlots,
      };
    });

    // Build CSV
    const header = ['zoneId', 'zoneName', 'revenue', 'revenueRaw', 'occupancyPercent', 'totalSlots', 'occupiedSlots'];
    const rows = [header, ...zoneMetrics.map((z) => [z.id, z.name, z.revenue, z.revenueRaw, z.occupancy, z.totalSlots, z.occupiedSlots])];
    const csv = toCsv(rows as any);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="top-zones.csv"',
      },
    });
  } catch (error: any) {
    console.error('Error exporting top zones:', error);
    return NextResponse.json({ error: 'Failed to export top zones' }, { status: 500 });
  }
}
