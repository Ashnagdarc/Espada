'use client'

import { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Search, X, Check, Loader2 } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled' | 'outlined' | 'minimal'
  clearable?: boolean
  onClear?: () => void
  loading?: boolean
  success?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    clearable = false,
    onClear,
    value,
    disabled,
    loading = false,
    success = false,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const hasValue = value !== undefined && value !== ''

    const variantClasses = {
      default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-black dark:focus:border-white focus:shadow-sm',
      filled: 'border-transparent bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white focus:shadow-sm',
      outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-black dark:focus:border-white focus:shadow-md',
      minimal: 'border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent rounded-none focus:border-black dark:focus:border-white px-0',
    }

    const handleClear = () => {
      if (onClear) {
        onClear()
      }
    }

    return (
      <div className="space-y-2">
        {label && (
          <motion.label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <motion.input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              'flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              variantClasses[variant],
              leftIcon && 'pl-10',
              (rightIcon || isPassword || clearable) && 'pr-10',
              error && 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400',
              success && 'border-green-500 dark:border-green-400',
              loading && 'border-blue-500 dark:border-blue-400',
              className
            )}
            value={value}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {loading && (
              <motion.div
                className="text-blue-500 dark:text-blue-400"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-4 w-4" />
              </motion.div>
            )}
            
            {success && !loading && (
              <motion.div
                className="text-green-500 dark:text-green-400"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Check className="h-4 w-4" />
              </motion.div>
            )}
            
            {clearable && hasValue && !disabled && !loading && (
              <motion.button
                type="button"
                onClick={handleClear}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
            
            {isPassword && !loading && (
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </motion.button>
            )}
            
            {rightIcon && !isPassword && !clearable && !loading && !success && (
              <motion.div
                className="text-gray-400 dark:text-gray-500"
                whileHover={{ scale: 1.05 }}
              >
                {rightIcon}
              </motion.div>
            )}
          </div>
        </div>
        
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'text-xs',
              error ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {error || helperText}
          </motion.div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Search Input Component
interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="text"
        leftIcon={<Search className="h-4 w-4" />}
        placeholder="Search..."
        clearable
        {...props}
        onChange={(e) => {
          props.onChange?.(e)
          onSearch?.(e.target.value)
        }}
      />
    )
  }
)

SearchInput.displayName = 'SearchInput'

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled' | 'outlined'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    label,
    error,
    helperText,
    variant = 'default',
    disabled,
    ...props
  }, ref) => {
    const variantClasses = {
      default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-black dark:focus:border-white',
      filled: 'border-transparent bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white',
      outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-black dark:focus:border-white',
    }

    return (
      <div className="space-y-2">
        {label && (
          <motion.label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        
        <motion.textarea
          ref={ref}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm transition-all duration-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
            variantClasses[variant],
            error && 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400',
            className
          )}
          disabled={disabled}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
          {...props}
        />
        
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'text-xs',
              error ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {error || helperText}
          </motion.div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'