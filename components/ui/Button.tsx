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
  default: 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-sm hover:shadow-md',
  destructive: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 shadow-sm hover:shadow-md',
  outline: 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md',
  secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm hover:shadow-md',
  ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 hover:shadow-sm',
  link: 'text-black dark:text-white underline-offset-4 hover:underline',
  gradient: 'bg-gradient-to-r from-gray-900 to-black dark:from-gray-100 dark:to-white text-white dark:text-black hover:from-gray-800 hover:to-gray-900 dark:hover:from-gray-200 dark:hover:to-gray-100 shadow-lg hover:shadow-xl',
}

const sizeVariants = {
  xs: 'h-7 px-2 text-xs',
  sm: 'h-9 px-3 text-sm',
  default: 'h-10 px-4 py-2',
  lg: 'h-11 px-8 text-base',
  icon: 'h-10 w-10',
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
          'relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
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