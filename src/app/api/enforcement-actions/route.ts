import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const zoneId = request.nextUrl.searchParams.get('zoneId');

    // Build query with JOINs
    let query = `
      SELECT 
        ea.reference_id,
        ea.action_type,
        ea.requested_at,
        ea.status,
        v.plate_number,
        pz.zone_name,
        s.first_name as officer_first_name,
        s.last_name as officer_last_name
      FROM enforcement_actions ea
      LEFT JOIN customer_violations cv ON ea.violation_id = cv.id
      LEFT JOIN vehicles v ON cv.vehicle_id = v.id
      LEFT JOIN parking_zones pz ON cv.zone_id = pz.id
      LEFT JOIN staff s ON ea.requested_by = s.id
    `;

    const params: any[] = [];
    if (zoneId && zoneId !== 'all') {
      // Assuming customer_violations has zone_id, which it does based on schema
      query += ` WHERE cv.zone_id = $1`;
      params.push(parseInt(zoneId));
    }

    query += ` ORDER BY ea.requested_at DESC LIMIT 10`;

    const result = await db.query(query, params);

    const enforcementData = result.rows.map((row) => ({
      id: row.reference_id,
      vehicle: row.plate_number || 'Unknown',
      action: row.action_type,
      zone: row.zone_name || 'Unknown',
      officer: `${row.officer_first_name || ''} ${row.officer_last_name || ''}`.trim() || 'System',
      time: new Date(row.requested_at).toLocaleTimeString(),
      status: row.status,
    }));

    return NextResponse.json(enforcementData);
  } catch (error: any) {
    console.error('Error fetching enforcement actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enforcement actions' },
      { status: 500 }
    );
  }
}