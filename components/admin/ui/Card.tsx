'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  hover?: boolean
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  onClick
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return ''
      case 'sm':
        return 'p-4'
      case 'lg':
        return 'p-8'
      case 'xl':
        return 'p-10'
      default:
        return 'p-6'
    }
  }

  const getShadowClasses = () => {
    switch (shadow) {
      case 'none':
        return ''
      case 'sm':
        return 'shadow-sm'
      case 'md':
        return 'shadow-md'
      case 'lg':
        return 'shadow-lg'
      case 'xl':
        return 'shadow-xl'
      default:
        return 'shadow-sm'
    }
  }

  const getBorderClasses = () => {
    return border ? 'border border-gray-200 dark:border-gray-800' : ''
  }

  const getHoverClasses = () => {
    return hover ? 'hover:shadow-md hover:scale-[1.02] transition-all duration-200' : ''
  }

  const getClickableClasses = () => {
    return onClick ? 'cursor-pointer' : ''
  }

  return (
    <div
      className={`
        bg-white dark:bg-gray-900 rounded-xl
        ${getPaddingClasses()}
        ${getShadowClasses()}
        ${getBorderClasses()}
        ${getHoverClasses()}
        ${getClickableClasses()}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Card Header Component
interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  border?: boolean
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  border = true
}) => {
  return (
    <div
      className={`
        ${border ? 'border-b border-gray-200 dark:border-gray-800 pb-4 mb-6' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// Card Title Component
interface CardTitleProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  size = 'lg'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'md':
        return 'text-base'
      case 'lg':
        return 'text-lg'
      case 'xl':
        return 'text-xl'
      default:
        return 'text-lg'
    }
  }

  return (
    <h3
      className={`
        font-bold text-gray-900 dark:text-gray-100
        ${getSizeClasses()}
        ${className}
      `}
      style={{ fontFamily: 'Gilroy, sans-serif' }}
    >
      {children}
    </h3>
  )
}

// Card Description Component
interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = ''
}) => {
  return (
    <p
      className={`
        text-sm text-gray-600 dark:text-gray-400 mt-1
        ${className}
      `}
      style={{ fontFamily: 'Gilroy, sans-serif' }}
    >
      {children}
    </p>
  )
}

// Card Content Component
interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Card Footer Component
interface CardFooterProps {
  children: React.ReactNode
  className?: string
  border?: boolean
  justify?: 'start' | 'center' | 'end' | 'between'
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  border = true,
  justify = 'end'
}) => {
  const getJustifyClasses = () => {
    switch (justify) {
      case 'start':
        return 'justify-start'
      case 'center':
        return 'justify-center'
      case 'end':
        return 'justify-end'
      case 'between':
        return 'justify-between'
      default:
        return 'justify-end'
    }
  }

  return (
    <div
      className={`
        flex items-center
        ${border ? 'border-t border-gray-200 dark:border-gray-800 pt-4 mt-6' : ''}
        ${getJustifyClasses()}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// Stats Card Component
interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string | number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: React.ReactNode
  className?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  className = ''
}) => {
  const getChangeClasses = () => {
    if (!change) return ''
    
    switch (change.type) {
      case 'increase':
        return 'text-green-600 dark:text-green-400'
      case 'decrease':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p 
            className="text-sm font-medium text-gray-600 dark:text-gray-400"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            {title}
          </p>
          <p 
            className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            {value}
          </p>
          {change && (
            <p 
              className={`text-sm font-medium mt-1 ${getChangeClasses()}`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              {change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : ''}
              {change.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// Feature Card Component
interface FeatureCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  action,
  className = ''
}) => {
  return (
    <Card 
      className={`text-center hover:shadow-lg transition-all duration-200 ${className}`}
      hover
    >
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg">
            {icon}
          </div>
        </div>
      )}
      
      <CardTitle className="mb-2">{title}</CardTitle>
      <CardDescription className="mb-4">{description}</CardDescription>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          {action.label}
        </button>
      )}
    </Card>
  )
}

export default Card