'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, Search } from 'lucide-react';

type SelectSize = 'sm' | 'md' | 'lg';
type SelectVariant = 'default' | 'filled' | 'outline';
type SelectState = 'default' | 'error' | 'success' | 'warning';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface BaseSelectProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  size?: SelectSize;
  variant?: SelectVariant;
  state?: SelectState;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
  optionClassName?: string;
  maxHeight?: number;
  loading?: boolean;
  loadingText?: string;
  noOptionsText?: string;
  onClear?: () => void;
}

interface SingleSelectProps extends BaseSelectProps {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | null) => void;
  options: Option[];
}

interface MultiSelectProps extends BaseSelectProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  options: Option[];
  maxSelectedDisplay?: number;
}

type SelectProps = SingleSelectProps | MultiSelectProps;

const getSizeClasses = (size: SelectSize) => {
  switch (size) {
    case 'sm':
      return {
        select: 'px-3 py-2 text-sm',
        option: 'px-3 py-2 text-sm',
        icon: 'h-4 w-4',
        label: 'text-sm'
      };
    case 'md':
      return {
        select: 'px-4 py-3 text-sm',
        option: 'px-4 py-3 text-sm',
        icon: 'h-5 w-5',
        label: 'text-sm'
      };
    case 'lg':
      return {
        select: 'px-4 py-4 text-base',
        option: 'px-4 py-4 text-base',
        icon: 'h-6 w-6',
        label: 'text-base'
      };
    default:
      return {
        select: 'px-4 py-3 text-sm',
        option: 'px-4 py-3 text-sm',
        icon: 'h-5 w-5',
        label: 'text-sm'
      };
  }
};

const getVariantClasses = (variant: SelectVariant, state: SelectState, isOpen: boolean) => {
  const stateColors = {
    default: `border-gray-300 dark:border-gray-600 ${isOpen ? 'border-black dark:border-white ring-2 ring-black dark:ring-white' : 'hover:border-gray-400 dark:hover:border-gray-500'}`,
    error: `border-red-300 dark:border-red-600 ${isOpen ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500 dark:ring-red-400' : 'hover:border-red-400 dark:hover:border-red-500'}`,
    success: `border-green-300 dark:border-green-600 ${isOpen ? 'border-green-500 dark:border-green-400 ring-2 ring-green-500 dark:ring-green-400' : 'hover:border-green-400 dark:hover:border-green-500'}`,
    warning: `border-yellow-300 dark:border-yellow-600 ${isOpen ? 'border-yellow-500 dark:border-yellow-400 ring-2 ring-yellow-500 dark:ring-yellow-400' : 'hover:border-yellow-400 dark:hover:border-yellow-500'}`
  };

  switch (variant) {
    case 'filled':
      return `bg-gray-100 dark:bg-gray-800 border-transparent ${stateColors[state].replace('border-', 'focus:border-')}`;
    case 'outline':
      return `bg-transparent border-2 ${stateColors[state]}`;
    default:
      return `bg-white dark:bg-gray-900 border ${stateColors[state]}`;
  }
};

const getHelperTextColor = (state: SelectState) => {
  switch (state) {
    case 'error':
      return 'text-red-600 dark:text-red-400';
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

export const Select = forwardRef<HTMLDivElement, SelectProps>((
  {
    label,
    placeholder = 'Select an option...',
    helperText,
    errorText,
    successText,
    size = 'md',
    variant = 'default',
    state = 'default',
    required = false,
    disabled = false,
    fullWidth = false,
    clearable = false,
    searchable = false,
    multiple = false,
    className = '',
    labelClassName = '',
    selectClassName = '',
    optionClassName = '',
    maxHeight = 200,
    loading = false,
    loadingText = 'Loading...',
    noOptionsText = 'No options available',
    onClear,
    options,
    value,
    defaultValue,
    onChange,
    maxSelectedDisplay = 2,
    ...props
  },
  ref
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [internalValue, setInternalValue] = useState(() => {
    if (multiple) {
      return (value as string[]) || (defaultValue as string[]) || [];
    }
    return (value as string) || (defaultValue as string) || null;
  });
  
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const sizeClasses = getSizeClasses(size);
  const variantClasses = getVariantClasses(variant, state, isOpen);
  const helperTextColorClass = getHelperTextColor(state);
  
  const displayHelperText = errorText || successText || helperText;
  const currentState = errorText ? 'error' : successText ? 'success' : state;

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get selected options for display
  const getSelectedOptions = () => {
    if (multiple) {
      const selectedValues = internalValue as string[];
      return options.filter(option => selectedValues.includes(option.value));
    }
    return options.find(option => option.value === internalValue) || null;
  };

  const selectedOptions = getSelectedOptions();

  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = internalValue as string[];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      
      setInternalValue(newValues);
      if (onChange) {
        (onChange as (value: string[]) => void)(newValues);
      }
    } else {
      setInternalValue(optionValue);
      if (onChange) {
        (onChange as (value: string | null) => void)(optionValue);
      }
      setIsOpen(false);
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = multiple ? [] : null;
    setInternalValue(newValue);
    if (onChange) {
      if (multiple) {
        (onChange as (value: string[]) => void)([]);
      } else {
        (onChange as (value: string | null) => void)(null);
      }
    }
    if (onClear) {
      onClear();
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Sync with external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Render selected value display
  const renderSelectedValue = () => {
    if (multiple) {
      const selected = selectedOptions as Option[];
      if (selected.length === 0) {
        return <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>;
      }
      
      if (selected.length <= maxSelectedDisplay) {
        return (
          <div className="flex flex-wrap gap-1">
            {selected.map((option) => (
              <motion.span
                key={option.value}
                className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionSelect(option.value);
                  }}
                  className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </div>
        );
      }
      
      return (
        <span className="text-gray-900 dark:text-gray-100">
          {selected.length} items selected
        </span>
      );
    }
    
    const selected = selectedOptions as Option | null;
    return selected ? (
      <span className="text-gray-900 dark:text-gray-100">{selected.label}</span>
    ) : (
      <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
    );
  };

  const hasValue = multiple 
    ? (internalValue as string[]).length > 0 
    : internalValue !== null;

  return (
    <motion.div
      ref={ref}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <motion.label
          className={`block ${sizeClasses.label} font-semibold text-gray-700 dark:text-gray-300 mb-2 ${labelClassName}`}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>
      )}
      
      <div className="relative" ref={selectRef}>
        <motion.div
          className={`
            w-full rounded-lg cursor-pointer transition-all duration-200
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            text-gray-900 dark:text-gray-100
            ${sizeClasses.select}
            ${variantClasses}
            ${selectClassName}
          `}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          whileHover={!disabled ? { scale: 1.01 } : {}}
          whileTap={!disabled ? { scale: 0.99 } : {}}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {renderSelectedValue()}
            </div>
            
            <div className="flex items-center space-x-2 ml-2">
              {clearable && hasValue && (
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
                <ChevronDown className={`${sizeClasses.icon} text-gray-400`} />
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ maxHeight: maxHeight + 'px' }}
            >
              {searchable && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-gray-100"
                      placeholder="Search options..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                    />
                  </div>
                </div>
              )}
              
              <div className="max-h-48 overflow-y-auto">
                {loading ? (
                  <div className={`${sizeClasses.option} text-gray-500 dark:text-gray-400 text-center`}>
                    {loadingText}
                  </div>
                ) : filteredOptions.length === 0 ? (
                  <div className={`${sizeClasses.option} text-gray-500 dark:text-gray-400 text-center`}>
                    {noOptionsText}
                  </div>
                ) : (
                  filteredOptions.map((option, index) => {
                    const isSelected = multiple 
                      ? (internalValue as string[]).includes(option.value)
                      : internalValue === option.value;
                    
                    return (
                      <motion.div
                        key={option.value}
                        className={`
                          ${sizeClasses.option} cursor-pointer transition-colors duration-150
                          hover:bg-gray-100 dark:hover:bg-gray-800
                          ${isSelected ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}
                          ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                          ${optionClassName}
                        `}
                        style={{ fontFamily: 'Gilroy, sans-serif' }}
                        onClick={() => !option.disabled && handleOptionSelect(option.value)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={!option.disabled ? { x: 4 } : {}}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {option.icon && (
                              <span className="text-gray-400">
                                {option.icon}
                              </span>
                            )}
                            <span>{option.label}</span>
                          </div>
                          
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Check className="h-4 w-4 text-black dark:text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {displayHelperText && (
          <motion.p
            className={`mt-2 text-sm ${helperTextColorClass}`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {errorText || successText || helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

Select.displayName = 'Select';

export default Select;