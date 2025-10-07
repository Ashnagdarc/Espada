'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminAPI } from '@/lib/admin/api';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, FileText, BarChart3, Loader2 } from 'lucide-react';
import { ToastProvider, useToastHelpers } from '@/components/admin/ui/Toast';

interface AnalyticsData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  uniqueCustomers: number;
  newCustomers: number;
  averageOrderValue: number;
  avgCustomerLifetimeValue: number;
  revenueChange: number;
  ordersChange: number;
  aovChange: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
    averageRating: number;
    imageUrl: string;
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    customerEmail: string;
    totalSpent: number;
    totalOrders: number;
    averageOrderValue: number;
    lastOrderDate: string;
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

interface ReportData {
  salesReport: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    salesGrowth: number;
  };
  customerReport: {
    totalCustomers: number;
    newCustomers: number;
    customerGrowth: number;
    repeatCustomers: number;
  };
  productReport: {
    totalProducts: number;
    lowStockItems: number;
    topSellingProduct: string;
    categoryPerformance: Array<{ name: string; sales: number }>;
  };
  orderReport: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
}

function ReportsPageContent() {
  const { success, error: showError, info } = useToastHelpers();
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState('30');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: DollarSign, description: 'Revenue and sales analytics' },
    { id: 'customers', name: 'Customer Report', icon: Users, description: 'Customer behavior and growth' },
    { id: 'products', name: 'Product Report', icon: Package, description: 'Product performance and inventory' },
    { id: 'orders', name: 'Order Report', icon: ShoppingCart, description: 'Order trends and fulfillment' }
  ];

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics data from the API
      const analytics = await adminAPI.getAnalytics(dateRange);
      setAnalyticsData(analytics);

      // Transform analytics data into report format
      const transformedData: ReportData = {
        salesReport: {
          totalSales: analytics.totalRevenue || 0,
          totalOrders: analytics.totalOrders || 0,
          averageOrderValue: analytics.averageOrderValue || 0,
          salesGrowth: analytics.revenueChange || 0
        },
        customerReport: {
          totalCustomers: analytics.uniqueCustomers || 0,
          newCustomers: analytics.newCustomers || 0,
          customerGrowth: ((analytics.newCustomers || 0) / Math.max(analytics.uniqueCustomers || 1, 1)) * 100,
          repeatCustomers: Math.max((analytics.uniqueCustomers || 0) - (analytics.newCustomers || 0), 0)
        },
        productReport: {
          totalProducts: analytics.totalProducts || 0,
          lowStockItems: analytics.lowStockProducts || 0,
          topSellingProduct: analytics.topProducts?.[0]?.productName || 'No data',
          categoryPerformance: analytics.topProducts?.slice(0, 4).map(product => ({
            name: product.productName,
            sales: product.revenue
          })) || []
        },
        orderReport: {
          totalOrders: analytics.totalOrders || 0,
          pendingOrders: analytics.pendingOrders || 0,
          completedOrders: analytics.completedOrders || 0,
          cancelledOrders: analytics.cancelledOrders || 0
        }
      };

      setReportData(transformedData);
      
      // Show success notification for data loading
      success('Data Loaded!', `Report data for the last ${dateRange} days has been loaded successfully`);
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load report data. Please try again.';
      setError(errorMessage);
      showError('Loading Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (exportLoading) return;
    
    try {
      setExportLoading(true);
      const reportType = reportTypes.find(r => r.id === selectedReport);
      if (!reportType) return;

      // Show loading toast
      info('Export Started', `Preparing ${reportType.name} for the last ${dateRange} days...`);

      // Simulate export process with delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful export
      const fileName = `${reportType.name.toLowerCase().replace(' ', '_')}_${dateRange}days_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Create a simple CSV content for demonstration
      let csvContent = '';
      if (selectedReport === 'sales' && reportData) {
        csvContent = `Report Type,${reportType.name}\n`;
        csvContent += `Date Range,Last ${dateRange} days\n`;
        csvContent += `Generated,${new Date().toLocaleString()}\n\n`;
        csvContent += `Metric,Value\n`;
        csvContent += `Total Sales,${reportData.salesReport.totalSales}\n`;
        csvContent += `Total Orders,${reportData.salesReport.totalOrders}\n`;
        csvContent += `Average Order Value,${reportData.salesReport.averageOrderValue}\n`;
        csvContent += `Sales Growth,${reportData.salesReport.salesGrowth}%\n`;
      } else if (selectedReport === 'customers' && reportData) {
        csvContent = `Report Type,${reportType.name}\n`;
        csvContent += `Date Range,Last ${dateRange} days\n`;
        csvContent += `Generated,${new Date().toLocaleString()}\n\n`;
        csvContent += `Metric,Value\n`;
        csvContent += `Total Customers,${reportData.customerReport.totalCustomers}\n`;
        csvContent += `New Customers,${reportData.customerReport.newCustomers}\n`;
        csvContent += `Customer Growth,${reportData.customerReport.customerGrowth}%\n`;
        csvContent += `Repeat Customers,${reportData.customerReport.repeatCustomers}\n`;
      } else {
        csvContent = `Report Type,${reportType.name}\n`;
        csvContent += `Date Range,Last ${dateRange} days\n`;
        csvContent += `Generated,${new Date().toLocaleString()}\n\n`;
        csvContent += `Status,Report data available in full version\n`;
      }

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success toast
      success('Export Complete!', `${reportType.name} has been downloaded as ${fileName}`);
    } catch (err) {
      console.error('Export failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to export report. Please try again.';
      showError('Export Failed', errorMessage);
    } finally {
      setExportLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, trend }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    trend?: 'up' | 'down';
  }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-blue-100'
          }`}>
          <Icon className={`h-6 w-6 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-blue-600'
            }`} />
        </div>
      </div>
    </div>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6 text-white">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-2">Error loading reports</p>
            <p className="text-white/70 text-sm">{error}</p>
            <button
              onClick={fetchReportData}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 text-white">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-white/60">Generate and view detailed business reports</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-white/20 bg-black text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-white/40 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={handleExportReport}
              disabled={exportLoading}
              className="bg-white text-black px-4 py-2 rounded-lg hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exportLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exportLoading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 rounded-lg border text-left transition-all ${selectedReport === report.id
                  ? 'border-white bg-white text-black'
                  : 'border-white/10 hover:bg-white/5'
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`h-5 w-5 ${selectedReport === report.id ? 'text-black' : 'text-white/70'
                    }`} />
                  <h3 className={`font-medium ${selectedReport === report.id ? 'text-black' : 'text-white'
                    }`}>
                    {report.name}
                  </h3>
                </div>
                <p className={`text-sm ${selectedReport === report.id ? 'text-black/70' : 'text-white/60'}`}>{report.description}</p>
              </button>
            );
          })}
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="bg-black rounded-lg border border-white/10 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto"></div>
            <p className="mt-2 text-white/60">Loading report data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedReport === 'sales' && reportData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Sales"
                    value={formatCurrency(reportData.salesReport.totalSales)}
                    change={reportData.salesReport.salesGrowth}
                    icon={DollarSign}
                    trend={reportData.salesReport.salesGrowth >= 0 ? "up" : "down"}
                  />
                  <StatCard
                    title="Total Orders"
                    value={reportData.salesReport.totalOrders}
                    icon={ShoppingCart}
                  />
                  <StatCard
                    title="Average Order Value"
                    value={formatCurrency(reportData.salesReport.averageOrderValue)}
                    icon={BarChart3}
                  />
                  <StatCard
                    title="Growth Rate"
                    value={`${reportData.salesReport.salesGrowth.toFixed(1)}%`}
                    icon={TrendingUp}
                    trend={reportData.salesReport.salesGrowth >= 0 ? "up" : "down"}
                  />
                </div>

                <div className="bg-black rounded-lg border border-white/10 p-6">
                  <h3 className="text-lg font-semibold mb-4">Sales Trends</h3>
                  <div className="h-64 flex items-center justify-center bg-white/5 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-white/60 mx-auto mb-2" />
                      <p className="text-white/70">Sales chart visualization would appear here</p>
                      <p className="text-sm text-white/60">Integration with charting library needed</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedReport === 'customers' && reportData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Customers"
                    value={reportData.customerReport.totalCustomers}
                    icon={Users}
                  />
                  <StatCard
                    title="New Customers"
                    value={reportData.customerReport.newCustomers}
                    change={reportData.customerReport.customerGrowth}
                    icon={Users}
                    trend="up"
                  />
                  <StatCard
                    title="Repeat Customers"
                    value={reportData.customerReport.repeatCustomers}
                    icon={Users}
                  />
                  <StatCard
                    title="Customer Growth"
                    value={`${reportData.customerReport.customerGrowth.toFixed(1)}%`}
                    icon={TrendingUp}
                    trend="up"
                  />
                </div>

                <div className="bg-black rounded-lg border border-white/10 p-6">
                  <h3 className="text-lg font-semibold mb-4">Customer Acquisition</h3>
                  <div className="h-64 flex items-center justify-center bg-white/5 rounded-lg">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-white/60 mx-auto mb-2" />
                      <p className="text-white/70">Customer acquisition chart would appear here</p>
                      <p className="text-sm text-white/60">Shows new vs returning customers over time</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedReport === 'products' && reportData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Products"
                    value={reportData.productReport.totalProducts}
                    icon={Package}
                  />
                  <StatCard
                    title="Low Stock Items"
                    value={reportData.productReport.lowStockItems}
                    icon={Package}
                    trend="down"
                  />
                  <StatCard
                    title="Top Selling Product"
                    value={reportData.productReport.topSellingProduct}
                    icon={TrendingUp}
                  />
                  <StatCard
                    title="Categories"
                    value={reportData.productReport.categoryPerformance.length}
                    icon={Package}
                  />
                </div>

                <div className="bg-black rounded-lg border border-white/10 p-6">
                  <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
                  <div className="space-y-4">
                    {reportData.productReport.categoryPerformance.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-white/70">{formatCurrency(category.sales)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedReport === 'orders' && reportData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Orders"
                    value={reportData.orderReport.totalOrders}
                    icon={ShoppingCart}
                  />
                  <StatCard
                    title="Pending Orders"
                    value={reportData.orderReport.pendingOrders}
                    icon={ShoppingCart}
                  />
                  <StatCard
                    title="Completed Orders"
                    value={reportData.orderReport.completedOrders}
                    icon={ShoppingCart}
                    trend="up"
                  />
                  <StatCard
                    title="Cancelled Orders"
                    value={reportData.orderReport.cancelledOrders}
                    icon={ShoppingCart}
                    trend="down"
                  />
                </div>

                <div className="bg-black rounded-lg border border-white/10 p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
                  <div className="h-64 flex items-center justify-center bg-white/5 rounded-lg">
                    <div className="text-center">
                      <ShoppingCart className="h-12 w-12 text-white/60 mx-auto mb-2" />
                      <p className="text-white/70">Order status pie chart would appear here</p>
                      <p className="text-sm text-white/60">Shows distribution of order statuses</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-black rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              <FileText className="h-5 w-5 text-white/80" />
              <div className="text-left">
                <p className="font-medium">Generate Monthly Report</p>
                <p className="text-sm text-white/60">Create comprehensive monthly summary</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              <Calendar className="h-5 w-5 text-white/80" />
              <div className="text-left">
                <p className="font-medium">Schedule Report</p>
                <p className="text-sm text-white/60">Set up automated report delivery</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              <Download className="h-5 w-5 text-white/80" />
              <div className="text-left">
                <p className="font-medium">Export All Data</p>
                <p className="text-sm text-white/60">Download complete dataset</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Wrap with ToastProvider
export default function ReportsPage() {
  return (
    <ToastProvider>
      <ReportsPageContent />
    </ToastProvider>
  );
}