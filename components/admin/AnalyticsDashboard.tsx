'use client';

import { useState, useEffect } from 'react';
import { Analytics } from '@/lib/admin/data';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, Calendar, BarChart3 } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  color: string;
}

function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            {title}
          </p>
          <p className="text-2xl font-bold text-black mt-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {isPositive && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
              {isNegative && <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
              <span className={`text-sm font-medium ${
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
              }`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

interface SalesChartProps {
  data: { date: string; sales: number }[];
}

function SalesChart({ data }: SalesChartProps) {
  const maxSales = Math.max(...data.map(d => d.sales));
  const minSales = Math.min(...data.map(d => d.sales));
  const range = maxSales - minSales || 1;
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-black mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
        7-Day Sales Trend
      </h3>
      <div className="h-64 flex items-end justify-between space-x-2">
        {data.map((item, index) => {
          const height = ((item.sales - minSales) / range) * 200 + 20;
          const date = new Date(item.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex justify-center mb-2">
                <div
                  className="bg-black rounded-t-md w-8 transition-all duration-300 hover:bg-gray-800"
                  style={{ height: `${height}px` }}
                  title={`${dayName}: $${item.sales.toFixed(2)}`}
                ></div>
              </div>
              <div className="text-xs text-gray-600 text-center" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {dayName}
              </div>
              <div className="text-xs text-gray-500 text-center" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                ${item.sales.toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface StatusBreakdownProps {
  data: { status: string; count: number; revenue: number }[];
}

function StatusBreakdown({ data }: StatusBreakdownProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500'
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-black mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
        Order Status Breakdown
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          const colorClass = statusColors[item.status] || 'bg-gray-500';
          
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-black capitalize" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {item.status}
                </span>
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {item.count} orders
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${colorClass}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {percentage.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  ${item.revenue.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics/overview');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      setError('Failed to load analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Loading analytics...</div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error || 'Failed to load analytics data'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
          Analytics Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toFixed(2)}`}
          change={analytics.revenueGrowth}
          icon={DollarSign}
          color="bg-green-500"
        />
        <MetricCard
          title="Total Orders"
          value={analytics.totalOrders}
          change={analytics.orderGrowth}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <MetricCard
          title="Total Products"
          value={analytics.totalProducts}
          icon={Package}
          color="bg-purple-500"
        />
        <MetricCard
          title="Avg Order Value"
          value={`$${analytics.averageOrderValue.toFixed(2)}`}
          change={analytics.aovGrowth}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Conversion Rate"
          value={`${analytics.conversionRate.toFixed(1)}%`}
          change={analytics.conversionGrowth}
          icon={Users}
          color="bg-indigo-500"
        />
        <MetricCard
          title="Low Stock Items"
          value={analytics.lowStockProducts}
          icon={Package}
          color="bg-red-500"
        />
        <MetricCard
          title="Featured Products"
          value={analytics.featuredProducts}
          icon={BarChart3}
          color="bg-yellow-500"
        />
      </div>

      {/* Charts and Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <SalesChart data={analytics.salesTrend} />
        
        {/* Order Status Breakdown */}
        <StatusBreakdown data={analytics.ordersByStatus} />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-black mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Revenue by Category
          </h3>
          <div className="space-y-3">
            {analytics.revenueByCategory.slice(0, 5).map((category, index) => {
              const maxRevenue = Math.max(...analytics.revenueByCategory.map(c => c.revenue));
              const percentage = (category.revenue / maxRevenue) * 100;
              
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      {category.category}
                    </span>
                    <span className="text-sm text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      ${category.revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-black"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-black mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>Pending Orders</span>
              <span className="text-sm font-medium text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {analytics.ordersByStatus.find(s => s.status === 'pending')?.count || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>Processing Orders</span>
              <span className="text-sm font-medium text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {analytics.ordersByStatus.find(s => s.status === 'processing')?.count || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>Shipped Orders</span>
              <span className="text-sm font-medium text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {analytics.ordersByStatus.find(s => s.status === 'shipped')?.count || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>Delivered Orders</span>
              <span className="text-sm font-medium text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {analytics.ordersByStatus.find(s => s.status === 'delivered')?.count || 0}
              </span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Total Items Sold</span>
              <span className="text-sm font-bold text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {analytics.totalItemsSold}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}