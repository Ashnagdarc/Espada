'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CustomerProfile } from '@/components/auth/CustomerProfile';
import { CustomerOrderHistory } from '@/components/auth/CustomerOrderHistory';
import { CustomerWishlist } from '@/components/auth/CustomerWishlist';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { User, Package, Settings, Heart, CreditCard, LogOut, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type TabType = 'profile' | 'orders' | 'wishlist' | 'settings';

function AccountContent() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/signin?redirect=/account');
      return;
    }
    
    if (isAdmin) {
      router.push('/admin');
      return;
    }
  }, [user, router, isLoading, isAdmin]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      // No need to manually redirect - signOut now handles it
    } catch (error) {
      toast.error('Error signing out');
      router.push('/'); // Fallback redirect on error
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user || isAdmin) {
    return null;
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'orders' as TabType, label: 'Orders', icon: Package },
    { id: 'wishlist' as TabType, label: 'Wishlist', icon: Heart },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <CustomerProfile />;
      case 'orders':
        return <CustomerOrderHistory />;
      case 'wishlist':
        return <CustomerWishlist />;
      case 'settings':
        return (
          <Card className="p-6 border border-separator">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              Account Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 border border-separator rounded-lg">
                <div>
                  <h3 className="font-semibold text-black dark:text-white">Email</h3>
                  <p className="text-sm text-label-secondary mt-1">
                    {user?.email}
                  </p>
                </div>
                <Button variant="outline" className="border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                  Change Email
                </Button>
              </div>

              <div className="flex items-center justify-between p-5 border border-separator rounded-lg">
                <div>
                  <h3 className="font-semibold text-black dark:text-white">Password</h3>
                  <p className="text-sm text-label-secondary mt-1">
                    Change your account password
                  </p>
                </div>
                <Button variant="outline" className="border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                  Change Password
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-5 border border-separator rounded-lg">
                <div>
                  <h3 className="font-semibold text-black dark:text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-label-secondary mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" className="border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                  Enable 2FA
                </Button>
              </div>

              <div className="flex items-center justify-between p-5 border border-separator rounded-lg">
                <div>
                  <h3 className="font-semibold text-black dark:text-white">Payment Methods</h3>
                  <p className="text-sm text-label-secondary mt-1">
                    Manage your saved payment methods
                  </p>
                </div>
                <Button variant="outline" className="flex items-center border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>

              <div className="border-t border-separator pt-6 mt-6">
                <div className="flex items-center justify-between p-5 border-2 border-black dark:border-white rounded-lg">
                  <div>
                    <h3 className="font-semibold text-black dark:text-white">Delete Account</h3>
                    <p className="text-sm text-label-secondary mt-1">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="flex items-center space-x-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
              My Account
            </h1>
            <p className="text-label-secondary">
              Manage your profile, orders, and account settings
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center space-x-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4 border border-separator">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'text-label-secondary hover:bg-gray-100 dark:hover:bg-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return <AccountContent />;
}