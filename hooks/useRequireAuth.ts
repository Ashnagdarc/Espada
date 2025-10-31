import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

interface UseRequireAuthOptions {
  redirectTo?: string
  requireAdmin?: boolean
}

export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const { redirectTo = '/signin', requireAdmin = false } = options

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!user) {
      router.push(redirectTo)
      return
    }

    if (requireAdmin && !isAdmin) {
      router.push('/')
    }
  }, [isLoading, user, isAdmin, router, redirectTo, requireAdmin])

  return {
    user,
    isLoading,
    isAdmin,
    isAuthenticated: Boolean(user),
    canAccessAdmin: requireAdmin ? Boolean(isAdmin) : true
  }
}
