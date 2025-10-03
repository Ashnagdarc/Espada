"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingCart, User, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleSignOut = () => {
    setUserMenuOpen(false);
    router.push("/signin");
  };

  return (
    <header className="w-full bg-white dark:bg-black shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span>Espada</span>
        </Link>

        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-blue-600 transition-colors ${pathname === link.href ? "text-blue-600" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link href="/checkout" className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Cart">
              <ShoppingCart size={20} />
            </button>
          </Link>

          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              aria-label="User menu"
              onClick={() => setUserMenuOpen((open) => !open)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <User size={20} />
            </button>
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-900 rounded shadow-lg py-2 z-50"
                >
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} className="inline mr-2" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-black shadow-md px-4 py-2"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${pathname === link.href ? "text-blue-600" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;