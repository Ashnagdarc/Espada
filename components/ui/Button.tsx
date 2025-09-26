import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, ...props }, ref) => {
    // Apple Design Guidelines: 44pt minimum touch target
    const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95';
    
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border shadow-sm hover:shadow-md',
      tertiary: 'bg-transparent border border-border text-foreground hover:bg-secondary/50 shadow-sm hover:shadow-md',
      ghost: 'hover:bg-secondary/50 text-foreground',
      link: 'text-primary underline-offset-4 hover:underline p-0 h-auto min-h-0'
    };
    
    // Apple sizing: minimum 44pt (44px) touch target
    const sizes = {
      sm: 'h-10 min-h-[40px] px-4 text-subhead rounded-lg',      // 40px for small
      md: 'h-11 min-h-[44px] px-6 text-callout rounded-lg',      // 44px standard
      lg: 'h-12 min-h-[48px] px-8 text-headline rounded-xl'     // 48px for large
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses, 
          variants[variant], 
          variant !== 'link' ? sizes[size] : '',
          className
        )}
        whileHover={{ scale: variant === 'link' ? 1 : 1.02 }}
        whileTap={{ scale: variant === 'link' ? 1 : 0.96 }}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;