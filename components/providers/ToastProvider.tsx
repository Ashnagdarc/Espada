'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'hsl(var(--toast-bg))',
          color: 'hsl(var(--toast-color))',
          border: '1px solid hsl(var(--toast-border))',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'Gilroy, sans-serif',
          fontWeight: '500',
          padding: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            background: 'hsl(var(--toast-success-bg))',
            color: 'hsl(var(--toast-success-color))',
            border: '1px solid hsl(var(--toast-success-border))',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            background: 'hsl(var(--toast-error-bg))',
            color: 'hsl(var(--toast-error-color))',
            border: '1px solid hsl(var(--toast-error-border))',
          },
        },
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#ffffff',
          },
          style: {
            background: 'hsl(var(--toast-loading-bg))',
            color: 'hsl(var(--toast-loading-color))',
            border: '1px solid hsl(var(--toast-loading-border))',
          },
        },
      }}
    />
  )
}