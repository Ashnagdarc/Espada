'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Eye, ShoppingCart } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { useToastActions } from '@/hooks/useToast'
import { Button } from '@/components/admin/ui/Button'
import { SearchInput } from '@/components/admin/ui/Input'
import Select from '@/components/admin/ui/Select'
import Table from '@/components/admin/ui/Table'
import Card from '@/components/admin/ui/Card'
import { SkeletonTable } from '@/components/admin/ui/Skeleton'
import AdminPage from '@/components/admin/ui/AdminPage'
import PageHeader from '@/components/admin/ui/PageHeader'

// Order interface matching database schema
interface Order {
  id: string
  customer_id: string
  order_number: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  currency: string
  shipping_address: Record<string, unknown>
  billing_address: Record<string, unknown>
  payment_status: string
  payment_method: string
  notes: string
  created_at: string
  updated_at: string
  // Joined fields from customer_profiles
  customer_name?: string
  customer_email?: string
  [key: string]: unknown
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const { success, error: showError } = useToastActions()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isLoading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  // Set up real-time subscriptions for orders
  useEffect(() => {
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Order change detected:', payload);
          
          // Invalidate orders cache
          cache.invalidatePattern('orders:');
          
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders(prevOrders => [newOrder, ...prevOrders]);
            success('New order received!');
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            setOrders(prevOrders =>
              prevOrders.map(order =>
                order.id === updatedOrder.id ? updatedOrder : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedOrder = payload.old as Order;
            setOrders(prevOrders =>
              prevOrders.filter(order => order.id !== deletedOrder.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, [])

  const loadOrders = async (showRefreshToast = false, useCache: boolean = true) => {
    try {
      if (showRefreshToast) setIsRefreshing(true)

      const sessionToken = sessionStorage.getItem('adminAuth')
      const cacheKey = CACHE_KEYS.ORDERS(1, selectedStatus || '')
      
      if (useCache && !showRefreshToast) {
        const cachedData = cache.get(cacheKey) as { orders?: Order[] } | Order[];
        if (cachedData) {
          console.log(`Cache hit for ${cacheKey}`);
          setOrders(Array.isArray(cachedData) ? cachedData : cachedData.orders || []);
          setLoading(false);
          return;
        }
      }

      console.log(`Cache miss for ${cacheKey}, fetching from API`);
      const response = await fetch('/api/admin/orders', {
        headers: {
          'x-admin-session': sessionToken || ''
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json()
      cache.set(cacheKey, responseData, CACHE_TTL.ORDERS);
      setOrders(Array.isArray(responseData) ? responseData : responseData.orders || [])

      if (showRefreshToast) {
        success('Orders refreshed successfully')
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
      showError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order =>
        (order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, selectedStatus])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': sessionStorage.getItem('adminAuth') || ''
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus as Order['status'] }
            : order
        )
      )

      success(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error('Failed to update order status:', error)
      showError('Failed to update order status. Please try again.')
    }
  }



  // Helper functions have been removed as they were unused

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Table columns configuration
  const columns = [
    {
      key: 'order_number',
      title: 'Order Number',
      width: '140px',
      render: (value: unknown, order: Order) => {
        void value
        return (
          <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
            {order.order_number}
          </span>
        )
      }
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (value: unknown, order: Order) => {
        void value
        return (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {order.customer_name || 'Unknown Customer'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {order.customer_email || 'No email'}
            </div>
          </div>
        )
      }
    },
    {
      key: 'date',
      title: 'Date',
      width: '120px',
      render: (value: unknown, order: Order) => {
        void value
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(order.created_at)}
          </span>
        )
      }
    },
    {
      key: 'total',
      title: 'Total',
      width: '100px',
      align: 'right' as const,
      render: (value: unknown, order: Order) => {
        void value
        return (
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(order.total_amount)}
          </span>
        )
      }
    },
    {
      key: 'status',
      title: 'Status',
      width: '140px',
      render: (value: unknown, order: Order) => {
        void value
        return (
          <Select
            value={order.status}
            onChange={(v) => updateOrderStatus(order.id, v as string)}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
          />
        )
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '100px',
      align: 'center' as const,
      render: (value: unknown, order: Order) => {
        void value
        return (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="ghost"
              className="p-2"
              onClick={() => router.push(`/admin/orders/${order.id}`)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    }
  ]

  if (isLoading) {
    return (
      <AdminLayout>
        <AdminPage>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Orders Management</h1>
          </div>
          <SkeletonTable rows={8} />
        </AdminPage>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <AdminPage>
        <PageHeader
          title="Orders Management"
          actions={(
            <Button
              variant="outline"
              onClick={() => loadOrders(true)}
              disabled={isRefreshing}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          )}
        />
        {/* Filters */}
        <Card appearance="panel" className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value as string)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          </div>
        </Card>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <Card appearance="panel" className="p-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-white/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No orders found
            </h3>
            <p className="text-white/60">
              No orders match your current filters.
            </p>
          </Card>
        ) : (
          <Table
            data={filteredOrders}
            columns={columns}
            rowKey="id"
            className="hover:bg-white/5"
          />
        )}
      </AdminPage>
    </AdminLayout>
  )
}