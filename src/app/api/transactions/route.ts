import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const zoneId = request.nextUrl.searchParams.get('zoneId');

    const includeClause = {
      customer: true,
      bay: {
        include: {
          zone: true
        }
      }
    } as const;

    const tickets = await prisma.parkingTicket.findMany({
      where: zoneId && zoneId !== 'all' ? {
        bay: {
          zoneId: parseInt(zoneId),
        },
      } : undefined,
      include: includeClause,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const transactions = tickets.map((ticket) => ({
      id: ticket.transactionRef,
      zone: ticket.bay?.zone.zoneName || 'Unknown',
      amount: `₦ ${Number(ticket.amountPaid).toLocaleString()}`,
      channel: ticket.channel || 'Web',
      status: ticket.status === 'ACTIVE' ? 'Success' : 'Completed',
      time: new Date(ticket.createdAt).toLocaleTimeString(),
    }));

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
