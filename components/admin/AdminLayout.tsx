'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/SupabaseAuthContext'
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
  User,
  Sun,
  Moon,
  Monitor,
  Home
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}


const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Handle logout functionality
  const handleLogout = async () => {
    // Prevent multiple logout attempts
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    
    try {
      // Clear admin session storage first
      sessionStorage.removeItem('adminAuth')
      localStorage.removeItem('adminAuth')
      
      // Attempt Supabase logout with timeout
      const logoutPromise = signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 5000)
      )
      
      await Promise.race([logoutPromise, timeoutPromise])
      
    } catch (error) {
      console.error('Logout error:', error)
      // Continue with cleanup even if Supabase logout fails
    } finally {
      // Always redirect to login after cleanup
      setTimeout(() => {
        window.location.href = '/admin/login'
      }, 100)
    }
  }

  // Prevent hydration mismatch for theme toggle
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return
      const desktop = window.innerWidth >= 1024
      setIsDesktop(desktop)
      if (desktop) setSidebarOpen(true)
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white transition-colors duration-300 flex">
      {/* Sidebar */}
      {isDesktop ? (
        <div className="fixed inset-y-0 left-0 z-50 w-52 bg-black border-r border-white/10 flex flex-col justify-between lg:translate-x-0 lg:static lg:inset-0">
          <div className="flex-1 p-6 space-y-6">
            <div className="flex items-center space-x-2 mb-8">
              <span className="text-2xl font-bold tracking-tight">Espada</span>
            </div>
            <nav className="space-y-2">
              <Link href="/admin" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname === '/admin' ? 'bg-white/10' : 'hover:bg-white/5'}`}> <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard </Link>
              <Link href="/admin/homepage" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/homepage') ? 'bg-white/10' : 'hover:bg-white/5'}`}> <Home className="w-5 h-5 mr-3" /> Homepage </Link>
              <Link href="/admin/products" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/products') ? 'bg-white/10' : 'hover:bg-white/5'}`}> <Package className="w-5 h-5 mr-3" /> Products </Link>
              <Link href="/admin/orders" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/orders') ? 'bg-white/10' : 'hover:bg-white/5'}`}> <ShoppingCart className="w-5 h-5 mr-3" /> Orders </Link>
              <Link href="/admin/customers" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/customers') ? 'bg-white/10' : 'hover:bg-white/5'}`}> <Users className="w-5 h-5 mr-3" /> Customers </Link>
              <Link href="/admin/reports" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/reports') ? 'bg-white/10' : 'hover:bg-white/5'}`}> <BarChart3 className="w-5 h-5 mr-3" /> Reports </Link>
              <Link href="/admin/settings" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/settings') ? 'bg-white/10' : 'hover:bg-white/5'}`}> <Settings className="w-5 h-5 mr-3" /> Settings </Link>
            </nav>
          </div>
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <p className="font-sans text-sm font-medium">Admin</p>
                  <p className="font-sans text-xs text-white/60">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`p-2 rounded-lg transition-colors ${
                  isLoggingOut 
                    ? 'text-white/30 cursor-not-allowed' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title={isLoggingOut ? "Logging out..." : "Logout"}
                aria-label={isLoggingOut ? "Logging out..." : "Logout"}
              >
                <LogOut className={`h-4 w-4 ${isLoggingOut ? 'animate-spin' : ''}`} />
              </button>
            </div>
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
          </div>
        </div>
      ) : (
        <motion.div
          initial={false}
          animate={{ x: sidebarOpen ? 0 : -208 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-y-0 left-0 z-50 w-52 bg-black border-r border-white/10 flex flex-col justify-between lg:translate-x-0 lg:static lg:inset-0"
        >
          <div className="flex-1 p-6 space-y-6">
            <div className="flex items-center space-x-2 mb-8">
              <span className="text-2xl font-bold tracking-tight">Espada</span>
              <button
                className="ml-auto lg:hidden p-2 rounded-md hover:bg-white/10"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-2">
              <Link href="/admin" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname === '/admin' ? 'bg-white/10' : 'hover:bg-white/5'}`}> <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard </Link>
              <Link href="/admin/homepage" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/homepage') ? 'bg-white/10' : 'hover:bg-white/5'}`}> <Home className="w-5 h-5 mr-3" /> Homepage </Link>
              <Link href="/admin/products" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/products') ? 'bg-white/10' : 'hover:bg-white/5'}`}> <Package className="w-5 h-5 mr-3" /> Products </Link>
              <Link href="/admin/orders" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/orders') ? 'bg-white/10' : 'hover:bg-white/5'}`}> <ShoppingCart className="w-5 h-5 mr-3" /> Orders </Link>
              <Link href="/admin/customers" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/customers') ? 'bg-white/10' : 'hover:bg-white/5'}`}> <Users className="w-5 h-5 mr-3" /> Customers </Link>
              <Link href="/admin/reports" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/reports') ? 'bg-white/10' : 'hover:bg-white/5'}`}> <BarChart3 className="w-5 h-5 mr-3" /> Reports </Link>
              <Link href="/admin/settings" className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname.startsWith('/admin/settings') ? 'bg-white/10' : 'hover:bg-white/5'}`}> <Settings className="w-5 h-5 mr-3" /> Settings </Link>
            </nav>
          </div>
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <p className="font-sans text-sm font-medium">Admin</p>
                  <p className="font-sans text-xs text-white/60">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`p-2 rounded-lg transition-colors ${
                  isLoggingOut 
                    ? 'text-white/30 cursor-not-allowed' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title={isLoggingOut ? "Logging out..." : "Logout"}
                aria-label={isLoggingOut ? "Logging out..." : "Logout"}
              >
                <LogOut className={`h-4 w-4 ${isLoggingOut ? 'animate-spin' : ''}`} />
              </button>
            </div>
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
          </div>
        </motion.div>
      )}

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