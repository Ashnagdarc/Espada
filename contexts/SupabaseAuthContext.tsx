"use client";

import { createContext, useEffect, useState, useCallback } from "react";
import { createClientSupabaseClient } from "@/utils/auth-client";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

// User profile interface
interface UserProfile {
  id: string;
  email: string;
  role: "customer" | "admin";
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; profile?: UserProfile }>;
  signUp: (email: string, password: string, userData?: { fullName?: string; phone?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

export const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Supabase client
  const supabase = createClientSupabaseClient();

  // Check if user is admin
  const isAdmin = profile?.role === "admin";

  // Fetch user profile based on role
  const fetchUserProfile = useCallback(async (userId: string, userEmail: string): Promise<UserProfile | null> => {
    try {
      // First check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (adminData && !adminError) {
        return {
          id: adminData.id,
          email: adminData.email,
          role: "admin",
          created_at: adminData.created_at
        };
      }

      // If not admin, check customer profile
      const { data: customerData, error: customerError } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (customerData && !customerError) {
        return {
          id: customerData.id,
          email: customerData.email,
          role: "customer",
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          phone: customerData.phone,
          address: customerData.address,
          city: customerData.city,
          postal_code: customerData.postal_code,
          country: customerData.country,
          created_at: customerData.created_at
        };
      }

      // If no profile exists, create a customer profile
      const { data: newCustomerData, error: createError } = await supabase
        .from('customer_profiles')
        .insert([{
          auth_user_id: userId,
          email: userEmail,
          role: 'customer'
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating customer profile:', createError);
        return null;
      }

      return {
        id: newCustomerData.id,
        email: newCustomerData.email,
        role: "customer",
        created_at: newCustomerData.created_at
      };

    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, [supabase]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      const userProfile = await fetchUserProfile(user.id, user.email || '');
      setProfile(userProfile);
    }
  }, [user, fetchUserProfile]);

  // Update auth state consistently
  const updateAuthState = useCallback(async (currentUser: User | null, currentSession: Session | null) => {
    setUser(currentUser);
    setSession(currentSession);
    
    if (currentUser) {
      const userProfile = await fetchUserProfile(currentUser.id, currentUser.email || '');
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
  }, [fetchUserProfile]);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<{ error?: string; profile?: UserProfile }> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user && data.session) {
        // Update state immediately for better UX
        await updateAuthState(data.user, data.session);
        return { profile: profile || undefined };
      }

      return { error: 'Authentication failed' };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (
    email: string, 
    password: string, 
    userData?: { fullName?: string; phone?: string }
  ): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Supabase auth signup error:', error);
        return { error: error.message };
      }

      // If user is created, create customer profile
      if (data.user) {
        console.log('User created successfully, creating profile for:', data.user.id);
        
        const profileData: any = {
          auth_user_id: data.user.id,
          email: data.user.email,
          role: 'customer'
        };

        if (userData?.fullName) {
          const nameParts = userData.fullName.split(' ');
          profileData.first_name = nameParts[0];
          if (nameParts.length > 1) {
            profileData.last_name = nameParts.slice(1).join(' ');
          }
        }

        if (userData?.phone) {
          profileData.phone = userData.phone;
        }

        console.log('Attempting to create profile with data:', profileData);

        // Use API route to create profile with retry logic for timing issues
        let retryCount = 0;
        const maxRetries = 3;
        let lastError = '';

        while (retryCount < maxRetries) {
          try {
            const response = await fetch('/api/auth/create-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(profileData),
            });

            const result = await response.json();

            console.log('API Response:', { status: response.status, result });

            if (response.ok) {
              console.log('Profile created successfully via API:', result.profile);
              break; // Success, exit retry loop
            } else {
              lastError = result.error || `HTTP ${response.status}`;
              
              // If profile already exists (409), this is actually OK - user is already set up
              if (response.status === 409 && result.error?.includes('Profile already exists')) {
                console.log('Profile already exists for user - this is OK, user is already set up');
                break; // Exit retry loop, treat as success
              }
              
              // If it's a timing issue (user not found), retry after a short delay
              if (result.error?.includes('User not found') || result.error?.includes('not found')) {
                retryCount++;
                if (retryCount < maxRetries) {
                  console.log(`Profile creation attempt ${retryCount} failed, retrying in 1 second...`);
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  continue;
                }
              }
              
              // For other errors, don't retry
              console.error('Error creating customer profile via API:', { 
                status: response.status, 
                result, 
                profileData 
              });
              return { 
                error: `Registration successful, but failed to create profile: ${result.error || 'Unknown error'}. Please contact support.` 
              };
            }
          } catch (fetchError) {
            console.error('Network error during profile creation:', fetchError);
            retryCount++;
            lastError = 'Network error occurred';
            
            if (retryCount < maxRetries) {
              console.log(`Network error on attempt ${retryCount}, retrying in 1 second...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }

        // If we exhausted all retries
        if (retryCount >= maxRetries) {
          console.error('Failed to create profile after all retries');
          
          // Clean up: sign out the user since profile creation failed
          console.log('Signing out user due to profile creation failure');
          await supabase.auth.signOut();
          
          return { 
            error: `Registration failed: Unable to create user profile after ${maxRetries} attempts. ${lastError}. Please try again.` 
          };
        }
      } else {
        console.log('User signup initiated, email confirmation may be required');
      }

      return {};
    } catch (error) {
      console.error('Unexpected error during registration:', error);
      return { error: 'An unexpected error occurred during registration' };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🚪 Starting sign out process...');
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Sign out from Supabase FIRST - this is critical
      console.log('🔄 Signing out from Supabase...');
      const { error } = await supabase.auth.signOut({
        scope: 'global' // This ensures sign out from all sessions
      });
      
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }
      
      console.log('✅ Sign out successful');
      
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error?: string }> => {
    try {
      if (!user || !profile) {
        return { error: 'No user logged in' };
      }

      if (profile.role === 'admin') {
        const { error } = await supabase
          .from('admins')
          .update(updates)
          .eq('user_id', user.id);

        if (error) {
          return { error: error.message };
        }
      } else {
        const { error } = await supabase
          .from('customer_profiles')
          .update(updates)
          .eq('auth_user_id', user.id);

        if (error) {
          return { error: error.message };
        }
      }

      // Refresh profile data
      await refreshProfile();
      return {};
    } catch (error) {
      return { error: 'Failed to update profile' };
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth state...');
        
        // Use getUser() for secure authentication check
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (userError) {
          // Handle AuthSessionMissingError gracefully - this is expected when user is not authenticated
          if (userError.message === 'Auth session missing!') {
            console.log('ℹ️ No active session found - user not authenticated');
          } else {
            console.error('Auth user error:', userError);
          }
          // Clear any stale session data
          await updateAuthState(null, null);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }
        
        if (user) {
          console.log('✅ User found:', user.id);
          // Get the current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            // User exists but session is invalid, clear everything
            await updateAuthState(null, null);
          } else {
            console.log('✅ Session found:', session?.access_token ? 'valid' : 'invalid');
            await updateAuthState(user, session);
          }
        } else {
          console.log('ℹ️ No user found');
          await updateAuthState(null, null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          await updateAuthState(null, null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted || !isInitialized) return;
      
        console.log('🔄 Auth state change:', event, session?.user?.id);
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              console.log('✅ User signed in:', session.user.id);
              await updateAuthState(session.user, session);
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('🚪 User signed out');
            await updateAuthState(null, null);
            break;
            
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              console.log('🔄 Token refreshed for user:', session.user.id);
              await updateAuthState(session.user, session);
            }
            break;
            
          case 'USER_UPDATED':
            if (session?.user) {
              console.log('👤 User updated:', session.user.id);
              await updateAuthState(session.user, session);
            }
            break;
            
          default:
            // For other events, update state based on session presence
            if (session?.user) {
              await updateAuthState(session.user, session);
            } else {
              await updateAuthState(null, null);
            }
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState, isInitialized]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin,
    refreshProfile,
  };

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}