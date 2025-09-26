'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ShoppingBag, Menu, X, Sun, Moon, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import LanguageSwitch from '@/components/ui/LanguageSwitch'
import { useCart } from '@/contexts/CartContext'
import { useTranslations } from '@/contexts/LocaleContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { state } = useCart()
  const t = useTranslations();
  
  const navigation = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.collections, href: '/collections' },
    { name: t.nav.about, href: '/about' },
    { name: t.nav.contact, href: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border-b border-separator-opaque">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div
              className="text-title-2 font-bold text-foreground"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              ESPADA
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-callout font-medium text-label-secondary hover:text-label-primary transition-colors duration-200 focus-ring-inset rounded-md px-3 py-2"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-label-tertiary" />
              <input
                type="search"
                placeholder={t.common.search + '...'}
                className="w-80 h-11 rounded-xl border border-separator-opaque bg-fill-quaternary/50 pl-12 pr-4 text-callout placeholder:text-label-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-11 w-11 rounded-full"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 rounded-full"
            >
              <User className="h-5 w-5" />
            </Button>

            {/* Language Switch */}
            <LanguageSwitch variant="compact" className="hidden sm:block" />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 rounded-full"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Shopping Bag */}
            <Link href="/checkout">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-11 w-11 rounded-full"
              >
                <ShoppingBag className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-caption-2 font-bold text-primary-foreground flex items-center justify-center">
                    {state.itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-11 w-11 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <motion.div
          className="border-t border-separator-opaque bg-background/95 backdrop-blur-xl p-4 lg:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-label-tertiary" />
            <input
              type="search"
              placeholder={t.common.search + '...'}
              className="w-full h-11 rounded-xl border border-separator-opaque bg-fill-quaternary/50 pl-12 pr-4 text-callout placeholder:text-label-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </div>
        </motion.div>
      )}

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          className="border-t border-separator-opaque bg-background/95 backdrop-blur-xl md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <nav className="flex flex-col p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-callout font-medium text-label-secondary hover:text-label-primary transition-colors duration-200 focus-ring-inset rounded-lg px-4 py-3"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Language Switch */}
            <div className="px-4 py-3 border-t border-separator-opaque mt-2 pt-4">
              <div className="text-caption-1 font-medium text-label-tertiary mb-3 uppercase tracking-wider">
                {t.common.language}
              </div>
              <LanguageSwitch variant="default" />
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  )
}