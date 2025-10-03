'use client';

import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, CreditCard, Eye, Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
  shipping_address: any;
  payment_method: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image_url?: string;
}

export function CustomerOrderHistory() {
  const { user, profile, isLoading: authLoading } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchOrders();
    }
  }, [profile?.id]);

  const fetchOrders = async () => {
    if (!profile?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            size,
            color,
            quantity,
            price,
            image_url
          )
        `)
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders = data?.map(order => ({
        ...order,
        items: order.order_items || []
      })) || [];

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load order history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Please sign in to view your order history.</p>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Start shopping to see your order history here.
        </p>
        <Button
          onClick={() => window.location.href = '/products'}
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
        >
          Browse Products
        </Button>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h1>
        <Button
          onClick={fetchOrders}
          variant="outline"
          className="text-gray-600 dark:text-gray-400"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Order #{order.order_number}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(order.created_at)}
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      {formatPrice(order.total_amount)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <Button
                  onClick={() => setSelectedOrder(order)}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center space-x-4 overflow-x-auto">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 min-w-0">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    +{order.items.length - 3} more items
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Order #{selectedOrder.order_number}
                </h2>
                <Button
                  onClick={() => setSelectedOrder(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Order Status</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Placed on {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Items Ordered</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.product_name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Size: {item.size} • Color: {item.color}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatPrice(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 text-gray-600 dark:text-gray-400"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                {selectedOrder.status === 'delivered' && (
                  <Button
                    variant="outline"
                    className="flex-1 text-gray-600 dark:text-gray-400"
                  >
                    Reorder Items
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}