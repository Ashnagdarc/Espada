'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

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
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  isAdmin: boolean;
  handleRoleBasedRedirect: (defaultPath?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs for debouncing and preventing multiple redirects
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRedirectRef = useRef<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('🔍 fetchProfile called with userId:', userId);
      console.log('🔍 user.email:', user?.email);
      
      if (!user?.email) {
        console.log('❌ No user email found');
        return null;
      }

      // First check if user is an admin
      console.log('🔍 Checking admin table for email:', user.email);
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .single();

      console.log('🔍 Admin query result:', { adminData, adminError });

      if (adminData) {
        console.log('✅ Admin user found:', adminData);
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

      // If not admin, check customer profiles using auth_user_id
      const { data: customerData } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('auth_user_id', userId)
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
  }, [user?.email]);

  // Fetch profile by email (for use in auth state changes)
  const fetchProfileByEmail = useCallback(async (email: string): Promise<UserProfile | null> => {
    try {
      // Check cache first
      const cacheKey = CACHE_KEYS.USER_PROFILE(email);
      const cachedProfile = cache.get<UserProfile>(cacheKey);
      if (cachedProfile) {
        console.log('📦 Using cached user profile for:', email);
        return cachedProfile;
      }

      console.log('🔍 Fetching fresh user profile for:', email);

      // Optimize: Check role first with a single query
      const roleKey = CACHE_KEYS.USER_ROLE(email);
      let cachedRole = cache.get<'admin' | 'customer' | null>(roleKey);
      
      if (!cachedRole) {
        // Check admin table first (usually smaller table)
        const { data: adminData } = await supabase
          .from('admins')
          .select('email')
          .eq('email', email)
          .single();

        if (adminData) {
          cachedRole = 'admin';
          cache.set(roleKey, 'admin', CACHE_TTL.USER_ROLE);
        } else {
          // Check if customer exists
          const { data: customerData } = await supabase
            .from('customer_profiles')
            .select('email')
            .eq('email', email)
            .single();

          if (customerData) {
            cachedRole = 'customer';
            cache.set(roleKey, 'customer', CACHE_TTL.USER_ROLE);
          } else {
            cache.set(roleKey, null, CACHE_TTL.USER_ROLE);
            return null;
          }
        }
      }

      // Now fetch full profile based on role
      let profile: UserProfile | null = null;

      if (cachedRole === 'admin') {
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('email', email)
          .single();

        if (adminData) {
          profile = {
            id: adminData.id,
            email: adminData.email,
            first_name: adminData.first_name,
            last_name: adminData.last_name,
            role: 'admin',
            created_at: adminData.created_at,
            updated_at: adminData.updated_at,
          };
        }
      } else if (cachedRole === 'customer') {
        const { data: customerData } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (customerData) {
          profile = {
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
      }

      // Cache the profile if found
      if (profile) {
        cache.set(cacheKey, profile, CACHE_TTL.USER_PROFILE);
        console.log('💾 Cached user profile for:', email);
      }

      return profile;
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

  // Handle role-based redirection with proper guards and debouncing
  const handleRoleBasedRedirect = useCallback((defaultPath: string = '/account') => {
    // Guard: Only run on client side
    if (typeof window === 'undefined') {
      console.log('🚫 handleRoleBasedRedirect: Server side, skipping');
      return;
    }

    // Guard: Don't redirect if still loading
    if (isLoading) {
      console.log('🚫 handleRoleBasedRedirect: Still loading, skipping redirect');
      return;
    }

    // Guard: Don't redirect if no user
    if (!user) {
      console.log('🚫 handleRoleBasedRedirect: No user, skipping redirect');
      return;
    }

    // Guard: Don't redirect if no profile (unless it's been long enough)
    if (!profile) {
      console.log('🚫 handleRoleBasedRedirect: No profile loaded, skipping redirect');
      return;
    }

    // Determine target path based on role
    const targetPath = isAdmin ? '/admin' : defaultPath;
    
    // Guard: Prevent duplicate redirects to the same path
    if (lastRedirectRef.current === targetPath) {
      console.log('🚫 handleRoleBasedRedirect: Already redirected to', targetPath);
      return;
    }

    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Debounce the redirect to prevent rapid calls
    redirectTimeoutRef.current = setTimeout(() => {
      try {
        console.log('🔄 handleRoleBasedRedirect: Redirecting to', targetPath, 'isAdmin:', isAdmin);
        lastRedirectRef.current = targetPath;
        
        // Use Next.js router for better error handling and performance
        router.push(targetPath);
      } catch (error) {
        console.error('❌ Error during Next.js router redirect:', error);
        
        // Fallback to window.location if router fails
        try {
          window.location.replace(targetPath);
        } catch (fallbackError) {
          console.error('❌ Error during window.location fallback:', fallbackError);
          window.location.href = targetPath;
        }
      }
    }, 100); // 100ms debounce
  }, [router, isLoading, user, profile, isAdmin]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
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

  // Initialize auth state
  useEffect(() => {
    console.log('🚀 Initializing auth state...');
    
    let mounted = true;
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('🔍 Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);

      // Handle initial session profile loading
      if (session?.user && session.user.email) {
        console.log('👤 Initial user authenticated, fetching profile for:', session.user.email);
        const existingProfile = await fetchProfileByEmail(session.user.email);
        if (mounted) {
          if (existingProfile) {
            console.log('✅ Initial profile loaded:', existingProfile);
            setProfile(existingProfile);
          } else {
            console.log('❌ No initial profile found');
            setProfile(null);
          }
          setIsLoading(false);
        }
      } else {
        if (mounted) {
          console.log('❌ No initial user, setting loading to false');
          setProfile(null);
          setIsLoading(false);
        }
      }
    }).catch((error) => {
      console.error('Error getting initial session:', error);
      if (mounted) {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', { event, session });
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && session.user.email) {
          console.log('👤 User authenticated, fetching profile for:', session.user.email);
          // Fetch or create profile
          const existingProfile = await fetchProfileByEmail(session.user.email);
          if (mounted) {
            if (existingProfile) {
              console.log('✅ Profile loaded:', existingProfile);
              setProfile(existingProfile);
            } else if (event === 'SIGNED_UP') {
              console.log('🆕 Creating new profile for signed up user');
              // Create profile for new users
              const newProfile = await createProfile({});
              setProfile(newProfile);
            } else {
              console.log('❌ No profile found and not a sign-up event');
              setProfile(null);
            }
            setIsLoading(false);
          }
        } else {
          if (mounted) {
            console.log('❌ No user or email, clearing profile');
            setProfile(null);
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      
      // Cleanup redirect timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [fetchProfileByEmail, createProfile]);

  // Fetch profile when user changes
  useEffect(() => {
    if (user && !profile) {
      console.log('🔄 User changed, fetching profile for:', user.id);
      fetchProfile(user.id).then((fetchedProfile) => {
        console.log('📝 Profile fetch result:', fetchedProfile);
        setProfile(fetchedProfile);
      });
    }
  }, [user, profile, fetchProfile]);

  // Debug isAdmin state
  useEffect(() => {
    console.log('🔐 Auth state update:', {
      user: user?.email,
      profile: profile?.email,
      role: profile?.role,
      isAdmin: profile?.role === 'admin',
      isLoading,
      hasUser: !!user,
      hasProfile: !!profile
    });
  }, [user, profile, isLoading]);

  // Debug the computed isAdmin value
  useEffect(() => {
    const isAdminValue = profile?.role === 'admin';
    console.log('🔑 isAdmin computed value:', isAdminValue, 'from profile role:', profile?.role);
  }, [profile?.role]);

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
    handleRoleBasedRedirect,
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