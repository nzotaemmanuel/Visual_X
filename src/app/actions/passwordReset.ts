'use server';

import { db, dbQuerySingle, dbTransaction } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export async function requestPasswordReset(request: PasswordResetRequest): Promise<PasswordResetResponse> {
  try {
    if (!request.email) {
      return {
        success: false,
        message: 'Email is required.',
      };
    }

    // Find user by email
    const user = await dbQuerySingle(
      'SELECT * FROM users WHERE email = $1',
      [request.email]
    );

    // For security, always return success message (don't reveal if user exists)
    if (!user) {
      return {
        success: true,
        message: 'If the email exists in our system, a password reset link will be sent.',
      };
    }

    // Create password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const id = randomUUID();

    // Clear previous reset requests
    await db.query(
      'DELETE FROM password_resets WHERE user_id = $1',
      [user.id]
    );

    // Create new reset request
    await db.query(
      `INSERT INTO password_resets (id, user_id, token, expires_at, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
      [id, user.id, hashedToken, expiresAt]
    );

    // Build reset link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://laspa-visual-x.vercel.app/`;
    const resetLink = `${appUrl}/reset-password/${resetToken}`;

    // Try to send email via SMTP if configured, otherwise log the link to console
    try {
      const host = process.env.SMTP_HOST;
      const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
      const userAuth = process.env.SMTP_USER;
      const passAuth = process.env.SMTP_PASSWORD;
      const from = process.env.SMTP_FROM || `no-reply@${new URL(appUrl).hostname}`;

      if (host && port && userAuth && passAuth) {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 587, // true for 587, false for other ports
          auth: {
            user: userAuth,
            pass: passAuth,
          },
        });

        const mailOptions = {
          from,
          to: user.email,
          subject: 'LASPA Password Reset',
          text: `You requested a password reset. Use the link below to reset your password:\n\n${resetLink}\n\nThis link expires in 1 hour.`,
          html: `<p>You requested a password reset. Use the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour.</p>`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${user.email}`);
      } else {
        // SMTP not configured - log the link for dev
        console.log(`Password reset link for ${user.email}: ${resetLink}`);
      }
    } catch (sendError: any) {
      console.error('Failed to send password reset email, falling back to console link:', sendError);
      console.log(`Password reset link for ${user.email}: ${resetLink}`);
    }

    return {
      success: true,
      message: 'If the email exists in our system, a password reset link will be sent.',
    };
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      message: 'An error occurred. Please try again.',
    };
  }
}

export async function resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  try {
    if (!request.token || !request.newPassword) {
      return {
        success: false,
        message: 'Reset token and new password are required.',
      };
    }

    if (request.newPassword !== request.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match.',
      };
    }

    if (request.newPassword.length < PASSWORD_MIN_LENGTH) {
      return {
        success: false,
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
      };
    }

    if (!PASSWORD_REGEX.test(request.newPassword)) {
      return {
        success: false,
        message: 'Password must contain uppercase, lowercase, number, and special character.',
      };
    }

    // Hash the token to match stored hash
    const hashedToken = crypto.createHash('sha256').update(request.token).digest('hex');

    // Find reset request
    const resetRequest = await dbQuerySingle(
      `SELECT * FROM password_resets 
         WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [hashedToken]
    );

    if (!resetRequest) {
      return {
        success: false,
        message: 'Invalid or expired reset token.',
      };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(request.newPassword);

    // Update user password and reset request
    await dbTransaction(async (client) => {
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, resetRequest.user_id]
      );
      await client.query(
        'UPDATE password_resets SET used_at = NOW() WHERE id = $1',
        [resetRequest.id]
      );
    });

    return {
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return {
      success: false,
      message: 'An error occurred during password reset. Please try again.',
    };
  }
}
