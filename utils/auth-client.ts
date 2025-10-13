import { createBrowserClient } from '@supabase/ssr'

// Optimized storage adapter for better session persistence
const createOptimizedStorage = () => {
  if (typeof window === 'undefined') {
    // Server-side: return a no-op storage
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    };
  }

  return {
    getItem: (key: string) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('Storage getItem error:', error);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('Storage setItem error:', error);
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Storage removeItem error:', error);
      }
    }
  };
};

export function createClientSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'espada-auth-token',
        storage: createOptimizedStorage(),
        // Reduce debug noise in production
        debug: false
      },
      // Add global configuration for better error handling
      global: {
        headers: {
          'X-Client-Info': 'espada-web-app'
        }
      }
    }
  )
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
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