import type { Locale, Translations } from '@/lib/i18n';

export interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}
