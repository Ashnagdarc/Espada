/**
 * Utility functions for safe navigation and redirects
 */

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Validates if a redirect URL is safe (same origin)
 */
export function isValidRedirectUrl(url: string, baseUrl?: string): boolean {
  try {
    const redirectUrl = new URL(url, baseUrl || window.location.origin);
    return redirectUrl.origin === (baseUrl || window.location.origin);
  } catch {
    return false;
  }
}

/**
 * Safely redirects to a URL with fallback handling
 */
export function safeRedirect(
  router: AppRouterInstance,
  destination: string,
  fallback: string = '/',
  replace: boolean = true
): void {
  try {
    // Validate the destination URL
    if (!isValidRedirectUrl(destination)) {
      console.warn('Invalid redirect URL, using fallback:', destination);
      destination = fallback;
    }

    console.log('🔄 Redirecting to:', destination);
    
    // Try router navigation first
    if (replace) {
      router.replace(destination);
    } else {
      router.push(destination);
    }
  } catch (navError) {
    console.error('🔄 Router navigation failed, using window.location:', navError);
    try {
      window.location.href = destination;
    } catch (windowError) {
      console.error('🔄 Window navigation also failed:', windowError);
      // Last resort - try fallback
      if (destination !== fallback) {
        window.location.href = fallback;
      }
    }
  }
}

/**
 * Gets the appropriate redirect destination based on user role and intended destination
 */
export function getRedirectDestination(
  userRole: 'admin' | 'customer',
  intendedDestination?: string | null,
  defaultDestination: string = '/account'
): string {
  // Default destinations by role
  const roleDefaults = {
    admin: '/admin',
    customer: '/account'
  };

  // If no intended destination, use role default
  if (!intendedDestination) {
    return roleDefaults[userRole] || defaultDestination;
  }

  // For admin users
  if (userRole === 'admin') {
    // Allow access to admin routes
    if (intendedDestination.startsWith('/admin')) {
      return intendedDestination;
    }
    // For non-admin routes, redirect to admin dashboard
    return roleDefaults.admin;
  }

  // For regular users
  if (userRole === 'customer') {
    // Prevent access to admin routes
    if (intendedDestination.startsWith('/admin')) {
      return roleDefaults.customer;
    }
    // Allow access to other routes if valid
    if (isValidRedirectUrl(intendedDestination)) {
      return intendedDestination;
    }
  }

  // Fallback to default
  return defaultDestination;
}

/**
 * Creates a signin redirect URL with the current page as redirect parameter
 */
export function createSigninRedirect(currentPath?: string): string {
  const redirectPath = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const encodedPath = encodeURIComponent(redirectPath);
  return `/signin?redirect=${encodedPath}`;
}