'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { CustomerAuthProvider, useCustomerAuth } from '@/contexts/CustomerAuthContext';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const { profile, isLoading, handleRoleBasedRedirect } = useCustomerAuth();
  const redirectTo = searchParams.get('redirect') || '/account';

  useEffect(() => {
    console.log('🔍 SignIn useEffect triggered:', { 
      user: user?.id, 
      profile: profile?.role, 
      isLoading, 
      redirectTo 
    });
    
    if (user && !isLoading && profile) {
      // User is signed in and profile is loaded, use role-based redirect
      console.log('✅ User and profile loaded, calling handleRoleBasedRedirect');
      handleRoleBasedRedirect(redirectTo);
    } else if (user && !isLoading && !profile) {
      // User is signed in but no profile yet, redirect to account to create profile
      console.log('⚠️ User exists but no profile, redirecting to /account');
      router.push('/account');
    } else if (!user) {
      // Redirect to Stack Auth's built-in signin page with redirect parameter
      console.log('🔐 No user, redirecting to Stack Auth signin');
      const stackSigninUrl = `/handler/signin?redirect=${encodeURIComponent(redirectTo)}`;
      router.push(stackSigninUrl);
    } else {
      console.log('⏳ Waiting for profile to load...');
    }
    // If user exists but profile is still loading, wait for profile to load
  }, [user, profile, isLoading, router, redirectTo, handleRoleBasedRedirect]);

  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Redirecting to sign in...</p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <CustomerAuthProvider>
      <SignInContent />
    </CustomerAuthProvider>
  );
}