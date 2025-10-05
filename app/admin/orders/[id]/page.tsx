'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import PageTransition, { StaggerContainer, StaggerItem, HoverCard, LoadingSpinner } from '@/components/admin/PageTransition';
import { Order } from '@/lib/admin/data';
import { ArrowLeft, Package, User, MapPin, CreditCard, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const adminSession = sessionStorage.getItem('adminAuth');
      if (!adminSession) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          'x-admin-session': adminSession,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem('adminAuth');
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to load order');
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: Order['status']) => {
    try {
      setUpdating(true);
      setError(null);
      
      const adminSession = sessionStorage.getItem('adminAuth');
      if (!adminSession) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': adminSession,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem('adminAuth');
          router.push('/admin/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order status');
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailableStatusTransitions = (currentStatus: Order['status']): Order['status'][] => {
    switch (currentStatus) {
      case 'pending':
        return ['processing', 'cancelled'];
      case 'processing':
        return ['shipped', 'cancelled'];
      case 'shipped':
        return ['delivered'];
      case 'delivered':
      case 'cancelled':
        return [];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <LoadingSpinner size={48} className="mx-auto mb-4" />
            <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600 dark:text-gray-400">Loading order...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-red-600 dark:text-red-400 text-xl mb-4">Error</div>
            <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin/orders')}
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              Back to Orders
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageTransition>
        <div className="space-y-6">
          <StaggerContainer>
            {/* Header */}
            <StaggerItem>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.push('/admin/orders')}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                  >
                    <ArrowLeft className="h-5 w-5 mr-1" />
                    Back
                  </button>
                  <h1 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-3xl font-bold text-gray-900 dark:text-white">
                    Order #{order?.id}
                  </h1>
                </div>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order?.status || 'pending')}`}>
                  {getStatusIcon(order?.status || 'pending')}
                  <span style={{ fontFamily: 'Gilroy, sans-serif' }} className="ml-2 capitalize">{order?.status}</span>
                </div>
              </div>
            </StaggerItem>

            {/* Error Message */}
            {error && (
              <StaggerItem>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              </StaggerItem>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Items */}
                <StaggerItem>
                  <HoverCard className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
                    <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Order Items
                    </h3>
                    <div className="space-y-4">
                      {order?.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex-1">
                            <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-medium text-gray-900 dark:text-white">{item.productName}</h4>
                            <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span>Size: {item.size}</span>
                              <span className="mx-2">•</span>
                              <span>Color: {item.color}</span>
                              <span className="mx-2">•</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-medium text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</div>
                            <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm text-gray-600 dark:text-gray-400">${item.price.toFixed(2)} each</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 mt-4 pt-4">
                      <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="flex justify-between items-center text-lg font-medium text-gray-900 dark:text-white">
                        <span>Total</span>
                        <span>${order?.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>

                {/* Status Update */}
                <StaggerItem>
                  <HoverCard className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
                    <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-lg font-medium text-gray-900 dark:text-white mb-4">Update Order Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableStatusTransitions(order?.status || 'pending').map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(status)}
                          disabled={updating}
                          className="flex items-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
                          style={{ fontFamily: 'Gilroy, sans-serif' }}
                        >
                          {getStatusIcon(status)}
                          <span className="ml-2 capitalize">
                            {updating ? 'Updating...' : `Mark as ${status}`}
                          </span>
                        </button>
                      ))}
                    </div>
                    {getAvailableStatusTransitions(order?.status || 'pending').length === 0 && (
                      <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600 dark:text-gray-400">No status updates available for this order.</p>
                    )}
                  </HoverCard>
                </StaggerItem>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Customer Information */}
                <StaggerItem>
                  <HoverCard className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
                    <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Customer
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</div>
                        <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-900 dark:text-white">{order?.customerName}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</div>
                        <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-900 dark:text-white">{order?.customerEmail}</div>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>

                {/* Shipping Address */}
                <StaggerItem>
                  <HoverCard className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
                    <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Shipping Address
                    </h3>
                    <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-900 dark:text-white">
                      <div>{order?.shippingAddress.street}</div>
                      <div>
                        {order?.shippingAddress.city}, {order?.shippingAddress.state} {order?.shippingAddress.zipCode}
                      </div>
                      <div>{order?.shippingAddress.country}</div>
                    </div>
                  </HoverCard>
                </StaggerItem>

                {/* Order Information */}
                <StaggerItem>
                  <HoverCard className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
                    <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Order Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</div>
                        <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-900 dark:text-white font-mono text-sm">{order?.id}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Date</div>
                        <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-900 dark:text-white">
                          {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</div>
                        <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-900 dark:text-white">
                          {order?.updatedAt ? new Date(order.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount</div>
                        <div style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-900 dark:text-white text-lg font-medium">${order?.total.toFixed(2)}</div>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              </div>
            </div>
          </StaggerContainer>
        </div>
      </PageTransition>
    </AdminLayout>
  );
}