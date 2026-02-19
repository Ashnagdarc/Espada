'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Email and password are required');
        return;
      }

      const result = await signIn(email, password);
      
      if (result.error) {
        setError(result.error);
      } else {
        const callbackUrl = searchParams.get('callbackUrl');
        router.push(callbackUrl || '/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-system-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
          <span className="text-label-primary">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-system-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-large-title font-semibold text-label-primary mb-2">
            Welcome Back
          </h1>
          <p className="text-callout text-label-secondary">
            Sign in to your account to continue
          </p>
        </div>

        {/* Sign In Form */}
        <div className="card-apple p-8 bg-white dark:bg-gray-900 border border-separator shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-white dark:bg-black border border-black dark:border-white rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-black dark:text-white flex-shrink-0 mt-0.5" />
                <p className="text-sm text-black dark:text-white font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-label-primary mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-black border-2 border-gray-300 dark:border-gray-700 rounded-lg text-base text-label-primary placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-label-primary mb-2">
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
                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-black border-2 border-gray-300 dark:border-gray-700 rounded-lg text-base text-label-primary placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all duration-200"
                    placeholder="Enter your password"
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
                <label htmlFor="remember-me" className="ml-2 block text-sm text-label-secondary">
                  Remember me
                </label>
              </div>

              <Link
                href="/auth/reset-password"
                className="text-sm text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-label-secondary">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Admin Login Link */}
        <div className="text-center">
          <Link
            href="/admin/login"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}