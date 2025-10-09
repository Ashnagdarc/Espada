'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, handleAuthError } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; profile?: UserProfile }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = profile?.role === 'admin';
  
  // Debug logging for isAdmin
  useEffect(() => {
    console.log('🔐 isAdmin calculation:', {
      profile: profile ? { email: profile.email, role: profile.role } : null,
      isAdmin,
      calculation: `${profile?.role} === 'admin' = ${profile?.role === 'admin'}`
    });
  }, [profile]);



  // Simplified profile fetching by email
  const fetchProfileByEmail = useCallback(async (email: string): Promise<UserProfile | null> => {
    console.log('🔍 fetchProfileByEmail called for:', email);
    try {
      // Check admin table first
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('❌ Error checking admins table:', adminError);
      }

      if (adminData) {
        console.log('✅ Found admin profile:', adminData);
        const profile = {
          id: adminData.id,
          email: adminData.email,
          first_name: adminData.first_name,
          last_name: adminData.last_name,
          role: 'admin' as const,
          created_at: adminData.created_at,
          updated_at: adminData.updated_at,
        };
        console.log('🎯 Returning admin profile with role:', profile.role);
        return profile;
      }

      console.log('❌ Not found in admins table, checking customer_profiles...');

      // Check customer profiles
      const { data: customerData, error: customerError } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (customerError && customerError.code !== 'PGRST116') {
        console.error('❌ Error checking customer_profiles table:', customerError);
      }

      if (customerData) {
        console.log('✅ Found customer profile:', customerData);
        const profile = {
          id: customerData.id,
          email: customerData.email,
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          role: customerData.role || 'customer', // Use the actual role from database
          phone: customerData.phone,
          address: customerData.address,
          city: customerData.city,
          postal_code: customerData.postal_code,
          country: customerData.country,
          date_of_birth: customerData.date_of_birth,
          preferences: customerData.preferences,
          created_at: customerData.created_at,
          updated_at: customerData.updated_at,
        };
        console.log('🎯 Returning customer profile with role:', profile.role);
        return profile;
      }

      console.log('❌ No profile found for email:', email);
      return null;
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      return null;
    }
  }, []);

  // Sign in function with immediate profile fetching
  const signIn = async (email: string, password: string) => {
    const startTime = Date.now();
    try {
      console.log('🔐 SupabaseAuthContext signIn: Starting authentication for:', email);
      
      const authStart = Date.now();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      const authEnd = Date.now();
      console.log(`🔐 SupabaseAuthContext signIn: Auth took ${authEnd - authStart}ms`);

      if (error) {
        console.error('🔐 SupabaseAuthContext signIn: Auth error:', error.message);
        return { error: error.message };
      }

      console.log('🔐 SupabaseAuthContext signIn: Auth successful, setting session cookies for SSR...');
      
      // Set session cookies for SSR by calling our API route
      if (data.session) {
        try {
          const sessionStart = Date.now();
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }),
          });
          const sessionEnd = Date.now();
          console.log(`🔐 SupabaseAuthContext signIn: Session cookies set successfully in ${sessionEnd - sessionStart}ms`);
        } catch (sessionError) {
          console.warn('🔐 SupabaseAuthContext signIn: Failed to set session cookies:', sessionError);
        }
      }
      
      console.log('🔐 SupabaseAuthContext signIn: Fetching profile...');
      
      // Immediately fetch profile after successful sign in
      const profileStart = Date.now();
      const userProfile = await fetchProfileByEmail(email);
      const profileEnd = Date.now();
      
      console.log(`🔐 SupabaseAuthContext signIn: Profile fetch took ${profileEnd - profileStart}ms, result:`, userProfile);
      
      const totalTime = Date.now() - startTime;
      console.log(`🔐 SupabaseAuthContext signIn: Total signin process took ${totalTime}ms`);
      
      return { profile: userProfile || undefined };
    } catch (error) {
      console.error('🔐 SupabaseAuthContext signIn: Unexpected error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      // Profile will be created after email confirmation
      return {};
    } catch {
      return { error: 'An unexpected error occurred' };
    }
  };

  // Sign out function with improved error handling
  const signOut = async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      // Clear local state first to prevent UI issues
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Call logout API to clear server-side session cookies
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('✅ Server-side logout successful');
      } catch (apiError) {
        console.warn('⚠️ Server-side logout failed (continuing with client logout):', apiError);
      }
      
      // Attempt to sign out from Supabase client with timeout
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 5000)
      );
      
      try {
        const result = await Promise.race([signOutPromise, timeoutPromise]);
        if (result.error) {
          console.warn('⚠️ Supabase signOut error (continuing with local cleanup):', result.error);
        } else {
          console.log('✅ Client-side logout successful');
        }
      } catch (networkError) {
        // Handle network errors or timeouts gracefully
        console.warn('⚠️ Network error during logout (local state cleared):', networkError);
        // Continue with local cleanup - this is not critical for user experience
      }
      
      console.log('✅ Logout process completed');
      
    } catch (error) {
      console.warn('⚠️ SignOut error (local state cleared):', error);
      // Local state is already cleared, so this is not critical
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return { error: 'No profile found' };

    try {
      const table = profile.role === 'admin' ? 'admins' : 'customer_profiles';
      const { error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return {};
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: 'Failed to update profile' };
    }
  };

  // Simplified auth state initialization
  useEffect(() => {
    let mounted = true;
    console.log('🚀 SupabaseAuthContext useEffect initialized');
    
    // Get initial session with error handling
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('❌ Error getting initial session:', error);
        // Use the utility function to handle auth errors
        await handleAuthError(error);
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }
      
      console.log('📱 Initial session check:', session ? `User: ${session.user.email}` : 'No session');
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user?.email) {
        console.log('👤 Fetching profile for initial session user:', session.user.email);
        const userProfile = await fetchProfileByEmail(session.user.email);
        if (mounted) {
          setProfile(userProfile);
          console.log('✅ Profile set:', userProfile ? `Role: ${userProfile.role}` : 'No profile');
        }
      }
      
      if (mounted) {
        setIsLoading(false);
        console.log('✅ Initial auth loading complete');
      }
    }).catch((error) => {
      console.error('❌ Unexpected error in getSession:', error);
      if (mounted) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', event, session ? `User: ${session.user.email}` : 'No session');
        
        // Handle specific auth events
        if (event === 'TOKEN_REFRESHED') {
          console.log('✅ Token refreshed successfully');
          // Don't fetch profile again for token refresh, just update session
          setSession(session);
          setUser(session?.user ?? null);
          return;
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return; // Exit early to prevent profile fetching
        } else if (event === 'SIGNED_IN') {
          console.log('✅ User signed in');
          setSession(session);
          setUser(session?.user ?? null);
          
          // Only fetch profile for sign in events
          if (session?.user?.email) {
            console.log('👤 Fetching profile for signed in user:', session.user.email);
            const userProfile = await fetchProfileByEmail(session.user.email);
            if (mounted) {
              setProfile(userProfile);
              console.log('✅ Profile set after sign in:', userProfile ? `Role: ${userProfile.role}` : 'No profile');
            }
          }
          
          if (mounted) {
            setIsLoading(false);
            console.log('✅ Sign in auth change complete');
          }
          return;
        }
        
        // For other events (like initial session), handle normally
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user?.email) {
          console.log('👤 Fetching profile for auth change user:', session.user.email);
          const userProfile = await fetchProfileByEmail(session.user.email);
          if (mounted) {
            setProfile(userProfile);
            console.log('✅ Profile updated:', userProfile ? `Role: ${userProfile.role}` : 'No profile');
          }
        } else {
          if (mounted) {
            setProfile(null);
            console.log('❌ Profile cleared (no session)');
          }
        }
        
        if (mounted) {
          setIsLoading(false);
          console.log('✅ Auth change loading complete');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileByEmail]);

  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}