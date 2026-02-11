import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const zones = await prisma.parkingZone.findMany({
      orderBy: { zoneName: 'asc' },
    });

    // Calculate revenue and occupancy for each zone
    const zoneMetrics = await Promise.all(
      zones.map(async (zone) => {
        // Calculate revenue from tickets in this zone
        const tickets = await prisma.parkingTicket.findMany({
          where: {
            bay: {
              zoneId: zone.id,
            },
          },
        });

        const revenue = tickets.reduce(
          (sum, t) => sum + Number(t.amountPaid),
          0
        );

        // Calculate occupancy from parking slots
        const slots = await prisma.parkingSlot.findMany({
          where: {
            bay: {
              zoneId: zone.id,
            },
          },
        });

        const occupiedSlots = slots.filter(
          (s) => s.status === 'OCCUPIED'
        ).length;
        const occupancy =
          slots.length > 0 ? (occupiedSlots / slots.length) * 100 : 0;

        return {
          id: zone.id.toString(),
          name: zone.zoneName,
          revenue: `₦ ${(revenue / 1000000).toFixed(1)}M`,
          revenueRaw: revenue / 1000000,
          occupancy: `${Math.floor(occupancy)}%`,
          trend: Math.random() > 0.5 ? ('up' as const) : ('down' as const),
          progress: Math.floor(occupancy),
        };
      })
    );

    // Sort by revenue and take top 4
    const topZones = zoneMetrics
      .sort((a, b) => b.revenueRaw - a.revenueRaw)
      .slice(0, 4);

    return NextResponse.json(topZones);
  } catch (error: any) {
    console.error('Error fetching top zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top zones' },
      { status: 500 }
    );
  }
}
