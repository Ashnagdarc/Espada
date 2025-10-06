'use client';

import { useEffect, useState } from 'react';

interface OptimizedLoaderProps {
  message?: string;
  showAfter?: number; // Delay before showing loader (ms)
  className?: string;
}

export function OptimizedLoader({ 
  message = "Loading...", 
  showAfter = 200,
  className = ""
}: OptimizedLoaderProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show loader after a delay to prevent flash for fast loads
    const timer = setTimeout(() => {
      setShow(true);
    }, showAfter);

    return () => clearTimeout(timer);
  }, [showAfter]);

  if (!show) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="relative">
          {/* Optimized spinner with CSS animations */}
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
          {/* Pulse effect for better visual feedback */}
          <div className="absolute inset-0 w-8 h-8 border-2 border-gray-300 rounded-full animate-pulse mx-auto opacity-30" />
        </div>
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

// Skeleton loader for homepage content
export function HomepageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="h-16 bg-white border-b border-gray-200 animate-pulse" />
      
      {/* Main content skeleton */}
      <main className="relative z-10 pt-16">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left content skeleton */}
            <div className="lg:col-span-5 space-y-8">
              {/* Navigation skeleton */}
              <nav className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                ))}
              </nav>
              
              {/* Title skeleton */}
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
              
              {/* Button skeleton */}
              <div className="h-12 bg-gray-200 rounded animate-pulse w-48" />
            </div>
            
            {/* Right content skeleton */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}