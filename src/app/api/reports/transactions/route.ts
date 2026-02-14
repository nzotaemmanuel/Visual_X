import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

function csvEscape(v: any) {
  return `"${String(v ?? '').replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  try {
    const zoneId = request.nextUrl.searchParams.get('zoneId');
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by Zone (via parking_bays -> parking_zones)
    if (zoneId && zoneId !== 'all') {
      // Need to join parking_bays or check bay_id in subquery/join
      // But parking_tickets has bay_id.
      conditions.push(`pt.bay_id IN (SELECT id FROM parking_bays WHERE zone_id = $${paramIndex++})`);
      params.push(parseInt(zoneId));
    }

    if (startDate) {
      conditions.push(`pt.created_at >= $${paramIndex++}`);
      params.push(new Date(startDate));
    }
    if (endDate) {
      conditions.push(`pt.created_at <= $${paramIndex++}`);
      params.push(new Date(endDate));
    }

    const baseWhere = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const pageSize = 1000;

    const stream = new ReadableStream({
      async start(controller) {
        const header = ['transactionRef', 'zoneId', 'bayId', 'amountPaid', 'channel', 'status', 'createdAt', 'customerId', 'customerName'];
        controller.enqueue(header.join(',') + '\n');

        let lastId = 0;
        while (true) {
          const currentParams = [...params];
          const whereClause = baseWhere
            ? `${baseWhere} AND pt.id > $${paramIndex}`
            : `WHERE pt.id > $${paramIndex}`;

          currentParams.push(lastId);

          const query = `
            SELECT 
                pt.*,
                pb.zone_id,
                c.first_name,
                c.last_name
            FROM parking_tickets pt
            LEFT JOIN parking_bays pb ON pt.bay_id = pb.id
            LEFT JOIN customers c ON pt.customer_id = c.id
            ${whereClause}
            ORDER BY pt.id ASC
            LIMIT ${pageSize}
          `;

          const result = await db.query(query, currentParams);
          const batch = result.rows;

          if (batch.length === 0) break;

          for (const t of batch) {
            const row = [
              csvEscape(t.transaction_ref || t.id),
              csvEscape(t.zone_id ?? ''),
              csvEscape(t.bay_id ?? ''),
              csvEscape(t.amount_paid ?? 0),
              csvEscape(t.channel ?? ''),
              csvEscape(t.status ?? ''),
              csvEscape(t.created_at?.toISOString() ?? ''),
              csvEscape(t.customer_id ?? ''),
              csvEscape((t.first_name || t.last_name) ? `${t.first_name || ''} ${t.last_name || ''}`.trim() : ''),
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
