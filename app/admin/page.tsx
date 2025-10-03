'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import AdminLayout from '@/components/admin/AdminLayout';
import PageTransition from '@/components/admin/PageTransition';
import Card from '@/components/admin/ui/Card';
import {
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  FileText,
  Settings,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface AdminStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export default function AdminDashboard() {
  const user = useUser();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user?.id) {
        router.push('/signin');
        return;
      }

      try {
        // Server-verified admin check
        const resp = await fetch('/api/admin/check-role');
        const json = await resp.json();
        if (!json?.isAdmin) {
          router.push('/');
          return;
        }

        setAdminEmail(json?.email ?? null);
        await loadStats();
      } catch (error) {
        console.error('Error checking admin access:', error);
        setError('Failed to verify admin access');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, router]);

  const loadStats = async () => {
    try {
      // Load basic stats (you can expand this with real data)
      setStats({
        totalOrders: 156,
        totalCustomers: 89,
        totalProducts: 24,
        totalRevenue: 12450,
        pendingOrders: 8,
        lowStockProducts: 3
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Card>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Something went wrong</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  const navigationCards = [
    {
      title: 'Analytics',
      description: 'View sales analytics and reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-blue-500',
      stats: `$${stats.totalRevenue.toLocaleString()} revenue`
    },
    {
      title: 'Customers',
      description: 'Manage customer accounts',
      icon: Users,
      href: '/admin/customers',
      color: 'bg-green-500',
      stats: `${stats.totalCustomers} customers`
    },
    {
      title: 'Orders',
      description: 'Process and manage orders',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-orange-500',
      stats: `${stats.pendingOrders} pending`
    },
    {
      title: 'Products',
      description: 'Manage product catalog',
      icon: Package,
      href: '/admin/products',
      color: 'bg-purple-500',
      stats: `${stats.totalProducts} products`
    },
    {
      title: 'Reports',
      description: 'Generate detailed reports',
      icon: FileText,
      href: '/admin/reports',
      color: 'bg-indigo-500',
      stats: 'View reports'
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500',
      stats: 'System config'
    }
  ];

  const quickStats = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      change: '+15.3%',
      changeType: 'positive'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: AlertCircle,
      change: '-2.1%',
      changeType: 'negative'
    }
  ];

  return (
    <AdminLayout>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Signed in as {adminEmail || 'admin'}</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} className="bg-black border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">{stat.title}</p>
                    <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <stat.icon className="w-6 h-6 text-white/80" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-white/60">
                  <span className="mr-2">↕</span>
                  <span>{stat.change}</span>
                  <span className="ml-1">vs last month</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationCards.map((card, index) => (
              <div
                key={index}
                onClick={() => router.push(card.href)}
                className="bg-black rounded-lg border border-white/10 p-6 cursor-pointer hover:bg-white/5 transition-colors duration-200 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-white/10">
                    <card.icon className="w-6 h-6 text-white/80" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60">{card.stats}</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
                  {card.title}
                </h3>
                <p className="text-white/60 text-sm">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-black rounded-lg border border-white/10 p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white/60 rounded-full mr-3"></div>
                  <span className="text-sm text-white/70">New order #1234 received</span>
                </div>
                <span className="text-xs text-white/50">2 minutes ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white/60 rounded-full mr-3"></div>
                  <span className="text-sm text-white/70">Product "Vintage T-Shirt" updated</span>
                </div>
                <span className="text-xs text-white/50">15 minutes ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white/60 rounded-full mr-3"></div>
                  <span className="text-sm text-white/70">Low stock alert for "Classic Hoodie"</span>
                </div>
                <span className="text-xs text-white/50">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}