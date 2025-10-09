import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for frontend use (with anon key and proper auth config)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Add storage key prefix to avoid conflicts
    storageKey: 'espada-auth-token',
    // Add debug mode for better error tracking
    debug: process.env.NODE_ENV === 'development'
  }
})

// Utility function to handle auth errors gracefully
export const handleAuthError = async (error: Error | null) => {
  console.error('Auth error:', error);
  
  if (error?.message?.includes('refresh') || error?.message?.includes('token')) {
    console.log('Refresh token error detected, clearing session');
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.warn('Error during signOut:', signOutError);
    }
  }
}

// Database types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  sizes: string[]
  colors: string[]
  images: string[]
  stock: number
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: ShippingAddress
  created_at: string
  updated_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  size: string
  color: string
  quantity: number
  price: number
}

export interface ShippingAddress {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface Customer {
  id: string
  email: string
  name: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  username: string
  password_hash: string
  created_at: string
  updated_at: string
}