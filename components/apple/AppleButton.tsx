'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AppleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const AppleButton = forwardRef<HTMLButtonElement, AppleButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      // Base Apple button styles
      'btn-apple-base',
      'inline-flex items-center justify-center',
      'font-medium transition-all duration-200',
      'focus-apple',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:animate-apple-press',
      
      // Touch targets (44px minimum)
      'min-h-apple-touch min-w-apple-touch',
      
      // Prevent text selection
      'select-none',
      
      // Smooth animations
      'transform-gpu will-change-transform',
    ];

    const variantClasses = {
      primary: [
        'bg-apple-blue-500 text-white',
        'hover:bg-apple-blue-600 hover:shadow-lg',
        'active:bg-apple-blue-700',
        'dark:bg-apple-blue-500 dark:hover:bg-apple-blue-400',
        'border border-transparent',
      ],
      secondary: [
        'bg-fill-secondary text-label-primary',
        'hover:bg-fill-tertiary hover:shadow-md',
        'active:bg-fill-quaternary',
        'border border-separator-opaque',
      ],
      tertiary: [
        'bg-transparent text-apple-blue-500',
        'hover:bg-fill-secondary hover:text-apple-blue-600',
        'active:bg-fill-tertiary',
        'border border-transparent',
      ],
      destructive: [
        'bg-apple-red-500 text-white',
        'hover:bg-apple-red-600 hover:shadow-lg',
        'active:bg-apple-red-700',
        'border border-transparent',
      ],
      ghost: [
        'bg-transparent text-label-primary',
        'hover:bg-fill-secondary',
        'active:bg-fill-tertiary',
        'border border-transparent',
      ],
    };

    const sizeClasses = {
      sm: [
        'text-apple-footnote',
        'px-apple-3 py-apple-2',
        'rounded-apple-sm',
        'gap-apple-1',
      ],
      md: [
        'text-apple-body',
        'px-apple-4 py-apple-3',
        'rounded-apple-md',
        'gap-apple-2',
      ],
      lg: [
        'text-apple-headline',
        'px-apple-6 py-apple-4',
        'rounded-apple-lg',
        'gap-apple-2',
      ],
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    const combinedClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClasses,
      className
    );

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        
        {children && (
          <span className={cn(
            'truncate',
            (leftIcon || rightIcon || loading) && 'mx-1'
          )}>
            {children}
          </span>
        )}
        
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

AppleButton.displayName = 'AppleButton';

export default AppleButton;