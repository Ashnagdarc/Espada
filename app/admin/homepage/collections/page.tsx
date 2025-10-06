'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Search, 
  Plus, 
  X, 
  Eye, 
  EyeOff,
  CheckCircle,
  Trash2,
  Star,
  List,
  Grid,
  Package
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { ToastProvider, useToastHelpers } from '@/components/admin/ui/Toast';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  featured: boolean;
}

interface CollectionItem {
  id?: string;
  product_id: string;
  display_order: number;
  products?: Product;
}

interface CollectionSection {
  id?: string;
  content: {
    title: string;
    subtitle: string;
    description?: string;
  };
  status: 'draft' | 'published' | 'scheduled';
  collection_items: CollectionItem[];
}

function CollectionsManagerContent() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionType = searchParams.get('type') || 'xiv_collections';
  
  const [section, setSection] = useState<CollectionSection>({
    content: {
      title: '',
      subtitle: '',
      description: ''
    },
    status: 'draft',
    collection_items: []
  });
  
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { success, error: showError } = useToastHelpers();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, authLoading, router]);

  // Fetch section data and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch section data
        const sectionsResponse = await fetch('/api/admin/homepage/sections');
        if (!sectionsResponse.ok) {
          throw new Error('Failed to fetch section data');
        }
        
        const sectionsData = await sectionsResponse.json();
        const sectionData = sectionsData.sections?.[sectionType];
        
        if (sectionData) {
          setSection({
            id: sectionData.id,
            content: sectionData.content || {
              title: '',
              subtitle: '',
              description: ''
            },
            status: sectionData.status || 'draft',
            collection_items: sectionData.collection_items || []
          });
        }
        
        // Fetch available products
        const productsResponse = await fetch('/api/admin/homepage/products');
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const productsData = await productsResponse.json();
        setAvailableProducts(productsData.products || []);
        setCategories(productsData.categories || []);
        success('Collection data loaded successfully');
        
      } catch (err) {
        console.error('Error fetching data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        showError('Loading Failed', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, sectionType]);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = availableProducts;
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [availableProducts, searchTerm, selectedCategory]);

  const getSectionTitle = () => {
    switch (sectionType) {
      case 'new_this_week':
        return 'New This Week';
      case 'xiv_collections':
        return 'XIV Collections';
      default:
        return 'Collections';
    }
  };

  const addProductToCollection = (product: Product) => {
    const isAlreadyAdded = section.collection_items.some(item => item.product_id === product.id);
    if (isAlreadyAdded) {
      const errorMessage = 'Product is already in the collection';
      setError(errorMessage);
      showError('Duplicate Product', errorMessage);
      return;
    }

    const newItem: CollectionItem = {
      product_id: product.id,
      display_order: section.collection_items.length,
      products: product
    };

    setSection(prev => ({
      ...prev,
      collection_items: [...prev.collection_items, newItem]
    }));
    
    setShowProductSelector(false);
    setError(null);
    success(`Added "${product.name}" to collection`);
  };

  const removeFromCollection = (index: number) => {
    setSection(prev => ({
      ...prev,
      collection_items: prev.collection_items.filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, display_order: i }))
    }));
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    setSection(prev => {
      const newItems = [...prev.collection_items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      
      return {
        ...prev,
        collection_items: newItems.map((item, i) => ({ ...item, display_order: i }))
      };
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/admin/homepage/sections', {
        method: section.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_type: sectionType,
          content: section.content,
          status: section.status,
          collection_items: section.collection_items.map((item, index) => ({
            product_id: item.product_id,
            display_order: index
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save collection');
      }

      const data = await response.json();
      setSection(prev => ({ ...prev, id: data.section.id }));
      success('Collection saved successfully!');
      
    } catch (err) {
      console.error('Error saving collection:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save collection';
      setError(errorMessage);
      showError('Save Failed', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="h-64 bg-white/10 rounded-lg"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/homepage"
              className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{getSectionTitle()} Manager</h1>
              <p className="text-white/70">Manage products in the {getSectionTitle().toLowerCase()} section</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            
            <select
              aria-label="Section status"
              value={section.status}
              onChange={(e) => setSection(prev => ({ 
                ...prev, 
                status: e.target.value as 'draft' | 'published' | 'scheduled' 
              }))}
              className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>



        {previewMode ? (
          /* Preview Mode */
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                {section.content.title || getSectionTitle()}
              </h2>
              <p className="text-white/70 text-lg">
                {section.content.subtitle || `Discover our ${getSectionTitle().toLowerCase()} collection`}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {section.collection_items.map((item, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  {item.products?.images?.[0] && (
                    <div className="relative h-48">
                      <Image
                        src={item.products.images[0]}
                        alt={item.products.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2">{item.products?.name}</h3>
                    <p className="text-white/70">${item.products?.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Editor */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Section Content</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={section.content.title}
                      onChange={(e) => setSection(prev => ({
                        ...prev,
                        content: { ...prev.content, title: e.target.value }
                      }))}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                      placeholder={`Enter ${getSectionTitle().toLowerCase()} title`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Subtitle
                    </label>
                    <textarea
                      value={section.content.subtitle}
                      onChange={(e) => setSection(prev => ({
                        ...prev,
                        content: { ...prev.content, subtitle: e.target.value }
                      }))}
                      rows={3}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                      placeholder="Enter subtitle"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={section.content.description || ''}
                      onChange={(e) => setSection(prev => ({
                        ...prev,
                        content: { ...prev.content, description: e.target.value }
                      }))}
                      rows={4}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                      placeholder="Enter description"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Collection Manager */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Collection Products</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setShowProductSelector(true)}
                      className="flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </button>
                  </div>
                </div>
                
                {section.collection_items.length === 0 ? (
                  <div className="text-center py-12 text-white/60">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No products in collection</h3>
                    <p className="mb-4">Add products to start building your collection</p>
                    <button
                      onClick={() => setShowProductSelector(true)}
                      className="px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
                    >
                      Add First Product
                    </button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
                    {section.collection_items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white/5 border border-white/10 rounded-lg p-4 ${
                          viewMode === 'list' ? 'flex items-center space-x-4' : ''
                        }`}
                      >
                        {item.products?.images?.[0] && (
                          <div className={`relative bg-white/10 rounded-lg overflow-hidden ${
                            viewMode === 'list' ? 'w-16 h-16 flex-shrink-0' : 'h-32 mb-3'
                          }`}>
                            <Image
                              src={item.products.images[0]}
                              alt={item.products.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        
                        <div className={viewMode === 'list' ? 'flex-1' : ''}>
                          <h3 className="font-semibold text-white mb-1">{item.products?.name}</h3>
                          <p className="text-white/70 text-sm mb-2">${item.products?.price}</p>
                          <p className="text-white/50 text-xs mb-3">Order: {index + 1}</p>
                        </div>
                        
                        <div className={`flex items-center space-x-2 ${viewMode === 'list' ? '' : 'mt-3'}`}>
                          <button
                            onClick={() => index > 0 && moveItem(index, index - 1)}
                            disabled={index === 0}
                            className="p-1 text-white/60 hover:text-white disabled:opacity-30 text-xs"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => index < section.collection_items.length - 1 && moveItem(index, index + 1)}
                            disabled={index === section.collection_items.length - 1}
                            className="p-1 text-white/60 hover:text-white disabled:opacity-30 text-xs"
                            aria-label="Move item down"
                            title="Move down"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeFromCollection(index)}
                            className="p-1 text-red-400 hover:text-red-300"
                            aria-label="Remove item"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Selector Modal */}
        {showProductSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Select Products</h3>
                  <button
                    onClick={() => setShowProductSelector(false)}
                    className="p-2 text-white/60 hover:text-white"
                    aria-label="Close product selector"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                      placeholder="Search products..."
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                    aria-label="Filter by category"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => {
                    const isAdded = section.collection_items.some(item => item.product_id === product.id);
                    
                    return (
                      <div
                        key={product.id}
                        className={`bg-white/5 border rounded-lg p-4 cursor-pointer transition-colors ${
                          isAdded 
                            ? 'border-green-500/50 bg-green-500/10' 
                            : 'border-white/10 hover:bg-white/10'
                        }`}
                        onClick={() => !isAdded && addProductToCollection(product)}
                      >
                        {product.images?.[0] && (
                          <div className="relative h-32 bg-white/10 rounded-lg overflow-hidden mb-3">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        
                        <h4 className="font-semibold text-white mb-1">{product.name}</h4>
                        <p className="text-white/70 text-sm mb-2">${product.price}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/60">{product.category}</span>
                          {product.featured && <Star className="w-4 h-4 text-yellow-400" />}
                          {isAdded && <CheckCircle className="w-4 h-4 text-green-400" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No products found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function CollectionsManager() {
  return (
    <ToastProvider>
      <CollectionsManagerContent />
    </ToastProvider>
  );
}