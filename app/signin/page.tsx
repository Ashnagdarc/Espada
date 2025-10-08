'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SignInForm from '@/components/auth/SignInForm';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isLoading } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/account';

  useEffect(() => {
    // Simple redirect for already authenticated users
    if (!isLoading && user && profile) {
      if (profile.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    }
  }, [user, profile, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in form for unauthenticated users
  return <SignInForm redirectTo={redirectTo} />;
}

export default function SignInPage() {
  return <SignInContent />;
}