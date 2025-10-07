# Apple Design Implementation Guide

## Espada E-commerce Application - Technical Implementation

### Overview

This technical implementation guide provides specific code examples, component updates, and step-by-step instructions for implementing Apple Design Guidelines across the Espada application. This guide complements the main compliance document with actionable development tasks.

## 1. CSS Foundation Updates

### 1.1 Enhanced Global Styles (globals.css)

**Replace existing typography and spacing with Apple-compliant system:**

```css
@layer base {
  :root {
    /* Apple Typography Scale - Enhanced */
    --font-large-title: 34px;
    --font-title-1: 28px;
    --font-title-2: 22px;
    --font-title-3: 20px;
    --font-headline: 17px;
    --font-body: 17px;
    --font-callout: 16px;
    --font-subhead: 15px;
    --font-footnote: 13px;
    --font-caption-1: 12px;
    --font-caption-2: 11px;
    
    /* Apple Spacing Scale (8pt grid) */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --space-8: 32px;
    --space-10: 40px;
    --space-12: 48px;
    --space-16: 64px;
    --space-20: 80px;
    --space-24: 96px;
    
    /* Apple Touch Targets */
    --touch-target-min: 44px;
    --touch-target-comfortable: 48px;
    --touch-target-large: 52px;
    
    /* Apple Border Radius */
    --radius-small: 6px;
    --radius-medium: 8px;
    --radius-large: 12px;
    --radius-extra-large: 16px;
    
    /* Enhanced Contrast Colors */
    --text-primary: 0 0% 0%;           /* #000000 - 21:1 */
    --text-secondary: 0 0% 23.5%;      /* #3C3C43 - 8.9:1 */
    --text-tertiary: 0 0% 42%;         /* #6B6B70 - 4.6:1 */
    --text-quaternary: 0 0% 57%;       /* #8E8E93 - 3.1:1 */
    
    /* Form Colors */
    --form-background: 0 0% 98%;       /* #FAFAFA */
    --form-border: 0 0% 85%;           /* #D9D9D9 */
    --form-border-focus: 211 100% 50%; /* Apple Blue */
    --form-border-error: 0 84% 60%;    /* Apple Red */
    --form-text: 0 0% 0%;              /* #000000 */
    --form-placeholder: 0 0% 42%;      /* #6B6B70 */
  }

  .dark {
    --text-primary: 0 0% 100%;         /* #FFFFFF - 21:1 */
    --text-secondary: 0 0% 76.5%;      /* #C3C3C8 - 8.9:1 */
    --text-tertiary: 0 0% 58%;         /* #94949A - 4.6:1 */
    --text-quaternary: 0 0% 43%;       /* #6E6E73 - 3.1:1 */
    
    --form-background: 0 0% 7%;        /* #121212 */
    --form-border: 0 0% 22%;           /* #383838 */
    --form-text: 0 0% 100%;            /* #FFFFFF */
    --form-placeholder: 0 0% 58%;      /* #94949A */
  }
}

/* Apple Typography Classes */
.text-large-title {
  font-size: var(--font-large-title);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0.374px;
  color: hsl(var(--text-primary));
}

.text-title-1 {
  font-size: var(--font-title-1);
  line-height: 1.21;
  font-weight: 700;
  letter-spacing: 0.364px;
  color: hsl(var(--text-primary));
}

.text-title-2 {
  font-size: var(--font-title-2);
  line-height: 1.27;
  font-weight: 700;
  letter-spacing: 0.352px;
  color: hsl(var(--text-primary));
}

.text-title-3 {
  font-size: var(--font-title-3);
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: 0.38px;
  color: hsl(var(--text-primary));
}

.text-headline {
  font-size: var(--font-headline);
  line-height: 1.29;
  font-weight: 600;
  letter-spacing: -0.408px;
  color: hsl(var(--text-primary));
}

.text-body {
  font-size: var(--font-body);
  line-height: 1.29;
  font-weight: 400;
  letter-spacing: -0.408px;
  color: hsl(var(--text-primary));
}

.text-callout {
  font-size: var(--font-callout);
  line-height: 1.31;
  font-weight: 400;
  letter-spacing: -0.32px;
  color: hsl(var(--text-primary));
}

.text-subhead {
  font-size: var(--font-subhead);
  line-height: 1.33;
  font-weight: 400;
  letter-spacing: -0.24px;
  color: hsl(var(--text-secondary));
}

.text-footnote {
  font-size: var(--font-footnote);
  line-height: 1.38;
  font-weight: 400;
  letter-spacing: -0.078px;
  color: hsl(var(--text-tertiary));
}

.text-caption-1 {
  font-size: var(--font-caption-1);
  line-height: 1.33;
  font-weight: 400;
  letter-spacing: 0px;
  color: hsl(var(--text-tertiary));
}

.text-caption-2 {
  font-size: var(--font-caption-2);
  line-height: 1.18;
  font-weight: 400;
  letter-spacing: 0.066px;
  color: hsl(var(--text-quaternary));
}

/* Apple Button System */
.btn-apple-base {
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-medium);
  font-family: var(--font-gilroy), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: var(--font-body);
  line-height: 1.29;
  font-weight: 600;
  letter-spacing: -0.408px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
  text-decoration: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.btn-apple-primary {
  background: hsl(211 100% 50%);
  color: hsl(0 0% 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-apple-primary:hover {
  background: hsl(211 100% 45%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.btn-apple-primary:active {
  background: hsl(211 100% 40%);
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-apple-secondary {
  background: hsl(var(--form-background));
  color: hsl(var(--text-primary));
  border: 1px solid hsl(var(--form-border));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-apple-secondary:hover {
  background: hsl(0 0% 95%);
  border-color: hsl(0 0% 80%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.dark .btn-apple-secondary {
  background: hsl(0 0% 14%);
  color: hsl(var(--text-primary));
  border-color: hsl(0 0% 22%);
}

.dark .btn-apple-secondary:hover {
  background: hsl(0 0% 18%);
  border-color: hsl(0 0% 30%);
}

/* Apple Form Elements */
.input-apple {
  min-height: var(--touch-target-min);
  padding: var(--space-3) var(--space-4);
  border: 1px solid hsl(var(--form-border));
  border-radius: var(--radius-medium);
  background: hsl(var(--form-background));
  color: hsl(var(--form-text));
  font-family: var(--font-gilroy), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: var(--font-body);
  line-height: 1.29;
  letter-spacing: -0.408px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  outline: none;
}

.input-apple::placeholder {
  color: hsl(var(--form-placeholder));
}

.input-apple:focus {
  border-color: hsl(var(--form-border-focus));
  box-shadow: 0 0 0 1px hsl(var(--form-border-focus));
}

.input-apple:invalid,
.input-apple.error {
  border-color: hsl(var(--form-border-error));
  box-shadow: 0 0 0 1px hsl(var(--form-border-error));
}

/* Apple Card System */
.card-apple {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-large);
  padding: var(--space-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-apple:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.card-apple-compact {
  padding: var(--space-4);
}

.card-apple-spacious {
  padding: var(--space-8);
}

/* Focus Management */
.focus-apple {
  outline: none;
  box-shadow: 0 0 0 2px hsl(211 100% 50%);
  border-radius: var(--radius-small);
}

.focus-apple-inset {
  outline: none;
  box-shadow: inset 0 0 0 2px hsl(211 100% 50%);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .btn-apple-base,
  .input-apple,
  .card-apple {
    transition: none;
  }
  
  .btn-apple-primary:hover,
  .btn-apple-secondary:hover,
  .card-apple:hover {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn-apple-primary {
    border: 2px solid;
  }
  
  .btn-apple-secondary {
    border-width: 2px;
  }
  
  .input-apple {
    border-width: 2px;
  }
}
```

### 1.2 Tailwind Config Updates

**Update tailwind.config.js with Apple-compliant values:**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Apple Typography Scale
      fontSize: {
        'large-title': ['34px', { lineHeight: '41px', fontWeight: '700', letterSpacing: '0.374px' }],
        'title-1': ['28px', { lineHeight: '34px', fontWeight: '700', letterSpacing: '0.364px' }],
        'title-2': ['22px', { lineHeight: '28px', fontWeight: '700', letterSpacing: '0.352px' }],
        'title-3': ['20px', { lineHeight: '25px', fontWeight: '600', letterSpacing: '0.38px' }],
        'headline': ['17px', { lineHeight: '22px', fontWeight: '600', letterSpacing: '-0.408px' }],
        'body': ['17px', { lineHeight: '22px', fontWeight: '400', letterSpacing: '-0.408px' }],
        'callout': ['16px', { lineHeight: '21px', fontWeight: '400', letterSpacing: '-0.32px' }],
        'subhead': ['15px', { lineHeight: '20px', fontWeight: '400', letterSpacing: '-0.24px' }],
        'footnote': ['13px', { lineHeight: '18px', fontWeight: '400', letterSpacing: '-0.078px' }],
        'caption-1': ['12px', { lineHeight: '16px', fontWeight: '400', letterSpacing: '0px' }],
        'caption-2': ['11px', { lineHeight: '13px', fontWeight: '400', letterSpacing: '0.066px' }],
      },
      
      // Apple 8pt Grid Spacing
      spacing: {
        '0': '0px',
        '1': '4px',    // 1 unit
        '2': '8px',    // 2 units
        '3': '12px',   // 3 units
        '4': '16px',   // 4 units
        '5': '20px',   // 5 units
        '6': '24px',   // 6 units
        '7': '28px',   // 7 units
        '8': '32px',   // 8 units
        '9': '36px',   // 9 units
        '10': '40px',  // 10 units
        '11': '44px',  // 11 units (touch target)
        '12': '48px',  // 12 units
        '14': '56px',  // 14 units
        '16': '64px',  // 16 units
        '20': '80px',  // 20 units
        '24': '96px',  // 24 units
        '28': '112px', // 28 units
        '32': '128px', // 32 units
      },
      
      // Apple Touch Targets
      minHeight: {
        'touch': '44px',
        'touch-comfortable': '48px',
        'touch-large': '52px',
      },
      
      minWidth: {
        'touch': '44px',
        'touch-comfortable': '48px',
        'touch-large': '52px',
      },
      
      // Apple Border Radius
      borderRadius: {
        'apple-small': '6px',
        'apple-medium': '8px',
        'apple-large': '12px',
        'apple-extra-large': '16px',
        'apple-button': '8px',
        'apple-card': '12px',
      },
      
      // Enhanced Color System
      colors: {
        // Existing colors...
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Apple Text Colors
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          tertiary: "hsl(var(--text-tertiary))",
          quaternary: "hsl(var(--text-quaternary))",
        },
        
        // Apple Form Colors
        form: {
          background: "hsl(var(--form-background))",
          border: "hsl(var(--form-border))",
          'border-focus': "hsl(var(--form-border-focus))",
          'border-error': "hsl(var(--form-border-error))",
          text: "hsl(var(--form-text))",
          placeholder: "hsl(var(--form-placeholder))",
        },
        
        // Apple System Colors
        'apple-blue': {
          50: '#e6f3ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#007AFF', // Apple Blue
          600: '#0056b3',
          700: '#004080',
          800: '#002a4d',
          900: '#00141a',
        },
        
        'apple-red': {
          50: '#ffe6e6',
          100: '#ffb3b3',
          200: '#ff8080',
          300: '#ff4d4d',
          400: '#ff1a1a',
          500: '#FF3B30', // Apple Red
          600: '#cc2e26',
          700: '#99221c',
          800: '#661713',
          900: '#330b09',
        },
        
        'apple-green': {
          50: '#e6ffe6',
          100: '#b3ffb3',
          200: '#80ff80',
          300: '#4dff4d',
          400: '#1aff1a',
          500: '#34C759', // Apple Green
          600: '#2a9f47',
          700: '#1f7735',
          800: '#154f23',
          900: '#0a2712',
        },
      },
      
      // Apple Shadows
      boxShadow: {
        'apple-small': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'apple-medium': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'apple-large': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'apple-button': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'apple-button-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'apple-focus': '0 0 0 2px #007AFF',
      },
      
      // Apple Transitions
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'apple-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      // Apple Animations
      keyframes: {
        'apple-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'apple-scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'apple-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      
      animation: {
        'apple-fade-in': 'apple-fade-in 0.3s ease-out',
        'apple-scale-in': 'apple-scale-in 0.2s ease-out',
        'apple-slide-up': 'apple-slide-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
```

## 2. Component Updates

### 2.1 Enhanced Button Component

**Create new Apple-compliant Button component:**

```typescript
// components/ui/AppleButton.tsx
'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface AppleButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive'
  size?: 'small' | 'medium' | 'large'
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const buttonVariants = {
  primary: 'btn-apple-base btn-apple-primary',
  secondary: 'btn-apple-base btn-apple-secondary',
  tertiary: 'btn-apple-base bg-transparent text-text-primary hover:bg-form-background',
  destructive: 'btn-apple-base bg-apple-red-500 text-white hover:bg-apple-red-600',
}

const sizeVariants = {
  small: 'min-h-[36px] px-4 text-subhead',
  medium: 'min-h-touch px-6 text-body',
  large: 'min-h-touch-large px-8 text-headline',
}

export const AppleButton = forwardRef<HTMLButtonElement, AppleButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || isLoading

    return (
      <motion.button
        ref={ref}
        className={cn(
          buttonVariants[variant],
          sizeVariants[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-60 cursor-not-allowed',
          className
        )}
        disabled={isDisabled}
        whileHover={!isDisabled ? { 
          scale: 1.02,
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        } : {}}
        whileTap={!isDisabled ? { 
          scale: 0.98,
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        } : {}}
        {...props}
      >
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mr-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}
        
        {leftIcon && !isLoading && (
          <span className="mr-2">{leftIcon}</span>
        )}
        
        <span>
          {isLoading && loadingText ? loadingText : children}
        </span>
        
        {rightIcon && !isLoading && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </motion.button>
    )
  }
)

AppleButton.displayName = 'AppleButton'

// Icon Button variant
interface AppleIconButtonProps extends Omit<AppleButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode
  'aria-label': string
  tooltip?: string
}

export const AppleIconButton = forwardRef<HTMLButtonElement, AppleIconButtonProps>(
  ({ icon, size = 'medium', className, ...props }, ref) => {
    const iconSizeVariants = {
      small: 'min-h-[36px] min-w-[36px] p-2',
      medium: 'min-h-touch min-w-touch p-3',
      large: 'min-h-touch-large min-w-touch-large p-4',
    }

    return (
      <AppleButton
        ref={ref}
        className={cn(
          iconSizeVariants[size],
          'rounded-full',
          className
        )}
        size={size}
        {...props}
      >
        {icon}
      </AppleButton>
    )
  }
)

AppleIconButton.displayName = 'AppleIconButton'
```

### 2.2 Enhanced Input Component

**Create Apple-compliant Input component:**

```typescript
// components/ui/AppleInput.tsx
'use client'

import { forwardRef, InputHTMLAttributes, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface AppleInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

export const AppleInput = forwardRef<HTMLInputElement, AppleInputProps>(
  ({
    className,
    type,
    label,
    helperText,
    error,
    success,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    id,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    
    const inputType = showPasswordToggle && showPassword ? 'text' : type
    const hasError = !!error
    const hasSuccess = !!success && !hasError
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-subhead font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}
          
          <motion.input
            ref={ref}
            type={inputType}
            id={inputId}
            className={cn(
              'input-apple',
              leftIcon && 'pl-10',
              (rightIcon || showPasswordToggle || hasError || hasSuccess) && 'pr-10',
              hasError && 'border-form-border-error focus:border-form-border-error focus:shadow-[0_0_0_1px_hsl(var(--form-border-error))]',
              hasSuccess && 'border-apple-green-500 focus:border-apple-green-500 focus:shadow-[0_0_0_1px_hsl(var(--apple-green-500))]',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {hasError && (
              <AlertCircle className="h-4 w-4 text-apple-red-500" />
            )}
            {hasSuccess && (
              <CheckCircle className="h-4 w-4 text-apple-green-500" />
            )}
            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-tertiary hover:text-text-secondary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
            {rightIcon && !showPasswordToggle && !hasError && !hasSuccess && (
              <span className="text-text-tertiary">{rightIcon}</span>
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {(error || success || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              {error && (
                <p className="text-caption-1 text-apple-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              )}
              {success && !error && (
                <p className="text-caption-1 text-apple-green-500 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {success}
                </p>
              )}
              {helperText && !error && !success && (
                <p className="text-caption-1 text-text-tertiary">
                  {helperText}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

AppleInput.displayName = 'AppleInput'

// Textarea variant
interface AppleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  success?: string
}

export const AppleTextarea = forwardRef<HTMLTextAreaElement, AppleTextareaProps>(
  ({
    className,
    label,
    helperText,
    error,
    success,
    id,
    ...props
  }, ref) => {
    const hasError = !!error
    const hasSuccess = !!success && !hasError
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-subhead font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        
        <motion.textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'input-apple resize-none',
            hasError && 'border-form-border-error focus:border-form-border-error focus:shadow-[0_0_0_1px_hsl(var(--form-border-error))]',
            hasSuccess && 'border-apple-green-500 focus:border-apple-green-500 focus:shadow-[0_0_0_1px_hsl(var(--apple-green-500))]',
            className
          )}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          {...props}
        />
        
        <AnimatePresence>
          {(error || success || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {error && (
                <p className="text-caption-1 text-apple-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              )}
              {success && !error && (
                <p className="text-caption-1 text-apple-green-500 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {success}
                </p>
              )}
              {helperText && !error && !success && (
                <p className="text-caption-1 text-text-tertiary">
                  {helperText}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

AppleTextarea.displayName = 'AppleTextarea'
```

### 2.3 Enhanced Card Component

**Create Apple-compliant Card component:**

```typescript
// components/ui/AppleCard.tsx
'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AppleCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'compact' | 'spacious' | 'elevated'
  interactive?: boolean
  padding?: 'none' | 'small' | 'medium' | 'large'
}

const cardVariants = {
  default: 'card-apple',
  compact: 'card-apple card-apple-compact',
  spacious: 'card-apple card-apple-spacious',
  elevated: 'card-apple shadow-apple-large',
}

const paddingVariants = {
  none: 'p-0',
  small: 'p-4',
  medium: 'p-6',
  large: 'p-8',
}

export const AppleCard = forwardRef<HTMLDivElement, AppleCardProps>(
  ({
    className,
    variant = 'default',
    interactive = false,
    padding,
    children,
    ...props
  }, ref) => {
    const paddingClass = padding ? paddingVariants[padding] : ''
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          cardVariants[variant],
          paddingClass,
          interactive && 'cursor-pointer',
          className
        )}
        whileHover={interactive ? {
          scale: 1.02,
          transition: { type: 'spring', stiffness: 300, damping: 30 }
        } : {}}
        whileTap={interactive ? {
          scale: 0.98,
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        } : {}}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

AppleCard.displayName = 'AppleCard'

// Card Header component
interface AppleCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export const AppleCardHeader = forwardRef<HTMLDivElement, AppleCardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between space-y-1.5 pb-6',
          className
        )}
        {...props}
      >
        <div className="space-y-1">
          {title && (
            <h3 className="text-headline font-semibold text-text-primary">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-subhead text-text-secondary">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    )
  }
)

AppleCardHeader.displayName = 'AppleCardHeader'

// Card Content component
export const AppleCardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-body text-text-primary', className)}
        {...props}
      />
    )
  }
)

AppleCardContent.displayName = 'AppleCardContent'

// Card Footer component
export const AppleCardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center pt-6', className)}
        {...props}
      />
    )
  }
)

AppleCardFooter.displayName = 'AppleCardFooter'
```

## 3. Layout Component Updates

### 3.1 Enhanced Header Component

**Update Header with Apple design principles:**

```typescript
// components/layout/AppleHeader.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  ShoppingCart,
  User,
  LogOut,
  Sun,
  Moon,
  LogIn,
  Search,
  X
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useCart } from '@/contexts/CartContext';
import { AppleButton, AppleIconButton } from '@/components/ui/AppleButton';
import { AppleInput } from '@/components/ui/AppleInput';

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
];

const AppleHeader: React.FC = React.memo(() => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, profile, isAdmin } = useAuth();
  const { state: cartState } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }
    
    if (userMenuOpen || searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen, searchOpen]);

  const handleSignOut = async () => {
    try {
      setUserMenuOpen(false);
      await signOut();
      router.push("/");
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleAccountClick = () => {
    setUserMenuOpen(false);
    if (isAdmin) {
      router.push('/admin');
    } else {
      router.push('/account');
    }
  };

  return (
    <header className="w-full bg-background/80 backdrop-blur-lg backdrop-saturate-150 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-title-2 font-bold text-text-primary hover:opacity-70 transition-opacity"
        >
          Espada
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-3 py-2 text-body font-medium transition-colors",
                pathname === link.href
                  ? "text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue-500"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <AppleIconButton
              icon={<Search size={18} />}
              aria-label="Search products"
              variant="tertiary"
              size="small"
              onClick={() => setSearchOpen(!searchOpen)}
            />

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-80 bg-background rounded-apple-large shadow-apple-medium border border-border p-4 z-50"
                >
                  <form onSubmit={handleSearch} className="space-y-3">
                    <AppleInput
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      leftIcon={<Search size={16} />}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <AppleButton
                        type="submit"
                        size="small"
                        className="flex-1"
                      >
                        Search
                      </AppleButton>
                      <AppleButton
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={() => setSearchOpen(false)}
                      >
                        Cancel
                      </AppleButton>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <AppleIconButton
            icon={mounted ? (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />) : <Moon size={18} />}
            aria-label="Toggle theme"
            variant="tertiary"
            size="small"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          />

          {/* Cart */}
          <Link href="/checkout">
            <AppleIconButton
              icon={
                <div className="relative">
                  <ShoppingCart size={18} />
                  {cartState.itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-apple-red-500 text-white text-caption-2 font-semibold rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {cartState.itemCount > 9 ? '9+' : cartState.itemCount}
                    </motion.span>
                  )}
                </div>
              }
              aria-label={`Cart with ${cartState.itemCount} items`}
              variant="tertiary"
              size="small"
            />
          </Link>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <AppleIconButton
              icon={<User size={18} />}
              aria-label="User menu"
              variant="tertiary"
              size="small"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            />

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-56 bg-background rounded-apple-large shadow-apple-medium border border-border py-2 z-50"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-subhead font-medium text-text-primary">
                          {profile?.name || user.email}
                        </p>
                        <p className="text-caption-1 text-text-secondary">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleAccountClick}
                        className="w-full px-4 py-3 text-left text-body text-text-primary hover:bg-form-background transition-colors flex items-center gap-3"
                      >
                        <User size={16} />
                        {isAdmin ? 'Admin Dashboard' : 'My Account'}
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-3 text-left text-body text-apple-red-500 hover:bg-form-background transition-colors flex items-center gap-3"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="p-2">
                      <AppleButton
                        onClick={() => {
                          setUserMenuOpen(false);
                          router.push('/signin');
                        }}
                        variant="primary"
                        size="small"
                        fullWidth
                        leftIcon={<LogIn size={16} />}
                      >
                        Sign In
                      </AppleButton>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <AppleIconButton
              icon={menuOpen ? <X size={18} /> : <Menu size={18} />}
              aria-label="Toggle menu"
              variant="tertiary"
              size="small"
              onClick={() => setMenuOpen(!menuOpen)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-background border-t border-border"
          >
            <nav className="px-6 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block px-3 py-3 text-body font-medium rounded-apple-medium transition-colors",
                    pathname === link.href
                      ? "text-text-primary bg-form-background"
                      : "text-text-secondary hover:text-text-primary hover:bg-form-background"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

AppleHeader.displayName = 'AppleHeader';

export default AppleHeader;
```

## 4. Implementation Checklist

### Phase 1: Foundation (Week 1)

* [ ] Update `globals.css` with Apple design system

* [ ] Update `tailwind.config.js` with Apple spacing and colors

* [ ] Create Apple component library (Button, Input, Card)

* [ ] Test contrast ratios and accessibility

### Phase 2: Component Migration (Week 2)

* [ ] Replace existing Button components with AppleButton

* [ ] Replace existing Input components with AppleInput

* [ ] Replace existing Card components with AppleCard

* [ ] Update Header component with Apple design

### Phase 3: Layout and Pages (Week 3)

* [ ] Update all page layouts with Apple spacing

* [ ] Implement consistent typography hierarchy

* [ ] Update admin interface components

* [ ] Test responsive behavior

### Phase 4: Testing and Refinement (Week 4)

* [ ] Accessibility testing with screen readers

* [ ] Contrast ratio validation

* [ ] Touch target testing on mobile devices

* [ ] Performance optimization

## 5. Testing Guidelines

### Accessibility Testing

```bash
# Install accessibility testing tools
npm install --save-dev @axe-core/react jest-axe

# Run accessibility tests
npm run test:a11y
```

### Contrast Testing

Use tools like:

* WebAIM Contrast Checker

* Stark Figma Plugin

* Chrome DevTools Accessibility Panel

### Touch Target Testing

Ensure all interactive elements meet 44px minimum:

```css
/* Test helper class */
.debug-touch-targets * {
  outline: 1px solid red !important;
}

.debug-touch-targets button,
.debug-touch-targets a,
.debug-touch-targets input {
  outline: 2px solid blue !important;
}
```

This implementation guide provides the foundation for transform
