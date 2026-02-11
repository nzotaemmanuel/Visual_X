import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

function csvEscape(v: any) {
  return `"${String(v ?? '').replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  try {
    const zoneId = request.nextUrl.searchParams.get('zoneId');
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');

    const where: any = {};
    if (zoneId && zoneId !== 'all') {
      where.bay = { zoneId: parseInt(zoneId) };
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const pageSize = 1000;

    const stream = new ReadableStream({
      async start(controller) {
        const header = ['transactionRef', 'zoneId', 'bayId', 'amountPaid', 'channel', 'status', 'createdAt', 'customerId', 'customerName'];
        controller.enqueue(header.join(',') + '\n');

        const includeClause = { bay: true, customer: true } as const;

        let lastId: any = undefined;
        while (true) {
          const batch = await prisma.parkingTicket.findMany({
            where,
            include: includeClause,
            orderBy: { id: 'asc' },
            take: pageSize,
            ...(lastId ? { cursor: { id: lastId }, skip: 1 } : {}),
          });
          if (batch.length === 0) break;

          for (const t of batch) {
            const row = [
              csvEscape(t.transactionRef || t.id),
              csvEscape(t.bay?.zoneId ?? ''),
              csvEscape(t.bayId ?? ''),
              csvEscape(t.amountPaid ?? 0),
              csvEscape(t.channel ?? ''),
              csvEscape(t.status ?? ''),
              csvEscape(t.createdAt?.toISOString() ?? ''),
              csvEscape(t.customerId ?? ''),
              csvEscape(t.customer ? `${t.customer.firstName || ''} ${t.customer.lastName || ''}`.trim() : ''),
            ];
            controller.enqueue(row.join(',') + '\n');
            lastId = t.id;
          }

          if (batch.length < pageSize) break;
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="transactions.csv"',
      },
    });
  } catch (error: any) {
    console.error('Error exporting transactions (stream):', error);
    return new Response(JSON.stringify({ error: 'Failed to export transactions' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
