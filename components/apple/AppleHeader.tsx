'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AppleHeaderProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'large' | 'compact';
  sticky?: boolean;
  transparent?: boolean;
  blurred?: boolean;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AppleHeader = forwardRef<HTMLElement, AppleHeaderProps>(
  (
    {
      className,
      variant = 'default',
      sticky = false,
      transparent = false,
      blurred = false,
      leftContent,
      centerContent,
      rightContent,
      title,
      subtitle,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'w-full',
      'transition-all duration-300',
      'border-b border-separator-opaque',
      
      // Apple design principles
      'bg-background/95',
      blurred && 'backdrop-blur-xl',
      transparent && 'bg-transparent border-transparent',
      
      // Sticky positioning
      sticky && 'sticky top-0 z-50',
      
      // Touch targets and spacing
      'min-h-apple-touch',
    ];

    const variantClasses = {
      default: [
        'px-apple-4 py-apple-3',
        'min-h-[64px]',
      ],
      large: [
        'px-apple-6 py-apple-6',
        'min-h-[80px]',
      ],
      compact: [
        'px-apple-3 py-apple-2',
        'min-h-[48px]',
      ],
    };

    const containerClasses = cn(
      'flex items-center justify-between',
      'w-full max-w-7xl mx-auto',
      'gap-apple-4'
    );

    const titleClasses = cn(
      'flex flex-col',
      variant === 'large' ? 'text-apple-large-title' : 'text-apple-title-1',
      'font-semibold text-label-primary'
    );

    const subtitleClasses = cn(
      'text-apple-footnote text-label-secondary',
      'mt-apple-1'
    );

    const sectionClasses = cn(
      'flex items-center gap-apple-2',
      'min-h-apple-touch'
    );

    const combinedClasses = cn(
      baseClasses,
      variantClasses[variant],
      className
    );

    return (
      <header ref={ref} className={combinedClasses} {...props}>
        <div className={containerClasses}>
          {/* Left Section */}
          <div className={cn(sectionClasses, 'flex-shrink-0')}>
            {leftContent}
          </div>

          {/* Center Section */}
          <div className={cn(sectionClasses, 'flex-1 justify-center')}>
            {centerContent || (title && (
              <div className={titleClasses}>
                <span>{title}</span>
                {subtitle && (
                  <span className={subtitleClasses}>{subtitle}</span>
                )}
              </div>
            ))}
          </div>

          {/* Right Section */}
          <div className={cn(sectionClasses, 'flex-shrink-0')}>
            {rightContent}
          </div>
        </div>

        {/* Custom children content */}
        {children && (
          <div className="w-full max-w-7xl mx-auto mt-apple-4">
            {children}
          </div>
        )}
      </header>
    );
  }
);

AppleHeader.displayName = 'AppleHeader';

export default AppleHeader;