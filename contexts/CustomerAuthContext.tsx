'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface CustomerProfile {
  id: string;
  stack_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string;
  preferences?: {
    newsletter: boolean;
    smsUpdates: boolean;
  };
  role?: string;
  created_at: string;
  updated_at: string;
}

interface CustomerAuthContextType {
  user: any;
  profile: CustomerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  handleRoleBasedRedirect: (redirectTo?: string) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const fetchProfile = async () => {
    console.log('📋 fetchProfile called for user:', user?.id);
    console.log('📧 User email:', user?.primaryEmail);

    if (!user?.id) {
      console.log('❌ No user ID, setting profile to null');
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      // First try to fetch by stack_user_id
      console.log('🔍 Fetching profile by stack_user_id...');
      const response = await fetch(`/api/customer-profile?stack_user_id=${user.id}`);
      const result = await response.json();

      console.log('📊 Profile fetch result:', result);

      if (result.success && result.profile) {
        console.log('✅ Profile found by stack_user_id:', result.profile);
        console.log('👑 User role:', result.profile.role);
        setProfile(result.profile);
        return;
      }

      // If not found by stack_user_id, try by email
      console.log('⚠️ No profile found by stack_user_id, checking by email...');
      const emailResponse = await fetch(`/api/customer-profile?email=${encodeURIComponent(user.primaryEmail || '')}`);
      const emailResult = await emailResponse.json();

      console.log('📧 Email-based profile check:', emailResult);

      if (emailResult.success && emailResult.profile) {
        console.log('🔄 Found existing profile by email, updating stack_user_id...');
        // Update the existing profile with the new stack_user_id
        const updateResponse = await fetch('/api/customer-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stack_user_id: user.id,
            email: user.primaryEmail,
          }),
        });

        const updateResult = await updateResponse.json();

        if (!updateResult.success) {
          console.error('❌ Error updating existing profile:', updateResult.error);
          setProfile(null);
        } else {
          console.log('✅ Updated existing profile:', updateResult.profile);
          setProfile(updateResult.profile);
        }
        return;
      }

      // Create profile if it doesn't exist
      console.log('🆕 Creating new profile for user...');

      // Special handling for admin users - check if this email should be admin
      const isAdminEmail = user.primaryEmail === 'daniel.nonso48@gmail.com';
      const defaultRole = isAdminEmail ? 'admin' : 'customer';

      console.log('🔐 Role assignment:', {
        email: user.primaryEmail,
        isAdminEmail,
        defaultRole
      });

      const newProfileData = {
        stack_user_id: user.id,
        email: user.primaryEmail || '',
        first_name: user.displayName?.split(' ')[0] || '',
        last_name: user.displayName?.split(' ').slice(1).join(' ') || '',
        role: defaultRole, // Use admin role for admin email, customer for others
      };

      console.log('📝 New profile data:', newProfileData);

      const createResponse = await fetch('/api/customer-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProfileData),
      });

      const createResult = await createResponse.json();

      if (!createResult.success) {
        console.error('❌ Error creating customer profile:', createResult.error);
        setProfile(null);
      } else {
        console.log('✅ Created new profile:', createResult.profile);
        setProfile(createResult.profile);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<CustomerProfile>) => {
    if (!user?.id || !profile) return;

    try {
      // Prevent accidental role changes for admin users
      const updateData = { ...data };
      if (profile.email === 'daniel.nonso48@gmail.com' && data.role && data.role !== 'admin') {
        console.warn('🚫 Preventing role change for admin user:', {
          email: profile.email,
          attemptedRole: data.role
        });
        delete updateData.role; // Remove role from update data
      }

      const response = await fetch('/api/customer-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stack_user_id: user.id,
          ...updateData,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Error updating profile:', result.error);
        throw new Error(result.error);
      }

      await fetchProfile();
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    await fetchProfile();
  };

  const handleRoleBasedRedirect = (redirectTo?: string) => {
    console.log('🔄 handleRoleBasedRedirect called', {
      profile,
      user: user?.id,
      redirectTo,
      userRole: profile?.role
    });

    if (!profile || !user) {
      console.log('❌ No profile or user found, cannot redirect');
      return;
    }

    // If user is admin (via server check), redirect to admin dashboard
    // Avoid relying on client-stored role; defer to API
    (async () => {
      try {
        const res = await fetch('/api/admin/check-role');
        const json = await res.json();
        if (json?.isAdmin) {
          console.log('👑 Admin detected by server, redirecting to /admin');
          router.push('/admin');
          return;
        }
      } catch (e) {
        console.warn('Admin check failed, proceeding as customer');
      }
      const destination = redirectTo || '/account';
      console.log('👤 Regular user, redirecting to:', destination);
      router.push(destination);
    })();

  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  // Auto-redirect when profile is loaded and user is authenticated
  useEffect(() => {
    console.log('🔄 Profile/auth state changed:', {
      isAuthenticated,
      profile: profile?.email,
      role: profile?.role,
      isLoading
    });

    if (isAuthenticated && profile && !isLoading) {
      console.log('🚀 Triggering auto-redirect...');
      handleRoleBasedRedirect();
    }
  }, [isAuthenticated, profile, isLoading]);

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    updateProfile,
    refreshProfile,
    handleRoleBasedRedirect,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}