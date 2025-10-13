'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { adminAPI } from '@/lib/admin/api';
import { AnalyticsData } from '@/lib/types/api';
import AdminLayout from '@/components/admin/AdminLayout';
import Card from '@/components/admin/ui/Card';
import AdminPage from '@/components/admin/ui/AdminPage';
import PageHeader from '@/components/admin/ui/PageHeader';
import {
  Users,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  Calendar,
  BarChart3,
  Package,
  FileText,
  Settings
} from 'lucide-react';

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

interface ActivityItem {
  id: string;
  type: 'order' | 'customer' | 'stock' | 'product';
  message: string;
  timestamp: string;
  color: string;
}

interface AdminStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  revenueChange?: number;
  ordersChange?: number;
  uniqueCustomers?: number;
  recentOrders?: RecentOrder[];
  newCustomers?: number;
  recentActivities?: ActivityItem[];
}

// Utility function to format time ago
const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};

// Function to generate recent activities from analytics data
const generateRecentActivities = (analyticsData: AnalyticsData): ActivityItem[] => {
  const activities: ActivityItem[] = [];

  // Add recent orders as activities
  if (analyticsData.recentOrders && analyticsData.recentOrders.length > 0) {
    analyticsData.recentOrders.slice(0, 3).forEach((order: RecentOrder) => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        message: `New order ${order.orderNumber} received from ${order.customerName}`,
        timestamp: order.createdAt,
        color: 'bg-green-400'
      });
    });
  }

  // Add low stock alerts
  if (analyticsData.lowStockProducts > 0) {
    activities.push({
      id: 'stock-alert',
      type: 'stock',
      message: `${analyticsData.lowStockProducts} product${analyticsData.lowStockProducts !== 1 ? 's' : ''} running low on stock`,
      timestamp: new Date().toISOString(),
      color: 'bg-orange-400'
    });
  }

  // Add new customers activity
  if (analyticsData.newCustomers && analyticsData.newCustomers > 0) {
    activities.push({
      id: 'new-customers',
      type: 'customer',
      message: `${analyticsData.newCustomers} new customer${analyticsData.newCustomers !== 1 ? 's' : ''} registered`,
      timestamp: new Date().toISOString(),
      color: 'bg-purple-400'
    });
  }

  // Add product update activity (simulated)
  if (analyticsData.totalProducts > 0) {
    activities.push({
      id: 'product-update',
      type: 'product',
      message: `Product catalog updated with ${analyticsData.totalProducts} active products`,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      color: 'bg-blue-400'
    });
  }

  // Sort by timestamp (most recent first) and limit to 6 items
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);
};

export default function AdminDashboard() {
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();
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
  const [hasRedirected] = useState(false);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    console.log('Admin page useEffect - Auth state:', { 
      authLoading, 
      hasRedirected
    });

    // Don't do anything while auth is still loading
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    const checkAdminAccess = async () => {
      try {
        // Always load stats; auth is disabled
        await loadStats();
      } catch (error) {
        console.error('Error in admin access check:', error);
        setError('Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [authLoading, hasRedirected]);

  const loadStats = async () => {
    try {
      console.log('🔄 Starting loadStats function...');
      const response = await adminAPI.getAnalytics();
      if (!response) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const analyticsData = response;
      console.log('📊 Analytics data received:', analyticsData);
      
      // Generate recent activities from analytics data
      const recentActivities = generateRecentActivities(analyticsData);
      
      // Map API response to stats state
      const newStats = {
        totalOrders: analyticsData.totalOrders || 0,
        totalCustomers: analyticsData.uniqueCustomers || 0,
        totalProducts: analyticsData.totalProducts || 0,
        totalRevenue: analyticsData.totalRevenue || 0,
        pendingOrders: analyticsData.pendingOrders || 0,
        lowStockProducts: analyticsData.lowStockProducts || 0,
        revenueChange: analyticsData.revenueChange || 0,
        ordersChange: analyticsData.ordersChange || 0,
        uniqueCustomers: analyticsData.uniqueCustomers || 0,
        recentOrders: analyticsData.recentOrders || [],
        newCustomers: analyticsData.newCustomers || 0,
        recentActivities: recentActivities
      };
      
      console.log('🎯 Setting new stats:', newStats);
      setStats(newStats);
      console.log('✅ Stats updated successfully');
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      // Set default values on error
      const defaultStats = {
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        lowStockProducts: 0
      };
      console.log('🔄 Setting default stats:', defaultStats);
      setStats(defaultStats);
    }
  };

  // Show loading while auth is loading or while we're checking admin access
  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <AdminPage className="pt-2 pb-8">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded mb-2" />
            <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        </AdminPage>
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
      change: stats.revenueChange ? `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}%` : '0%',
      changeType: (stats.revenueChange || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      change: stats.ordersChange ? `${stats.ordersChange > 0 ? '+' : ''}${stats.ordersChange.toFixed(1)}%` : '0%',
      changeType: (stats.ordersChange || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      change: '0%', // Customer change calculation can be added later
      changeType: 'positive'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: AlertCircle,
      change: '0%', // Pending orders change calculation can be added later
      changeType: 'negative'
    }
  ];

  return (
    <AdminLayout>
      <AdminPage>
        <PageHeader
          title="Admin Dashboard"
          actions={
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          }
        />
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} appearance="panel" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm px-2 py-1 rounded-full ${
                  stat.changeType === 'positive' 
                    ? 'text-green-400 bg-green-400/10' 
                    : 'text-red-400 bg-red-400/10'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navigationCards.map((card, index) => (
            <Card
              key={index}
              onClick={() => router.push(card.href)}
              appearance="panel"
              className="p-6 cursor-pointer hover:bg-white/5 transition-all duration-200 group hover:border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-white transition-colors">
                {card.title}
              </h3>
              <p className="text-white/60 text-sm mb-3">
                {card.description}
              </p>
              <p className="text-xs text-white/40">{card.stats}</p>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card appearance="panel" className="p-6">
          <h3 className="text-lg font-semibold mb-6 text-white">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 ${activity.color} rounded-full mr-4`}></div>
                    <span className="text-sm text-white/80">{activity.message}</span>
                  </div>
                  <span className="text-xs text-white/50">{formatTimeAgo(activity.timestamp)}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-white/40 mx-auto mb-2" />
                  <p className="text-sm text-white/60">No recent activity</p>
                  <p className="text-xs text-white/40">Activity will appear here as it happens</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </AdminPage>
    </AdminLayout>
  );
}