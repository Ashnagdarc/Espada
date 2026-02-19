'use client'

import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  X,
  Users,
  User,
  Sun,
  Moon,
  Monitor,
  Home,
  Menu,
  Mail
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}


const AdminLayout = ({ children }: AdminLayoutProps) => {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Nav routes for DRY rendering
  const routes = [
    { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, active: pathname === '/admin' },
    { href: '/admin/homepage', label: 'Homepage', Icon: Home, active: pathname.startsWith('/admin/homepage') },
    { href: '/admin/products', label: 'Products', Icon: Package, active: pathname.startsWith('/admin/products') },
    { href: '/admin/orders', label: 'Orders', Icon: ShoppingCart, active: pathname.startsWith('/admin/orders') },
    { href: '/admin/contact-messages', label: 'Contact', Icon: Mail, active: pathname.startsWith('/admin/contact-messages') },
    { href: '/admin/customers', label: 'Customers', Icon: Users, active: pathname.startsWith('/admin/customers') },
    { href: '/admin/reports', label: 'Reports', Icon: BarChart3, active: pathname.startsWith('/admin/reports') },
    { href: '/admin/settings', label: 'Settings', Icon: Settings, active: pathname.startsWith('/admin/settings') },
  ]
  
  const ThemeToggle = () => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-md transition-colors ${mounted && theme === 'light' ? 'bg-white text-black shadow-sm' : 'hover:bg-white/20'}`}
        title="Light theme"
        aria-label="Set light theme"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-md transition-colors ${mounted && theme === 'dark' ? 'bg-white text-black shadow-sm' : 'hover:bg-white/20'}`}
        title="Dark theme"
        aria-label="Set dark theme"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-md transition-colors ${mounted && theme === 'system' ? 'bg-white text-black shadow-sm' : 'hover:bg-white/20'}`}
        title="System theme"
        aria-label="Set system theme"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  )
  
  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <Fragment>
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center space-x-2 mb-8">
          <span className="text-2xl font-bold tracking-tight">Espada</span>
          {onClose && (
            <button
              className="ml-auto lg:hidden p-2 rounded-md hover:bg-white/10"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <nav className="space-y-2">
          {routes.map(({ href, label, Icon, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}
              onClick={onClose}
            >
              <Icon className="w-5 h-5 mr-3" /> {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mr-3">
            <User className="h-4 w-4 text-white/80" />
          </div>
          <div>
            <p className="font-sans text-sm font-medium">Admin Panel</p>
            <p className="font-sans text-xs text-white/60">Theme & navigation</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </Fragment>
  )
  

  // Prevent hydration mismatch for theme toggle
  useEffect(() => {
    setMounted(true)
  }, [])

  // Default closed on mobile; desktop shows via CSS
  useEffect(() => {
    setSidebarOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white transition-colors duration-300 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:justify-between w-52 bg-black border-r border-white/10">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar (drawer) */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -208 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-52 bg-black border-r border-white/10 flex flex-col justify-between"
      >
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </motion.aside>

      {/* Mobile open button */}
      <button
        className="lg:hidden fixed top-3 left-3 z-40 p-2 rounded-md bg-white/10 hover:bg-white/20"
        aria-label="Open sidebar"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Main content */}
      <div className="flex-1">
        <main className="min-h-screen w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout