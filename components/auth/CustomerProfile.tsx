'use client';

import React, { useState } from 'react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { stackClientApp } from '@/stack/client';
import { useRouter } from 'next/navigation';

export function CustomerProfile() {
  const { user, profile, updateProfile, isLoading } = useCustomerAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    postalCode: profile?.postal_code || '',
    country: profile?.country || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        postalCode: profile.postal_code || '',
        country: profile.country || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        country: formData.country,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      city: profile?.city || '',
      postalCode: profile?.postal_code || '',
      country: profile?.country || '',
    });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await stackClientApp.signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Please sign in to view your profile.</p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Profile Header */}
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile?.first_name} {profile?.last_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{user.primaryEmail}</p>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                Member since {new Date(profile?.created_at || '').toLocaleDateString()}
              </div>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Profile Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Profile Information
          </h2>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="text-black dark:text-white border-gray-200 dark:border-gray-700"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="ml-2">Save</span>
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="text-gray-600 dark:text-gray-400"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Personal Information</h3>
            
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 disabled:opacity-60"
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 disabled:opacity-60"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="email"
                value={user.primaryEmail || ''}
                disabled
                className="pl-10 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-60"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Address Information</h3>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Street address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!isEditing}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 disabled:opacity-60"
              />
              <Input
                type="text"
                placeholder="Postal code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                disabled={!isEditing}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 disabled:opacity-60"
              />
            </div>

            <Input
              type="text"
              placeholder="Country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              disabled={!isEditing}
              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 disabled:opacity-60"
            />
          </div>
        </div>
      </Card>

      {/* Account Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Account Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive updates about your orders and new products
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black dark:focus:ring-white dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Marketing Communications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive promotional emails and special offers
              </p>
            </div>
            <input
              type="checkbox"
              className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black dark:focus:ring-white dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}