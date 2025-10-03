'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerAuthProvider, useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { CustomerProfile } from '@/components/auth/CustomerProfile';
import { CustomerOrderHistory } from '@/components/auth/CustomerOrderHistory';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { User, Package, Settings, Heart, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

type TabType = 'profile' | 'orders' | 'wishlist' | 'settings';

function AccountContent() {
  const user = useUser();
  const router = useRouter();
  const { profile, isLoading } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  useEffect(() => {
    if (!user) {
      // Redirect to Stack Auth's built-in signin page
      router.push('/handler/signin?redirect=/account');
    } else if (!isLoading && profile && profile.role === 'admin') {
      // If user is admin, redirect to admin dashboard
      router.push('/admin');
    }
  }, [user, router, profile, isLoading]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-md mx-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Redirecting to sign in...</p>
          </div>
        </div>
      </div>
    );
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
        return (
          <Card className="p-8 text-center">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Your Wishlist is Empty
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Save items you love to your wishlist and shop them later.
            </p>
            <Button
              onClick={() => window.location.href = '/products'}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
            >
              Browse Products
            </Button>
          </Card>
        );
      case 'settings':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Account Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Password</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Change your account password
                  </p>
                </div>
                <Button variant="outline" className="text-gray-600 dark:text-gray-400">
                  Change Password
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" className="text-gray-600 dark:text-gray-400">
                  Enable 2FA
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Payment Methods</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your saved payment methods
                  </p>
                </div>
                <Button variant="outline" className="text-gray-600 dark:text-gray-400">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div>
                    <h3 className="font-medium text-red-900 dark:text-red-400">Delete Account</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile, orders, and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
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
  return (
    <CustomerAuthProvider>
      <AccountContent />
    </CustomerAuthProvider>
  );
}