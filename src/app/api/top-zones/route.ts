import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Optimized single query for revenue and occupancy
    const query = `
      WITH ZoneRevenue AS (
        SELECT 
          pb.zone_id,
          COALESCE(SUM(pt.amount_paid), 0) as total_revenue
        FROM parking_tickets pt
        JOIN parking_bays pb ON pt.bay_id = pb.id
        GROUP BY pb.zone_id
      ),
      ZoneOccupancy AS (
        SELECT
          pb.zone_id,
          COUNT(ps.id) as total_slots,
          COUNT(CASE WHEN ps.status = 'OCCUPIED' THEN 1 END) as occupied_slots
        FROM parking_slots ps
        JOIN parking_bays pb ON ps.bay_id = pb.id
        GROUP BY pb.zone_id
      )
      SELECT
        pz.id,
        pz.zone_name,
        COALESCE(zr.total_revenue, 0) as revenue,
        COALESCE(zo.total_slots, 0) as total_slots,
        COALESCE(zo.occupied_slots, 0) as occupied_slots
      FROM parking_zones pz
      LEFT JOIN ZoneRevenue zr ON pz.id = zr.zone_id
      LEFT JOIN ZoneOccupancy zo ON pz.id = zo.zone_id
      ORDER BY revenue DESC
      LIMIT 4
    `;

    const result = await db.query(query);

    const topZones = result.rows.map(row => {
      const revenue = Number(row.revenue);
      const totalSlots = Number(row.total_slots);
      const occupiedSlots = Number(row.occupied_slots);
      const occupancy = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

      return {
        id: row.id.toString(),
        name: row.zone_name,
        revenue: `₦ ${(revenue / 1000000).toFixed(1)}M`,
        revenueRaw: revenue / 1000000,
        occupancy: `${Math.floor(occupancy)}%`,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        progress: Math.floor(occupancy),
      };
    });

    return NextResponse.json(topZones);
  } catch (error: any) {
    console.error('Error fetching top zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top zones' },
      { status: 500 }
    );
  }
}
