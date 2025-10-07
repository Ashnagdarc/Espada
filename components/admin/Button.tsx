'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const getVariantClasses = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return 'bg-apple-blue-500 text-label-primary-inverse hover:bg-apple-blue-600 active:bg-apple-blue-700';
    case 'secondary':
      return 'bg-fill-secondary text-label-primary hover:bg-fill-tertiary active:bg-fill-quaternary';
    case 'outline':
      return 'border-2 border-separator text-label-primary hover:bg-fill-secondary active:bg-fill-tertiary';
    case 'ghost':
      return 'text-label-primary hover:bg-fill-secondary active:bg-fill-tertiary';
    case 'danger':
      return 'bg-apple-red-500 text-label-primary-inverse hover:bg-apple-red-600 active:bg-apple-red-700';
    case 'success':
      return 'bg-apple-green-500 text-label-primary-inverse hover:bg-apple-green-600 active:bg-apple-green-700';
    default:
      return 'bg-apple-blue-500 text-label-primary-inverse hover:bg-apple-blue-600 active:bg-apple-blue-700';
  }
};

const getSizeClasses = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return 'px-apple-3 py-apple-2 text-apple-footnote min-h-apple-touch';
    case 'md':
      return 'px-apple-4 py-apple-3 text-apple-body min-h-apple-touch';
    case 'lg':
      return 'px-apple-6 py-apple-4 text-apple-headline min-h-apple-touch';
    case 'xl':
      return 'px-apple-8 py-apple-5 text-apple-title-3 min-h-apple-touch';
    default:
      return 'px-apple-4 py-apple-3 text-apple-body min-h-apple-touch';
  }
};

const getIconSize = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return 'h-4 w-4';
    case 'md':
      return 'h-4 w-4';
    case 'lg':
      return 'h-5 w-5';
    case 'xl':
      return 'h-6 w-6';
    default:
      return 'h-4 w-4';
  }
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-apple-md
    transition-all duration-200
    focus-apple
    disabled:opacity-50 disabled:cursor-not-allowed
    shadow-apple-sm hover:shadow-apple-md
    border border-transparent
    select-none transform-gpu will-change-transform
  `;

  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const iconSizeClasses = getIconSize(size);
  const widthClasses = fullWidth ? 'w-full' : '';

  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses} ${className}`}
      style={{ fontFamily: 'Gilroy, sans-serif' }}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {loading && (
        <motion.div
          className={`${iconSizeClasses} mr-2`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className={iconSizeClasses} />
        </motion.div>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <motion.div
          className={`${iconSizeClasses} mr-2`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            className: iconSizeClasses
          })}
        </motion.div>
      )}
      
      <span>{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <motion.div
          className={`${iconSizeClasses} ml-2`}
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ duration: 0.2 }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            className: iconSizeClasses
          })}
        </motion.div>
      )}
    </motion.button>
  );
};

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  orientation = 'horizontal',
  spacing = 'sm'
}) => {
  const getSpacingClasses = () => {
    if (spacing === 'none') return '';
    
    const spacingMap = {
      sm: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
      md: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4',
      lg: orientation === 'horizontal' ? 'space-x-6' : 'space-y-6'
    };
    
    return spacingMap[spacing];
  };

  const orientationClasses = orientation === 'horizontal' ? 'flex' : 'flex flex-col';
  const spacingClasses = getSpacingClasses();

  return (
    <motion.div
      className={`${orientationClasses} ${spacingClasses} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, staggerChildren: 0.1 }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Icon Button Component
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}) => {
  const sizeMap = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${sizeMap[size]} ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
};

export default Button;