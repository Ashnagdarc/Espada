'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Eye, Package, ShoppingCart, Truck, RefreshCw } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { type Order } from '@/lib/admin/data'
import toast from 'react-hot-toast'
import { Button, IconButton } from '@/components/admin/ui/Button'
import { SearchInput } from '@/components/admin/ui/Input'
import Select from '@/components/admin/ui/Select'
import Table from '@/components/admin/ui/Table'
import { StatusBadge } from '@/components/admin/ui/Badge'
import Card from '@/components/admin/ui/Card'
import { SkeletonTable } from '@/components/admin/ui/Skeleton'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isLoading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setIsRefreshing(true)

      const sessionToken = sessionStorage.getItem('adminAuth')

      const response = await fetch('/api/admin/orders', {
        headers: {
          'x-admin-session': sessionToken || ''
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setOrders(data.orders || data)

      if (showRefreshToast) {
        toast.success('Orders refreshed successfully')
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
      toast.error('Failed to load orders. Please try again.')
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
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, selectedStatus])

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
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
            ? { ...order, status: newStatus }
            : order
        )
      )

      toast.success(`Order status updated to ${newStatus}`)
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast.error('Failed to update order status. Please try again.')
    }
  }

  const handleViewOrder = (orderId: string) => {
    // Navigate to order details page or open modal
    console.log('View order:', orderId)
  }



  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

  // Helper function to get status variant for StatusBadge
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'processing': return 'info'
      case 'shipped': return 'primary'
      case 'delivered': return 'success'
      case 'cancelled': return 'danger'
      default: return 'secondary'
    }
  }

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
      key: 'id',
      title: 'Order ID',
      width: '120px',
      render: (order: Order) => (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
          #{order.id}
        </span>
      )
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (order: Order) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {order.customerName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {order.customerEmail}
          </div>
        </div>
      )
    },
    {
      key: 'date',
      title: 'Date',
      width: '120px',
      render: (order: Order) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(order.date)}
        </span>
      )
    },
    {
      key: 'total',
      title: 'Total',
      width: '100px',
      align: 'right' as const,
      render: (order: Order) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(order.total)}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      width: '140px',
      render: (order: Order) => (
        <Select
          value={order.status}
          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
          size="sm"
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
        />
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '100px',
      align: 'center' as const,
      render: (order: Order) => (
        <div className="flex items-center justify-center space-x-2">
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/orders/${order.id}`)}
            icon={<Eye className="h-4 w-4" />}
            tooltip="View Details"
          />
        </div>
      )
    }
  ]

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Orders Management</h1>
          </div>
          <SkeletonTable rows={8} />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-3xl font-bold">
            Orders Management
          </h1>
          <Button
            variant="outline"
            onClick={() => loadOrders(true)}
            disabled={isRefreshing}
            loading={isRefreshing}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {/* Filters */}
        <Card className="p-4 mb-6 bg-black border border-white/10">
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
              onChange={(e) => setSelectedStatus(e.target.value)}
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
          <Card className="p-12 text-center bg-black border border-white/10">
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
            hover
            striped
          />
        )}
      </div>
    </AdminLayout>
  )
}