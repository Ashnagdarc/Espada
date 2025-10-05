'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/admin/data';
import { adminAPI } from '@/lib/admin/api';
import ProductForm from './ProductForm';
import PageTransition, { StaggerContainer, StaggerItem, HoverScale, LoadingSpinner } from './PageTransition';
import ConfirmDialog, { Toast } from './ConfirmDialog';
import { Edit, Trash2, Plus, Search, Filter, Star } from 'lucide-react';

interface ProductListProps {
  onProductUpdate?: () => void;
}

export default function ProductList({ onProductUpdate }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info'; isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'created'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProducts();
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (productData: any) => {
    try {
      setIsSubmitting(true);
      const response = await adminAPI.createProduct(productData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      await fetchProducts();
      setShowForm(false);
      onProductUpdate?.();
      showToast('Product created successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      showToast('Failed to create product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return;

    try {
      setIsSubmitting(true);
      const response = await adminAPI.updateProduct(editingProduct.id, productData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      await fetchProducts();
      setShowForm(false);
      setEditingProduct(undefined);
      onProductUpdate?.();
      showToast('Product updated successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      showToast('Failed to update product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setIsSubmitting(true);
    try {
      const response = await adminAPI.deleteProduct(productToDelete.id);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      await fetchProducts();
      setShowDeleteDialog(false);
      setProductToDelete(null);
      onProductUpdate?.();
      showToast('Product deleted successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      showToast('Failed to delete product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={32} />
        <span className="ml-3 text-gray-600">Loading products...</span>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center animate-fade-in">
          <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Products ({filteredAndSortedProducts.length})
          </h2>
          <HoverScale>
            <button
              onClick={() => setShowForm(true)}
              className="admin-button flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </HoverScale>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md animate-bounce-in">
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
        <div className="bg-white p-4 rounded-lg border border-gray-200 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                <option value="created">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stock">Sort by Stock</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="admin-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

      {/* Products Grid */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-gray-500 text-lg" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              {searchTerm || categoryFilter ? 'No products match your filters' : 'No products found'}
            </div>
            {!searchTerm && !categoryFilter && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProducts.map(product => (
            <StaggerItem key={product.id}>
              <HoverScale className="admin-card bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="text-gray-400" style={{ fontFamily: 'Gilroy, sans-serif' }}>No Image</div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-black truncate" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      {product.name}
                    </h3>
                    {product.featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0 ml-2 animate-bounce-in" />
                    )}
                  </div>
                
                <p className="text-gray-600 text-sm mb-2 line-clamp-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Stock: {product.stock}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 mb-3" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {product.category} • {product.sizes.join(', ')}
                </div>
                
                  <div className="flex gap-2">
                    <HoverScale scale={1.1}>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="admin-button flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-black rounded-md hover:bg-gray-50"
                        style={{ fontFamily: 'Gilroy, sans-serif' }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </HoverScale>
                    <HoverScale scale={1.1}>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="admin-button flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </HoverScale>
                  </div>
                </div>
              </HoverScale>
            </StaggerItem>
          ))}
        </StaggerContainer>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <HoverScale>
                    <button
                      onClick={handleCloseForm}
                      className="admin-button text-gray-400 hover:text-gray-600 p-2 rounded-lg"
                    >
                      ×
                    </button>
                  </HoverScale>
                </div>
                <ProductForm
                  product={editingProduct}
                  onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  onCancel={handleCloseForm}
                  isLoading={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Product"
          message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDeleteProduct}
          onCancel={() => {
            setShowDeleteDialog(false);
            setProductToDelete(null);
          }}
          isLoading={isSubmitting}
          variant="danger"
        />

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
      </div>
    </PageTransition>
  );
}