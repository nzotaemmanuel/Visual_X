import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

function toCsv(rows: string[][]) {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

export async function GET(request: NextRequest) {
  try {
    const zones = await prisma.parkingZone.findMany({ orderBy: { zoneName: 'asc' } });

    const zoneMetrics = await Promise.all(
      zones.map(async (zone) => {
        const tickets = await prisma.parkingTicket.findMany({ where: { bay: { zoneId: zone.id } } });
        const revenue = tickets.reduce((sum, t) => sum + Number(t.amountPaid), 0);

        const slots = await prisma.parkingSlot.findMany({ where: { bay: { zoneId: zone.id } } });
        const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED').length;
        const occupancy = slots.length > 0 ? (occupiedSlots / slots.length) * 100 : 0;

        return {
          id: zone.id,
          name: zone.zoneName,
          revenueRaw: revenue,
          revenue: revenue,
          occupancy: Math.floor(occupancy),
          totalSlots: slots.length,
          occupiedSlots,
        };
      })
    );

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
