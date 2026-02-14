import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const zoneId = request.nextUrl.searchParams.get('zoneId');

    // Base query
    let query = `
      SELECT v.*, count(pr.id) as session_count
      FROM vehicles v
      LEFT JOIN parking_requests pr ON v.id = pr.vehicle_id
    `;

    const params: any[] = [];

    if (zoneId && zoneId !== 'all') {
      // If we have a zone filter, we specifically want vehicles that have requests in that zone.
      query += ` WHERE pr.zone_id = $1`;
      params.push(parseInt(zoneId));
    }

    query += ` GROUP BY v.id ORDER BY v.created_at DESC LIMIT 20`;

    const result = await db.query(query, params);

    const vehicleData = result.rows.map((vehicle) => ({
      id: vehicle.id.toString(),
      plate: vehicle.plate_number,
      owner: 'Private', // Assuming default as prev code hardcoded 'Private'
      brand: 'Vehicle', // Prev code hardcoded 'Vehicle'
      status: 'Parked', // Prev code hardcoded 'Parked'
      zone: 'Multi-zone', // Prev code hardcoded 'Multi-zone'
      sessions: parseInt(vehicle.session_count || '0'),
    }));

    return NextResponse.json(vehicleData);
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}
