'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Package, Truck, CheckCircle, Clock, AlertCircle, ArrowLeft, Eye } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth, SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'
import { useToastActions } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  price: number
  color: string
  size: string
  image_url?: string
}

interface Order {
  id: string
  order_number: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  currency: string
  created_at: string
  payment_method: string
  shipping_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  items: OrderItem[]
}

const ORDER_STATUS_CONFIG = {
  pending: { 
    icon: Clock, 
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
    label: 'Pending' 
  },
  processing: { 
    icon: Package, 
    color: 'text-blue-600 bg-blue-50 border-blue-200', 
    label: 'Processing' 
  },
  shipped: { 
    icon: Truck, 
    color: 'text-purple-600 bg-purple-50 border-purple-200', 
    label: 'Shipped' 
  },
  delivered: { 
    icon: CheckCircle, 
    color: 'text-green-600 bg-green-50 border-green-200', 
    label: 'Delivered' 
  },
  cancelled: { 
    icon: AlertCircle, 
    color: 'text-red-600 bg-red-50 border-red-200', 
    label: 'Cancelled' 
  }
}

function OrderHistoryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()
  const { success } = useToastActions()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for new order notification
  useEffect(() => {
    const newOrderNumber = searchParams.get('new_order')
    if (newOrderNumber) {
      success('Order placed successfully!', `Your order #${newOrderNumber} has been created`)
      // Remove the query parameter from URL
      const url = new URL(window.location.href)
      url.searchParams.delete('new_order')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, success])

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !profile) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/orders?customer_id=${profile.id}`)
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to fetch orders')
        }

        setOrders(result.data || [])
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, profile])

  // Redirect to sign in if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-label-primary mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              Sign In Required
            </h2>
            <p className="text-label-secondary mb-6" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              Please sign in to view your order history.
            </p>
            <Button
              onClick={() => router.push('/signin')}
              className="bg-label-primary text-white hover:bg-opacity-90"
            >
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-label-secondary hover:text-label-primary transition-colors"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Order History
          </h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-label-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                Loading orders...
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-label-primary mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              Error Loading Orders
            </h3>
            <p className="text-label-secondary mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-label-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-label-primary mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              No Orders Yet
            </h3>
            <p className="text-label-secondary mb-6" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button
              onClick={() => router.push('/products')}
              className="bg-label-primary text-white hover:bg-opacity-90"
            >
              Start Shopping
            </Button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = ORDER_STATUS_CONFIG[order.status]
              const StatusIcon = statusConfig.icon

              return (
                <div key={order.id} className="bg-fill-secondary border border-separator rounded-lg p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        Order #{order.order_number}
                      </h3>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig.label}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-background rounded-lg">
                        <div className="relative w-12 h-12 bg-fill-tertiary rounded-md overflow-hidden">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-fill-tertiary flex items-center justify-center">
                              <Package className="w-6 h-6 text-label-secondary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                            {item.product_name}
                          </h4>
                          <div className="flex gap-2 text-xs text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                            <span>{item.color}</span>
                            <span>•</span>
                            <span>{item.size}</span>
                            <span>•</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="flex items-center justify-between pt-4 border-t border-separator">
                    <div className="text-sm text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      <p>Payment: {order.payment_method.replace('_', ' ').toUpperCase()}</p>
                      <p>
                        Shipping: {order.shipping_address.city}, {order.shipping_address.state}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/account/orders/${order.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default function OrderHistoryPage() {
  return (
    <SupabaseAuthProvider>
      <OrderHistoryContent />
    </SupabaseAuthProvider>
  )
}