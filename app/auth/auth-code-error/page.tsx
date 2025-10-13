'use client'

import { useSearchParams } from 'next/navigation'
import { XCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const getErrorMessage = () => {
    switch (error) {
      case 'access_denied':
        return 'Access was denied. You may have cancelled the authentication process.'
      case 'invalid_request':
        return 'The authentication request was invalid.'
      case 'unauthorized_client':
        return 'The client is not authorized to request an access token.'
      case 'unsupported_response_type':
        return 'The authorization server does not support this response type.'
      case 'invalid_scope':
        return 'The requested scope is invalid.'
      case 'server_error':
        return 'The authorization server encountered an unexpected condition.'
      case 'temporarily_unavailable':
        return 'The authorization server is temporarily overloaded or under maintenance.'
      default:
        return errorDescription || 'An unknown authentication error occurred.'
    }
  }

  const getErrorIcon = () => {
    if (error === 'access_denied') {
      return <AlertTriangle className="h-8 w-8 text-yellow-600" />
    }
    return <XCircle className="h-8 w-8 text-red-600" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            error === 'access_denied' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            {getErrorIcon()}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Error
          </h1>
          
          <p className="text-gray-600 mb-6">
            {getErrorMessage()}
          </p>

          {error && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Error Code:</p>
              <p className="text-sm font-mono text-gray-700">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/signin"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Sign In Again
            </Link>
            <Link
              href="/signup"
              className="block w-full text-blue-600 py-3 px-4 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Create New Account
            </Link>
            <Link
              href="/"
              className="block w-full text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}