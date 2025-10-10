// Shared TypeScript types for API operations

// Product types
export interface ProductFormData {
  // Basic Info
  name: string
  description: string
  category: string
  sku: string
  tags: string[]
  status: 'draft' | 'published'
  
  // Pricing
  price: number
  compareAtPrice: number
  costPerItem: number
  
  // Inventory
  stock: number
  trackQuantity: boolean
  continueSellingWhenOutOfStock: boolean
  
  // Variants
  sizes: string[]
  colors: string[]
  
  // Media
  images: string[]
  
  // SEO & Details
  metaDescription: string
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  
  // Settings
  featured: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  sizes: string[]
  colors: string[]
  images: string[]
  stock: number
  featured: boolean
  createdAt: string
  updatedAt: string
}

// Order types
export interface OrderItem {
  product_id: string
  product_name: string
  size: string
  color: string
  quantity: number
  price: number
}

export interface ShippingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Order {
  id: string
  customer_id: string
  order_number: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  currency: string
  shipping_address: ShippingAddress
  billing_address: ShippingAddress
  payment_status: string
  payment_method: string
  notes: string
  created_at: string
  updated_at: string
  customer_name?: string
  customer_email?: string
  items?: OrderItem[]
}

export interface OrderUpdateData {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
  payment_status?: string
  shipping_address?: ShippingAddress
  billing_address?: ShippingAddress
}

// Customer types
export interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  country: string
  total_orders: number
  total_spent: number
  created_at: string
  status: 'active' | 'inactive' | 'deleted'
  gender?: string
  date_of_birth?: string
  last_order_date?: string
}

// Analytics types
export interface AnalyticsData {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders?: number
  cancelledOrders?: number
  lowStockProducts: number
  outOfStockProducts?: number
  uniqueCustomers: number
  newCustomers: number
  averageOrderValue: number
  avgCustomerLifetimeValue: number
  revenueChange: number
  ordersChange: number
  aovChange: number
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>
  weeklyRevenue: Array<{ week: string; revenue: number; orders: number }>
  monthlyRevenue?: Array<{ month: string; revenue: number; orders: number }>
  topProducts: Array<{
    productId: string
    productName: string
    totalSold: number
    revenue: number
  }>
  topCustomers?: Array<{
    customerId: string
    customerName: string
    customerEmail: string
    totalSpent: number
    totalOrders: number
    averageOrderValue: number
    lastOrderDate: string
  }>
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    customerEmail: string
    total: number
    status: string
    createdAt: string
    itemCount: number
  }>
  statusDistribution: Record<string, number>
  revenueByStatus: Record<string, number>
  timeRange: {
    from: string
    to: string
    days: number
  }
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}