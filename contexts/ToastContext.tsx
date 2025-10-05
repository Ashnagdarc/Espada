'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ToastProvider as UIToastProvider, useToast as useUIToast, useToastActions } from '@/components/ui/Toast'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

// Re-export the UI Toast components and hooks
export { UIToastProvider as ToastProvider, useUIToast as useToast, useToastActions }

// Convenience hook for quick toast notifications
export function useToastNotifications() {
  const { success, error, warning, info } = useToastActions()
  
  return {
    showSuccess: success,
    showError: error,
    showWarning: warning,
    showInfo: info
  }
}