import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

export interface ToastFunction {
  (message: string, options?: ToastOptions): string | number;
}

export interface Toast {
  success: ToastFunction;
  error: ToastFunction;
  warning: ToastFunction;
  info: ToastFunction;
  loading: ToastFunction;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error | unknown) => string);
    }
  ) => string | number;
  dismiss: (toastId?: string | number) => void;
  message: ToastFunction;
}

// Create a unified toast object that wraps Sonner with consistent API
export const toast: Toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      duration: options?.duration || Infinity,
      position: options?.position || 'top-right',
    });
  },

  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error | unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, options);
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  message: (message: string, options?: ToastOptions) => {
    return sonnerToast.message(message, {
      description: options?.description,
      action: options?.action,
      cancel: options?.cancel,
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  },
};

// Export individual functions for convenience
export const { success, error, warning, info, loading, promise, dismiss, message } = toast;

// Default export
export default toast;