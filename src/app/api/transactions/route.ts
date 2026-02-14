import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const zoneId = request.nextUrl.searchParams.get('zoneId');

    let query = `
      SELECT 
        pt.transaction_ref,
        pt.amount_paid,
        pt.channel,
        pt.status,
        pt.created_at,
        pz.zone_name
      FROM parking_tickets pt
      JOIN parking_bays pb ON pt.bay_id = pb.id
      JOIN parking_zones pz ON pb.zone_id = pz.id
    `;

    const params: any[] = [];
    if (zoneId && zoneId !== 'all') {
      query += ` WHERE pb.zone_id = $1`;
      params.push(parseInt(zoneId));
    }

    query += ` ORDER BY pt.created_at DESC LIMIT 20`;

    const result = await db.query(query, params);

    const transactions = result.rows.map((ticket) => ({
      id: ticket.transaction_ref,
      zone: ticket.zone_name || 'Unknown',
      amount: `₦ ${Number(ticket.amount_paid).toLocaleString()}`,
      channel: ticket.channel || 'Web',
      status: ticket.status === 'ACTIVE' ? 'Success' : 'Completed',
      time: new Date(ticket.created_at).toLocaleTimeString(),
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
