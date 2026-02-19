'use client'

import { useState } from 'react'
import Link from 'next/link'
import { validateEmail } from '@/utils/auth-client'
import { toast } from 'sonner'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password/confirm`,
      })

      if (error) {
        setError(error.message)
      } else {
        setIsSubmitted(true)
        toast.success('Password reset email sent!')
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-system-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-800">
            <div className="mx-auto w-16 h-16 bg-white dark:bg-black border border-black dark:border-white rounded-full flex items-center justify-center mb-6">
              <Send className="h-8 w-8 text-black dark:text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-label-primary mb-4">Check Your Email</h1>
            
            <p className="text-label-secondary mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>. 
              Click the link in the email to reset your password.
            </p>
            
            <div className="space-y-4">
              <p className="text-sm text-label-secondary">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              
              <button
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                }}
                className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium"
              >
                Try a different email address
              </button>
            </div>
            
            <div className="mt-8">
              <Link
                href="/signin"
                className="inline-flex items-center text-sm text-label-secondary hover:text-label-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-system-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-black rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-label-primary mb-2">Reset Password</h1>
            <p className="text-label-secondary">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-label-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors ${
                    error ? 'border-gray-400 bg-gray-50 dark:bg-gray-900' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-black'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {error && (
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white focus:ring-offset-white dark:focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Back to Sign In */}
          <div className="mt-8 text-center">
            <Link
              href="/signin"
              className="inline-flex items-center text-sm text-label-secondary hover:text-label-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}