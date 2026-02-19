import prisma from '@/lib/prisma';
import { cache } from 'react';

export interface StoreSettings {
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

const defaultSettings: StoreSettings = {
  general: {
    storeName: 'Espada',
    storeDescription: 'Your premier online shopping destination',
    contactEmail: 'contact@espada.com',
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
    theme: 'dark',
    primaryColor: '#3B82F6',
    logoUrl: ''
  }
};

// Cache the settings fetch for 5 minutes
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  try {
    const settings = await prisma.adminSettings.findMany();

    if (settings.length === 0) {
      return defaultSettings;
    }

    // Transform database settings into StoreSettings structure
    const transformedSettings: Partial<StoreSettings> = settings.reduce((acc, setting) => {
      if (!acc[setting.category as keyof StoreSettings]) {
        acc[setting.category as keyof StoreSettings] = {} as any;
      }

      let parsedValue;
      try {
        parsedValue = JSON.parse(setting.value);
      } catch {
        parsedValue = setting.value;
      }

      const category = acc[setting.category as keyof StoreSettings] as any;
      
      if (typeof parsedValue === 'object' && parsedValue !== null) {
        Object.assign(category, parsedValue);
      } else {
        category[setting.key] = parsedValue;
      }

      return acc;
    }, {} as Partial<StoreSettings>);

    // Merge with defaults to ensure all fields exist
    return {
      general: { ...defaultSettings.general, ...transformedSettings.general },
      notifications: { ...defaultSettings.notifications, ...transformedSettings.notifications },
      security: { ...defaultSettings.security, ...transformedSettings.security },
      appearance: { ...defaultSettings.appearance, ...transformedSettings.appearance }
    };
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return defaultSettings;
  }
});

// Helper to get just general settings
export async function getGeneralSettings() {
  const settings = await getStoreSettings();
  return settings.general;
}

// Helper to format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const currencyMap: Record<string, { symbol: string; locale: string }> = {
    'USD': { symbol: '$', locale: 'en-US' },
    'EUR': { symbol: '€', locale: 'de-DE' },
    'GBP': { symbol: '£', locale: 'en-GB' },
    'CAD': { symbol: 'C$', locale: 'en-CA' },
    'NGN': { symbol: '₦', locale: 'en-NG' }
  };

  const config = currencyMap[currency] || currencyMap['USD'];
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}
