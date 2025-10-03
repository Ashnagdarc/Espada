"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Menu, X, Sun, Moon, User, LogOut, Settings, Package } from "lucide-react";
import { useTheme } from "next-themes";
import { useUser } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import LanguageSwitch from "@/components/ui/LanguageSwitch";
import { useCart } from "@/contexts/CartContext";
import { useTranslations } from "@/contexts/LocaleContext";
import { toast } from "react-hot-toast";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { state } = useCart();
  const t = useTranslations();
  const user = useUser();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const navigation = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.collections, href: "/products" },
    { name: t.nav.about, href: "/about" },
    { name: t.nav.contact, href: "/contact" },
  ];

  const handleSignOut = async () => {
    try {
      await stackClientApp.signOut();
      setIsUserMenuOpen(false);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border-b border-separator-opaque">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div
              className="text-title-2 font-bold text-foreground"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                placeholder={t.common.search + "..."}
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
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 border border-primary/20 hover:border-primary/30"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.displayName || "User"}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                        {(user.displayName || user.primaryEmail || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-background/95 backdrop-blur-xl border border-separator-opaque rounded-xl shadow-lg overflow-hidden z-50"
                      >
                        {/* User Info */}
                        <div className="p-4 border-b border-separator-opaque">
                          <div className="flex items-center space-x-3">
                            {user.profileImageUrl ? (
                              <img
                                src={user.profileImageUrl}
                                alt={user.displayName || "User"}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                                {(user.displayName || user.primaryEmail || "U").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {user.displayName || "User"}
                              </p>
                              <p className="text-xs text-label-secondary truncate">
                                {user.primaryEmail}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            href="/account"
                            className="flex items-center px-4 py-3 text-sm text-label-primary hover:bg-fill-quaternary/50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4 mr-3 text-label-secondary" />
                            My Account
                          </Link>
                          <Link
                            href="/account?tab=orders"
                            className="flex items-center px-4 py-3 text-sm text-label-primary hover:bg-fill-quaternary/50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package className="h-4 w-4 mr-3 text-label-secondary" />
                            Order History
                          </Link>
                          <Link
                            href="/account?tab=settings"
                            className="flex items-center px-4 py-3 text-sm text-label-primary hover:bg-fill-quaternary/50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-3 text-label-secondary" />
                            Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link href="/handler/signin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 rounded-full hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all duration-200"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Language Switch */}
            <LanguageSwitch variant="compact" className="hidden sm:block" />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 rounded-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Shopping Bag */}
            <Link href="/checkout">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-11 w-11 rounded-full bg-gradient-to-br from-background to-muted/20 hover:from-muted/30 hover:to-muted/40 dark:from-background dark:to-muted/10 dark:hover:from-muted/20 dark:hover:to-muted/30 border border-border/50 hover:border-border shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <motion.div
                    animate={
                      state.itemCount > 0
                        ? { rotate: [0, -10, 10, 0] }
                        : { rotate: 0 }
                    }
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <ShoppingBag className="h-5 w-5 text-foreground/80 group-hover:text-foreground transition-colors duration-200" />
                  </motion.div>
                </Button>
                {state.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {state.itemCount}
                  </span>
                )}
              </motion.div>
            </Link>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-11 w-11 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <motion.div
          className="border-t border-separator-opaque bg-background/95 backdrop-blur-xl p-4 lg:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-label-tertiary" />
            <input
              type="search"
              placeholder={t.common.search + "..."}
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
          animate={{ opacity: 1, height: "auto" }}
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

            {/* Mobile User Section */}
            {user && (
              <div className="px-4 py-3 border-t border-separator-opaque mt-2 pt-4">
                <div className="flex items-center space-x-3 mb-4">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.displayName || "User"}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                      {(user.displayName || user.primaryEmail || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs text-label-secondary truncate">
                      {user.primaryEmail}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Link
                    href="/account"
                    className="flex items-center px-4 py-3 text-sm text-label-primary hover:bg-fill-quaternary/50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3 text-label-secondary" />
                    My Account
                  </Link>
                  <Link
                    href="/account?tab=orders"
                    className="flex items-center px-4 py-3 text-sm text-label-primary hover:bg-fill-quaternary/50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package className="h-4 w-4 mr-3 text-label-secondary" />
                    Order History
                  </Link>
                  <Link
                    href="/account?tab=settings"
                    className="flex items-center px-4 py-3 text-sm text-label-primary hover:bg-fill-quaternary/50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3 text-label-secondary" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {!user && (
              <div className="px-4 py-3 border-t border-separator-opaque mt-2 pt-4">
                <Link
                  href="/handler/signin"
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </div>
            )}

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
  );
}
