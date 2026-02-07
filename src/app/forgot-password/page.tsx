'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { requestPasswordReset } from '@/app/actions/passwordReset';
import { Mail } from 'lucide-react';

const DARK_NAVY = '#0F1419';
const LIGHT_ACCENT = '#E8EBED';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await requestPasswordReset({ email });

      if (result.success) {
        setSuccess(result.message);
        setSubmitted(true);
        setEmail('');
      } else {
        setError(result.message || 'Request failed. Please try again.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password reset request error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: DARK_NAVY }}>
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#E8EBED', color: DARK_NAVY }}
            >
              <Mail size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: LIGHT_ACCENT }}>
              Check Your Email
            </h2>
            <p style={{ color: '#A0A6AD' }} className="mb-4">
              We've sent a password reset link to <strong>{email || 'your email address'}</strong>
            </p>
            <p style={{ color: '#A0A6AD' }}>
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t" style={{ borderColor: '#2D3139' }}>
            <p style={{ color: '#A0A6AD' }} className="mb-4">
              Didn't receive the email?
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Try again
            </button>
          </div>

          <div className="mt-6">
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: DARK_NAVY }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: LIGHT_ACCENT }}>
            Reset Password
          </h1>
          <p style={{ color: '#A0A6AD' }}>Enter your email address to receive a password reset link</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: LIGHT_ACCENT }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
              style={{
                backgroundColor: '#1A1F28',
                borderColor: email ? '#4A9EFF' : '#2D3139',
                color: LIGHT_ACCENT,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#4A9EFF')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2D3139')}
              required
              disabled={loading}
            />
          </div>

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
            disabled={loading || !email}
            className="w-full py-2.5 rounded-lg font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#4A9EFF',
              color: '#fff',
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
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
