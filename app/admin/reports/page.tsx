'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, FileText, BarChart3 } from 'lucide-react';

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
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState('30');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: DollarSign, description: 'Revenue and sales analytics' },
    { id: 'customers', name: 'Customer Report', icon: Users, description: 'Customer behavior and growth' },
    { id: 'products', name: 'Product Report', icon: Package, description: 'Product performance and inventory' },
    { id: 'orders', name: 'Order Report', icon: ShoppingCart, description: 'Order trends and fulfillment' }
  ];

  useEffect(() => {
    // Simulate loading report data
    setTimeout(() => {
      const mockData: ReportData = {
        salesReport: {
          totalSales: 125430.50,
          totalOrders: 342,
          averageOrderValue: 366.75,
          salesGrowth: 12.5
        },
        customerReport: {
          totalCustomers: 1247,
          newCustomers: 89,
          customerGrowth: 8.3,
          repeatCustomers: 456
        },
        productReport: {
          totalProducts: 156,
          lowStockItems: 12,
          topSellingProduct: 'Premium Leather Jacket',
          categoryPerformance: [
            { name: 'Jackets', sales: 45230 },
            { name: 'Accessories', sales: 32100 },
            { name: 'Footwear', sales: 28900 },
            { name: 'Bags', sales: 19200 }
          ]
        }
      };
      setReportData(mockData);
      setLoading(false);
    }, 1000);
  }, [selectedReport, dateRange]);

  const handleExportReport = () => {
    // Simulate report export
    alert(`Exporting ${reportTypes.find(r => r.id === selectedReport)?.name} for the last ${dateRange} days...`);
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
              {Math.abs(change)}%
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
              className="bg-white text-black px-4 py-2 rounded-lg hover:bg-white/80 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
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
                <p className="text-sm ${selectedReport === report.id ? 'text-black/70' : 'text-white/60'}">{report.description}</p>
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
                    value={`$${reportData.salesReport.totalSales.toLocaleString()}`}
                    change={reportData.salesReport.salesGrowth}
                    icon={DollarSign}
                    trend="up"
                  />
                  <StatCard
                    title="Total Orders"
                    value={reportData.salesReport.totalOrders}
                    icon={ShoppingCart}
                  />
                  <StatCard
                    title="Average Order Value"
                    value={`$${reportData.salesReport.averageOrderValue.toFixed(2)}`}
                    icon={BarChart3}
                  />
                  <StatCard
                    title="Growth Rate"
                    value={`${reportData.salesReport.salesGrowth}%`}
                    icon={TrendingUp}
                    trend="up"
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
                    value={`${reportData.customerReport.customerGrowth}%`}
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
                        <span className="text-white/70">${category.sales.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedReport === 'orders' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Orders"
                    value="342"
                    icon={ShoppingCart}
                  />
                  <StatCard
                    title="Pending Orders"
                    value="23"
                    icon={ShoppingCart}
                  />
                  <StatCard
                    title="Completed Orders"
                    value="298"
                    icon={ShoppingCart}
                    trend="up"
                  />
                  <StatCard
                    title="Cancelled Orders"
                    value="21"
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