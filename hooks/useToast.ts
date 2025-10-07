'use client'

import { useContext } from 'react'

// Import the useToast hook directly from the Toast component
import { useToast } from '../components/ui/Toast'
export { useToast }

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