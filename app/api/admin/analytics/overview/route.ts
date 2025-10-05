import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AnalyticsData } from '@/lib/types/api';

// Database analytics interfaces
interface DailyAnalytic {
  date: string;
  total_orders: number;
  total_revenue: number;
  unique_customers: number;
  new_customers: number;
}

interface ProductAnalytic {
  product_id: string;
  product_name: string;
  total_sold: number;
  revenue: number;
}

interface CustomerAnalytic {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  total_spent: number;
  total_orders: number;
}

interface DatabaseOrder {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  item_count?: number;
}

interface DatabaseProduct {
  id: string;
  name: string;
  stock_quantity: number;
}

interface ProductAggregate {
  product_id: string;
  totalSold: number;
  totalRevenue: number;
  products?: {
    name: string;
    images: string[];
  };
}

interface CustomerSpending {
  customer_id: string;
  totalSpent: number;
  totalOrders: number;
  lastOrderDate: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to check if user is admin
async function isAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return false;

    // Check if user exists in admins table
    const { data: admin } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('email', user.email)
      .single();

    return !!admin;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!(await isAdmin(authHeader))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for time filtering
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range
    const now = new Date();
    const defaultStartDate = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);
    const fromDate = startDate ? new Date(startDate) : defaultStartDate;
    const toDate = endDate ? new Date(endDate) : now;

    // Fetch analytics data from the new analytics tables
    const [
      dailyAnalyticsResult,
      productAnalyticsResult,
      customerAnalyticsResult,
      ordersResult,
      productsResult
    ] = await Promise.all([
      // Daily analytics for the time range
      supabaseAdmin
        .from('daily_analytics')
        .select('*')
        .gte('date', fromDate.toISOString().split('T')[0])
        .lte('date', toDate.toISOString().split('T')[0])
        .order('date', { ascending: true }),
      
      // Product analytics - get daily data for aggregation
      supabaseAdmin
        .from('product_analytics')
        .select(`
          product_id,
          orders,
          revenue,
          products(name, price, images, stock_quantity)
        `)
        .gte('date', fromDate.toISOString().split('T')[0])
        .lte('date', toDate.toISOString().split('T')[0]),
      
      // Customer analytics - get daily data for aggregation  
      supabaseAdmin
        .from('customer_analytics')
        .select(`
          customer_id,
          sessions,
          page_views,
          time_spent,
          customer_profiles(first_name, last_name, email, created_at)
        `)
        .gte('date', fromDate.toISOString().split('T')[0])
        .lte('date', toDate.toISOString().split('T')[0]),
      
      // Recent orders
      supabaseAdmin
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            product_id,
            quantity,
            unit_price,
            products(name, images)
          ),
          customer_profiles(first_name, last_name, email)
        `)
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(20),
      
      // Products for inventory metrics
      supabaseAdmin
        .from('products')
        .select('*')
    ]);

    if (dailyAnalyticsResult.error) {
      console.error('Error fetching daily analytics:', dailyAnalyticsResult.error);
      return NextResponse.json({ error: 'Failed to fetch daily analytics' }, { status: 500 });
    }

    if (productAnalyticsResult.error) {
      console.error('Error fetching product analytics:', productAnalyticsResult.error);
      return NextResponse.json({ error: 'Failed to fetch product analytics' }, { status: 500 });
    }

    if (customerAnalyticsResult.error) {
      console.error('Error fetching customer analytics:', customerAnalyticsResult.error);
      return NextResponse.json({ error: 'Failed to fetch customer analytics' }, { status: 500 });
    }

    if (ordersResult.error) {
      console.error('Error fetching orders:', ordersResult.error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    if (productsResult.error) {
      console.error('Error fetching products:', productsResult.error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    const dailyAnalytics = dailyAnalyticsResult.data || [];
    const productAnalytics = productAnalyticsResult.data || [];
    const customerAnalytics = customerAnalyticsResult.data || [];
    const orders = ordersResult.data || [];
    const products = productsResult.data || [];

    // Calculate comprehensive analytics
    const analytics = calculateEnhancedAnalytics(
      dailyAnalytics,
      productAnalytics,
      customerAnalytics,
      orders,
      products,
      fromDate,
      toDate
    );

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateEnhancedAnalytics(
  dailyAnalytics: DailyAnalytic[],
  productAnalytics: ProductAnalytic[],
  customerAnalytics: CustomerAnalytic[],
  orders: DatabaseOrder[],
  products: DatabaseProduct[],
  fromDate: Date,
  toDate: Date
): AnalyticsData {
  // Calculate totals from daily analytics
  const totalOrders = dailyAnalytics.reduce((sum, day) => sum + (day.total_orders || 0), 0);
  const totalRevenue = dailyAnalytics.reduce((sum, day) => sum + (day.total_revenue || 0), 0);
  const uniqueCustomers = dailyAnalytics.reduce((sum, day) => sum + (day.unique_customers || 0), 0);
  const newCustomers = dailyAnalytics.reduce((sum, day) => sum + (day.new_customers || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate previous period for comparison
  const periodDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousFromDate = new Date(fromDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const previousToDate = fromDate;

  // Get previous period analytics
  const previousDailyAnalytics = dailyAnalytics.filter(day => {
    const dayDate = new Date(day.date);
    return dayDate >= previousFromDate && dayDate < previousToDate;
  });

  const previousRevenue = previousDailyAnalytics.reduce((sum, day) => sum + (day.total_revenue || 0), 0);
  const previousOrderCount = previousDailyAnalytics.reduce((sum, day) => sum + (day.total_orders || 0), 0);
  const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

  // Calculate percentage changes
  const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const ordersChange = previousOrderCount > 0 ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 : 0;
  const aovChange = previousAOV > 0 ? ((averageOrderValue - previousAOV) / previousAOV) * 100 : 0;

  // Inventory metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(product => (product.stock_quantity || 0) < 10).length;
  const outOfStockProducts = products.filter(product => (product.stock_quantity || 0) === 0).length;

  // Order status metrics
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

  // Status distribution
  const statusDistribution = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Revenue by status
  const revenueByStatus = orders.reduce((acc, order) => {
    const status = order.status;
    acc[status] = (acc[status] || 0) + parseFloat(order.total_amount || 0);
    return acc;
  }, {} as Record<string, number>);

  // Aggregate product analytics by product_id
  const productAggregates = productAnalytics.reduce((acc, item) => {
    const productId = item.product_id;
    if (!acc[productId]) {
      acc[productId] = {
        product_id: productId,
        products: item.products,
        totalSold: 0,
        totalRevenue: 0
      };
    }
    acc[productId].totalSold += item.orders || 0;
    acc[productId].totalRevenue += parseFloat(item.revenue || 0);
    return acc;
  }, {} as Record<string, ProductAggregate>);

  // Top products from aggregated analytics
  const topProducts = Object.values(productAggregates)
    .sort((a: ProductAggregate, b: ProductAggregate) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5)
    .map((product: ProductAggregate) => ({
      productId: product.product_id,
      productName: product.products?.name || 'Unknown Product',
      totalSold: product.totalSold,
      revenue: product.totalRevenue,
      averageRating: 0, // Not available in current schema
      imageUrl: product.products?.images && Array.isArray(product.products.images) && product.products.images.length > 0 
        ? product.products.images[0] 
        : null
    }));

  // Aggregate customer analytics by customer_id
  const customerAggregates = customerAnalytics.reduce((acc, item) => {
    const customerId = item.customer_id;
    if (!acc[customerId]) {
      acc[customerId] = {
        customer_id: customerId,
        customer_profiles: item.customer_profiles,
        totalSessions: 0,
        totalPageViews: 0,
        totalTimeSpent: 0
      };
    }
    acc[customerId].totalSessions += item.sessions || 0;
    acc[customerId].totalPageViews += item.page_views || 0;
    acc[customerId].totalTimeSpent += item.time_spent || 0;
    return acc;
  }, {} as Record<string, any>);

  // Get customer spending data from orders
  const customerSpending = orders.reduce((acc, order) => {
    const customerId = order.customer_id;
    if (!acc[customerId]) {
      acc[customerId] = {
        totalSpent: 0,
        totalOrders: 0,
        lastOrderDate: order.created_at
      };
    }
    acc[customerId].totalSpent += parseFloat(order.total_amount || 0);
    acc[customerId].totalOrders += 1;
    if (new Date(order.created_at) > new Date(acc[customerId].lastOrderDate)) {
      acc[customerId].lastOrderDate = order.created_at;
    }
    return acc;
  }, {} as Record<string, CustomerSpending>);

  // Top customers based on spending
  const topCustomers = Object.values(customerSpending)
    .sort((a: CustomerSpending, b: CustomerSpending) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map((spending: CustomerSpending) => {
      const customerData = customerAggregates[spending.customer_id];
      return {
        customerId: spending.customer_id,
        customerName: customerData ? `${customerData.customer_profiles?.first_name || ''} ${customerData.customer_profiles?.last_name || ''}`.trim() : 'Unknown Customer',
        customerEmail: customerData?.customer_profiles?.email || 'Unknown Email',
        totalSpent: spending.totalSpent,
        totalOrders: spending.totalOrders,
        averageOrderValue: spending.totalOrders > 0 ? spending.totalSpent / spending.totalOrders : 0,
        lastOrderDate: spending.lastOrderDate
      };
    });

  // Recent orders
  const recentOrders = orders.slice(0, 10).map(order => ({
    id: order.id,
    orderNumber: order.order_number,
    customerName: `${order.customer_profiles?.first_name || ''} ${order.customer_profiles?.last_name || ''}`.trim(),
    customerEmail: order.customer_profiles?.email,
    total: parseFloat(order.total_amount || 0),
    status: order.status,
    createdAt: order.created_at,
    itemCount: order.order_items?.length || 0
  }));

  // Daily revenue trend
  const dailyRevenue = dailyAnalytics.map(day => ({
    date: day.date,
    revenue: day.total_revenue || 0,
    orders: day.total_orders || 0,
    customers: day.unique_customers || 0,
    averageOrderValue: day.average_order_value || 0
  }));

  // Weekly aggregation
  const weeklyRevenue = aggregateWeekly(dailyAnalytics);

  // Customer lifetime value (from customer spending data)
  const customerSpendingValues = Object.values(customerSpending);
  const avgCustomerLifetimeValue = customerSpendingValues.length > 0
    ? customerSpendingValues.reduce((sum: number, customer: CustomerSpending) => sum + (customer.totalSpent || 0), 0) / customerSpendingValues.length
    : 0;

  return {
    // Basic metrics
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    lowStockProducts,
    outOfStockProducts,
    uniqueCustomers,
    newCustomers,
    
    // Advanced metrics
    averageOrderValue,
    avgCustomerLifetimeValue,
    
    // Changes from previous period
    revenueChange,
    ordersChange,
    aovChange,
    
    // Trends
    dailyRevenue,
    weeklyRevenue,
    
    // Product insights
    topProducts,
    
    // Customer insights
    topCustomers,
    
    // Order insights
    recentOrders,
    statusDistribution,
    revenueByStatus,
    
    // Time range info
    timeRange: {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      days: periodDays
    }
  };
}

function aggregateWeekly(dailyAnalytics: DailyAnalytic[]) {
  const weeklyData = new Map();
  
  dailyAnalytics.forEach(day => {
    const date = new Date(day.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];
    
    const existing = weeklyData.get(weekKey) || { 
      week: weekKey, 
      revenue: 0, 
      orders: 0, 
      customers: 0 
    };
    existing.revenue += day.total_revenue || 0;
    existing.orders += day.total_orders || 0;
    existing.customers += day.unique_customers || 0;
    weeklyData.set(weekKey, existing);
  });
  
  return Array.from(weeklyData.values()).sort((a, b) => a.week.localeCompare(b.week));
}