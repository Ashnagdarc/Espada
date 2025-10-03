'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/admin/data';
import { Package, Truck, CheckCircle, Clock, AlertCircle, Search, Filter, Eye } from 'lucide-react';

interface OrderListProps {
  onOrderUpdate?: () => void;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  { value: 'processing', label: 'Processing', icon: Package, color: 'text-blue-600 bg-blue-50' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'text-purple-600 bg-purple-50' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  { value: 'cancelled', label: 'Cancelled', icon: AlertCircle, color: 'text-red-600 bg-red-50' }
];

export default function OrderList({ onOrderUpdate }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order status');
      }

      await fetchOrders();
      onOrderUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
          Orders ({filteredAndSortedOrders.length})
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              <option value="date">Sort by Date</option>
              <option value="total">Sort by Total</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            {searchTerm || statusFilter ? 'No orders match your filters' : 'No orders found'}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedOrders.map(order => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          #{order.id.slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          {order.customerName}
                        </div>
                        <div className="text-sm text-gray-500" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-gray-500" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} total qty
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          ${order.total.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            disabled={updatingStatus === order.id}
                            className={`text-sm rounded-full px-3 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-black ${statusInfo.color}`}
                            style={{ fontFamily: 'Gilroy, sans-serif' }}
                          >
                            {ORDER_STATUSES.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          {updatingStatus === order.id && (
                            <div className="ml-2 w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-black hover:text-gray-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  Order #{selectedOrder.id.slice(-8).toUpperCase()}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold text-black mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>Customer Information</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}><strong>Name:</strong> {selectedOrder.customerName}</p>
                    <p className="text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                    <p className="text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold text-black mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>Shipping Address</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>{selectedOrder.shippingAddress.street}</p>
                    <p className="text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p className="text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold text-black mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md flex justify-between items-center">
                        <div>
                          <p className="font-medium text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>{item.name}</p>
                          <p className="text-sm text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                            Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="font-semibold text-black mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>Order Summary</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Total:</span>
                      <span className="text-lg font-bold text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      Order placed on {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}