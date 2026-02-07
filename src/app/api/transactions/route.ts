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
      // Filter by zone through parking bay
      query.where = {
        bay: {
          zoneId: parseInt(zoneId),
        },
      };
    }

    const tickets = await prisma.parkingTicket.findMany(query);

    const transactions = tickets.map((ticket) => ({
      id: ticket.transactionRef,
      zone: ticket.bay?.id ? 'Zone' : 'Unknown', // Would need bay data for zone name
      amount: `₦ ${ticket.amountPaid.toLocaleString()}`,
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
