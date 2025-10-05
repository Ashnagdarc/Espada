'use client';

import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Search, X, AlertCircle, CheckCircle } from 'lucide-react';

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'filled' | 'outline';
type InputState = 'default' | 'error' | 'success' | 'warning';

interface BaseInputProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  size?: InputSize;
  variant?: InputVariant;
  state?: InputState;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  onClear?: () => void;
  showClearButton?: boolean;
}

interface InputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {}

interface PasswordInputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  showPasswordToggle?: boolean;
}

interface SearchInputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  onSearch?: (value: string) => void;
  showSearchIcon?: boolean;
}

interface TextAreaProps extends BaseInputProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  rows?: number;
  resize?: boolean;
}

const getSizeClasses = (size: InputSize) => {
  switch (size) {
    case 'sm':
      return {
        input: 'px-3 py-2 text-sm',
        icon: 'h-4 w-4',
        label: 'text-sm'
      };
    case 'md':
      return {
        input: 'px-4 py-3 text-sm',
        icon: 'h-5 w-5',
        label: 'text-sm'
      };
    case 'lg':
      return {
        input: 'px-4 py-4 text-base',
        icon: 'h-6 w-6',
        label: 'text-base'
      };
    default:
      return {
        input: 'px-4 py-3 text-sm',
        icon: 'h-5 w-5',
        label: 'text-sm'
      };
  }
};

const getVariantClasses = (variant: InputVariant, state: InputState) => {
  const stateColors = {
    default: 'border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white',
    error: 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400',
    success: 'border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400',
    warning: 'border-yellow-300 dark:border-yellow-600 focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-yellow-500 dark:focus:ring-yellow-400'
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

const getStateIcon = (state: InputState) => {
  switch (state) {
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    default:
      return null;
  }
};

const getHelperTextColor = (state: InputState) => {
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

export const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    label,
    placeholder,
    helperText,
    errorText,
    successText,
    size = 'md',
    variant = 'default',
    state = 'default',
    required = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = '',
    labelClassName = '',
    inputClassName = '',
    onClear,
    showClearButton = false,
    value,
    onChange,
    ...props
  },
  ref
) => {
  const [isFocused, setIsFocused] = useState(false);
  const sizeClasses = getSizeClasses(size);
  const variantClasses = getVariantClasses(variant, state);
  const stateIcon = getStateIcon(state);
  const helperTextColorClass = getHelperTextColor(state);
  
  const displayHelperText = errorText || successText || helperText;
  const currentState = errorText ? 'error' : successText ? 'success' : state;

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <motion.div
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
      
      <motion.div
        className="relative"
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {React.cloneElement(leftIcon as React.ReactElement, {
              className: sizeClasses.icon
            })}
          </div>
        )}
        
        <motion.input
          ref={ref}
          className={`
            w-full rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black
            disabled:opacity-50 disabled:cursor-not-allowed
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            ${sizeClasses.input}
            ${variantClasses}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || stateIcon || (showClearButton && value) ? 'pr-10' : ''}
            ${inputClassName}
          `}
          style={{ fontFamily: 'Gilroy, sans-serif' }}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          {...props}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {showClearButton && value && (
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
          
          {stateIcon && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {stateIcon}
            </motion.div>
          )}
          
          {rightIcon && !stateIcon && (
            <div className="text-gray-400 dark:text-gray-500">
              {React.cloneElement(rightIcon as React.ReactElement, {
                className: sizeClasses.icon
              })}
            </div>
          )}
        </div>
      </motion.div>
      
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

Input.displayName = 'Input';

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((
  {
    showPasswordToggle = true,
    ...props
  },
  ref
) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        showPasswordToggle ? (
          <motion.button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </motion.button>
        ) : undefined
      }
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>((
  {
    onSearch,
    showSearchIcon = true,
    ...props
  },
  ref
) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch && props.value) {
      onSearch(props.value as string);
    }
    if (props.onKeyPress) {
      props.onKeyPress(e);
    }
  };

  return (
    <Input
      ref={ref}
      type="search"
      leftIcon={showSearchIcon ? <Search /> : undefined}
      showClearButton
      onKeyPress={handleKeyPress}
      {...props}
    />
  );
});

SearchInput.displayName = 'SearchInput';

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>((
  {
    label,
    placeholder,
    helperText,
    errorText,
    successText,
    size = 'md',
    variant = 'default',
    state = 'default',
    required = false,
    disabled = false,
    fullWidth = false,
    className = '',
    labelClassName = '',
    inputClassName = '',
    rows = 4,
    resize = true,
    ...props
  },
  ref
) => {
  const sizeClasses = getSizeClasses(size);
  const variantClasses = getVariantClasses(variant, state);
  const helperTextColorClass = getHelperTextColor(state);
  
  const displayHelperText = errorText || successText || helperText;
  const currentState = errorText ? 'error' : successText ? 'success' : state;

  return (
    <motion.div
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
      
      <motion.textarea
        ref={ref}
        className={`
          w-full rounded-lg transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black
          disabled:opacity-50 disabled:cursor-not-allowed
          text-gray-900 dark:text-gray-100
          placeholder-gray-500 dark:placeholder-gray-400
          ${sizeClasses.input}
          ${variantClasses}
          ${!resize ? 'resize-none' : 'resize-y'}
          ${inputClassName}
        `}
        style={{ fontFamily: 'Gilroy, sans-serif' }}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        {...props}
      />
      
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

TextArea.displayName = 'TextArea';

export default Input;