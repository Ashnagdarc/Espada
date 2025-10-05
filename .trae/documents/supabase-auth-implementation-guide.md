# Supabase Auth Implementation Guide

## Migration Implementation Steps

### Phase 1: Remove Stack Auth Dependencies

#### 1.1 Remove Stack Auth Packages
```bash
npm uninstall @stackframe/stack @stackframe/stack-shared
```

#### 1.2 Remove Stack Auth Configuration Files
- Delete `stack/client.tsx`
- Delete `stack/server.tsx`
- Remove Stack Auth environment variables from `.env`

#### 1.3 Remove Stack Auth Components
- Delete `app/handler/[...stack]/` directory
- Remove Stack Auth imports from existing components
- Clean up Stack Auth references in middleware

### Phase 2: Setup Supabase Auth

#### 2.1 Install Supabase Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

#### 2.2 Environment Configuration
```env
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 2.3 Supabase Client Setup
Create `lib/supabase/client.ts`:
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createClientComponentClient()
```

Create `lib/supabase/server.ts`:
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerClient = () => {
  return createServerComponentClient({ cookies })
}
```

### Phase 3: Create Authentication Components

#### 3.1 Authentication Context
Create `contexts/AuthContext.tsx`:
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  profile: any | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, userData?: any) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  updateProfile: (data: any) => Promise<{ error?: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
          setIsAdmin(false)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      // Check if user is admin
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (adminData) {
        setIsAdmin(true)
        setProfile(adminData)
        return
      }

      // Get customer profile
      const { data: customerData } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      setProfile(customerData)
      setIsAdmin(false)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setIsAdmin(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (!error && data.user) {
      // Create customer profile
      await supabase
        .from('customer_profiles')
        .insert({
          user_id: data.user.id,
          email: data.user.email,
          ...userData,
        })
    }

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (data: any) => {
    if (!user) return { error: 'No user logged in' }

    const { error } = await supabase
      .from('customer_profiles')
      .update(data)
      .eq('user_id', user.id)

    if (!error) {
      setProfile({ ...profile, ...data })
    }

    return { error }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAdmin,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

#### 3.2 Login Component
Create `components/auth/LoginForm.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, isAdmin } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Redirect based on role
    if (isAdmin) {
      router.push('/admin')
    } else {
      router.push('/account')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

### Phase 4: Implement Admin Role System

#### 4.1 Admin Route Protection
Create `components/auth/AdminRoute.tsx`:
```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }
      
      if (!isAdmin) {
        router.push('/account')
        return
      }
    }
  }, [user, isAdmin, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || !isAdmin) {
    return null
  }

  return <>{children}</>
}
```

#### 4.2 Update Admin Dashboard
Update `app/admin/page.tsx`:
```typescript
import AdminRoute from '@/components/auth/AdminRoute'

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        {/* Admin dashboard content */}
      </div>
    </AdminRoute>
  )
}
```

### Phase 5: Update Authentication Flows

#### 5.1 Update Root Layout
Update `app/layout.tsx`:
```typescript
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

#### 5.2 Create Auth Callback Handler
Create `app/auth/callback/route.ts`:
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to admin or account based on role
  return NextResponse.redirect(requestUrl.origin)
}
```

#### 5.3 Update Login Page
Update `app/login/page.tsx`:
```typescript
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold">
            Sign in to your account
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
```

### Phase 6: Database Migration

#### 6.1 Run Database Setup
Execute the SQL commands from the technical architecture document to create the necessary tables and policies.

#### 6.2 Migrate Existing Data
Create a migration script to move any existing user data to the new Supabase Auth system.

#### 6.3 Setup Admin User
Ensure `daniel.nonso48@gmail.com` is properly added to the admins table:
```sql
INSERT INTO admins (user_id, email) 
SELECT id, email FROM auth.users 
WHERE email = 'daniel.nonso48@gmail.com'
ON CONFLICT (email) DO NOTHING;
```

### Phase 7: Testing and Validation

#### 7.1 Test Authentication Flows
- Test customer registration and login
- Test admin login with daniel.nonso48@gmail.com
- Verify role-based redirections
- Test password reset functionality

#### 7.2 Test Protected Routes
- Verify admin routes are protected
- Test customer account access
- Validate proper error handling

#### 7.3 Performance Testing
- Test authentication performance
- Verify database query optimization
- Check for memory leaks in auth context

### Phase 8: Cleanup and Optimization

#### 8.1 Remove Old Code
- Delete all Stack Auth related files
- Remove unused dependencies
- Clean up environment variables

#### 8.2 Update Documentation
- Update README with new auth setup
- Document environment variables
- Create deployment guide

#### 8.3 Security Review
- Review RLS policies
- Validate admin access controls
- Test for authentication vulnerabilities

## Post-Migration Checklist

- [ ] Stack Auth completely removed
- [ ] Supabase Auth properly configured
- [ ] Admin user can access dashboard
- [ ] Customer users can access accounts
- [ ] Role-based redirection working
- [ ] Password reset functional
- [ ] Email verification working
- [ ] Database policies secure
- [ ] All tests passing
- [ ] Documentation updated

## Troubleshooting Common Issues

### Issue: Admin user not redirected to dashboard
**Solution**: Verify admin user exists in admins table and RLS policies allow access

### Issue: Authentication state not persisting
**Solution**: Check Supabase client configuration and cookie settings

### Issue: Database permission errors
**Solution**: Review RLS policies and ensure proper user roles

### Issue: Email verification not working
**Solution**: Check Supabase email settings and callback URL configuration