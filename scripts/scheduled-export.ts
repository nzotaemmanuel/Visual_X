// scripts/scheduled-export.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function csvEscape(v: any) {
  return `"${String(v ?? '').replace(/"/g, '""')}"`;
}

async function buildTopZonesCsv() {
  const zones = await prisma.parkingZone.findMany({ orderBy: { zoneName: 'asc' } });
  const header = ['zoneId', 'zoneName', 'revenue', 'revenueRaw', 'occupancyPercent', 'totalSlots', 'occupiedSlots'];
  const rows: string[] = [header.join(',')];

  for (const z of zones) {
    const tickets = await prisma.parkingTicket.findMany({ where: { bay: { zoneId: z.id } } });
    const revenue = tickets.reduce((s, t) => s + Number(t.amountPaid), 0);
    const slots = await prisma.parkingSlot.findMany({ where: { bay: { zoneId: z.id } } });
    const occupied = slots.filter(s => s.status === 'OCCUPIED').length;
    const occupancy = slots.length > 0 ? Math.floor((occupied / slots.length) * 100) : 0;

    const row = [
      csvEscape(z.id),
      csvEscape(z.zoneName),
      csvEscape(revenue),
      csvEscape(revenue),
      csvEscape(occupancy),
      csvEscape(slots.length),
      csvEscape(occupied),
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

async function buildTransactionsCsv(startDate?: string, endDate?: string) {
  const where: any = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  // limit is configurable here; for scheduled day exports this should be fine
  const tickets = await prisma.parkingTicket.findMany({
    where,
    include: { bay: true, customer: true },
    orderBy: { createdAt: 'desc' },
  });

  const header = ['transactionRef', 'zoneId', 'bayId', 'amountPaid', 'channel', 'status', 'createdAt', 'customerId', 'customerName'];
  const rows: string[] = [header.join(',')];

  for (const t of tickets) {
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
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

async function sendMail(subject: string, text: string, attachments: Array<{filename: string, content: string | Buffer}>) {
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
    // example: export yesterday's transactions
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const start = new Date(yesterday.setHours(0,0,0,0)).toISOString();
    const end = new Date(yesterday.setHours(23,59,59,999)).toISOString();

    console.log('Building top zones CSV...');
    const topCsv = await buildTopZonesCsv();
    console.log(`Top zones CSV built (${topCsv.length} bytes)`);

    console.log(`Building transactions CSV for ${start} to ${end}...`);
    const txCsv = await buildTransactionsCsv(start, end);
    console.log(`Transactions CSV built (${txCsv.length} bytes)`);

    console.log('Sending email...');
    await sendMail(
      `LASPA Scheduled Reports - ${new Date().toISOString().slice(0,10)}`,
      `Attached are scheduled exports for ${new Date().toISOString().slice(0,10)}.`,
      [
        { filename: `top-zones-${new Date().toISOString().slice(0,10)}.csv`, content: topCsv },
        { filename: `transactions-${new Date().toISOString().slice(0,10)}.csv`, content: txCsv },
      ]
    );
  } catch (err) {
    console.error('Scheduled export failed', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();