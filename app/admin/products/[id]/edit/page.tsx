'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Product } from '@/lib/admin/data';
import { ArrowLeft, Save, X } from 'lucide-react';

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const adminSession = sessionStorage.getItem('adminAuth');
      if (!adminSession) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
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
        throw new Error('Failed to load product');
      }

      const data = await response.json();
      setProduct(data.product);
      setFormData(data.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: 'sizes' | 'colors' | 'images', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(field, items);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const adminSession = sessionStorage.getItem('adminAuth');
      if (!adminSession) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': adminSession,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem('adminAuth');
          router.push('/admin/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      const data = await response.json();
      setProduct(data.product);
      setFormData(data.product);
      
      // Show success message and redirect
      alert('Product updated successfully!');
      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !product) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin/products')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Products
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Product: {product?.name}
            </h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Home">Home</option>
                </select>
              </div>
            </div>

            {/* Pricing and Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Pricing &amp; Inventory</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock || ''}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Product</span>
                </label>
              </div>
            </div>

            {/* Product Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Sizes
                </label>
                <input
                  type="text"
                  value={formData.sizes?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('sizes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="XS, S, M, L, XL"
                />
                <p className="text-xs text-gray-500 mt-1">Separate sizes with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Colors
                </label>
                <input
                  type="text"
                  value={formData.colors?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('colors', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Red, Blue, Green, Black"
                />
                <p className="text-xs text-gray-500 mt-1">Separate colors with commas</p>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URLs
                </label>
                <textarea
                  value={formData.images?.join('\n') || ''}
                  onChange={(e) => handleArrayInputChange('images', e.target.value.replace(/\n/g, ','))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter image URLs, one per line"
                />
                <p className="text-xs text-gray-500 mt-1">Enter one URL per line</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}