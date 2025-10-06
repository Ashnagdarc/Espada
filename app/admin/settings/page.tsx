'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Save, Store, Bell, Shield, Palette, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { ToastProvider, useToast } from '@/components/admin/ui/Toast';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SettingsData {
  general: {
    storeName: string;
    storeDescription: string;
    contactEmail: string;
    contactPhone: string;
    timezone: string;
    currency: string;
  };
  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    lowStockAlerts: boolean;
    customerSignups: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordRequirements: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    logoUrl: string;
  };
}

function SettingsPageContent() {
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      storeName: '',
      storeDescription: '',
      contactEmail: '',
      contactPhone: '',
      timezone: 'America/New_York',
      currency: 'USD'
    },
    notifications: {
      emailNotifications: true,
      orderNotifications: true,
      lowStockAlerts: true,
      customerSignups: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordRequirements: true
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      logoUrl: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'general', name: 'General', icon: Store },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette }
  ];

  // Load settings from database
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const errorMsg = 'Please log in to access settings';
        setError(errorMsg);
        error('Authentication Required', errorMsg);
        return;
      }

      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await response.json();

      // Merge loaded settings with defaults
      setSettings(prevSettings => ({
        general: { ...prevSettings.general, ...data.general },
        notifications: { ...prevSettings.notifications, ...data.notifications },
        security: { ...prevSettings.security, ...data.security },
        appearance: { ...prevSettings.appearance, ...data.appearance }
      }));
    } catch (err) {
      console.error('Error loading settings:', err);
      const errorMsg = 'Failed to load settings. Using default values.';
      setError(errorMsg);
      error('Load Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const errorMsg = 'Please log in to save settings';
        setError(errorMsg);
        error('Authentication Required', errorMsg);
        return;
      }

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      // Show success toast
      success('Settings saved successfully!', 'Your configuration has been updated.');
    } catch (err) {
      console.error('Error saving settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings. Please try again.';
      error('Save Failed', errorMessage);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading settings...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 text-white">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-white/60">Manage your store configuration and preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-white/80 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-black rounded-lg border border-white/10 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                      ? 'bg-white text-black'
                      : 'text-white/80 hover:bg-white/10'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-black rounded-lg border border-white/10 p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">General Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.storeName}
                      onChange={(e) => updateSettings('general', 'storeName', e.target.value)}
                      className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => updateSettings('general', 'contactEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.general.contactPhone}
                      onChange={(e) => updateSettings('general', 'contactPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => updateSettings('general', 'currency', e.target.value)}
                      className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => updateSettings('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Store Description
                  </label>
                  <textarea
                    value={settings.general.storeDescription}
                    onChange={(e) => updateSettings('general', 'storeDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Notification Settings</h2>

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive general email notifications' },
                    { key: 'orderNotifications', label: 'Order Notifications', description: 'Get notified about new orders' },
                    { key: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'Alert when products are running low' },
                    { key: 'customerSignups', label: 'Customer Signups', description: 'Notify when new customers register' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                      <div>
                        <h3 className="font-medium">{item.label}</h3>
                        <p className="text-sm text-white/60">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                          onChange={(e) => updateSettings('notifications', item.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Security Settings</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-white/60">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => updateSettings('security', 'twoFactorAuth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                    </label>
                  </div>

                  <div className="p-4 border border-white/10 rounded-lg">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="120"
                      className="w-32 px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                    <div>
                      <h3 className="font-medium">Strong Password Requirements</h3>
                      <p className="text-sm text-white/60">Enforce strong password policies</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.passwordRequirements}
                        onChange={(e) => updateSettings('security', 'passwordRequirements', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Appearance Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.appearance.theme}
                      onChange={(e) => updateSettings('appearance', 'theme', e.target.value)}
                      className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => updateSettings('appearance', 'primaryColor', e.target.value)}
                        className="w-12 h-10 border border-white/20 rounded cursor-pointer bg-black"
                      />
                      <input
                        type="text"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => updateSettings('appearance', 'primaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={settings.appearance.logoUrl}
                      onChange={(e) => updateSettings('appearance', 'logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsPageContent />
    </ToastProvider>
  );
}