"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * AuthGuard component to handle SSR/client hydration mismatch
 * and provide consistent authentication state across the app
 */
function AuthGuard({ 
  children, 
  fallback = null, 
  requireAuth = false 
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show fallback during SSR and initial hydration
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export { AuthGuard };
export default AuthGuard;