'use client'

import React from 'react'
import { X } from 'lucide-react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  removable?: boolean
  onRemove?: () => void
  className?: string
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  removable = false,
  onRemove,
  className = ''
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-black text-white dark:bg-white dark:text-black'
      case 'secondary':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'danger':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs'
      case 'lg':
        return 'px-3 py-1 text-sm'
      default:
        return 'px-2.5 py-0.5 text-xs'
    }
  }

  const getRoundedClasses = () => {
    return rounded ? 'rounded-full' : 'rounded-md'
  }

  return (
    <span
      className={`
        inline-flex items-center font-medium transition-all duration-200
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${getRoundedClasses()}
        ${className}
      `}
      style={{ fontFamily: 'Gilroy, sans-serif' }}
    >
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 -mr-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
          type="button"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}

// Status Badge Component
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'draft' | 'published'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          variant: 'success' as const,
          dot: true
        }
      case 'inactive':
        return {
          label: 'Inactive',
          variant: 'secondary' as const,
          dot: true
        }
      case 'pending':
        return {
          label: 'Pending',
          variant: 'warning' as const,
          dot: true
        }
      case 'completed':
        return {
          label: 'Completed',
          variant: 'success' as const,
          dot: false
        }
      case 'cancelled':
        return {
          label: 'Cancelled',
          variant: 'danger' as const,
          dot: false
        }
      case 'draft':
        return {
          label: 'Draft',
          variant: 'secondary' as const,
          dot: false
        }
      case 'published':
        return {
          label: 'Published',
          variant: 'primary' as const,
          dot: false
        }
      default:
        return {
          label: status,
          variant: 'default' as const,
          dot: false
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.dot && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {config.label}
    </Badge>
  )
}

// Notification Badge Component
interface NotificationBadgeProps {
  count: number
  max?: number
  showZero?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  showZero = false,
  size = 'md',
  className = ''
}) => {
  if (count === 0 && !showZero) return null

  const displayCount = count > max ? `${max}+` : count.toString()

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4 text-xs min-w-[16px]'
      case 'lg':
        return 'h-7 w-7 text-sm min-w-[28px]'
      default:
        return 'h-5 w-5 text-xs min-w-[20px]'
    }
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full bg-red-500 text-white font-bold
        ${getSizeClasses()}
        ${className}
      `}
      style={{ fontFamily: 'Gilroy, sans-serif' }}
    >
      {displayCount}
    </span>
  )
}

// Dot Badge Component
interface DotBadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

export const DotBadge: React.FC<DotBadgeProps> = ({
  variant = 'default',
  size = 'md',
  animated = false,
  className = ''
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-black dark:bg-white'
      case 'success':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'danger':
        return 'bg-red-500'
      case 'info':
        return 'bg-blue-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2 w-2'
      case 'lg':
        return 'h-4 w-4'
      default:
        return 'h-3 w-3'
    }
  }

  return (
    <span
      className={`
        inline-block rounded-full
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${animated ? 'animate-pulse' : ''}
        ${className}
      `}
    />
  )
}

export default Badge