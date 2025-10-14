"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  ShoppingCart,
  User,
  Sun,
  Moon,
  Search
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
];

const Header: React.FC = React.memo(() => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { state: cartState } = useCart();

  // Prevent hydration mismatch for theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }
    if (userMenuOpen || searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen, searchOpen]);

  const handleSignOut = async () => {
    try {
      setUserMenuOpen(false);
      await signOut();
      router.push("/");
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSignIn = () => {
    router.push('/signin');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleAccountClick = () => {
    setUserMenuOpen(false);
    // Auth is disabled: route to a neutral account page
    router.push('/account');
  };

  return (
    <header className="w-full bg-white/80 dark:bg-black/80 backdrop-blur-lg backdrop-saturate-150 shadow-lg shadow-black/5 dark:shadow-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Simple Logo */}
        <Link href="/" className="font-bold text-xl text-black dark:text-white hover:opacity-70 transition-opacity">
          Espada
        </Link>

        {/* Clean Navigation */}
        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-2 text-sm font-medium transition-opacity ${pathname === link.href
                  ? "text-black dark:text-white"
                  : "text-black dark:text-white opacity-60 hover:opacity-100"
                }`}
            >
              {link.label}
              {pathname === link.href && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Simple Search */}
          <div className="relative" ref={searchRef}>
            <button
              type="button"
              aria-label="Search products"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:opacity-70 rounded transition-opacity"
            >
              <Search size={18} />
            </button>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-black rounded-lg shadow-lg border border-black dark:border-white p-3 z-50"
                >
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-2 border border-black dark:border-white rounded bg-white dark:bg-black text-black dark:text-white placeholder-black placeholder-opacity-50 dark:placeholder-white dark:placeholder-opacity-50 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:opacity-70 transition-opacity"
                    >
                      <Search size={14} />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 hover:opacity-70 rounded transition-opacity"
          >
            {mounted ? (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />) : <Moon size={18} />}
          </button>

          {/* Cart with Badge */}
          <Link href="/checkout" className="relative">
            <button
              className="p-2 hover:opacity-70 rounded transition-opacity relative"
              aria-label={`Cart with ${cartState.itemCount} items`}
            >
              <ShoppingCart size={18} />
              {cartState.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded-full h-4 w-4 flex items-center justify-center">
                  {cartState.itemCount > 9 ? '9+' : cartState.itemCount}
                </span>
              )}
            </button>
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                aria-label="User menu"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="p-2 hover:opacity-70 rounded transition-opacity"
              >
                <User size={18} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-black rounded-lg shadow-lg border border-black dark:border-white py-1 z-50"
                  >
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:opacity-70 transition-opacity"
                      onClick={handleAccountClick}
                    >
                      My Account
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:opacity-70 transition-opacity"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Sign in"
              onClick={handleSignIn}
              className="px-4 py-2 text-sm font-medium text-black dark:text-white border border-black dark:border-white rounded hover:opacity-70 transition-opacity"
            >
              Sign In
            </button>
          )}

          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden p-2 rounded-full hover:opacity-70 transition-opacity"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-black border-t border-black dark:border-white"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 text-base font-medium transition-opacity ${pathname === link.href
                      ? 'text-black dark:text-white border-l-2 border-black dark:border-white bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5'
                      : 'text-black dark:text-white opacity-60 hover:opacity-100'
                    }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* User Actions */}
              {user ? (
                <div className="pt-2 border-t border-black dark:border-white space-y-1">
                  <button
                    className="block w-full text-left px-3 py-2 text-base font-medium text-black dark:text-white hover:opacity-70 transition-opacity"
                    onClick={() => {
                      setMenuOpen(false);
                      handleAccountClick();
                    }}
                  >
                    My Account
                  </button>

                  <button
                    className="block w-full text-left px-3 py-2 text-base font-medium text-black dark:text-white hover:opacity-70 transition-opacity"
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-black dark:border-white">
                  <button
                    className="block w-full text-left px-3 py-2 text-base font-medium text-black dark:text-white hover:opacity-70 transition-opacity"
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignIn();
                    }}
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;