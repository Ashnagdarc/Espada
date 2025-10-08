'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SignInForm from '@/components/auth/SignInForm';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isLoading } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/account';
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log('🔐 SignInPage useEffect:', { 
      isLoading, 
      user: !!user, 
      userEmail: user?.email,
      profile: !!profile, 
      profileRole: profile?.role,
      hasRedirected: hasRedirected.current
    });
    
    // Prevent multiple redirects
    if (hasRedirected.current) {
      console.log('🔐 SignInPage: Already redirected, skipping...');
      return;
    }
    
    // Only redirect if we have a user and are not loading
    if (!isLoading && user) {
      console.log('🔐 SignInPage: User is authenticated, checking profile...');
      
      if (profile) {
        console.log('🔐 SignInPage: Profile found, redirecting based on role:', profile.role);
        hasRedirected.current = true;
        
        // Use router.replace for better navigation
        if (profile.role === 'admin') {
          console.log('🔐 SignInPage: Redirecting admin to /admin');
          router.replace('/admin');
        } else {
          console.log('🔐 SignInPage: Redirecting user to /account');
          router.replace('/account');
        }
      } else {
        // User is authenticated but no profile yet - this might be a timing issue
        console.log('🔐 SignInPage: User authenticated but no profile found');
        console.log('🔐 SignInPage: Waiting for profile to load...');
        // Don't redirect immediately, let the profile load
      }
    } else if (!isLoading && !user) {
      console.log('🔐 SignInPage: No user found, showing signin form');
    } else {
      console.log('🔐 SignInPage: Still loading authentication state...');
    }
  }, [user, profile, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('🔐 SignInPage: Rendering loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated but we haven't redirected yet, show loading
  if (user && !hasRedirected.current) {
    console.log('🔐 SignInPage: User authenticated, preparing redirect...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show sign-in form for unauthenticated users
  console.log('🔐 SignInPage: Rendering signin form');
  return <SignInForm redirectTo={redirectTo} />;
}

export default function SignInPage() {
  return <SignInContent />;
}