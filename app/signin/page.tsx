'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SignInForm from '@/components/auth/SignInForm';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isLoading, handleRoleBasedRedirect } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/account';
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ Loading timeout reached, forcing loading state to false');
        setLoadingTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  useEffect(() => {
    // Only proceed if not loading (or if timeout reached)
    if (isLoading && !loadingTimeout) return;

    if (user && profile) {
      // User is signed in and profile is loaded, use role-based redirect
      console.log('🔄 Redirecting authenticated user with profile');
      handleRoleBasedRedirect(redirectTo);
    } else if (user && !profile) {
      // User is signed in but no profile yet, redirect to account to create profile
      console.log('🔄 Redirecting authenticated user without profile to account');
      router.push('/account');
    }
    // If no user and not loading, show the sign-in form
  }, [user, profile, isLoading, loadingTimeout, router, redirectTo, handleRoleBasedRedirect]);

  // If user is already authenticated and still loading (and timeout not reached), show loading
  if (user && isLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // If timeout reached or other issues, show error message
  if (loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Authentication timeout. Please try signing in again.</p>
          <SignInForm redirectTo={redirectTo} />
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