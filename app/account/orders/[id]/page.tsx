'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Package, Truck, CheckCircle, Clock, AlertCircle, ArrowLeft, MapPin, CreditCard, Calendar } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'
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
  updated_at: string
  payment_method: string
  payment_status: string
  shipping_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  billing_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  notes?: string
  items: OrderItem[]
}

const ORDER_STATUS_CONFIG = {
  pending: { 
    icon: Clock, 
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
    label: 'Pending',
    description: 'Your order is being processed'
  },
  processing: { 
    icon: Package, 
    color: 'text-blue-600 bg-blue-50 border-blue-200', 
    label: 'Processing',
    description: 'Your order is being prepared for shipment'
  },
  shipped: { 
    icon: Truck, 
    color: 'text-purple-600 bg-purple-50 border-purple-200', 
    label: 'Shipped',
    description: 'Your order is on its way'
  },
  delivered: { 
    icon: CheckCircle, 
    color: 'text-green-600 bg-green-50 border-green-200', 
    label: 'Delivered',
    description: 'Your order has been delivered'
  },
  cancelled: { 
    icon: AlertCircle, 
    color: 'text-red-600 bg-red-50 border-red-200', 
    label: 'Cancelled',
    description: 'This order has been cancelled'
  }
}

function OrderDetailsContent() {
  const router = useRouter()
  const params = useParams()
  const { user, profile } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderId = params.id as string

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !profile || !orderId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/orders?customer_id=${profile.id}`)
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to fetch order')
        }

        const orders = result.data || []
        const foundOrder = orders.find((o: Order) => o.id === orderId)
        
        if (!foundOrder) {
          throw new Error('Order not found')
        }

        setOrder(foundOrder)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [user, profile, orderId])

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
              Please sign in to view your order details.
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
            onClick={() => router.push('/account/orders')}
            className="flex items-center gap-2 text-label-secondary hover:text-label-primary transition-colors"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-label-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                Loading order details...
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-label-primary mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              Error Loading Order
            </h3>
            <p className="text-label-secondary mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              {error}
            </p>
            <Button
              onClick={() => router.push('/account/orders')}
              variant="outline"
            >
              Back to Orders
            </Button>
          </div>
        )}

        {/* Order Details */}
        {!loading && !error && order && (
          <div className="space-y-8">
            {/* Order Header */}
            <div className="bg-fill-secondary border border-separator rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-label-primary mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Order #{order.order_number}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${ORDER_STATUS_CONFIG[order.status].color}`}>
                      {(() => {
                        const StatusIcon = ORDER_STATUS_CONFIG[order.status].icon
                        return <StatusIcon className="w-4 h-4" />
                      })()}
                      {ORDER_STATUS_CONFIG[order.status].label}
                    </div>
                    <span className="text-sm text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      {ORDER_STATUS_CONFIG[order.status].description}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    ${order.total_amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    {order.currency.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-separator">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-label-secondary" />
                  <div>
                    <p className="text-sm font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      Order Date
                    </p>
                    <p className="text-sm text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-label-secondary" />
                  <div>
                    <p className="text-sm font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      Payment Method
                    </p>
                    <p className="text-sm text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      {order.payment_method.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-label-secondary" />
                  <div>
                    <p className="text-sm font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      Payment Status
                    </p>
                    <p className="text-sm text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      {order.payment_status.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-fill-secondary border border-separator rounded-lg p-6">
              <h2 className="text-lg font-semibold text-label-primary mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                Order Items ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-background rounded-lg">
                    <div className="relative w-16 h-16 bg-fill-tertiary rounded-md overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-fill-tertiary flex items-center justify-center">
                          <Package className="w-8 h-8 text-label-secondary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-label-primary mb-1" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        {item.product_name}
                      </h3>
                      <div className="flex gap-3 text-sm text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        <span>Color: {item.color}</span>
                        <span>Size: {item.size}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-separator">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Total
                  </span>
                  <span className="text-lg font-bold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping & Billing Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-fill-secondary border border-separator rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-label-secondary" />
                  <h2 className="text-lg font-semibold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Shipping Address
                  </h2>
                </div>
                <div className="text-sm text-label-secondary space-y-1" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  <p>{order.shipping_address.street}</p>
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-fill-secondary border border-separator rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-label-secondary" />
                  <h2 className="text-lg font-semibold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Billing Address
                  </h2>
                </div>
                <div className="text-sm text-label-secondary space-y-1" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  <p>{order.billing_address.street}</p>
                  <p>
                    {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                  </p>
                  <p>{order.billing_address.country}</p>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-fill-secondary border border-separator rounded-lg p-6">
                <h2 className="text-lg font-semibold text-label-primary mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  Order Notes
                </h2>
                <p className="text-sm text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default function OrderDetailsPage() {
  return (
    <SupabaseAuthProvider>
      <OrderDetailsContent />
    </SupabaseAuthProvider>
  )
}