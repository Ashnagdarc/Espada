'use client'

import { useContext } from 'react'
import { ToastContext } from '../components/ui/Toast'

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
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