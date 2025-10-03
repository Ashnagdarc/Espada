'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalType = 'default' | 'confirmation' | 'success' | 'error' | 'warning' | 'info';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: ModalSize;
  type?: ModalType;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

interface ConfirmationModalProps extends Omit<ModalProps, 'type' | 'children'> {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const getModalSizeClasses = (size: ModalSize) => {
  switch (size) {
    case 'sm':
      return 'max-w-md';
    case 'md':
      return 'max-w-lg';
    case 'lg':
      return 'max-w-2xl';
    case 'xl':
      return 'max-w-4xl';
    case 'full':
      return 'max-w-7xl mx-4';
    default:
      return 'max-w-lg';
  }
};

const getModalTypeIcon = (type: ModalType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
    case 'error':
      return <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />;
    case 'warning':
      return <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
    case 'info':
      return <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
    default:
      return null;
  }
};

const getModalTypeColors = (type: ModalType) => {
  switch (type) {
    case 'success':
      return 'border-green-200 dark:border-green-800';
    case 'error':
      return 'border-red-200 dark:border-red-800';
    case 'warning':
      return 'border-yellow-200 dark:border-yellow-800';
    case 'info':
      return 'border-blue-200 dark:border-blue-800';
    default:
      return 'border-gray-200 dark:border-gray-700';
  }
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  type = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={`relative w-full ${getModalSizeClasses(size)} bg-white dark:bg-gray-800 rounded-lg shadow-xl border ${getModalTypeColors(type)} ${className}`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {getModalTypeIcon(type)}
                  {title && (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h3>
                  )}
                </div>
                {showCloseButton && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
  loading = false,
  ...modalProps
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          type: 'error' as ModalType,
          confirmButton: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white',
          icon: <XCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
        };
      case 'warning':
        return {
          type: 'warning' as ModalType,
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white',
          icon: <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
        };
      case 'info':
        return {
          type: 'info' as ModalType,
          confirmButton: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white',
          icon: <Info className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        };
    }
  };

  const styles = getVariantStyles();

  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={styles.type}
      size="sm"
      {...modalProps}
    >
      <div className="text-center">
        {styles.icon}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        
        <div className="flex space-x-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            {cancelText}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${styles.confirmButton}`}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </div>
            ) : (
              confirmText
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

// Hook for easier modal management
export const useModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

export default Modal;