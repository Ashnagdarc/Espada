// Client-side data utilities for admin dashboard
// Note: File operations are handled by API routes

// Helper function to generate unique IDs
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
  stock: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: {
    productId: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: Order[];
  topProducts: {
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }[];
}

// Note: File operations are now handled by API routes

// Client-side helper functions for product data
export function createProductData(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  return {
    ...productData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function updateProductData(product: Product, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product {
  return {
    ...product,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}

// Client-side helper functions for order data
export function updateOrderData(order: Order, updates: Partial<Omit<Order, 'id' | 'createdAt'>>): Order {
  return {
    ...order,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}

// Helper function to calculate analytics from data
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  total: number;
  status: string;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  order_number?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string;
}

export interface AnalyticsData {
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

export function calculateEnhancedAnalytics(
  products: Product[], 
  orders: Order[], 
  orderItems: OrderItem[],
  timeRange: { from: string; to: string; days: number }
): AnalyticsData {
  const now = new Date();
  const fromDate = new Date(timeRange.from);
  const toDate = new Date(timeRange.to);
  
  // Filter orders within the time range
  const currentOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= fromDate && orderDate <= toDate;
  });

  // Calculate previous period for comparison
  const previousFromDate = new Date(fromDate.getTime() - (toDate.getTime() - fromDate.getTime()));
  const previousToDate = fromDate;
  
  const previousOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= previousFromDate && orderDate < previousToDate;
  });

  // Basic metrics
  const totalProducts = products.length;
  const totalOrders = currentOrders.length;
  const totalRevenue = currentOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = currentOrders.filter(order => order.status === 'pending').length;
  const lowStockProducts = products.filter(product => product.stock < 10).length;

  // Customer metrics
  const uniqueCustomers = new Set(currentOrders.map(order => order.customer_id)).size;
  const previousUniqueCustomers = new Set(previousOrders.map(order => order.customer_id)).size;
  const newCustomers = uniqueCustomers - previousUniqueCustomers;

  // Calculate changes
  const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
  const previousOrderCount = previousOrders.length;
  const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const avgCustomerLifetimeValue = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

  const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const ordersChange = previousOrderCount > 0 ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 : 0;
  const aovChange = previousAOV > 0 ? ((averageOrderValue - previousAOV) / previousAOV) * 100 : 0;

  // Time-based revenue trends
  const dailyRevenue = calculateDailyTrend(currentOrders, fromDate, toDate);
  const weeklyRevenue = calculateWeeklyTrend(currentOrders, fromDate, toDate);
  const monthlyRevenue = calculateMonthlyTrend(currentOrders, fromDate, toDate);

  // Top products
  const productSales = new Map<string, { totalSold: number; revenue: number; productName: string }>();
  
  orderItems.forEach(item => {
    const order = orders.find(o => o.id === item.order_id);
    if (order && currentOrders.includes(order)) {
      const existing = productSales.get(item.product_id) || { totalSold: 0, revenue: 0, productName: item.product_name || 'Unknown' };
      existing.totalSold += item.quantity;
      existing.revenue += item.price * item.quantity;
      productSales.set(item.product_id, existing);
    }
  });

  const topProducts = Array.from(productSales.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.productName,
      totalSold: data.totalSold,
      revenue: data.revenue
    }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 10);

  // Recent orders with item counts
  const recentOrders = currentOrders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map(order => {
      const itemCount = orderItems.filter(item => item.order_id === order.id).length;
      return {
        id: order.id,
        orderNumber: order.order_number || `#${order.id.slice(0, 8)}`,
        customerName: order.customer_name || 'Unknown Customer',
        customerEmail: order.customer_email || 'unknown@email.com',
        total: order.total,
        status: order.status,
        createdAt: order.created_at,
        itemCount
      };
    });

  // Status distribution
  const statusDistribution: Record<string, number> = {};
  currentOrders.forEach(order => {
    statusDistribution[order.status] = (statusDistribution[order.status] || 0) + 1;
  });

  // Revenue by status
  const revenueByStatus: Record<string, number> = {};
  currentOrders.forEach(order => {
    revenueByStatus[order.status] = (revenueByStatus[order.status] || 0) + order.total;
  });

  return {
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    lowStockProducts,
    uniqueCustomers,
    newCustomers,
    averageOrderValue,
    avgCustomerLifetimeValue,
    revenueChange,
    ordersChange,
    aovChange,
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    topProducts,
    recentOrders,
    statusDistribution,
    revenueByStatus,
    timeRange
  };
}

export function calculateDailyTrend(
  orders: Order[], 
  fromDate: Date, 
  toDate: Date
): Array<{ date: string; revenue: number; orders: number }> {
  const dailyData = new Map<string, { revenue: number; orders: number }>();
  
  // Initialize all days in range
  const currentDate = new Date(fromDate);
  while (currentDate <= toDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    dailyData.set(dateStr, { revenue: 0, orders: 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Aggregate order data by day
  orders.forEach(order => {
    const orderDate = new Date(order.created_at).toISOString().split('T')[0];
    const existing = dailyData.get(orderDate);
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    }
  });
  
  return Array.from(dailyData.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateWeeklyTrend(
  orders: Order[], 
  fromDate: Date, 
  toDate: Date
): Array<{ week: string; revenue: number; orders: number }> {
  const weeklyData = new Map<string, { revenue: number; orders: number }>();
  
  orders.forEach(order => {
    const orderDate = new Date(order.created_at);
    const weekStart = new Date(orderDate);
    weekStart.setDate(orderDate.getDate() - orderDate.getDay()); // Start of week (Sunday)
    const weekStr = weekStart.toISOString().split('T')[0];
    
    const existing = weeklyData.get(weekStr) || { revenue: 0, orders: 0 };
    existing.revenue += order.total;
    existing.orders += 1;
    weeklyData.set(weekStr, existing);
  });
  
  return Array.from(weeklyData.entries())
    .map(([week, data]) => ({ week, ...data }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

export function calculateMonthlyTrend(
  orders: Order[], 
  fromDate: Date, 
  toDate: Date
): Array<{ month: string; revenue: number; orders: number }> {
  const monthlyData = new Map<string, { revenue: number; orders: number }>();
  
  orders.forEach(order => {
    const orderDate = new Date(order.created_at);
    const monthStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    
    const existing = monthlyData.get(monthStr) || { revenue: 0, orders: 0 };
    existing.revenue += order.total;
    existing.orders += 1;
    monthlyData.set(monthStr, existing);
  });
  
  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function calculateRevenueByStatus(orders: Order[]): Record<string, number> {
  const revenueByStatus: Record<string, number> = {};
  
  orders.forEach(order => {
    revenueByStatus[order.status] = (revenueByStatus[order.status] || 0) + order.total;
  });
  
  return revenueByStatus;
}

export function calculateSalesTrend(orders: Order[], days: number = 7): Array<{ date: string; sales: number }> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  const salesByDate = new Map<string, number>();
  
  // Initialize all dates
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    salesByDate.set(dateStr, 0);
  }
  
  // Count sales by date
  orders.forEach(order => {
    const orderDate = new Date(order.created_at);
    if (orderDate >= startDate && orderDate <= endDate) {
      const dateStr = orderDate.toISOString().split('T')[0];
      salesByDate.set(dateStr, (salesByDate.get(dateStr) || 0) + 1);
    }
  });
  
  return Array.from(salesByDate.entries())
    .map(([date, sales]) => ({ date, sales }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Legacy function for backward compatibility
export function calculateAnalytics(products: Product[], orders: Order[]) {
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const lowStockProducts = products.filter(product => product.stock < 10).length;

  // Get recent orders (last 10)
  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  // Calculate top products (mock data for now)
  const topProducts = products
    .slice(0, 5)
    .map(product => ({
      productId: product.id,
      productName: product.name,
      totalSold: Math.floor(Math.random() * 100) + 1,
      revenue: product.price * (Math.floor(Math.random() * 100) + 1)
    }));

  return {
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    lowStockProducts,
    recentOrders,
    topProducts
  };
}

// Helper function to determine product status based on stock
export function getProductStatus(stock: number): 'In Stock' | 'Low Stock' | 'Out of Stock' {
  if (stock === 0) {
    return 'Out of Stock';
  } else if (stock < 10) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
}

// Helper function to get status badge color classes
export function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'In Stock':
      return 'bg-green-100 text-green-800';
    case 'Low Stock':
      return 'bg-yellow-100 text-yellow-800';
    case 'Out of Stock':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Note: generateId function is defined above