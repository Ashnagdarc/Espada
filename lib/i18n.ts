export type Locale = 'en' | 'fr' | 'es' | 'de';

export const locales: Locale[] = ['en', 'fr', 'es', 'de'];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  fr: '🇫🇷',
  es: '🇪🇸',
  de: '🇩🇪',
};

// Basic translations structure
export interface Translations {
  nav: {
    home: string;
    collections: string;
    about: string;
    contact: string;
  };
  common: {
    search: string;
    cart: string;
    menu: string;
    close: string;
    language: string;
  };
  home: {
    hero: {
      title: string;
      subtitle: string;
    };
    newThisWeek: string;
    xivCollections: string;
  };
}

// Translation data
export const translations: Record<Locale, Translations> = {
  en: {
    nav: {
      home: 'Home',
      collections: 'Collections',
      about: 'About',
      contact: 'Contact',
    },
    common: {
      search: 'Search',
      cart: 'Cart',
      menu: 'Menu',
      close: 'Close',
      language: 'Language',
    },
    home: {
      hero: {
        title: 'Welcome to Espada',
        subtitle: 'Discover our premium collection',
      },
      newThisWeek: 'New This Week',
      xivCollections: 'XIV Collections',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      collections: 'Collections',
      about: 'À propos',
      contact: 'Contact',
    },
    common: {
      search: 'Rechercher',
      cart: 'Panier',
      menu: 'Menu',
      close: 'Fermer',
      language: 'Langue',
    },
    home: {
      hero: {
        title: 'Bienvenue chez Espada',
        subtitle: 'Découvrez notre collection premium',
      },
      newThisWeek: 'Nouveau cette semaine',
      xivCollections: 'Collections XIV',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      collections: 'Colecciones',
      about: 'Acerca de',
      contact: 'Contacto',
    },
    common: {
      search: 'Buscar',
      cart: 'Carrito',
      menu: 'Menú',
      close: 'Cerrar',
      language: 'Idioma',
    },
    home: {
      hero: {
        title: 'Bienvenido a Espada',
        subtitle: 'Descubre nuestra colección premium',
      },
      newThisWeek: 'Nuevo esta semana',
      xivCollections: 'Colecciones XIV',
    },
  },
  de: {
    nav: {
      home: 'Startseite',
      collections: 'Kollektionen',
      about: 'Über uns',
      contact: 'Kontakt',
    },
    common: {
      search: 'Suchen',
      cart: 'Warenkorb',
      menu: 'Menü',
      close: 'Schließen',
      language: 'Sprache',
    },
    home: {
      hero: {
        title: 'Willkommen bei Espada',
        subtitle: 'Entdecken Sie unsere Premium-Kollektion',
      },
      newThisWeek: 'Neu diese Woche',
      xivCollections: 'XIV Kollektionen',
    },
  },
};

// Helper function to get translations for a locale
export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations[defaultLocale];
}

// Helper function to validate locale
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}