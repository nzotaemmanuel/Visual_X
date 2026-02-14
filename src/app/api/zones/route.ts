import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const result = await db.query('SELECT * FROM parking_zones ORDER BY zone_name ASC');

    const zones = result.rows.map(z => ({
      ...z,
      zoneName: z.zone_name,
      zoneCode: z.zone_code,
      geographicalArea: z.geographical_area,
      createdAt: z.created_at,
      updatedAt: z.updated_at
    }));

    return NextResponse.json(zones);
  } catch (error: any) {
    console.error('Error fetching zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch zones' },
      { status: 500 }
    );
  }
}
