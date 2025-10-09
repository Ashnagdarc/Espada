'use client';

import React, { forwardRef, useState, useId } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface AppleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
}

const AppleInput = forwardRef<HTMLInputElement, AppleInputProps>(
  (
    {
      className,
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      variant = 'default',
      inputSize = 'md',
      fullWidth = true,
      showPasswordToggle = false,
      type = 'text',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    
    const inputId = id || `apple-input-${generatedId}`;
    const isPassword = type === 'password';
    const hasError = !!errorText;
    const inputType = isPassword && showPassword ? 'text' : type;

    const containerClasses = cn(
      'form-group-apple',
      fullWidth && 'w-full'
    );

    const labelClasses = cn(
      'label-apple',
      hasError && 'text-apple-red-500',
      disabled && 'opacity-50'
    );

    const inputWrapperClasses = cn(
      'relative flex items-center',
      fullWidth && 'w-full'
    );

    const baseInputClasses = [
      'input-apple',
      'w-full',
      'transition-all duration-200',
      'focus-apple',
      
      // Touch targets
      'min-h-apple-touch',
      
      // Typography
      'text-apple-body',
      'placeholder:text-form-placeholder',
      
      // Disabled state
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'disabled:bg-fill-quaternary',
    ];

    const variantClasses = {
      default: [
        'bg-form-background',
        'border border-form-border',
        'focus:border-form-border-focus',
        'rounded-apple-md',
      ],
      filled: [
        'bg-fill-secondary',
        'border border-transparent',
        'focus:bg-form-background',
        'focus:border-form-border-focus',
        'rounded-apple-md',
      ],
      outlined: [
        'bg-transparent',
        'border-2 border-form-border',
        'focus:border-form-border-focus',
        'rounded-apple-lg',
      ],
    };

    const sizeClasses = {
      sm: [
        'text-apple-footnote',
        'px-apple-3 py-apple-2',
      ],
      md: [
        'text-apple-body',
        'px-apple-4 py-apple-3',
      ],
      lg: [
        'text-apple-headline',
        'px-apple-5 py-apple-4',
      ],
    };

    const errorClasses = hasError ? [
      'border-form-border-error',
      'focus:border-form-border-error',
      'bg-apple-red-50 dark:bg-apple-red-900/10',
    ] : [];

    const iconClasses = 'flex-shrink-0 text-label-secondary';
    const leftIconClasses = cn(iconClasses, 'ml-apple-3');
    const rightIconClasses = cn(iconClasses, 'mr-apple-3');

    const inputClasses = cn(
      baseInputClasses,
      variantClasses[variant],
      sizeClasses[inputSize],
      errorClasses,
      leftIcon && 'pl-apple-10',
      (rightIcon || isPassword) && 'pr-apple-10',
      className
    );

    const helperTextClasses = cn(
      'helper-text-apple',
      hasError ? 'error-text-apple' : 'text-label-secondary'
    );

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        
        <div className={inputWrapperClasses}>
          {leftIcon && (
            <div className={leftIconClasses}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={inputClasses}
            disabled={disabled}
            {...props}
          />
          
          {(rightIcon || isPassword) && (
            <div className={rightIconClasses}>
              {isPassword && showPasswordToggle ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded-apple-sm hover:bg-fill-secondary transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              ) : rightIcon ? (
                rightIcon
              ) : null}
            </div>
          )}
          
          {hasError && !rightIcon && !isPassword && (
            <div className={rightIconClasses}>
              <AlertCircle className="h-4 w-4 text-apple-red-500" />
            </div>
          )}
        </div>
        
        {(helperText || errorText) && (
          <div className={helperTextClasses}>
            {errorText || helperText}
          </div>
        )}
      </div>
    );
  }
);

AppleInput.displayName = 'AppleInput';

export default AppleInput;