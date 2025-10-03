'use client'

import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'rounded-md'
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
        return 'rounded-none'
      case 'rounded':
        return 'rounded-xl'
      default:
        return 'rounded-md'
    }
  }

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse'
      case 'wave':
        return 'animate-shimmer'
      case 'none':
        return ''
      default:
        return 'animate-pulse'
    }
  }

  const getDefaultSize = () => {
    switch (variant) {
      case 'text':
        return { width: '100%', height: '1rem' }
      case 'circular':
        return { width: '2.5rem', height: '2.5rem' }
      case 'rectangular':
      case 'rounded':
        return { width: '100%', height: '8rem' }
      default:
        return { width: '100%', height: '1rem' }
    }
  }

  const defaultSize = getDefaultSize()
  const style = {
    width: width || defaultSize.width,
    height: height || defaultSize.height
  }

  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700 
        ${getVariantClasses()} 
        ${getAnimationClasses()} 
        ${className}
      `}
      style={style}
    />
  )
}

// Skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        width={index === lines - 1 ? '75%' : '100%'}
        className="h-4"
      />
    ))}
  </div>
)

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <Skeleton
      variant="circular"
      className={`${sizeClasses[size]} ${className}`}
    />
  )
}

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonAvatar />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" className="h-4 mb-2" />
        <Skeleton variant="text" width="40%" className="h-3" />
      </div>
    </div>
    <SkeletonText lines={3} />
    <div className="mt-4 flex space-x-2">
      <Skeleton variant="rounded" width="80px" height="32px" />
      <Skeleton variant="rounded" width="80px" height="32px" />
    </div>
  </div>
)

export const SkeletonTable: React.FC<{ 
  rows?: number
  columns?: number
  className?: string 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" width="80%" className="h-4" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                variant="text" 
                width={colIndex === 0 ? '90%' : '70%'} 
                className="h-4" 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const SkeletonList: React.FC<{ 
  items?: number
  showAvatar?: boolean
  className?: string 
}> = ({ 
  items = 5, 
  showAvatar = true, 
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
        {showAvatar && <SkeletonAvatar />}
        <div className="flex-1">
          <Skeleton variant="text" width="70%" className="h-4 mb-2" />
          <Skeleton variant="text" width="50%" className="h-3" />
        </div>
        <Skeleton variant="rounded" width="60px" height="24px" />
      </div>
    ))}
  </div>
)

export const SkeletonForm: React.FC<{ fields?: number; className?: string }> = ({ 
  fields = 4, 
  className = '' 
}) => (
  <div className={`space-y-6 ${className}`}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton variant="text" width="30%" className="h-4" />
        <Skeleton variant="rounded" width="100%" height="40px" />
      </div>
    ))}
    <div className="flex space-x-3 pt-4">
      <Skeleton variant="rounded" width="100px" height="40px" />
      <Skeleton variant="rounded" width="80px" height="40px" />
    </div>
  </div>
)

export const SkeletonStats: React.FC<{ items?: number; className?: string }> = ({ 
  items = 4, 
  className = '' 
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <Skeleton variant="text" width="60%" className="h-4" />
          <Skeleton variant="circular" width="32px" height="32px" />
        </div>
        <Skeleton variant="text" width="80%" className="h-8 mb-2" />
        <Skeleton variant="text" width="50%" className="h-3" />
      </div>
    ))}
  </div>
)

export default Skeleton