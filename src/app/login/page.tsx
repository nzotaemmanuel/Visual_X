'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { login } from '@/app/actions/auth';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

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
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isShaking, setIsShaking] = useState(false);

  // Clear errors when user types
  useEffect(() => {
    if (email) setFieldErrors(prev => ({ ...prev, email: undefined }));
  }, [email]);

  useEffect(() => {
    if (password) setFieldErrors(prev => ({ ...prev, password: undefined }));
  }, [password]);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      triggerShake();
      return;
    }

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
        triggerShake();
        // If it's a credential error, highlight both fields
        if (result.message?.toLowerCase().includes('email') || result.message?.toLowerCase().includes('password')) {
          setFieldErrors({ email: ' ', password: ' ' });
        }
      }
    } catch (err: any) {
      const errorMessage = err?.message || JSON.stringify(err) || 'Unknown error';
      setError(`System Error: ${errorMessage}`);
      triggerShake();
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-500" style={{ backgroundColor: DARK_NAVY }}>
      <div className={`w-full max-w-md transition-all duration-300 ${isShaking ? 'animate-shake' : ''}`}>
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative h-20 w-20 hover:scale-105 transition-transform duration-300 cursor-pointer">
            <Image
              src="/laspa-logo.png"
              alt="LASPA Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: LIGHT_ACCENT }}>
            Welcome Back
          </h1>
          <p className="text-sm" style={{ color: '#A0A6AD' }}>Sign in to the Visual X Command Center</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium transition-colors" style={{ color: fieldErrors.email ? '#FF6B6B' : LIGHT_ACCENT }}>
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
                style={{
                  backgroundColor: '#1A1F28',
                  borderColor: (fieldErrors.email && fieldErrors.email !== ' ') ? '#FF6B6B' : (email && !fieldErrors.email ? '#4A9EFF' : '#2D3139'),
                  color: LIGHT_ACCENT,
                  boxShadow: (fieldErrors.email && fieldErrors.email !== ' ') ? '0 0 0 1px rgba(255, 107, 107, 0.2)' : 'none'
                }}
                required
                disabled={loading}
              />
              {fieldErrors.email && fieldErrors.email !== ' ' && (
                <p className="mt-1.5 text-xs font-medium animate-in slide-in-from-top-1 duration-200" style={{ color: '#FF6B6B' }}>
                  {fieldErrors.email}
                </p>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium transition-colors" style={{ color: (fieldErrors.password && fieldErrors.password !== ' ') ? '#FF6B6B' : LIGHT_ACCENT }}>
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200"
                style={{
                  backgroundColor: '#1A1F28',
                  borderColor: (fieldErrors.password && fieldErrors.password !== ' ') ? '#FF6B6B' : (password && !fieldErrors.password ? '#4A9EFF' : '#2D3139'),
                  color: LIGHT_ACCENT,
                  boxShadow: (fieldErrors.password && fieldErrors.password !== ' ') ? '0 0 0 1px rgba(255, 107, 107, 0.2)' : 'none'
                }}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300 transition-colors p-1"
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {fieldErrors.password && fieldErrors.password !== ' ' && (
                <p className="mt-1.5 text-xs font-medium animate-in slide-in-from-top-1 duration-200" style={{ color: '#FF6B6B' }}>
                  {fieldErrors.password}
                </p>
              )}
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center text-sm">
            <label className="flex items-center cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                  disabled={loading}
                />
                <div className={`w-4 h-4 border rounded transition-all duration-200 flex items-center justify-center ${rememberMe ? 'bg-blue-500 border-blue-500' : 'border-gray-600 bg-transparent'}`}>
                  {rememberMe && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span className="ml-2 transition-colors group-hover:text-blue-300" style={{ color: LIGHT_ACCENT }}>Remember me</span>
              </div>
            </label>
          </div>

          {/* Feedback Messages */}
          <div className="min-h-[48px] flex flex-col justify-end">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium" style={{ color: '#51CF66' }}>{success}</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 overflow-hidden active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            style={{
              backgroundColor: '#4A9EFF',
              color: '#fff',
              boxShadow: '0 4px 14px 0 rgba(74, 158, 255, 0.39)'
            }}
          >
            <div className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50 group-hover:bg-white group-hover:animate-ping transition-all" />
                </>
              )}
            </div>

            {/* Hover Shine Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" />
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center animate-in fade-in slide-in-from-bottom-2 duration-1000">
          <p className="text-sm" style={{ color: '#A0A6AD' }}>
            New to the Command Center?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-bold transition-colors underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shine {
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
