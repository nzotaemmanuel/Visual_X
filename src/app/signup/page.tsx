'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signup } from '@/app/actions/signup';
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

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await signup(formData);

      if (result.success) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setError(result.message || 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordRequirement = (requirement: any) => {
    return requirement.regex.test(formData.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: DARK_NAVY }}>
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
            Create Account
          </h1>
          <p style={{ color: '#A0A6AD' }}>Join us to get started</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={{ color: LIGHT_ACCENT }}>
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
              style={{
                backgroundColor: '#1A1F28',
                borderColor: formData.firstName ? '#4A9EFF' : '#2D3139',
                color: LIGHT_ACCENT,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#4A9EFF')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2D3139')}
              required
              disabled={loading}
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={{ color: LIGHT_ACCENT }}>
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
              style={{
                backgroundColor: '#1A1F28',
                borderColor: formData.lastName ? '#4A9EFF' : '#2D3139',
                color: LIGHT_ACCENT,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#4A9EFF')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2D3139')}
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: LIGHT_ACCENT }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
              style={{
                backgroundColor: '#1A1F28',
                borderColor: formData.email ? '#4A9EFF' : '#2D3139',
                color: LIGHT_ACCENT,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#4A9EFF')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2D3139')}
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: LIGHT_ACCENT }}>
              Password
            </label>
            <div className="relative mb-2">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
                style={{
                  backgroundColor: '#1A1F28',
                  borderColor: formData.password ? '#4A9EFF' : '#2D3139',
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
            {formData.password && (
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
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
                style={{
                  backgroundColor: '#1A1F28',
                  borderColor: formData.confirmPassword ? '#4A9EFF' : '#2D3139',
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
          {formData.password && formData.confirmPassword && (
            <div className="flex items-center gap-2 text-sm">
              {formData.password === formData.confirmPassword ? (
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
              !formData.firstName ||
              !formData.lastName ||
              !formData.email ||
              !formData.password ||
              !formData.confirmPassword ||
              formData.password !== formData.confirmPassword
            }
            className="w-full py-2.5 rounded-lg font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#4A9EFF',
              color: '#fff',
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p style={{ color: '#A0A6AD' }}>
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
