import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, dbQuerySingle } from './db';
import { randomUUID } from 'crypto';

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
  const id = randomUUID();

  await db.query(
    `INSERT INTO sessions (id, user_id, token, expires_at, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [id, userId, token, expiresAt]
  );

  return id;
}

export async function createRefreshTokenRecord(
  userId: number,
  token: string
): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const id = randomUUID();

  await db.query(
    `INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [id, userId, token, expiresAt]
  );

  return id;
}

export async function getSession(
  sessionId: string
): Promise<{ userId: number; token: string; expiresAt: Date } | null> {
  const session = await dbQuerySingle(
    'SELECT * FROM sessions WHERE id = $1',
    [sessionId]
  );

  if (!session || new Date() > session.expires_at) {
    return null;
  }

  return {
    userId: session.user_id,
    token: session.token,
    expiresAt: session.expires_at,
  };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
}

export async function invalidateRefreshToken(tokenId: string): Promise<void> {
  await db.query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
    [tokenId]
  );
}

// Password reset
export async function createPasswordReset(
  userId: number
): Promise<{ token: string; expiresAt: Date }> {
  // Invalidate previous reset tokens
  await db.query(
    'UPDATE password_resets SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
    [userId]
  );

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const id = randomUUID();

  await db.query(
    `INSERT INTO password_resets (id, user_id, token, expires_at, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [id, userId, token, expiresAt]
  );

  return { token, expiresAt };
}

export async function verifyPasswordReset(
  token: string
): Promise<number | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const reset = await dbQuerySingle(
      'SELECT * FROM password_resets WHERE token = $1',
      [token]
    );

    if (
      !reset ||
      reset.used_at ||
      new Date() > reset.expires_at
    ) {
      return null;
    }

    return decoded.userId;
  } catch {
    return null;
  }
}

export async function completePasswordReset(token: string): Promise<void> {
  await db.query(
    'UPDATE password_resets SET used_at = NOW() WHERE token = $1',
    [token]
  );
}

// User update
export async function updateUserLastActive(userId: number): Promise<void> {
  await db.query(
    'UPDATE users SET last_active_at = NOW() WHERE id = $1',
    [userId]
  );
}
