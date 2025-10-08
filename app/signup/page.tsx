'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SignUpForm from '@/components/auth/SignUpForm';

function SignUpContent() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (user && !isLoading && profile) {
      // User is already signed in and has a profile, redirect based on role
      if (profile.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } else if (user && !isLoading && !profile) {
      // User is signed in but no profile yet, redirect to account to create profile
      router.push('/account');
    }
    // If no user, show the sign-up form
  }, [user, profile, isLoading, router]);

  // If user is already authenticated, show loading
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show sign-up form for unauthenticated users
  return <SignUpForm />;
}

export default function SignUpPage() {
  return <SignUpContent />;
}