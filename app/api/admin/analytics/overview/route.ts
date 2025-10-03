import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withStackAdminAuth } from '@/lib/auth/stack-admin-middleware';

export const GET = withStackAdminAuth(async (request, admin) => {
  try {

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

    // Fetch products data
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*');

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Fetch orders data with date filtering
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price,
          size,
          color
        ),
        customer_profiles (
          id,
          email,
          first_name,
          last_name,
          created_at
        )
      `)
      .gte('created_at', fromDate.toISOString())
      .lte('created_at', toDate.toISOString())
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Fetch all orders for customer lifetime value calculation
    const { data: allOrders, error: allOrdersError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer_profiles (
          id,
          email,
          created_at
        )
      `);

    if (allOrdersError) {
      console.error('Error fetching all orders:', allOrdersError);
      return NextResponse.json({ error: 'Failed to fetch all orders' }, { status: 500 });
    }

    // Calculate comprehensive analytics
    const analytics = calculateEnhancedAnalytics(products || [], orders || [], allOrders || [], fromDate, toDate);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

function calculateEnhancedAnalytics(products: any[], orders: any[], allOrders: any[], fromDate: Date, toDate: Date) {
  // Basic metrics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || order.total || 0), 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const lowStockProducts = products.filter(product => (product.stock || 0) < 10).length;

  // Calculate previous period for comparison
  const periodDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousFromDate = new Date(fromDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const previousToDate = fromDate;

  const previousOrders = allOrders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= previousFromDate && orderDate < previousToDate;
  });

  const previousRevenue = previousOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || order.total || 0), 0);
  const previousOrderCount = previousOrders.length;

  // Calculate percentage changes
  const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const ordersChange = previousOrderCount > 0 ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 : 0;

  // Average Order Value
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;
  const aovChange = previousAOV > 0 ? ((averageOrderValue - previousAOV) / previousAOV) * 100 : 0;

  // Customer metrics
  const uniqueCustomers = new Set(orders.filter(o => o.customer_id).map(o => o.customer_id)).size;
  const newCustomers = orders.filter(order => {
    if (!order.customer_profiles) return false;
    const customerCreatedAt = new Date(order.customer_profiles.created_at);
    return customerCreatedAt >= fromDate && customerCreatedAt <= toDate;
  }).length;

  // Customer Lifetime Value (simplified)
  const customerRevenue = new Map();
  allOrders.forEach(order => {
    if (order.customer_id) {
      const current = customerRevenue.get(order.customer_id) || 0;
      customerRevenue.set(order.customer_id, current + parseFloat(order.total_amount || order.total || 0));
    }
  });
  const avgCustomerLifetimeValue = customerRevenue.size > 0 
    ? Array.from(customerRevenue.values()).reduce((sum, val) => sum + val, 0) / customerRevenue.size 
    : 0;

  // Daily revenue trend (last 30 days)
  const dailyRevenue = calculateDailyTrend(orders, fromDate, toDate);
  
  // Weekly revenue trend
  const weeklyRevenue = calculateWeeklyTrend(orders, fromDate, toDate);

  // Monthly revenue trend (last 12 months)
  const monthlyRevenue = calculateMonthlyTrend(allOrders);

  // Top selling products
  const productSales = new Map();
  orders.forEach(order => {
    if (order.order_items) {
      order.order_items.forEach((item: any) => {
        const existing = productSales.get(item.product_id) || { 
          name: item.product_name, 
          quantity: 0, 
          revenue: 0 
        };
        existing.quantity += item.quantity;
        existing.revenue += parseFloat(item.price) * item.quantity;
        productSales.set(item.product_id, existing);
      });
    }
  });

  const topProducts = Array.from(productSales.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      totalSold: data.quantity,
      revenue: data.revenue
    }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  // Recent orders
  const recentOrders = orders
    .slice(0, 10)
    .map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      total: parseFloat(order.total_amount || order.total || 0),
      status: order.status,
      createdAt: order.created_at,
      itemCount: order.order_items?.length || 0
    }));

  // Order status distribution
  const statusDistribution = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Revenue by status
  const revenueByStatus = calculateRevenueByStatus(orders);

  return {
    // Basic metrics
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    lowStockProducts,
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
    monthlyRevenue,
    
    // Product insights
    topProducts,
    
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

function calculateDailyTrend(orders: any[], fromDate: Date, toDate: Date) {
  const dailyData = new Map();
  
  // Initialize all days with 0
  const currentDate = new Date(fromDate);
  while (currentDate <= toDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    dailyData.set(dateKey, { date: dateKey, revenue: 0, orders: 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Aggregate actual data
  orders.forEach(order => {
    const orderDate = new Date(order.created_at).toISOString().split('T')[0];
    const existing = dailyData.get(orderDate);
    if (existing) {
      existing.revenue += parseFloat(order.total_amount || order.total || 0);
      existing.orders += 1;
    }
  });
  
  return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function calculateWeeklyTrend(orders: any[], fromDate: Date, toDate: Date) {
  const weeklyData = new Map();
  
  orders.forEach(order => {
    const orderDate = new Date(order.created_at);
    const weekStart = new Date(orderDate);
    weekStart.setDate(orderDate.getDate() - orderDate.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];
    
    const existing = weeklyData.get(weekKey) || { week: weekKey, revenue: 0, orders: 0 };
    existing.revenue += parseFloat(order.total_amount || order.total || 0);
    existing.orders += 1;
    weeklyData.set(weekKey, existing);
  });
  
  return Array.from(weeklyData.values()).sort((a, b) => a.week.localeCompare(b.week));
}

function calculateMonthlyTrend(orders: any[]) {
  const monthlyData = new Map();
  
  orders.forEach(order => {
    const orderDate = new Date(order.created_at);
    const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    
    const existing = monthlyData.get(monthKey) || { month: monthKey, revenue: 0, orders: 0 };
    existing.revenue += parseFloat(order.total_amount || order.total || 0);
    existing.orders += 1;
    monthlyData.set(monthKey, existing);
  });
  
  return Array.from(monthlyData.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Last 12 months
}

function calculateRevenueByStatus(orders: any[]) {
  return orders.reduce((acc, order) => {
    const status = order.status;
    acc[status] = (acc[status] || 0) + parseFloat(order.total_amount || order.total || 0);
    return acc;
  }, {} as Record<string, number>);
}