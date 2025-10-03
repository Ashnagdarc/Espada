// Utility functions for admin API calls with authentication

function getAuthHeaders(): HeadersInit {
  const sessionToken = sessionStorage.getItem('adminAuth');
  return {
    'Content-Type': 'application/json',
    'x-admin-session': sessionToken || ''
  };
}

export async function adminFetch(url: string, options: RequestInit = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Clear invalid session and redirect to login
    sessionStorage.removeItem('adminAuth');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }

  return response;
}

// Specific API functions
export const adminAPI = {
  // Products
  getProducts: () => adminFetch('/api/admin/products'),
  createProduct: (data: any) => adminFetch('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProduct: (id: string, data: any) => adminFetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteProduct: (id: string) => adminFetch(`/api/admin/products/${id}`, {
    method: 'DELETE'
  }),

  // Orders
  getOrders: () => adminFetch('/api/admin/orders'),
  updateOrder: (id: string, data: any) => adminFetch(`/api/admin/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Analytics
  getAnalytics: () => adminFetch('/api/admin/analytics/overview'),
  getCustomers: () => adminFetch('/api/admin/customers')
};