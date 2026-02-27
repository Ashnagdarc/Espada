'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function CustomerProfile() {
  const { user, profile, updateProfile, isLoading } = useAuth();
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
    if (!user) {
      toast.error('Please sign in to update your profile');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile({
        email: user.email || '',
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        country: formData.country,
      });
      
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
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
      className="space-y-6"
    >
      {/* Profile Header */}
      <Card className="p-8 border border-separator bg-white dark:bg-black">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 border-2 border-black dark:border-white rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-black dark:text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              {profile?.first_name && profile?.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : 'Complete Your Profile'}
            </h1>
            <p className="text-label-secondary flex items-center mt-1">
              <Mail className="w-4 h-4 mr-2" />
              {user.email}
            </p>
            {profile?.created_at && (
              <div className="flex items-center mt-2 text-sm text-label-tertiary">
                <Calendar className="w-4 h-4 mr-1" />
                Member since {new Date(profile.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Profile Information */}
      <Card className="p-8 border border-separator bg-white dark:bg-black">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            Profile Information
          </h2>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="ml-2">Save</span>
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="space-y-5">
            <h3 className="font-semibold text-lg text-black dark:text-white flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
            
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-label-tertiary group-focus-within:text-black dark:group-focus-within:text-white w-5 h-5 transition-colors" />
              <Input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
                className="pl-12 h-12 !bg-white dark:!bg-black !border !border-white/20 dark:!border-white/20 disabled:opacity-60 focus:!ring-0 focus:!border-white/40 dark:focus:!border-white/40 transition-all rounded-lg"
              />
            </div>

            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-label-tertiary group-focus-within:text-black dark:group-focus-within:text-white w-5 h-5 transition-colors" />
              <Input
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
                className="pl-12 h-12 !bg-white dark:!bg-black !border !border-white/20 dark:!border-white/20 disabled:opacity-60 focus:!ring-0 focus:!border-white/40 dark:focus:!border-white/40 transition-all rounded-lg"
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-label-tertiary w-5 h-5" />
              <Input
                type="email"
                placeholder="Email"
                value={user.email || ''}
                disabled={true}
                className="pl-12 h-12 !bg-white dark:!bg-black !border !border-white/20 dark:!border-white/20 opacity-60 rounded-lg cursor-not-allowed"
              />
            </div>

            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-label-tertiary group-focus-within:text-black dark:group-focus-within:text-white w-5 h-5 transition-colors" />
              <Input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                className="pl-12 h-12 !bg-white dark:!bg-black !border !border-white/20 dark:!border-white/20 disabled:opacity-60 focus:!ring-0 focus:!border-white/40 dark:focus:!border-white/40 transition-all rounded-lg"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-5">
            <h3 className="font-semibold text-lg text-black dark:text-white flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Address Information
            </h3>
            
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-label-tertiary group-focus-within:text-black dark:group-focus-within:text-white w-5 h-5 transition-colors" />
              <Input
                type="text"
                placeholder="Street address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                className="pl-12 h-12 !bg-white dark:!bg-black !border !border-white/20 dark:!border-white/20 disabled:opacity-60 focus:!ring-0 focus:!border-white/40 dark:focus:!border-white/40 transition-all rounded-lg"
              />
            </div>

            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-label-tertiary group-focus-within:text-black dark:group-focus-within:text-white w-5 h-5 transition-colors" />
              <Input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!isEditing}
                className="pl-12 h-12 !bg-white dark:!bg-black !border !border-white/20 dark:!border-white/20 disabled:opacity-60 focus:!ring-0 focus:!border-white/40 dark:focus:!border-white/40 transition-all rounded-lg"
              />
            </div>

            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-label-tertiary group-focus-within:text-black dark:group-focus-within:text-white w-5 h-5 transition-colors" />
              <Input
                type="text"
                placeholder="Postal code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                disabled={!isEditing}
                className="pl-12 h-12 !bg-white dark:!bg-black !border !border-white/20 dark:!border-white/20 disabled:opacity-60 focus:!ring-0 focus:!border-white/40 dark:focus:!border-white/40 transition-all rounded-lg"
              />
            </div>

            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-label-tertiary group-focus-within:text-black dark:group-focus-within:text-white w-5 h-5 transition-colors" />
              <Input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                disabled={!isEditing}
                className="pl-12 h-12 !bg-white dark:!bg-black !border !border-white/20 dark:!border-white/20 disabled:opacity-60 focus:!ring-0 focus:!border-white/40 dark:focus:!border-white/40 transition-all rounded-lg"
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
