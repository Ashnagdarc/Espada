'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin/api'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Filter,
  Download
} from 'lucide-react';

interface AnalyticsData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  uniqueCustomers: number;
  newCustomers: number;
  averageOrderValue: number;
  avgCustomerLifetimeValue: number;
  revenueChange: number;
  ordersChange: number;
  aovChange: number;
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
  weeklyRevenue: Array<{ week: string; revenue: number; orders: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: string;
    createdAt: string;
    itemCount: number;
  }>;
  statusDistribution: Record<string, number>;
  revenueByStatus: Record<string, number>;
  timeRange: {
    from: string;
    to: string;
    days: number;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');
  const [chartView, setChartView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ timeRange });
      const data = await adminFetch(`/api/admin/analytics/overview?${params}`);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChartData = () => {
    if (!analytics) return [];

    switch (chartView) {
      case 'daily':
        return analytics.dailyRevenue.map(item => ({
          ...item,
          name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));
      case 'weekly':
        return analytics.weeklyRevenue.map(item => ({
          ...item,
          name: new Date(item.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));
      case 'monthly':
        return analytics.monthlyRevenue.map(item => ({
          ...item,
          name: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        }));
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/80 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="mt-2 text-white/60">
                Comprehensive revenue and performance metrics
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              {/* Time Range Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-white/60" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-white/20 bg-black text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-white/40 focus:border-transparent"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>

              <button className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/80">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-white/80" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analytics.revenueChange)}
              <span className={`ml-2 text-sm font-medium ${getChangeColor(analytics.revenueChange).replace('600', '400')}`}>
                {formatPercentage(analytics.revenueChange)}
              </span>
              <span className="ml-2 text-sm text-white/60">vs previous period</span>
            </div>
          </div>

          <div className="bg-black rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-white/80" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analytics.ordersChange)}
              <span className={`ml-2 text-sm font-medium ${getChangeColor(analytics.ordersChange).replace('600', '400')}`}>
                {formatPercentage(analytics.ordersChange)}
              </span>
              <span className="ml-2 text-sm text-white/60">vs previous period</span>
            </div>
          </div>

          <div className="bg-black rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Average Order Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.averageOrderValue)}
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white/80" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(analytics.aovChange)}
              <span className={`ml-2 text-sm font-medium ${getChangeColor(analytics.aovChange).replace('600', '400')}`}>
                {formatPercentage(analytics.aovChange)}
              </span>
              <span className="ml-2 text-sm text-white/60">vs previous period</span>
            </div>
          </div>

          <div className="bg-black rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Unique Customers</p>
                <p className="text-2xl font-bold">{analytics.uniqueCustomers}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <Users className="h-6 w-6 text-white/80" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-white/60">
                {analytics.newCustomers} new customers
              </span>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Customer Lifetime Value</h3>
              <DollarSign className="h-5 w-5 text-white/60" />
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(analytics.avgCustomerLifetimeValue)}
            </p>
            <p className="text-sm text-white/60 mt-2">Average per customer</p>
          </div>

          <div className="bg-black rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pending Orders</h3>
              <Package className="h-5 w-5 text-white/60" />
            </div>
            <p className="text-2xl font-bold">{analytics.pendingOrders}</p>
            <p className="text-sm text-white/60 mt-2">Awaiting processing</p>
          </div>

          <div className="bg-black rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Low Stock Products</h3>
              <Package className="h-5 w-5 text-white/60" />
            </div>
            <p className="text-2xl font-bold">{analytics.lowStockProducts}</p>
            <p className="text-sm text-white/60 mt-2">Need restocking</p>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-black rounded-xl border border-white/10 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-white/60" />
              <select
                value={chartView}
                onChange={(e) => setChartView(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="border border-white/20 bg-black text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-white/40 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Status Distribution */}
          <div className="bg-black rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold mb-6">Order Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.statusDistribution).map(([status, count]) => ({
                      name: status.charAt(0).toUpperCase() + status.slice(1),
                      value: count
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {Object.entries(analytics.statusDistribution).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-black rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold mb-6">Top Selling Products</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="productName"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'totalSold' ? value : formatCurrency(value),
                      name === 'totalSold' ? 'Units Sold' : 'Revenue'
                    ]}
                  />
                  <Bar dataKey="totalSold" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-black rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold mb-6">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-black divide-y divide-white/10">
                {analytics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {order.orderNumber || `#${order.id.slice(0, 8)}`}
                      </div>
                      <div className="text-sm text-white/60">
                        {order.itemCount} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {order.customerName}
                      </div>
                      <div className="text-sm text-white/60">
                        {order.customerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'delivered' ? 'bg-white/10 text-white' :
                          order.status === 'shipped' ? 'bg-white/10 text-white' :
                            order.status === 'processing' ? 'bg-white/10 text-white' :
                              order.status === 'pending' ? 'bg-white/10 text-white' :
                                'bg-white/10 text-white'
                        }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}