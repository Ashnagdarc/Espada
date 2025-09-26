'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-md border border-separator bg-background px-4 py-2 text-sm",
            "placeholder:text-label-tertiary focus:border-label-primary focus:outline-none focus:ring-0",
            "disabled:cursor-not-allowed disabled:opacity-50 text-label-primary",
            error && "border-red-500 focus:border-red-500",
            className
          )}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }