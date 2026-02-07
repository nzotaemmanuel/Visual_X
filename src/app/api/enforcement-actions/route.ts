import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const zoneId = request.nextUrl.searchParams.get('zoneId');

    const query: any = {
      include: {
        violation: {
          include: {
            vehicle: true,
            zone: true,
          },
        },
        requester: true,
      },
      orderBy: { requestedAt: 'desc' },
      take: 10,
    };

    if (zoneId && zoneId !== 'all') {
      query.where = {
        violation: {
          zoneId: parseInt(zoneId),
        },
      };
    }

    const actions = await prisma.enforcementAction.findMany(query);

    const enforcementData = actions.map((action) => ({
      id: action.referenceId,
      vehicle: action.violation.vehicle.plateNumber,
      action: action.actionType,
      zone: action.violation.zone.zoneName,
      officer: action.requester.firstName + ' ' + action.requester.lastName,
      time: new Date(action.requestedAt).toLocaleTimeString(),
      status: action.status,
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
