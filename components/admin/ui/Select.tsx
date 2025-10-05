'use client'

import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'

interface Option {
  value: string | number
  label: string
  disabled?: boolean
}

interface SelectProps {
  label?: string
  error?: string
  helperText?: string
  placeholder?: string
  options: Option[]
  value?: string | number
  onChange?: (value: string | number) => void
  variant?: 'default' | 'filled' | 'outline'
  selectSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  className?: string
}

const Select = forwardRef<HTMLDivElement, SelectProps>((
  {
    label,
    error,
    helperText,
    placeholder = 'Select an option...',
    options,
    value,
    onChange,
    variant = 'default',
    selectSize = 'md',
    fullWidth = true,
    disabled = false,
    multiple = false,
    searchable = false,
    clearable = false,
    className = ''
  },
  ref
) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(
    multiple ? (Array.isArray(value) ? value : value ? [value] : []) : (value ? [value] : [])
  )

  const selectRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  const getVariantClasses = () => {
    switch (variant) {
      case 'filled':
        return `
          bg-gray-100 dark:bg-gray-800 border-transparent 
          focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:border-black dark:focus-within:border-white
        `
      case 'outline':
        return `
          bg-transparent border-gray-300 dark:border-gray-600 
          focus-within:border-black dark:focus-within:border-white
        `
      default:
        return `
          bg-black text-white border-white/20 
          focus-within:border-white/60
        `
    }
  }

  const getSizeClasses = () => {
    switch (selectSize) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-4 py-3 text-base'
      default:
        return 'px-4 py-2.5 text-sm'
    }
  }

  const filteredOptions = searchable && searchTerm
    ? options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : options

  const getSelectedLabel = () => {
    if (selectedValues.length === 0) return placeholder

    if (multiple) {
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0])
        return option?.label || ''
      }
      return `${selectedValues.length} items selected`
    }

    const option = options.find(opt => opt.value === selectedValues[0])
    return option?.label || ''
  }

  const handleOptionClick = (optionValue: string | number) => {
    if (multiple) {
      const newSelectedValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(val => val !== optionValue)
        : [...selectedValues, optionValue]

      setSelectedValues(newSelectedValues)
      onChange?.(newSelectedValues as any)
    } else {
      setSelectedValues([optionValue])
      onChange?.(optionValue)
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedValues([])
    onChange?.(multiple ? [] as any : '' as any)
  }

  const hasError = !!error
  const hasValue = selectedValues.length > 0

  return (
    <div className={fullWidth ? 'w-full' : ''} ref={ref}>
      {label && (
        <label
          className="block text-sm font-semibold text-white/80 mb-2"
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          {label}
        </label>
      )}

      <div className="relative" ref={selectRef}>
        <div
          className={`
            relative w-full rounded-xl border cursor-pointer transition-all duration-200
            focus-within:outline-none focus-within:ring-2 focus-within:ring-white/20
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${getVariantClasses()}
            ${getSizeClasses()}
            ${hasError
              ? 'border-red-300 dark:border-red-600 focus-within:border-red-500 dark:focus-within:border-red-400 focus-within:ring-red-200 dark:focus-within:ring-red-800'
              : ''
            }
            ${className}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <span
              className={`block truncate ${hasValue
                ? 'text-white'
                : 'text-white/60'
                }`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              {getSelectedLabel()}
            </span>

            <div className="flex items-center space-x-1">
              {clearable && hasValue && (
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors duration-200"
                  type="button"
                >
                  <X className="h-4 w-4 text-white/70" />
                </button>
              )}

              <ChevronDown
                className={`h-4 w-4 text-white/60 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-black border border-white/20 rounded-xl shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-white/10">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-black text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                />
              </div>
            )}

            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-white/60">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value)

                  return (
                    <div
                      key={option.value}
                      className={`
                        px-3 py-2 cursor-pointer flex items-center justify-between transition-colors duration-150
                        ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}
                        ${isSelected ? 'bg-white/10 text-white' : 'text-white/80'}
                      `}
                      onClick={() => !option.disabled && handleOptionClick(option.value)}
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ fontFamily: 'Gilroy, sans-serif' }}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                  )
                })
              )}
            </div>
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

Select.displayName = 'Select'

// Simple Select Component (native select element)
interface SimpleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Option[]
  variant?: 'default' | 'filled' | 'outline'
  selectSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const SimpleSelect = forwardRef<HTMLSelectElement, SimpleSelectProps>((
  {
    label,
    error,
    helperText,
    options,
    variant = 'default',
    selectSize = 'md',
    fullWidth = true,
    className = '',
    ...props
  },
  ref
) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'filled':
        return 'bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-black dark:focus:border-white'
      case 'outline':
        return 'bg-transparent border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white'
      default:
        return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white'
    }
  }

  const getSizeClasses = () => {
    switch (selectSize) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-4 py-3 text-base'
      default:
        return 'px-4 py-2.5 text-sm'
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

      <select
        ref={ref}
        className={`
          block w-full rounded-xl border transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getVariantClasses()}
          ${getSizeClasses()}
          ${hasError
            ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-800'
            : ''
          }
          ${className}
        `}
        style={{ fontFamily: 'Gilroy, sans-serif' }}
        {...props}
      >
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

SimpleSelect.displayName = 'SimpleSelect'

export default Select