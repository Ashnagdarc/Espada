import { useCallback, useEffect, useState } from 'react'
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react'

interface UserProfile {
  id: string
  email: string
  role: 'customer' | 'admin'
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  created_at?: string
}

export const useAuth = () => {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const user = session?.user ?? null

  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null)
      return
    }

    try {
      setProfileLoading(true)
      const response = await fetch('/api/customer-profile')

      if (!response.ok) {
        setProfile(null)
        return
      }

      const data = await response.json()
      setProfile(data.profile ?? null)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  const signIn = async (email: string, password: string) => {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      const message = result.error === 'CredentialsSignin'
        ? 'Invalid email or password'
        : result.error
      return { error: message }
    }

    await refreshProfile()
    return { profile: profile ?? undefined }
  }

  const signUp = async (
    email: string,
    password: string,
    userData?: { firstName?: string; lastName?: string; phone?: string }
  ) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        phone: userData?.phone,
      }),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await response.json()
        return { error: data.error || 'Failed to sign up' }
      }

      const text = await response.text()
      return { error: text || 'Failed to sign up' }
    }

    const signInResult = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (signInResult?.error) {
      return { error: 'Account created, but sign-in failed. Please sign in.' }
    }

    await refreshProfile()
    return {}
  }

  const signOut = async () => {
    try {
      // Clear profile state immediately
      setProfile(null)
      
      // Call NextAuth signOut which will:
      // 1. Clear the session cookie
      // 2. Clear the SessionProvider state
      // 3. Redirect to the callback URL
      await nextAuthSignOut({ 
        callbackUrl: '/',
        redirect: true
      })
    } catch (error) {
      console.error('Sign out error in useAuth:', error)
      // Force redirect even if there's an error
      window.location.href = '/'
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/customer-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const data = await response.json()
        return { error: data.error || 'Failed to update profile' }
      }

      const data = await response.json()
      setProfile(data.profile ?? null)
      return {}
    } catch (error) {
      console.error('Error updating profile:', error)
      return { error: 'Failed to update profile' }
    }
  }

  return {
    user,
    session,
    profile,
    isLoading: status === 'loading' || profileLoading,
    isAdmin: profile?.role === 'admin' || user?.role === 'admin',
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  }
}

export default useAuth