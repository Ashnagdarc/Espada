'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@stackframe/stack'
import { Lock, AlertCircle } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const user = useUser()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      if (user) {
        // User is authenticated, check if they're an admin
        try {
          const response = await fetch('/api/admin/check-role')
          const result = await response.json()
          
          if (result.isAdmin) {
            // User is admin, redirect to admin dashboard
            router.push('/admin')
          } else {
            // User is authenticated but not admin
            setError('Admin access required. You are not authorized to access the admin dashboard.')
            setIsCheckingAuth(false)
          }
        } catch (error) {
          console.error('Error checking admin role:', error)
          setError('Error checking admin permissions. Please try again.')
          setIsCheckingAuth(false)
        }
      } else {
        // User is not authenticated, redirect to Stack Auth signin
        router.push('/handler/signin?redirect=/admin/login')
      }
    }

    checkAuth()
  }, [user, router])

  const handleSignOut = async () => {
    if (user) {
      await user.signOut()
      router.push('/')
    }
  }

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-white dark:text-black" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show error state for non-admin users
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 style={{ fontFamily: 'Gilroy, sans-serif' }} className="mt-6 text-3xl font-bold text-black dark:text-white">
              Access Denied
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Admin access required
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              Sign Out
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              ← Back to Store
            </button>
          </div>
        </div>
      </div>
    )
  }

  // This should not be reached as we redirect in useEffect
  return null
}