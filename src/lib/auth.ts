import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret-key';
const TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT Token generation
export function generateAccessToken(
  userId: number,
  email: string,
  role: string
): string {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function generateRefreshToken(userId: number): string {
  return jwt.sign(
    { userId },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

// Token verification
export function verifyAccessToken(token: string): {
  userId: number;
  email: string;
  role: string;
} | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { userId: number };
  } catch {
    return null;
  }
}

// Session management
export async function createSession(
  userId: number,
  token: string
): Promise<string> {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return session.id;
}

export async function createRefreshTokenRecord(
  userId: number,
  token: string
): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const refreshToken = await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return refreshToken.id;
}

export async function getSession(
  sessionId: string
): Promise<{ userId: number; token: string; expiresAt: Date } | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || new Date() > session.expiresAt) {
    return null;
  }

  return session;
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.delete({
    where: { id: sessionId },
  }).catch(() => {
    // Session might already be deleted
  });
}

export async function invalidateRefreshToken(tokenId: string): Promise<void> {
  await prisma.refreshToken.update({
    where: { id: tokenId },
    data: { revokedAt: new Date() },
  });
}

// Password reset
export async function createPasswordReset(
  userId: number
): Promise<{ token: string; expiresAt: Date }> {
  // Invalidate previous reset tokens
  await prisma.passwordReset.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordReset.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function verifyPasswordReset(
  token: string
): Promise<number | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    const reset = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (
      !reset ||
      reset.usedAt ||
      new Date() > reset.expiresAt
    ) {
      return null;
    }

    return decoded.userId;
  } catch {
    return null;
  }
}

export async function completePasswordReset(token: string): Promise<void> {
  await prisma.passwordReset.update({
    where: { token },
    data: { usedAt: new Date() },
  });
}

// User update
export async function updateUserLastActive(userId: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveAt: new Date() },
  });
}
