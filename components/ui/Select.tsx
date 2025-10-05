'use client'

import React, { forwardRef, useState } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  description?: string
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  variant?: 'default' | 'filled' | 'outlined'
  clearable?: boolean
  searchable?: boolean
  loading?: boolean
  onChange?: (value: string) => void
  onClear?: () => void
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText,
    options, 
    placeholder = 'Select an option...',
    variant = 'default',
    clearable = false,
    searchable = false,
    loading = false,
    value,
    disabled,
    onChange,
    onClear,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    const selectedOption = options.find(option => option.value === value)
    
    const filteredOptions = searchable 
      ? options.filter(option => 
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options

    const variantClasses = {
      default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-black dark:focus:border-white focus:shadow-sm',
      filled: 'border-transparent bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-black dark:focus:border-white focus:shadow-sm',
      outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:border-black dark:focus:border-white focus:shadow-md',
    }

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue)
      setIsOpen(false)
      setSearchTerm('')
    }

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onClear?.()
      onChange?.('')
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
          {/* Hidden native select for form compatibility */}
          <select
            ref={ref}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className="sr-only"
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom select trigger */}
          <motion.div
            className={cn(
              'relative flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer transition-all duration-200',
              variantClasses[variant],
              error && 'border-red-500 dark:border-red-400',
              disabled && 'opacity-50 cursor-not-allowed',
              isFocused && 'ring-2 ring-gray-200 dark:ring-gray-700',
              className
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            <div className="flex items-center flex-1 min-w-0">
              {selectedOption ? (
                <div className="flex flex-col">
                  <span className="text-gray-900 dark:text-gray-100 truncate">
                    {selectedOption.label}
                  </span>
                  {selectedOption.description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {selectedOption.description}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-gray-500 dark:text-gray-400 truncate">
                  {placeholder}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              {clearable && selectedOption && !disabled && (
                <motion.button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
              
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* Dropdown */}
          <AnimatePresence>
            {isOpen && !disabled && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {searchable && (
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <input
                      type="text"
                      placeholder="Search options..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                    />
                  </div>
                )}
                
                <div className="py-1">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No options found
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <motion.div
                        key={option.value}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 cursor-pointer transition-colors',
                          option.disabled 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700',
                          selectedOption?.value === option.value && 'bg-gray-100 dark:bg-gray-700'
                        )}
                        onClick={() => !option.disabled && handleSelect(option.value)}
                        whileHover={!option.disabled ? { x: 4 } : {}}
                        transition={{ duration: 0.1 }}
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {option.description}
                            </span>
                          )}
                        </div>
                        
                        {selectedOption?.value === option.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-black dark:text-white"
                          >
                            <Check className="h-4 w-4" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {helperText && !error && (
          <motion.p 
            className="text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {helperText}
          </motion.p>
        )}
        
        {error && (
          <motion.p 
            className="text-sm text-red-600 dark:text-red-400"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'