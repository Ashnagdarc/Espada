'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs'
  isLoading?: boolean
  loadingText?: string
  ripple?: boolean
}

const buttonVariants = {
  default: 'bg-apple-blue-500 text-white hover:bg-apple-blue-600 active:bg-apple-blue-700 dark:bg-apple-blue-500 dark:hover:bg-apple-blue-400 shadow-sm hover:shadow-md',
  destructive: 'bg-apple-red-500 text-white hover:bg-apple-red-600 active:bg-apple-red-700 dark:bg-apple-red-500 dark:hover:bg-apple-red-400 shadow-sm hover:shadow-md',
  outline: 'border border-form-border bg-transparent hover:bg-fill-secondary active:bg-fill-tertiary text-label-primary shadow-sm hover:shadow-md',
  secondary: 'bg-fill-secondary text-label-primary hover:bg-fill-tertiary active:bg-fill-quaternary shadow-sm hover:shadow-md',
  ghost: 'hover:bg-fill-secondary active:bg-fill-tertiary text-label-primary hover:shadow-sm',
  link: 'text-apple-blue-500 dark:text-apple-blue-400 underline-offset-4 hover:underline',
  gradient: 'bg-gradient-to-r from-apple-blue-600 to-apple-blue-500 text-white hover:from-apple-blue-700 hover:to-apple-blue-600 shadow-lg hover:shadow-xl',
}

const sizeVariants = {
  xs: 'min-h-apple-touch px-apple-2 text-apple-caption-1',
  sm: 'min-h-apple-touch px-apple-3 text-apple-footnote',
  default: 'min-h-apple-touch px-apple-5 py-apple-4 text-apple-body',
  lg: 'min-h-apple-touch px-apple-6 py-apple-4 text-apple-headline',
  icon: 'min-h-apple-touch min-w-apple-touch',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    isLoading = false,
    loadingText,
    children,
    disabled,
    ripple = true,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center btn-apple-base rounded-apple-md font-medium transition-all duration-200 focus-apple disabled:pointer-events-none disabled:opacity-50 overflow-hidden select-none transform-gpu will-change-transform active:animate-apple-press',
          buttonVariants[variant],
          sizeVariants[size],
          className
        )}
        disabled={isDisabled}
        whileHover={!isDisabled ? { 
          scale: 1.02,
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        } : {}}
        whileTap={!isDisabled ? { 
          scale: 0.98,
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        } : {}}
        style={{ fontFamily: 'Gilroy, sans-serif' }}
        {...props}
      >
        {ripple && !isDisabled && (
          <motion.div
            className="absolute inset-0 bg-white/30 dark:bg-black/30 rounded-md"
            initial={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 1.5, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: -10 }}
            className="mr-2"
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}
        
        <motion.span
          className="flex items-center gap-2"
          initial={false}
          animate={{ opacity: isLoading ? 0.7 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading && loadingText ? loadingText : children}
        </motion.span>
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

// Icon Button Component
interface IconButtonProps extends Omit<ButtonProps, 'size'> {
  icon: React.ReactNode
  tooltip?: string
  size?: 'sm' | 'md' | 'lg'
}

const iconSizeVariants = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, tooltip, size = 'md', className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(
          iconSizeVariants[size],
          'rounded-full p-0',
          className
        )}
        title={tooltip}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'

// Floating Action Button
interface FABProps extends Omit<ButtonProps, 'variant' | 'size'> {
  icon: React.ReactNode
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

const positionVariants = {
  'bottom-right': 'fixed bottom-6 right-6',
  'bottom-left': 'fixed bottom-6 left-6',
  'top-right': 'fixed top-6 right-6',
  'top-left': 'fixed top-6 left-6',
}

export const FloatingActionButton = forwardRef<HTMLButtonElement, FABProps>(
  ({ icon, position = 'bottom-right', className, ...props }, ref) => {
    return (
      <motion.div
        className={positionVariants[position]}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          ref={ref}
          variant="default"
          className={cn(
            'h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200',
            className
          )}
          {...props}
        >
          {icon}
        </Button>
      </motion.div>
    )
  }
)

FloatingActionButton.displayName = 'FloatingActionButton'