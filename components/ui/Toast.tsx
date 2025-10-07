'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useId } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

// Context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Item Component
const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log('ToastItem mounted:', toast);
    // Show toast immediately
    setIsVisible(true);

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      console.log('Auto-dismissing toast:', toast.id);
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300); // Wait for fade out
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const handleClose = () => {
    console.log('Manually closing toast:', toast.id);
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  // Icon mapping
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  // Background color mapping
  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`
        ${getBgColor()}
        border rounded-lg p-4 mb-3 shadow-lg
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
        w-80 max-w-sm
      `}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
      }}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-sm text-gray-700">
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

// Toast Container Component
const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  console.log('ToastContainer render, toasts count:', toasts.length);
  
  if (toasts.length === 0) {
    console.log('No toasts to display');
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

// Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toastData, id };
    
    console.log('Adding toast:', newToast);
    setToasts(prev => {
      const updated = [...prev, newToast];
      console.log('Updated toasts array:', updated);
      return updated;
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    console.log('Removing toast:', id);
    setToasts(prev => {
      const updated = prev.filter(toast => toast.id !== id);
      console.log('Updated toasts array after removal:', updated);
      return updated;
    });
  }, []);

  console.log('ToastProvider render, current toasts:', toasts);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Export default
export default ToastProvider;