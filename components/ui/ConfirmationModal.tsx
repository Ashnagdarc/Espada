'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  info: {
    icon: AlertTriangle,
    iconColor: 'text-blue-600',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmationModalProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, isLoading])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                "absolute top-4 right-4 p-1 rounded-full transition-colors",
                "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Icon and title */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2 rounded-full bg-gray-100", config.iconColor)}>
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {title}
                </h2>
              </div>

              {/* Message */}
              <p className="text-gray-600 mb-6 leading-relaxed" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    "focus:outline-none focus:ring-2 focus:ring-gray-300",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2",
                    config.confirmButton,
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for easier usage
export function useConfirmationModal() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Omit<ConfirmationModalProps, 'isOpen' | 'onClose' | 'onConfirm'> & { onConfirm: () => void | Promise<void> }>({
    title: '',
    message: '',
    onConfirm: () => {},
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const openModal = (modalConfig: Omit<ConfirmationModalProps, 'isOpen' | 'onClose' | 'onConfirm'> & { onConfirm: () => void | Promise<void> }) => {
    setConfig(modalConfig)
    setIsOpen(true)
  }

  const closeModal = () => {
    if (!isLoading) {
      setIsOpen(false)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await config.onConfirm()
      setIsOpen(false)
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const ConfirmationModalComponent = () => (
    <ConfirmationModal
      {...config}
      isOpen={isOpen}
      onClose={closeModal}
      onConfirm={handleConfirm}
      isLoading={isLoading}
    />
  )

  return {
    openModal,
    closeModal,
    ConfirmationModal: ConfirmationModalComponent,
    isOpen,
    isLoading,
  }
}