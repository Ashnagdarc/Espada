'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Product } from '@/lib/admin/data';
import { ArrowLeft, Save, X, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageErrors, setImageErrors] = useState<{ [key: number]: string }>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (formData.images) {
      setImageUrls(formData.images);
    }
  }, [formData.images]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.push('/signin?redirect=/admin');
        return;
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await supabase.auth.signOut();
          router.push('/signin?redirect=/admin');
          return;
        }
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error('Failed to load product');
      }

      const data = await response.json();
      setProduct(data.product);
      setFormData(data.product);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error: Please check your internet connection and try again');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Product, value: Product[keyof Product]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: 'sizes' | 'colors', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(field, items);
  };

  const validateImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    } catch {
      return false;
    }
  };

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    
    if (!validateImageUrl(newImageUrl)) {
      setError('Please enter a valid image URL (jpg, jpeg, png, gif, webp, svg)');
      return;
    }

    if (imageUrls.length >= 6) {
      setError('Maximum 6 images allowed per product');
      return;
    }

    const updatedImages = [...imageUrls, newImageUrl.trim()];
    setImageUrls(updatedImages);
    handleInputChange('images', updatedImages);
    setNewImageUrl('');
    setError(null);
  };

  const removeImage = (index: number) => {
    const updatedImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedImages);
    handleInputChange('images', updatedImages);
    
    // Remove any error for this image
    const newErrors = { ...imageErrors };
    delete newErrors[index];
    setImageErrors(newErrors);
  };

  const updateImageUrl = (index: number, url: string) => {
    const updatedImages = [...imageUrls];
    updatedImages[index] = url;
    setImageUrls(updatedImages);
    handleInputChange('images', updatedImages);

    // Validate the URL
    if (url && !validateImageUrl(url)) {
      setImageErrors(prev => ({
        ...prev,
        [index]: 'Invalid image URL format'
      }));
    } else {
      const newErrors = { ...imageErrors };
      delete newErrors[index];
      setImageErrors(newErrors);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const updatedImages = [...imageUrls];
    const draggedImage = updatedImages[draggedIndex];
    
    // Remove the dragged image
    updatedImages.splice(draggedIndex, 1);
    
    // Insert at the new position
    updatedImages.splice(dropIndex, 0, draggedImage);
    
    setImageUrls(updatedImages);
    handleInputChange('images', updatedImages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.push('/signin?redirect=/admin');
        return;
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await supabase.auth.signOut();
          router.push('/signin?redirect=/admin');
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
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error: Please check your internet connection and try again');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save product');
      }
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mx-auto mb-4"></div>
            <p className="text-white/60">Loading product...</p>
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
            <div className="text-red-400 text-xl mb-4">Error</div>
            <p className="text-white/60 mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin/products')}
              className="bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
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
              className="flex items-center text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-white">
              Edit Product: {product?.name}
            </h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 border border-white/20 rounded-lg text-white/60 hover:bg-white/5 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/5 rounded-lg border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                  placeholder="Enter product description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Category
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                >
                  <option value="" className="bg-black text-white">Select a category</option>
                  <option value="electronics" className="bg-black text-white">Electronics</option>
                  <option value="clothing" className="bg-black text-white">Clothing</option>
                  <option value="home" className="bg-black text-white">Home & Garden</option>
                  <option value="sports" className="bg-black text-white">Sports & Outdoors</option>
                  <option value="books" className="bg-black text-white">Books</option>
                  <option value="toys" className="bg-black text-white">Toys & Games</option>
                  <option value="beauty" className="bg-black text-white">Beauty & Personal Care</option>
                  <option value="automotive" className="bg-black text-white">Automotive</option>
                  <option value="other" className="bg-black text-white">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing and Inventory */}
          <div className="bg-white/5 rounded-lg border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Pricing & Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock || ''}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-white focus:ring-white/30"
                />
                <span className="ml-2 text-sm text-white/80">Featured Product</span>
              </label>
            </div>
          </div>

          {/* Product Variants */}
          <div className="bg-white/5 rounded-lg border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Product Variants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Available Sizes
                </label>
                <input
                  type="text"
                  value={formData.sizes?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('sizes', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                  placeholder="XS, S, M, L, XL"
                />
                <p className="text-xs text-white/40 mt-1">Separate sizes with commas</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Available Colors
                </label>
                <input
                  type="text"
                  value={formData.colors?.join(', ') || ''}
                  onChange={(e) => handleArrayInputChange('colors', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                  placeholder="Red, Blue, Green, Black"
                />
                <p className="text-xs text-white/40 mt-1">Separate colors with commas</p>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white/5 rounded-lg border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Product Images</h2>
            
            {/* Current Images */}
             {imageUrls.length > 0 && (
               <div className="mb-6">
                 <h3 className="text-lg font-medium text-white/80 mb-4">Current Images</h3>
                 <p className="text-sm text-white/60 mb-4">Drag and drop to reorder images</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {imageUrls.map((url, index) => (
                     <div 
                       key={index} 
                       className={`space-y-2 ${draggedIndex === index ? 'opacity-50' : ''}`}
                       draggable
                       onDragStart={(e) => handleDragStart(e, index)}
                       onDragOver={handleDragOver}
                       onDrop={(e) => handleDrop(e, index)}
                       onDragEnd={handleDragEnd}
                     >
                       <div className="relative group cursor-move">
                         <img
                           src={url}
                           alt={`Product image ${index + 1}`}
                           className="w-full h-48 object-cover rounded-lg border border-white/20"
                           onError={(e) => {
                             const target = e.target as HTMLImageElement;
                             target.style.display = 'none';
                             setImageErrors(prev => ({
                               ...prev,
                               [index]: 'Failed to load image'
                             }));
                           }}
                         />
                         <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                           {index + 1}
                         </div>
                         <button
                           onClick={() => removeImage(index)}
                           className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                           <div className="text-white text-sm font-medium">Drag to reorder</div>
                         </div>
                       </div>
                       <input
                         type="url"
                         value={url}
                         onChange={(e) => updateImageUrl(index, e.target.value)}
                         className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                         placeholder="Image URL"
                       />
                       {imageErrors[index] && (
                         <p className="text-red-400 text-xs">{imageErrors[index]}</p>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}

            {/* Add New Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white/80">Add New Image</h3>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                  placeholder="Enter image URL (jpg, png, gif, webp, svg)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addImageUrl();
                    }
                  }}
                />
                <button
                  onClick={addImageUrl}
                  className="flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </button>
              </div>
              <p className="text-xs text-white/40">Maximum 6 images allowed. Supported formats: JPG, PNG, GIF, WebP, SVG</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}