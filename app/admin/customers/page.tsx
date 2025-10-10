'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Filter, UserPlus, Mail, Phone, MapPin, Eye, Edit, Trash2, X, Calendar, ShoppingBag, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { useToastActions } from '@/hooks/useToast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
  status: 'active' | 'inactive' | 'deleted';
  gender?: string;
  date_of_birth?: string;
  last_order_date?: string;
}

interface CustomerAddress {
  id: string;
  customer_id: string;
  type: 'shipping' | 'billing';
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface CustomersApiResponse {
  customers: Customer[];
  totalPages: number;
  total: number;
}

function CustomersPageContent() {
  const { success, error: showError } = useToastActions();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);
  
  // Edit form state
  const [editForm, setEditForm] = useState<Customer | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    loadCustomers();
  }, [currentPage, searchTerm, filterStatus]);

  // Set up real-time subscriptions for customers
  useEffect(() => {
    const customersSubscription = supabase
      .channel('customers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customer_profiles' },
        (payload) => {
          console.log('Customer change detected:', payload);
          
          // Invalidate customers cache
          cache.invalidatePattern('customers:');
          
          if (payload.eventType === 'INSERT') {
            const newCustomer = payload.new as Customer;
            setCustomers(prevCustomers => [newCustomer, ...prevCustomers]);
            success('New Customer!', `${newCustomer.first_name} ${newCustomer.last_name} has registered`);
          } else if (payload.eventType === 'UPDATE') {
            const updatedCustomer = payload.new as Customer;
            setCustomers(prevCustomers =>
              prevCustomers.map(customer =>
                customer.id === updatedCustomer.id ? updatedCustomer : customer
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedCustomer = payload.old as Customer;
            setCustomers(prevCustomers =>
              prevCustomers.filter(customer => customer.id !== deletedCustomer.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(customersSubscription);
    };
  }, [])

  const loadCustomers = async (useCache: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      // Auth disabled: do not require a client session

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      });

      const url = `/api/admin/customers?${params}`;
      const cacheKey = CACHE_KEYS.CUSTOMERS(currentPage, searchTerm, filterStatus);
      
      if (useCache) {
        const cachedData = cache.get(cacheKey) as CustomersApiResponse;
        if (cachedData) {
          console.log(`Cache hit for ${cacheKey}`);
          setCustomers(cachedData.customers);
          setTotalPages(cachedData.totalPages);
          setTotalCustomers(cachedData.total);
          setLoading(false);
          return;
        }
      }

      console.log(`Cache miss for ${cacheKey}, fetching from API`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to load customers');
      }

      const data: CustomersApiResponse = await response.json();
      cache.set(cacheKey, data, CACHE_TTL.CUSTOMERS);
      setCustomers(data.customers);
      setTotalPages(data.totalPages);
      setTotalCustomers(data.total);
    } catch (error) {
      console.error('Error loading customers:', error);
      const errorMessage = 'Failed to load customers. Please try again.';
      setError(errorMessage);
      showError('Loading Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/admin/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomerAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Error loading customer details:', error);
    }
  };

  const filteredCustomers = customers;

  // Handler functions
  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await loadCustomerDetails(customer.id);
    setViewModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditForm({ ...customer });
    setEditModalOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setConfirmDeleteOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm || !selectedCustomer) return;
    
    setEditLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const errorMessage = 'Please log in to save changes';
        setError(errorMessage);
        showError('Authentication Required', errorMessage);
        return;
      }

      const response = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      // Reload customers to get updated data
      await loadCustomers();
      
      setEditModalOpen(false);
      setEditForm(null);
      setSelectedCustomer(null);

      // Show success toast
      success('Customer Updated!', `${editForm.first_name} ${editForm.last_name}'s information has been updated`);
    } catch (error) {
      console.error('Error updating customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update customer. Please try again.';
      setError(errorMessage);
      showError('Update Failed', errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const errorMessage = 'Please log in to delete customer';
      setError(errorMessage);
      showError('Authentication Required', errorMessage);
        return;
      }

      const response = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }

      // Reload customers to get updated data
      await loadCustomers();
      
      setConfirmDeleteOpen(false);
      setSelectedCustomer(null);

      // Show success toast
      success('Customer Deleted!', `${selectedCustomer.first_name} ${selectedCustomer.last_name} has been removed from the system`);
    } catch (error) {
      console.error('Error deleting customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete customer. Please try again.';
      setError(errorMessage);
      showError('Delete Failed', errorMessage);
    }
  };

  const closeModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setConfirmDeleteOpen(false);
    setSelectedCustomer(null);
    setEditForm(null);
    setCustomerAddresses([]);
  };

  const getFullName = (customer: Customer) => {
    return `${customer.first_name} ${customer.last_name}`.trim();
  };

  const getFullAddress = (customer: Customer) => {
    const parts = [customer.address, customer.city, customer.postal_code, customer.country].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-white">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-white/60">
              Manage your customer base and view customer details ({totalCustomers} total)
            </p>
          </div>
          <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-white/80 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Customer
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-white/20 bg-black text-white rounded-lg w-full focus:ring-2 focus:ring-white/40 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-white/60" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="border border-white/20 bg-black text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-white/40 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-black rounded-lg border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-white/60" />
                <p className="text-white/60">Loading customers...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-black divide-y divide-white/10">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium">{getFullName(customer)}</div>
                          <div className="text-sm text-white/60">
                            Joined {new Date(customer.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-white/60" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center text-sm text-white/60">
                              <Phone className="h-3 w-3 mr-1 text-white/60" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex items-center text-sm text-white/60">
                              <MapPin className="h-3 w-3 mr-1 text-white/60" />
                              {getFullAddress(customer)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {customer.total_orders || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ${(customer.total_spent || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.status === 'active'
                            ? 'bg-green-400/10 text-green-400'
                            : customer.status === 'inactive'
                            ? 'bg-yellow-400/10 text-yellow-400'
                            : 'bg-red-400/10 text-red-400'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewCustomer(customer)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
                            title="View customer details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCustomer(customer)}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors"
                            title="Edit customer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Delete customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <UserPlus className="mx-auto h-12 w-12 text-white/60" />
              <h3 className="mt-2 text-sm font-medium">No customers found</h3>
              <p className="mt-1 text-sm text-white/60">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first customer.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCustomers)} of {totalCustomers} customers
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-white/20 text-white rounded hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-white/20 text-white rounded hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* View Customer Modal */}
        {viewModalOpen && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-black border border-white/20 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Customer Details</h2>
                <button 
                  onClick={closeModals}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-white/60">Name</label>
                        <p className="text-white">{getFullName(selectedCustomer)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-white/60">Email</label>
                        <p className="text-white">{selectedCustomer.email}</p>
                      </div>
                      {selectedCustomer.phone && (
                        <div>
                          <label className="text-sm text-white/60">Phone</label>
                          <p className="text-white">{selectedCustomer.phone}</p>
                        </div>
                      )}
                      {selectedCustomer.date_of_birth && (
                        <div>
                          <label className="text-sm text-white/60">Date of Birth</label>
                          <p className="text-white">{new Date(selectedCustomer.date_of_birth).toLocaleDateString()}</p>
                        </div>
                      )}
                      {selectedCustomer.gender && (
                        <div>
                          <label className="text-sm text-white/60">Gender</label>
                          <p className="text-white capitalize">{selectedCustomer.gender}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-white/60" />
                        <div>
                          <label className="text-sm text-white/60">Join Date</label>
                          <p className="text-white">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-white/60" />
                        <div>
                          <label className="text-sm text-white/60">Total Orders</label>
                          <p className="text-white">{selectedCustomer.total_orders || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-white/60" />
                        <div>
                          <label className="text-sm text-white/60">Total Spent</label>
                          <p className="text-white">${(selectedCustomer.total_spent || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      {selectedCustomer.last_order_date && (
                        <div>
                          <label className="text-sm text-white/60">Last Order</label>
                          <p className="text-white">{new Date(selectedCustomer.last_order_date).toLocaleDateString()}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm text-white/60">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedCustomer.status === 'active' 
                            ? 'bg-green-400/10 text-green-400' 
                            : selectedCustomer.status === 'inactive'
                            ? 'bg-yellow-400/10 text-yellow-400'
                            : 'bg-red-400/10 text-red-400'
                        }`}>
                          {selectedCustomer.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                {customerAddresses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Addresses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customerAddresses.map((address) => (
                        <div key={address.id} className="p-4 border border-white/10 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white capitalize">{address.type}</span>
                            {address.is_default && (
                              <span className="text-xs bg-blue-400/10 text-blue-400 px-2 py-1 rounded">Default</span>
                            )}
                          </div>
                          <div className="text-sm text-white/80">
                            <p>{address.address_line_1}</p>
                            {address.address_line_2 && <p>{address.address_line_2}</p>}
                            <p>{address.city}, {address.state} {address.postal_code}</p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {editModalOpen && editForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-black border border-white/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Edit Customer</h2>
                <button 
                  onClick={closeModals}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">First Name</label>
                      <input
                        type="text"
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                        className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                        className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'inactive' | 'deleted' })}
                        className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Gender</label>
                      <select
                        value={editForm.gender || ''}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Address</label>
                      <input
                        type="text"
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">City</label>
                      <input
                        type="text"
                        value={editForm.city || ''}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={editForm.postal_code || ''}
                        onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                        className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Country</label>
                      <input
                        type="text"
                        value={editForm.country || ''}
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        className="w-full px-3 py-2 border border-white/20 bg-black text-white rounded-lg focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {editLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDeleteOpen}
          title="Delete Customer"
          message={selectedCustomer ? `Are you sure you want to delete ${getFullName(selectedCustomer)}? This action will mark the customer as deleted but preserve their order history.` : ''}
          confirmText="Delete Customer"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteOpen(false)}
          variant="danger"
        />
      </div>
    </AdminLayout>
  );
}

export default function CustomersPage() {
  return <CustomersPageContent />;
}