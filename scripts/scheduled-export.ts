// scripts/scheduled-export.ts
import 'dotenv/config';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function csvEscape(v: any) {
  return `"${String(v ?? '').replace(/"/g, '""')}"`;
}

async function buildTopZonesCsv() {
  const query = `
    WITH ZoneRevenue AS (
      SELECT 
        pb.zone_id, 
        SUM(pt.amount_paid) as revenue 
      FROM parking_tickets pt
      JOIN parking_bays pb ON pt.bay_id = pb.id
      GROUP BY pb.zone_id
    ),
    ZoneOccupancy AS (
      SELECT 
        pb.zone_id,
        COUNT(*) as total_slots,
        COUNT(CASE WHEN ps.status = 'OCCUPIED' THEN 1 END) as occupied_slots
      FROM parking_slots ps
      JOIN parking_bays pb ON ps.bay_id = pb.id
      GROUP BY pb.zone_id
    )
    SELECT 
      pz.id,
      pz.zone_name,
      COALESCE(zr.revenue, 0) as revenue,
      COALESCE(zo.total_slots, 0) as total_slots,
      COALESCE(zo.occupied_slots, 0) as occupied_slots
    FROM parking_zones pz
    LEFT JOIN ZoneRevenue zr ON pz.id = zr.zone_id
    LEFT JOIN ZoneOccupancy zo ON pz.id = zo.zone_id
    ORDER BY pz.zone_name ASC
  `;

  const result = await pool.query(query);
  const header = ['zoneId', 'zoneName', 'revenue', 'revenueRaw', 'occupancyPercent', 'totalSlots', 'occupiedSlots'];
  const rows: string[] = [header.join(',')];

  for (const z of result.rows) {
    const revenue = Number(z.revenue);
    const totalSlots = Number(z.total_slots);
    const occupied = Number(z.occupied_slots);
    const occupancy = totalSlots > 0 ? Math.floor((occupied / totalSlots) * 100) : 0;

    const row = [
      csvEscape(z.id),
      csvEscape(z.zone_name),
      csvEscape(revenue),
      csvEscape(revenue),
      csvEscape(occupancy),
      csvEscape(totalSlots),
      csvEscape(occupied),
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

async function buildTransactionsCsv(startDate?: string, endDate?: string) {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (startDate) {
    conditions.push(`pt.created_at >= $${paramIndex++}`);
    params.push(new Date(startDate));
  }
  if (endDate) {
    conditions.push(`pt.created_at <= $${paramIndex++}`);
    params.push(new Date(endDate));
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

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
    ORDER BY pt.created_at DESC
  `;

  const result = await pool.query(query, params);
  const header = ['transactionRef', 'zoneId', 'bayId', 'amountPaid', 'channel', 'status', 'createdAt', 'customerId', 'customerName'];
  const rows: string[] = [header.join(',')];

  for (const t of result.rows) {
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
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

async function sendMail(subject: string, text: string, attachments: Array<{ filename: string, content: string | Buffer }>) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    } : undefined,
  });

  const recipients = (process.env.RECIPIENTS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (recipients.length === 0) {
    console.warn('No recipients set in RECIPIENTS env var — aborting email send.');
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipients.join(','),
    subject,
    text,
    attachments: attachments.map(a => ({ filename: a.filename, content: a.content })),
  });

  console.log('Scheduled report emailed to', recipients);
}

async function main() {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const start = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
    const end = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();

    console.log('Building top zones CSV...');
    const topCsv = await buildTopZonesCsv();
    console.log(`Top zones CSV built (${topCsv.length} bytes)`);

    console.log(`Building transactions CSV for ${start} to ${end}...`);
    const txCsv = await buildTransactionsCsv(start, end);
    console.log(`Transactions CSV built (${txCsv.length} bytes)`);

    console.log('Sending email...');
    await sendMail(
      `LASPA Scheduled Reports - ${new Date().toISOString().slice(0, 10)}`,
      `Attached are scheduled exports for ${new Date().toISOString().slice(0, 10)}.`,
      [
        { filename: `top-zones-${new Date().toISOString().slice(0, 10)}.csv`, content: topCsv },
        { filename: `transactions-${new Date().toISOString().slice(0, 10)}.csv`, content: txCsv },
      ]
    );
  } catch (err) {
    console.error('Scheduled export failed', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
