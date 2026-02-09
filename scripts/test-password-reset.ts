import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../src/lib/db';

async function run() {
  const email = process.argv[2] || 'admin@laspa.gov.ng';

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('User not found:', email);
    process.exit(1);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
  const pr = await prisma.passwordReset.create({ data: { userId: user.id, token: hashedToken, expiresAt } });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${appUrl}/reset-password/${resetToken}`;

  console.log('Password reset link (dev):', resetLink);

  // Try sending email if SMTP configured
  try {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const userAuth = process.env.SMTP_USER;
    const passAuth = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM || `no-reply@${new URL(appUrl).hostname}`;

    if (host && port && userAuth && passAuth) {
      const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user: userAuth, pass: passAuth } });
      await transporter.sendMail({ from, to: user.email, subject: 'LASPA Password Reset (Dev)', text: `Reset: ${resetLink}`, html: `<a href="${resetLink}">${resetLink}</a>` });
      console.log('Email sent to', user.email);
    } else {
      console.log('SMTP not configured; link logged to console.');
    }
  } catch (e) {
    console.error('Failed to send email:', e);
  }

  await prisma.$disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
