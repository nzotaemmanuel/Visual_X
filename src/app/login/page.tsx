'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { login } from '@/app/actions/auth';
import { Eye, EyeOff } from 'lucide-react';

const DARK_NAVY = '#0F1419';
const LIGHT_ACCENT = '#E8EBED';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await login({
        email,
        password,
        rememberMe,
      });

      if (result.success && result.user) {
        setSuccess('Login successful. Redirecting...');
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        setTimeout(() => router.push('/'), 1500);
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: DARK_NAVY }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative h-16 w-16">
            <Image
              src="/logo.png"
              alt="LASPA Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: LIGHT_ACCENT }}>
            Welcome Back
          </h1>
          <p style={{ color: '#A0A6AD' }}>Sign in to your account to continue</p>
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

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: LIGHT_ACCENT }}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
                style={{
                  backgroundColor: '#1A1F28',
                  borderColor: password ? '#4A9EFF' : '#2D3139',
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
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
                disabled={loading}
              />
              <span style={{ color: LIGHT_ACCENT }}>Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300">
              Forgot password?
            </Link>
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
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#4A9EFF',
              color: '#fff',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p style={{ color: '#A0A6AD' }}>
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
