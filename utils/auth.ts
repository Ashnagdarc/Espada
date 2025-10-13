import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createServerSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const store = await cookies()
          return store.getAll()
        },
        async setAll(cookiesToSet) {
          try {
            const store = await cookies()
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                store.set(name, value, options)
              } catch {
                // Ignore if setting cookies is not available in this context
              }
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function getServerSession() {
  const supabase = await createServerSupabaseClient()
  
  // Use getUser() for better security, then get session if user exists
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return null
  }
  
  // If user exists, get the session
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getServerUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting server user:', error)
    return null
  }
  
  return user
}

export async function requireAuth(redirectTo: string = '/signin') {
  const user = await getServerUser()
  
  if (!user) {
    redirect(redirectTo)
  }
  
  // Also get the session for backward compatibility
  const session = await getServerSession()
  
  // If we have a user but no session, something is wrong
  if (!session) {
    redirect(redirectTo)
  }
  
  return session
}

export async function requireAdmin() {
  const session = await requireAuth('/admin/login')
  const supabase = await createServerSupabaseClient()
  
  const { data: adminData } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', session.user.id)
    .single()
  
  if (!adminData) {
    redirect('/')
  }
  
  return { session, isAdmin: true }
}

export async function getUserProfile(userId: string) {
  const supabase = await createServerSupabaseClient()
  
  // Check if user is admin first
  const { data: adminData } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (adminData) {
    return { type: 'admin', profile: adminData }
  }
  
  // Check customer profile
  const { data: customerData } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('auth_user_id', userId)
    .single()
  
  if (customerData) {
    return { type: 'customer', profile: customerData }
  }
  
  return null
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 8
}

export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function generateSecureToken(): string {
  return crypto.randomUUID()
}