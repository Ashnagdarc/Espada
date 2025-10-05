'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
}

const variantConfig = {
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
}

const sizeConfig = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export default function InfoModal({
  isOpen,
  onClose,
  title,
  content,
  variant = 'info',
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
}: InfoModalProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
  }, [isOpen, onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose()
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
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative w-full bg-white rounded-lg shadow-xl border border-gray-200",
              sizeConfig[size]
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={cn(
              "flex items-center gap-3 p-6 border-b border-gray-200",
              config.bgColor,
              config.borderColor
            )}>
              <div className={cn("p-2 rounded-full bg-white", config.iconColor)}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="flex-1 text-xl font-semibold text-gray-900" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-full transition-colors hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {content}
              </div>
            </div>

            {/* Footer (optional close button) */}
            <div className="flex justify-end p-6 pt-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for easier usage
export function useInfoModal() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Omit<InfoModalProps, 'isOpen' | 'onClose'>>({
    title: '',
    content: '',
  })

  const openModal = (modalConfig: Omit<InfoModalProps, 'isOpen' | 'onClose'>) => {
    setConfig(modalConfig)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const InfoModalComponent = () => (
    <InfoModal
      {...config}
      isOpen={isOpen}
      onClose={closeModal}
    />
  )

  return {
    openModal,
    closeModal,
    InfoModal: InfoModalComponent,
    isOpen,
  }
}

// Convenience functions for different variants
export function useSuccessModal() {
  const { openModal, closeModal, InfoModal, isOpen } = useInfoModal()
  
  const openSuccessModal = (title: string, content: React.ReactNode, options?: Partial<InfoModalProps>) => {
    openModal({ title, content, variant: 'success', ...options })
  }
  
  return { openSuccessModal, closeModal, InfoModal, isOpen }
}

export function useErrorModal() {
  const { openModal, closeModal, InfoModal, isOpen } = useInfoModal()
  
  const openErrorModal = (title: string, content: React.ReactNode, options?: Partial<InfoModalProps>) => {
    openModal({ title, content, variant: 'error', ...options })
  }
  
  return { openErrorModal, closeModal, InfoModal, isOpen }
}

export function useWarningModal() {
  const { openModal, closeModal, InfoModal, isOpen } = useInfoModal()
  
  const openWarningModal = (title: string, content: React.ReactNode, options?: Partial<InfoModalProps>) => {
    openModal({ title, content, variant: 'warning', ...options })
  }
  
  return { openWarningModal, closeModal, InfoModal, isOpen }
}