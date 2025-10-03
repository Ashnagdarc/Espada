'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  showProgress?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1 - (index * 0.02), 
              opacity: 1,
              y: index * -8,
              zIndex: toasts.length - index
            }}
            exit={{ scale: 0.8, opacity: 0, x: 400 }}
            transition={{ 
              layout: { duration: 0.3, ease: "easeInOut" },
              scale: { duration: 0.2 },
              opacity: { duration: 0.2 }
            }}
            className="pointer-events-auto"
            style={{ 
              transformOrigin: 'top right',
              filter: index > 0 ? `brightness(${1 - (index * 0.1)})` : 'none'
            }}
          >
            <ToastItem toast={toast} onRemove={removeToast} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [progress, setProgress] = useState(100)
  const duration = toast.duration || 5000

  useEffect(() => {
    if (toast.showProgress !== false) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100))
          return newProgress <= 0 ? 0 : newProgress
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [duration, toast.showProgress])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-white dark:bg-black border-green-200 dark:border-green-800 shadow-green-100 dark:shadow-green-900/20'
      case 'error':
        return 'bg-white dark:bg-black border-red-200 dark:border-red-800 shadow-red-100 dark:shadow-red-900/20'
      case 'warning':
        return 'bg-white dark:bg-black border-yellow-200 dark:border-yellow-800 shadow-yellow-100 dark:shadow-yellow-900/20'
      case 'info':
        return 'bg-white dark:bg-black border-blue-200 dark:border-blue-800 shadow-blue-100 dark:shadow-blue-900/20'
    }
  }

  const getProgressColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 dark:bg-green-400'
      case 'error':
        return 'bg-red-500 dark:bg-red-400'
      case 'warning':
        return 'bg-yellow-500 dark:bg-yellow-400'
      case 'info':
        return 'bg-blue-500 dark:bg-blue-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
      exit={{ opacity: 0, x: 300, scale: 0.9, y: -20 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative max-w-sm w-full shadow-xl rounded-2xl border p-5 backdrop-blur-sm overflow-hidden ${getStyles()}`}
      style={{ fontFamily: 'Gilroy, sans-serif' }}
    >
      {/* Progress Bar */}
      {toast.showProgress !== false && (
        <motion.div 
          className="absolute bottom-0 left-0 h-1 rounded-b-2xl"
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        >
          <div className={`h-full ${getProgressColor()} rounded-b-2xl`} />
        </motion.div>
      )}

      <div className="flex items-start">
        <motion.div 
          className="flex-shrink-0"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, duration: 0.3, type: "spring" }}
        >
          {getIcon()}
        </motion.div>
        <div className="ml-4 flex-1">
          <motion.p 
            className="text-sm font-bold text-black dark:text-white"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            {toast.title}
          </motion.p>
          {toast.message && (
            <motion.p 
              className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {toast.message}
            </motion.p>
          )}
          {toast.action && (
            <motion.button
              onClick={toast.action.onClick}
              className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {toast.action.label}
            </motion.button>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <motion.button
            onClick={() => onRemove(toast.id)}
            className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// Helper hook for common toast actions
export const useToastActions = () => {
  const { addToast } = useToast()

  return {
    success: (title: string, message?: string) => 
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => 
      addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) => 
      addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) => 
      addToast({ type: 'info', title, message })
  }
}