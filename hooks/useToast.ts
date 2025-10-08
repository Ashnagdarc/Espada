import { toast, ToastOptions } from '@/lib/toast';

/**
 * Unified toast hook that provides a consistent API across the application
 * Uses Sonner under the hood for optimal performance and accessibility
 */
export const useToast = () => {
  return {
    toast,
    success: (message: string, options?: ToastOptions) => toast.success(message, options),
    error: (message: string, options?: ToastOptions) => toast.error(message, options),
    warning: (message: string, options?: ToastOptions) => toast.warning(message, options),
    info: (message: string, options?: ToastOptions) => toast.info(message, options),
    loading: (message: string, options?: ToastOptions) => toast.loading(message, options),
    promise: toast.promise,
    dismiss: toast.dismiss,
    message: (message: string, options?: ToastOptions) => toast.message(message, options),
  };
};

// For backward compatibility with existing code
export const useToastActions = () => {
  return {
    success: (message: string, description?: string) => 
      toast.success(message, { description }),
    error: (message: string, description?: string) => 
      toast.error(message, { description }),
    warning: (message: string, description?: string) => 
      toast.warning(message, { description }),
    info: (message: string, description?: string) => 
      toast.info(message, { description }),
  };
};