'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return `
          bg-black dark:bg-white text-white dark:text-black 
          hover:bg-gray-800 dark:hover:bg-gray-100 
          focus:ring-black dark:focus:ring-white
          shadow-lg hover:shadow-xl
        `
      case 'secondary':
        return `
          bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 
          hover:bg-gray-200 dark:hover:bg-gray-700 
          focus:ring-gray-200 dark:focus:ring-gray-700
          shadow-sm hover:shadow-md
        `
      case 'outline':
        return `
          bg-black text-white border border-white/20 
          hover:bg-white/10 focus:ring-white/30
        `
      case 'ghost':
        return `
          bg-transparent text-white/80 
          hover:bg-white/10 hover:text-white
          focus:ring-white/20
        `
      case 'danger':
        return `
          bg-red-600 text-white 
          hover:bg-red-700 
          focus:ring-red-200 dark:focus:ring-red-800
          shadow-lg hover:shadow-xl
        `
      case 'success':
        return `
          bg-green-600 text-white 
          hover:bg-green-700 
          focus:ring-green-200 dark:focus:ring-green-800
          shadow-lg hover:shadow-xl
        `
      default:
        return ''
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'md':
        return 'px-4 py-2 text-sm'
      case 'lg':
        return 'px-6 py-3 text-base'
      case 'xl':
        return 'px-8 py-4 text-lg'
      default:
        return 'px-4 py-2 text-sm'
    }
  }

  const isDisabled = disabled || isLoading

  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
        transform hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      style={{ fontFamily: 'Gilroy, sans-serif' }}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {isLoading ? (loadingText || 'Loading...') : children}
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  )
}

// Icon Button Component
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
      case 'secondary':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
      case 'outline':
        return 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
      case 'ghost':
        return 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700'
      default:
        return ''
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-1.5'
      case 'md':
        return 'p-2'
      case 'lg':
        return 'p-3'
      default:
        return 'p-2'
    }
  }

  const isDisabled = disabled || isLoading

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-xl
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 dark:focus:ring-gray-700
        transform hover:scale-110 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        children
      )}
    </button>
  )
}

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  orientation = 'horizontal'
}) => {
  return (
    <div
      className={`
        inline-flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'}
        ${className}
      `}
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0
          const isLast = index === React.Children.count(children) - 1

          let roundedClasses = ''
          if (orientation === 'horizontal') {
            if (isFirst) roundedClasses = 'rounded-l-xl rounded-r-none'
            else if (isLast) roundedClasses = 'rounded-r-xl rounded-l-none'
            else roundedClasses = 'rounded-none'
          } else {
            if (isFirst) roundedClasses = 'rounded-t-xl rounded-b-none'
            else if (isLast) roundedClasses = 'rounded-b-xl rounded-t-none'
            else roundedClasses = 'rounded-none'
          }

          return React.cloneElement(child, {
            className: `${child.props.className || ''} ${roundedClasses} ${!isFirst ? (orientation === 'horizontal' ? '-ml-px' : '-mt-px') : ''}`.trim()
          })
        }
        return child
      })}
    </div>
  )
}

export { Button }
export default Button