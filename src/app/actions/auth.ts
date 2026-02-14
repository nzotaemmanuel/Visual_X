'use server';

import { dbQuerySingle } from '@/lib/db';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  createSession,
  createRefreshTokenRecord,
  updateUserLastActive,
} from '@/lib/auth';
import { checkLoginRateLimit, resetLoginRateLimit } from '@/lib/rateLimit';
import { cookies } from 'next/headers';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  accessToken?: string;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    // Rate limiting
    const allowed = await checkLoginRateLimit(request.email);
    if (!allowed) {
      return {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.',
      };
    }

    // Find user
    const user = await dbQuerySingle(
      'SELECT * FROM users WHERE email = $1',
      [request.email]
    );

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password.',
      };
    }

    // Check if user is active
    if (!user.is_active) {
      return {
        success: false,
        message: 'Account is deactivated. Please contact an administrator.',
      };
    }

    // Verify password
    const passwordValid = await comparePassword(
      request.password,
      user.password_hash
    );

    if (!passwordValid) {
      return {
        success: false,
        message: 'Invalid email or password.',
      };
    }

    // Reset rate limit on success
    await resetLoginRateLimit(request.email);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Create session
    await createSession(user.id, accessToken);
    await createRefreshTokenRecord(user.id, refreshToken);

    // Update last active
    await updateUserLastActive(user.id);

    // Set cookies
    const cookieStore = await cookies();
    const maxAge = request.rememberMe ? 30 * 24 * 60 * 60 : undefined; // 30 days if Remember Me

    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: maxAge || 15 * 60, // 15 minutes default
    });

    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return {
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name || undefined,
        lastName: user.last_name || undefined,
        role: user.role,
      },
      accessToken,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: `Login failed: ${error.message}`,
    };
  }
}

export async function logout(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }
}
