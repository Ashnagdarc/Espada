'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AuthCodeErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // Log the error for debugging
    console.error('Authentication code exchange failed');
  }, []);

  const handleRetry = () => {
    // Clear any potentially corrupted session data
    if (typeof window !== 'undefined') {
      try {
        // Clear all Supabase-related storage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
        
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Error clearing storage:', error);
      }
    }
    
    // Redirect to sign in page
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-label-primary mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Authentication Error
          </h1>
          <p className="text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            We encountered an error while processing your authentication. This could be due to an expired or invalid authentication code.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-label-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="block w-full px-4 py-3 border border-separator text-label-primary rounded-lg hover:bg-fill-secondary transition-all"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Return to Home
          </Link>
        </div>

        <div className="mt-8 text-sm text-label-tertiary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
          <p>If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  );
}