'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'circular' | 'rectangular' | 'text'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
  lines?: number // For text variant
}

export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  animation = 'pulse',
  lines = 1
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
        return 'rounded-lg'
      case 'text':
        return 'rounded-md h-4'
      default:
        return 'rounded-md'
    }
  }

  const getAnimationProps = () => {
    switch (animation) {
      case 'wave':
        return {
          initial: { backgroundPosition: '-200px 0' },
          animate: { backgroundPosition: '200px 0' },
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }
        }
      case 'pulse':
        return {
          animate: { opacity: [0.5, 1, 0.5] },
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }
        }
      default:
        return {}
    }
  }

  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-800',
    animation === 'wave' && 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 bg-[length:400px_100%]',
    getVariantClasses(),
    className
  )

  const style = {
    width: width || (variant === 'circular' ? height : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined)
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              baseClasses,
              index === lines - 1 && 'w-3/4' // Last line is shorter
            )}
            style={{
              ...style,
              animationDelay: `${index * 0.1}s`
            }}
            {...getAnimationProps()}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={baseClasses}
      style={style}
      {...getAnimationProps()}
    />
  )
}

// Preset skeleton components for common use cases
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 space-y-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={120} />
      <div className="space-y-2">
        <Skeleton variant="text" lines={3} />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Table Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} variant="text" height={20} />
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              variant="text" 
              height={16}
              animation="pulse"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonProduct({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 space-y-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800', className)}>
      <Skeleton variant="rectangular" height={200} className="rounded-lg" />
      <div className="space-y-2">
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="60%" height={16} />
        <div className="flex items-center justify-between pt-2">
          <Skeleton variant="text" width="40%" height={18} />
          <Skeleton variant="rectangular" width={80} height={32} className="rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonList({ items = 5, className }: { items?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </div>
          <Skeleton variant="rectangular" width={60} height={24} className="rounded" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="80%" height={24} />
            </div>
            <Skeleton variant="circular" width={48} height={48} />
          </div>
          <div className="mt-4">
            <Skeleton variant="text" width="40%" height={14} />
          </div>
        </div>
      ))}
    </div>
  )
}