import { useState, useEffect } from 'react';

export interface PublicSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
}

const defaultSettings: PublicSettings = {
  storeName: 'Espada',
  storeDescription: 'Your premier online shopping destination',
  contactEmail: 'contact@espada.com',
  contactPhone: '',
  currency: 'USD'
};

export function useSettings() {
  const [settings, setSettings] = useState<PublicSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok && mounted) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        // Keep default settings on error
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchSettings();

    return () => {
      mounted = false;
    };
  }, []);

  return { settings, loading };
}
