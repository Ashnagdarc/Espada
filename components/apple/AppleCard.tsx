'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AppleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact' | 'spacious' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  loading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  as?: React.ElementType;
}

const AppleCard = forwardRef<HTMLDivElement, AppleCardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      interactive = false,
      loading = false,
      header,
      footer,
      children,
      as: Component = 'div',
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'card-apple',
      'relative overflow-hidden',
      'transition-all duration-200',
      
      // Apple design principles
      'bg-card border border-separator-opaque',
      'rounded-apple-lg',
      
      // Loading state
      loading && 'animate-pulse',
      
      // Interactive states
      interactive && [
        'cursor-pointer',
        'hover:shadow-lg hover:scale-[1.02]',
        'active:scale-[0.98]',
        'focus-apple',
        'transform-gpu will-change-transform',
      ],
    ];

    const variantClasses = {
      default: [
        'bg-card',
        'border border-separator-opaque',
        'shadow-sm',
      ],
      compact: [
        'card-apple-compact',
        'bg-card',
        'border border-separator-opaque',
      ],
      spacious: [
        'card-apple-spacious',
        'bg-card',
        'border border-separator-opaque',
        'shadow-md',
      ],
      elevated: [
        'bg-card',
        'border border-separator-opaque',
        'shadow-lg',
        'hover:shadow-xl',
      ],
      outlined: [
        'bg-transparent',
        'border-2 border-separator-opaque',
        'hover:border-apple-blue-500',
      ],
    };

    const paddingClasses = {
      none: '',
      sm: 'p-apple-2',
      md: 'p-apple-4',
      lg: 'p-apple-6',
      xl: 'p-apple-8',
    };

    const combinedClasses = cn(
      baseClasses,
      variantClasses[variant],
      !header && !footer && paddingClasses[padding],
      className
    );

    const contentClasses = cn(
      'flex flex-col',
      (header || footer) && paddingClasses[padding]
    );

    const headerClasses = cn(
      'border-b border-separator-opaque',
      'pb-apple-3 mb-apple-3',
      'text-apple-headline font-semibold text-label-primary'
    );

    const footerClasses = cn(
      'border-t border-separator-opaque',
      'pt-apple-3 mt-apple-3',
      'text-apple-footnote text-label-secondary'
    );

    if (loading) {
      return (
        <Component ref={ref} className={combinedClasses} {...props}>
          <div className={contentClasses}>
            {header && (
              <div className={headerClasses}>
                <div className="h-6 bg-fill-tertiary rounded-apple-sm animate-pulse" />
              </div>
            )}
            
            <div className="space-y-apple-3">
              <div className="h-4 bg-fill-tertiary rounded-apple-sm animate-pulse" />
              <div className="h-4 bg-fill-tertiary rounded-apple-sm w-3/4 animate-pulse" />
              <div className="h-4 bg-fill-tertiary rounded-apple-sm w-1/2 animate-pulse" />
            </div>
            
            {footer && (
              <div className={footerClasses}>
                <div className="h-4 bg-fill-tertiary rounded-apple-sm w-1/3 animate-pulse" />
              </div>
            )}
          </div>
        </Component>
      );
    }

    return (
      <Component ref={ref} className={combinedClasses} {...props}>
        <div className={contentClasses}>
          {header && (
            <div className={headerClasses}>
              {header}
            </div>
          )}
          
          <div className="flex-1">
            {children}
          </div>
          
          {footer && (
            <div className={footerClasses}>
              {footer}
            </div>
          )}
        </div>
      </Component>
    );
  }
);

AppleCard.displayName = 'AppleCard';

export default AppleCard;