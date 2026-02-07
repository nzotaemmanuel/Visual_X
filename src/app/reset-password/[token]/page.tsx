'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/app/actions/passwordReset';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

const DARK_NAVY = '#0F1419';
const LIGHT_ACCENT = '#E8EBED';

const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /[a-z]/, label: 'Lowercase letter' },
  { regex: /[A-Z]/, label: 'Uppercase letter' },
  { regex: /\d/, label: 'Number' },
  { regex: /[@$!%*?&]/, label: 'Special character (@$!%*?&)' },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Basic token validation (check if token exists and has reasonable length)
    if (!token || token.length < 32) {
      setTokenValid(false);
      setError('Invalid or expired reset link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await resetPassword({
        token,
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(result.message || 'Password reset failed. Please try again.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordRequirement = (requirement: any) => {
    return requirement.regex.test(newPassword);
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: DARK_NAVY }}>
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: LIGHT_ACCENT }}>
              Invalid Reset Link
            </h2>
            <p style={{ color: '#A0A6AD' }} className="mb-4">
              The password reset link is invalid or has expired.
            </p>
            <p style={{ color: '#A0A6AD' }}>
              Please request a new password reset link.
            </p>
          </div>

          <div className="mt-8">
            <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 font-medium block mb-4">
              Request New Reset Link
            </Link>
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: DARK_NAVY }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: LIGHT_ACCENT }}>
            Set New Password
          </h1>
          <p style={{ color: '#A0A6AD' }}>Create a strong password for your account</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-2" style={{ color: LIGHT_ACCENT }}>
              New Password
            </label>
            <div className="relative mb-2">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
                style={{
                  backgroundColor: '#1A1F28',
                  borderColor: newPassword ? '#4A9EFF' : '#2D3139',
                  color: LIGHT_ACCENT,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4A9EFF')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2D3139')}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: '#1A1F28', borderColor: '#2D3139' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#A0A6AD' }}>
                  Password Requirements:
                </p>
                <div className="space-y-1">
                  {PASSWORD_REQUIREMENTS.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {checkPasswordRequirement(req) ? (
                        <CheckCircle2 size={16} style={{ color: '#51CF66' }} />
                      ) : (
                        <XCircle size={16} style={{ color: '#FF6B6B' }} />
                      )}
                      <span style={{ color: checkPasswordRequirement(req) ? '#51CF66' : '#A0A6AD' }}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: LIGHT_ACCENT }}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
                style={{
                  backgroundColor: '#1A1F28',
                  borderColor: confirmPassword ? '#4A9EFF' : '#2D3139',
                  color: LIGHT_ACCENT,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#4A9EFF')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#2D3139')}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                disabled={loading}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Password Match Indicator */}
          {newPassword && confirmPassword && (
            <div className="flex items-center gap-2 text-sm">
              {newPassword === confirmPassword ? (
                <>
                  <CheckCircle2 size={16} style={{ color: '#51CF66' }} />
                  <span style={{ color: '#51CF66' }}>Passwords match</span>
                </>
              ) : (
                <>
                  <XCircle size={16} style={{ color: '#FF6B6B' }} />
                  <span style={{ color: '#FF6B6B' }}>Passwords don't match</span>
                </>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50">
              <p style={{ color: '#FF6B6B' }}>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-lg bg-green-500 bg-opacity-20 border border-green-500 border-opacity-50">
              <p style={{ color: '#51CF66' }}>{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              !PASSWORD_REQUIREMENTS.every((req) => checkPasswordRequirement(req))
            }
            className="w-full py-2.5 rounded-lg font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#4A9EFF',
              color: '#fff',
            }}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
