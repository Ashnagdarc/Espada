import React from 'react';
import { HoverScale } from './PageTransition';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700 text-white',
      border: 'border-red-200'
    },
    warning: {
      icon: 'text-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      border: 'border-yellow-200'
    },
    info: {
      icon: 'text-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      border: 'border-blue-200'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg max-w-md w-full animate-scale-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-gray-100 ${styles.icon}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {title}
              </h3>
            </div>
            <HoverScale>
              <button
                onClick={onCancel}
                className="admin-button text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            </HoverScale>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <HoverScale>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="admin-button px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                {cancelText}
              </button>
            </HoverScale>
            <HoverScale>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`admin-button px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${styles.button}`}
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </HoverScale>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast notification component
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div className={`px-4 py-3 rounded-lg border ${typeStyles[type]} shadow-lg max-w-sm`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            {message}
          </p>
          <button
            onClick={onClose}
            className="ml-3 text-current hover:opacity-70 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}