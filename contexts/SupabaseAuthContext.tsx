'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
  preferences?: any;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; profile?: UserProfile }>;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ error?: string }>;
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

  // Simplified profile fetching by email
  const fetchProfileByEmail = useCallback(async (email: string): Promise<UserProfile | null> => {
    try {
      // Check admin table first
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

      if (adminData) {
        return {
          id: adminData.id,
          email: adminData.email,
          first_name: adminData.first_name,
          last_name: adminData.last_name,
          role: 'admin',
          created_at: adminData.created_at,
          updated_at: adminData.updated_at,
        };
      }

      // Check customer profiles
      const { data: customerData } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (customerData) {
        return {
          id: customerData.id,
          email: customerData.email,
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          role: 'customer',
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
      }

      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  // Create profile for new users
  const createProfile = useCallback(async (userData: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!user?.email || !user?.id) return null;

    try {
      const profileData = {
        auth_user_id: user.id,
        email: user.email,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        postal_code: userData.postal_code || '',
        country: userData.country || '',
        date_of_birth: userData.date_of_birth || null,
        preferences: userData.preferences || {},
      };

      const { data, error } = await supabase
        .from('customer_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        role: 'customer',
      };
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }, [user?.email]);

  // Sign in function with immediate profile fetching
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      // Immediately fetch profile after successful sign in
      const userProfile = await fetchProfileByEmail(email);
      return { profile: userProfile };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
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
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Clear local state first to prevent UI issues
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Supabase signOut error (continuing with local cleanup):', error);
      }
    } catch (error) {
      console.warn('SignOut error (local state cleared):', error);
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
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user?.email) {
        const userProfile = await fetchProfileByEmail(session.user.email);
        if (mounted) {
          setProfile(userProfile);
        }
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user?.email) {
          const userProfile = await fetchProfileByEmail(session.user.email);
          if (mounted) {
            setProfile(userProfile);
          }
        } else {
          if (mounted) {
            setProfile(null);
          }
        }
        
        if (mounted) {
          setIsLoading(false);
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