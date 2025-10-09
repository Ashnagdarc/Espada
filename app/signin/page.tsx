'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SignInForm from '@/components/auth/SignInForm';
import { safeRedirect } from '@/lib/utils/redirect';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isLoading } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/account';
  const hasRedirected = useRef(false);
  const profileTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('🔐 SignInPage useEffect:', { 
      isLoading, 
      user: !!user, 
      userEmail: user?.email,
      profile: !!profile, 
      profileRole: profile?.role,
      hasRedirected: hasRedirected.current,
      redirectTo
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
        
        // Clear any pending timeout
        if (profileTimeout.current) {
          clearTimeout(profileTimeout.current);
          profileTimeout.current = null;
        }
        
        // Determine redirect destination with improved role handling
        let destination: string;
        if (profile.role === 'admin') {
          destination = redirectTo?.startsWith('/admin') ? redirectTo : '/admin';
        } else {
          // For customer or any other role, redirect to account or intended destination
          destination = redirectTo?.startsWith('/admin') ? '/account' : (redirectTo || '/account');
        }
        
        console.log('🔐 SignInPage: Redirecting', profile.role, 'to:', destination);
        
        // Use immediate redirect without delay for better UX
        safeRedirect(router, destination, '/account', true);
      } else {
        // User is authenticated but no profile yet - this might be a timing issue
        console.log('🔐 SignInPage: User authenticated but no profile found');
        console.log('🔐 SignInPage: Waiting for profile to load...');
        
        // Set a shorter timeout since auth should be faster now
        if (!profileTimeout.current) {
          profileTimeout.current = setTimeout(() => {
            console.log('🔐 SignInPage: Profile timeout, redirecting to account');
            hasRedirected.current = true;
            safeRedirect(router, '/account', '/account', true);
          }, 2000); // Reduced to 2 seconds
        }
      }
    } else if (!isLoading && !user) {
      console.log('🔐 SignInPage: No user found, showing signin form');
      // Reset redirect flag when no user
      hasRedirected.current = false;
      
      // Clear any pending timeout
      if (profileTimeout.current) {
        clearTimeout(profileTimeout.current);
        profileTimeout.current = null;
      }
    } else {
      console.log('🔐 SignInPage: Still loading authentication state...');
    }
  }, [user, profile, isLoading, router, redirectTo]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (profileTimeout.current) {
        clearTimeout(profileTimeout.current);
      }
    };
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('🔐 SignInPage: Rendering loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show sign-in form for unauthenticated users
  console.log('🔐 SignInPage: Rendering signin form');
  return <SignInForm />;
}

export default function SignInPage() {
  return <SignInContent />;
}