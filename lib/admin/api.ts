// Utility functions for admin API calls without authentication
import { cache } from '@/lib/cache';
import { ProductFormData, Product, Order, OrderUpdateData, Customer, AnalyticsData, ApiResponse } from '@/lib/types/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  // Auth removed: return basic JSON headers only
  return {
    'Content-Type': 'application/json'
  };
}

export async function adminFetch(url: string, options: RequestInit = {}) {
  const authHeaders = await getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // No auth: treat 401 like normal error

  // Return the raw response object so calling code can check response.ok
  return response;
}

// Cached version of adminFetch for GET requests
export async function adminFetchCached(url: string, cacheKey: string, ttl: number, options: RequestInit = {}) {
  // For non-GET requests, bypass cache
  if (options.method && options.method !== 'GET') {
    const response = await adminFetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for ${cacheKey}`);
    return cachedData;
  }

  // Fetch from API and cache the result
  console.log(`Cache miss for ${cacheKey}, fetching from API`);
  const response = await adminFetch(url, options);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  cache.set(cacheKey, data, ttl);
  
  return data;
}

// Specific API functions
export const adminAPI = {
  // Products
  getProducts: async (): Promise<{ products: Product[] }> => {
    const response = await adminFetch('/api/admin/products');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  createProduct: async (data: Partial<ProductFormData>): Promise<ApiResponse<Product>> => {
    const response = await adminFetch('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<ApiResponse<Product>> => {
    const response = await adminFetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  deleteProduct: async (id: string): Promise<ApiResponse> => {
    const response = await adminFetch(`/api/admin/products/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const response = await adminFetch('/api/admin/orders');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  updateOrder: async (id: string, data: OrderUpdateData): Promise<ApiResponse<Order>> => {
    const response = await adminFetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  // Analytics
  getAnalytics: async (timeRange?: string): Promise<AnalyticsData> => {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    const response = await adminFetch(`/api/admin/analytics/overview${params}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  getCustomers: async (): Promise<Customer[]> => {
    const response = await adminFetch('/api/admin/customers');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
};