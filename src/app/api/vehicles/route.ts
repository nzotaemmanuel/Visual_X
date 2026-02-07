import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const zoneId = request.nextUrl.searchParams.get('zoneId');

    const query: any = {
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    };

    if (zoneId && zoneId !== 'all') {
      // Filter vehicles by zone
      query.where = {
        parkingRequests: {
          some: {
            zoneId: parseInt(zoneId),
          },
        },
      };
    }

    const vehicles = await prisma.vehicle.findMany(query);

    const vehicleData = vehicles.map((vehicle) => ({
      id: vehicle.id.toString(),
      plate: vehicle.plateNumber,
      owner: 'Private',
      brand: 'Vehicle',
      status: 'Parked',
      zone: 'Multi-zone',
      sessions: 0,
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
