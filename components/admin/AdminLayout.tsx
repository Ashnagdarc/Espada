'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  FileText,
  CreditCard,
  User,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    router.push('/admin/login')
  }

  // If on login page, just render children without layout
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const navigationSections = [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, current: pathname === '/admin' },
        { name: 'Products', href: '/admin/products', icon: Package, current: pathname === '/admin/products' },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, current: pathname === '/admin/orders' },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: pathname === '/admin/analytics' },
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'Customers', href: '/admin/customers', icon: Users, current: pathname === '/admin/customers' },
        { name: 'Content', href: '/admin/content', icon: FileText, current: pathname === '/admin/content' },
        { name: 'Payments', href: '/admin/payments', icon: CreditCard, current: pathname === '/admin/payments' },
        { name: 'Settings', href: '/admin/settings', icon: Settings, current: pathname === '/admin/settings' },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white transition-colors duration-300">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -320,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-80 bg-black border-r border-white/10 lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">E</span>
              </div>
              <span style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-xl font-bold">
                Espada Admin
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="px-3 text-xs font-semibold text-white/60 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="mt-3 space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${item.current
                          ? 'bg-white text-black shadow'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        style={{ fontFamily: 'Gilroy, sans-serif' }}
                      >
                        <Icon className={`mr-3 h-5 w-5 ${item.current ? 'text-black' : 'text-white/60 group-hover:text-white'}`} />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile & Theme */}
          <div className="border-t border-white/10 p-4 space-y-4">
            {/* Theme Selector */}
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm font-medium text-white/80">
                Theme
              </span>
              <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-white text-black shadow-sm' : 'hover:bg-white/20'}`}
                >
                  <Sun className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-white text-black shadow-sm' : 'hover:bg-white/20'}`}
                >
                  <Moon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`p-1.5 rounded-md transition-colors ${theme === 'system' ? 'bg-white text-black shadow-sm' : 'hover:bg-white/20'}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm font-medium">
                    Admin
                  </p>
                  <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-xs text-white/60">
                    Administrator
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-black border-b border-white/10 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1 lg:flex lg:items-center lg:justify-between">
              <h1 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-2xl font-bold">
                {pathname === '/admin' ? 'Dashboard' :
                  pathname === '/admin/products' ? 'Products' :
                    pathname === '/admin/orders' ? 'Orders' :
                      pathname === '/admin/analytics' ? 'Analytics' :
                        pathname === '/admin/customers' ? 'Customers' :
                          pathname === '/admin/content' ? 'Content' :
                            pathname === '/admin/payments' ? 'Payments' :
                              pathname === '/admin/settings' ? 'Settings' : 'Admin'}
              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout