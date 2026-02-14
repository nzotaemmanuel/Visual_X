'use server';

import { db, dbQuerySingle } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export async function signup(request: SignupRequest): Promise<SignupResponse> {
  try {
    // Validation
    if (!request.email || !request.password || !request.firstName || !request.lastName) {
      return {
        success: false,
        message: 'All fields are required.',
      };
    }

    if (request.password !== request.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match.',
      };
    }

    if (request.password.length < PASSWORD_MIN_LENGTH) {
      return {
        success: false,
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
      };
    }

    if (!PASSWORD_REGEX.test(request.password)) {
      return {
        success: false,
        message: 'Password must contain uppercase, lowercase, number, and special character.',
      };
    }

    // Check if user already exists
    const existingUser = await dbQuerySingle(
      'SELECT * FROM users WHERE email = $1',
      [request.email]
    );

    if (existingUser) {
      return {
        success: false,
        message: 'Email already registered.',
      };
    }

    // Hash password
    const passwordHash = await hashPassword(request.password);

    // Create user (default role is VIEWER)
    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, 'VIEWER')
         RETURNING *`,
      [request.email, passwordHash, request.firstName, request.lastName]
    );
    const user = result.rows[0];

    return {
      success: true,
      message: 'Account created successfully. You can now login.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        role: user.role,
      },
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: 'An error occurred during signup. Please try again.',
    };
  }
}
