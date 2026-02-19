import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AnalyticsData } from "@/lib/types/api";

function formatDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function getWeekKey(date: Date) {
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diffDays = Math.floor((date.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.floor(diffDays / 7) + 1;
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function sumByStatus(orders: Array<{ status: string; totalAmount: number }>) {
  const totals: Record<string, number> = {};
  for (const order of orders) {
    totals[order.status] = (totals[order.status] || 0) + order.totalAmount;
  }
  return totals;
}

function countByStatus(orders: Array<{ status: string }>) {
  const counts: Record<string, number> = {};
  for (const order of orders) {
    counts[order.status] = (counts[order.status] || 0) + 1;
  }
  return counts;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = parseInt(searchParams.get("timeRange") || "30", 10);

    const now = new Date();
    const fromDate = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);

    const [
      products,
      orders,
      recentOrders,
      newCustomers
    ] = await Promise.all([
      prisma.product.findMany({
        select: { id: true, name: true, stock: true, price: true }
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: fromDate, lte: now } },
        include: {
          items: { include: { product: true } },
          user: { include: { profile: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.order.findMany({
        include: {
          items: true,
          user: { include: { profile: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 20
      }),
      prisma.user.count({
        where: {
          role: "customer",
          createdAt: { gte: fromDate, lte: now }
        }
      })
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter((order) => order.status === "pending").length;
    const completedOrders = orders.filter((order) => order.status === "delivered").length;
    const cancelledOrders = orders.filter((order) => order.status === "cancelled").length;

    const lowStockProducts = products.filter((product) => product.stock <= 5 && product.stock > 0).length;
    const outOfStockProducts = products.filter((product) => product.stock === 0).length;

    const uniqueCustomers = new Set(orders.map((order) => order.userId)).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgCustomerLifetimeValue = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    const weeklyMap = new Map<string, { revenue: number; orders: number }>();
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();

    for (const order of orders) {
      const dayKey = formatDateKey(order.createdAt);
      const weekKey = getWeekKey(order.createdAt);
      const monthKey = getMonthKey(order.createdAt);

      dailyMap.set(dayKey, {
        revenue: (dailyMap.get(dayKey)?.revenue || 0) + order.totalAmount,
        orders: (dailyMap.get(dayKey)?.orders || 0) + 1
      });

      weeklyMap.set(weekKey, {
        revenue: (weeklyMap.get(weekKey)?.revenue || 0) + order.totalAmount,
        orders: (weeklyMap.get(weekKey)?.orders || 0) + 1
      });

      monthlyMap.set(monthKey, {
        revenue: (monthlyMap.get(monthKey)?.revenue || 0) + order.totalAmount,
        orders: (monthlyMap.get(monthKey)?.orders || 0) + 1
      });
    }

    const dailyRevenue = Array.from(dailyMap.entries())
      .map(([date, value]) => ({ date, revenue: value.revenue, orders: value.orders }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const weeklyRevenue = Array.from(weeklyMap.entries())
      .map(([week, value]) => ({ week, revenue: value.revenue, orders: value.orders }))
      .sort((a, b) => a.week.localeCompare(b.week));

    const monthlyRevenue = Array.from(monthlyMap.entries())
      .map(([month, value]) => ({ month, revenue: value.revenue, orders: value.orders }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const productTotals = new Map<string, { productName: string; totalSold: number; revenue: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        const entry = productTotals.get(item.productId) || {
          productName: item.product?.name || "Unknown",
          totalSold: 0,
          revenue: 0
        };

        entry.totalSold += item.quantity;
        entry.revenue += item.price * item.quantity;
        productTotals.set(item.productId, entry);
      }
    }

    const topProducts = Array.from(productTotals.entries())
      .map(([productId, entry]) => ({
        productId,
        productName: entry.productName,
        totalSold: entry.totalSold,
        revenue: entry.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const recentOrdersPayload = recentOrders.map((order) => {
      const profile = order.user?.profile;
      const customerName = profile
        ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || profile.email || "Unknown"
        : order.user?.email || "Unknown";

      return {
        id: order.id,
        orderNumber: order.id,
        customerName,
        customerEmail: profile?.email || order.user?.email || "",
        total: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        itemCount: order.items.length
      };
    });

    const analytics: AnalyticsData = {
      totalProducts: products.length,
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      lowStockProducts,
      outOfStockProducts,
      uniqueCustomers,
      newCustomers,
      averageOrderValue,
      avgCustomerLifetimeValue,
      revenueChange: 0,
      ordersChange: 0,
      aovChange: 0,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      topProducts,
      topCustomers: [],
      recentOrders: recentOrdersPayload,
      statusDistribution: countByStatus(orders),
      revenueByStatus: sumByStatus(orders),
      timeRange: {
        from: fromDate.toISOString(),
        to: now.toISOString(),
        days: timeRange
      }
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
