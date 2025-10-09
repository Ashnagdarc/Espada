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

  // Debug logging to understand the state
  useEffect(() => {
    console.log('🔍 SignInContent state:', {
      isLoading,
      user: user ? { email: user.email, id: user.id } : null,
      profile: profile ? { email: profile.email, role: profile.role } : null,
      redirectTo
    });
  }, [isLoading, user, profile, redirectTo]);

  // Handle redirect when user is authenticated
  useEffect(() => {
    if (!isLoading && user && profile) {
      console.log('🚀 User authenticated, determining redirect destination...');
      
      // Determine redirect destination based on role
      let destination: string;
      
      if (profile.role === 'admin') {
        // Admin users go to admin dashboard or the requested admin page
        destination = redirectTo?.startsWith('/admin') ? redirectTo : '/admin';
      } else {
        // Regular users go to account page or the requested non-admin page
        destination = redirectTo?.startsWith('/admin') ? '/account' : redirectTo;
      }
      
      console.log('🚀 Redirecting to:', destination);
      
      // Use router.push for reliable navigation
      router.push(destination);
    }
  }, [user, profile, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and we have a profile, show redirecting state
  if (user && profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show sign-in form for unauthenticated users
  return <SignInForm />;
}

export default function SignInPage() {
  return <SignInContent />;
}