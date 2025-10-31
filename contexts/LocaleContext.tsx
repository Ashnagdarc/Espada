'use client';

import React, { useState, useEffect } from 'react';
import { defaultLocale, isValidLocale, getTranslations, type Locale, type Translations } from '@/lib/i18n';
import { LocaleContext } from './LocaleContextBase';

export type { LocaleContextType } from './LocaleContextTypes';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [t, setTranslations] = useState<Translations>(getTranslations(defaultLocale));

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && isValidLocale(savedLocale)) {
      setLocaleState(savedLocale);
      setTranslations(getTranslations(savedLocale));
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setTranslations(getTranslations(newLocale));
    localStorage.setItem('locale', newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}
