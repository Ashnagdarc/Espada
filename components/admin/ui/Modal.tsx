'use client'

import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
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
  }, [isOpen, closeOnEscape, onClose])

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose()
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md'
      case 'md':
        return 'max-w-lg'
      case 'lg':
        return 'max-w-2xl'
      case 'xl':
        return 'max-w-4xl'
      case 'full':
        return 'max-w-full mx-4'
      default:
        return 'max-w-lg'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleOverlayClick}
        style={{
          animation: isOpen ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out'
        }}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`
            relative w-full ${getSizeClasses()} transform transition-all duration-300 ease-out
            ${isOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
            }
            ${className}
          `}
          style={{
            animation: isOpen 
              ? 'modalSlideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
              : 'modalSlideOut 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        >
          {/* Modal Content */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                {title && (
                  <h3 
                    className="text-lg font-bold text-gray-900 dark:text-white"
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                  >
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="
                      p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                      hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700
                      hover:scale-110 hover:rotate-90
                    "
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
            
            {/* Body */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Confirmation Modal Component
interface ConfirmModalProps {
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

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '🗑️',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-200 dark:focus:ring-red-800',
          iconBg: 'bg-red-100 dark:bg-red-900/20'
        }
      case 'warning':
        return {
          icon: '⚠️',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-200 dark:focus:ring-yellow-800',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/20'
        }
      case 'info':
        return {
          icon: 'ℹ️',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-200 dark:focus:ring-blue-800',
          iconBg: 'bg-blue-100 dark:bg-blue-900/20'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} mb-4`}>
          <span className="text-2xl">{styles.icon}</span>
        </div>
        
        {/* Title */}
        <h3 
          className="text-lg font-bold text-gray-900 dark:text-white mb-2"
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          {title}
        </h3>
        
        {/* Message */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {message}
        </p>
        
        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              flex-1 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 
              bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 
              rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 
              focus:ring-gray-200 dark:focus:ring-gray-700 disabled:opacity-50
              hover:scale-105
            "
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              flex-1 px-4 py-2 text-sm font-semibold text-white rounded-xl 
              transition-all duration-200 focus:outline-none focus:ring-2 
              disabled:opacity-50 hover:scale-105
              ${styles.confirmButton}
              ${isLoading ? 'cursor-not-allowed' : ''}
            `}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default Modal