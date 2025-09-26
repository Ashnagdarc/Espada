'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';
import { locales, localeNames, localeFlags, Locale } from '@/lib/i18n';
import Button from '@/components/ui/Button';

interface LanguageSwitchProps {
  className?: string
  variant?: 'default' | 'compact'
}

export default function LanguageSwitch({ className, variant = 'default' }: LanguageSwitchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { locale, setLocale } = useLocale();
  const [selectedLanguage, setSelectedLanguage] = useState<{ code: Locale; name: string; flag: string }>(
    { code: locale, name: localeNames[locale], flag: localeFlags[locale] }
  )

  const handleLanguageChange = (languageCode: Locale) => {
    const language = { code: languageCode, name: localeNames[languageCode], flag: localeFlags[languageCode] };
    setSelectedLanguage(language);
    setLocale(languageCode);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-11 rounded-full transition-all duration-200',
          variant === 'compact' ? 'w-11' : 'px-3 min-w-[120px]'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {variant === 'compact' ? (
          <Globe className="h-5 w-5" />
        ) : (
          <>
            <span className="text-lg mr-2">{selectedLanguage.flag}</span>
            <span className="text-callout font-medium text-label-primary">
              {selectedLanguage.name}
            </span>
            <ChevronDown 
              className={cn(
                'h-4 w-4 ml-2 transition-transform duration-200',
                isOpen && 'rotate-180'
              )} 
            />
          </>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              className="absolute right-0 top-full mt-2 z-50 min-w-[180px] rounded-xl bg-background/95 backdrop-blur-xl border border-separator-opaque shadow-lg overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="py-2">
                {locales.map((languageCode) => {
                  const language = { code: languageCode, name: localeNames[languageCode], flag: localeFlags[languageCode] };
                  return (
                    <button
                      key={language.code}
                      className={cn(
                        'w-full flex items-center px-4 py-3 text-left hover:bg-fill-quaternary/50 transition-colors duration-200',
                        selectedLanguage.code === language.code && 'bg-fill-quaternary/30'
                      )}
                      onClick={() => handleLanguageChange(languageCode)}
                    >
                      <span className="text-lg mr-3">{language.flag}</span>
                      <span className="text-callout font-medium text-label-primary">
                        {language.name}
                      </span>
                      {selectedLanguage.code === language.code && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}