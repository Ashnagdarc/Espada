'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Filter, UserPlus, Mail, Phone, MapPin } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  orders: number;
  totalSpent: number;
  joinDate: string;
  status: 'active' | 'inactive';
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading customers data
    setTimeout(() => {
      const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main St, New York, NY 10001',
          orders: 5,
          totalSpent: 1250.00,
          joinDate: '2024-01-15',
          status: 'active'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1 (555) 987-6543',
          address: '456 Oak Ave, Los Angeles, CA 90210',
          orders: 3,
          totalSpent: 875.50,
          joinDate: '2024-02-20',
          status: 'active'
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          phone: '+1 (555) 456-7890',
          address: '789 Pine Rd, Chicago, IL 60601',
          orders: 1,
          totalSpent: 299.99,
          joinDate: '2024-03-10',
          status: 'inactive'
        }
      ];
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 text-white">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-white/60">Manage your customer base and view customer details</p>
          </div>
          <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-white/80 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Customer
          </button>
        </div>

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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto"></div>
              <p className="mt-2 text-white/60">Loading customers...</p>
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
                          <div className="text-sm font-medium">{customer.name}</div>
                          <div className="text-sm text-white/60">Joined {new Date(customer.joinDate).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-white/60" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-sm text-white/60">
                            <Phone className="h-3 w-3 mr-1 text-white/60" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center text-sm text-white/60">
                            <MapPin className="h-3 w-3 mr-1 text-white/60" />
                            {customer.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {customer.orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ${customer.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${customer.status === 'active'
                            ? 'bg-white/10 text-white'
                            : 'bg-white/10 text-white'
                          }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-white/80 hover:text-white mr-3">
                          View
                        </button>
                        <button className="text-white/80 hover:text-white mr-3">
                          Edit
                        </button>
                        <button className="text-white/80 hover:text-white">
                          Delete
                        </button>
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
      </div>
    </AdminLayout>
  );
}