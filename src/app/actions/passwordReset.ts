'use server';

import { prisma } from '@/lib/db';
import { createPasswordReset, verifyPasswordReset, completePasswordReset, hashPassword } from '@/lib/auth';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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
    const user = await prisma.user.findUnique({
      where: { email: request.email },
    });

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

    // Clear previous reset requests
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Create new reset request
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

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
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        token: hashedToken,
        usedAt: null, // Not yet used
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetRequest) {
      return {
        success: false,
        message: 'Invalid or expired reset token.',
      };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(request.newPassword);

    // Update user password and reset request
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { usedAt: new Date() },
      }),
    ]);

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
