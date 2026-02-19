'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Shield } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, isLoading, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        setError(result.error);
      } else if (result.profile) {
        // Check if user is admin
        if (result.profile.role === 'admin') {
          router.push('/admin');
        } else {
          setError('Access denied. Admin privileges required.');
        }
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-system-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white dark:bg-black border border-black dark:border-white rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-label-primary" />
          </div>
          <h1 className="text-large-title font-semibold text-label-primary mb-2">
            Admin Access
          </h1>
          <p className="text-callout text-label-secondary">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Admin Login Form */}
        <div className="card-apple p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-white dark:bg-black border border-black dark:border-white rounded-lg p-4">
                <p className="text-footnote text-black dark:text-white font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-subheadline font-medium text-label-primary mb-2">
                  Admin Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-body text-label-primary placeholder-label-tertiary focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200"
                  placeholder="Enter admin email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-subheadline font-medium text-label-primary mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-body text-label-primary placeholder-label-tertiary focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all duration-200"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 dark:border-gray-700 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-footnote text-label-secondary">
                  Keep me signed in
                </label>
              </div>

              <Link
                href="/auth/reset-password"
                className="text-footnote text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In to Admin'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-footnote text-label-secondary">
              Need customer access?{' '}
              <Link
                href="/signin"
                className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
              >
                Customer Login
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-caption2 text-label-tertiary">
            This is a secure admin area. All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}