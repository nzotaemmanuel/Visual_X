import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const zones = await prisma.parkingZone.findMany({
      orderBy: { zoneName: 'asc' },
    });

    return NextResponse.json(zones);
  } catch (error: any) {
    console.error('Error fetching zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch zones' },
      { status: 500 }
    );
  }
}
