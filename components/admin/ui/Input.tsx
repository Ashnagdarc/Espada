'use client'

import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff, Search, X } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled' | 'outline'
  inputSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    inputSize = 'md',
    fullWidth = true,
    className = '',
    type = 'text',
    ...props
  },
  ref
) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'filled':
        return `
          bg-gray-100 dark:bg-gray-800 border-transparent 
          focus:bg-white dark:focus:bg-gray-900 focus:border-black dark:focus:border-white
        `
      case 'outline':
        return `
          bg-transparent border-gray-300 dark:border-gray-600 
          focus:border-black dark:focus:border-white
        `
      default:
        return `
          bg-black text-white border-white/20 
          focus:border-white/60
        `
    }
  }

  const getSizeClasses = () => {
    switch (inputSize) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-4 py-3 text-base'
      default:
        return 'px-4 py-2.5 text-sm'
    }
  }

  const hasError = !!error
  const hasLeftIcon = !!leftIcon
  const hasRightIcon = !!rightIcon

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          className="block text-sm font-semibold text-white/80 mb-2"
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {hasLeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500">
              {leftIcon}
            </span>
          </div>
        )}

        <input
          ref={ref}
          type={type}
          className={`
            block w-full rounded-xl border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-white/20
            placeholder-white/40
            disabled:opacity-50 disabled:cursor-not-allowed
            ${getVariantClasses()}
            ${getSizeClasses()}
            ${hasLeftIcon ? 'pl-10' : ''}
            ${hasRightIcon ? 'pr-10' : ''}
            ${hasError
              ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-800'
              : ''
            }
            ${className}
          `}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
          {...props}
        />

        {hasRightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-gray-400 dark:text-gray-500">
              {rightIcon}
            </span>
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`mt-2 text-sm ${error
          ? 'text-red-600 dark:text-red-400'
          : 'text-gray-500 dark:text-gray-400'
          }`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// Password Input Component
interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showPasswordToggle?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((
  {
    showPasswordToggle = true,
    ...props
  },
  ref
) => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        showPasswordToggle ? (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        ) : undefined
      }
      {...props}
    />
  )
})

PasswordInput.displayName = 'PasswordInput'

// Search Input Component
interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void
  showClearButton?: boolean
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>((
  {
    onClear,
    showClearButton = true,
    value,
    ...props
  },
  ref
) => {
  const handleClear = () => {
    if (onClear) {
      onClear()
    }
  }

  const showClear = showClearButton && value && String(value).length > 0

  return (
    <Input
      ref={ref}
      type="search"
      value={value}
      leftIcon={<Search className="h-4 w-4" />}
      rightIcon={
        showClear ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
            tabIndex={-1}
          >
            <X className="h-4 w-4" />
          </button>
        ) : undefined
      }
      {...props}
    />
  )
})

SearchInput.displayName = 'SearchInput'

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled' | 'outline'
  textareaSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((
  {
    label,
    error,
    helperText,
    variant = 'default',
    textareaSize = 'md',
    fullWidth = true,
    resize = 'vertical',
    className = '',
    ...props
  },
  ref
) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'filled':
        return `
          bg-gray-100 dark:bg-gray-800 border-transparent 
          focus:bg-white dark:focus:bg-gray-900 focus:border-black dark:focus:border-white
        `
      case 'outline':
        return `
          bg-transparent border-gray-300 dark:border-gray-600 
          focus:border-black dark:focus:border-white
        `
      default:
        return `
          bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 
          focus:border-black dark:focus:border-white
        `
    }
  }

  const getSizeClasses = () => {
    switch (textareaSize) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-4 py-3 text-base'
      default:
        return 'px-4 py-2.5 text-sm'
    }
  }

  const getResizeClasses = () => {
    switch (resize) {
      case 'none':
        return 'resize-none'
      case 'horizontal':
        return 'resize-x'
      case 'both':
        return 'resize'
      default:
        return 'resize-y'
    }
  }

  const hasError = !!error

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        className={`
          block w-full rounded-xl border transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10
          placeholder-gray-400 dark:placeholder-gray-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getVariantClasses()}
          ${getSizeClasses()}
          ${getResizeClasses()}
          ${hasError
            ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-800'
            : ''
          }
          ${className}
        `}
        style={{ fontFamily: 'Gilroy, sans-serif' }}
        {...props}
      />

      {(error || helperText) && (
        <p className={`mt-2 text-sm ${error
          ? 'text-red-600 dark:text-red-400'
          : 'text-gray-500 dark:text-gray-400'
          }`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Input