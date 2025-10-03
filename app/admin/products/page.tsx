'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Edit, Trash2, Plus, Package, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { ConfirmModal } from '@/components/admin/ui/Modal'
import { SkeletonTable } from '@/components/admin/ui/Skeleton'
import { useToastHelpers, ToastProvider } from '@/components/admin/ui/Toast'
import Button, { IconButton } from '@/components/admin/ui/Button'
import { Input, SearchInput } from '@/components/admin/ui/Input'
import Select from '@/components/admin/ui/Select'
import Table from '@/components/admin/ui/Table'
import { StatusBadge } from '@/components/admin/ui/Badge'
import Card from '@/components/admin/ui/Card'
import { type Product } from '@/lib/admin/data'
import { adminFetch } from '@/lib/admin/api'

// Helper function to determine product status based on stock
const getProductStatus = (stock: number) => {
  if (stock === 0) return 'out-of-stock'
  if (stock <= 10) return 'low-stock'
  return 'in-stock'
}

function AdminProductsPageContent() {
  const router = useRouter()
  const { success, error } = useToastHelpers()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string; productName: string }>({
    isOpen: false,
    productId: '',
    productName: ''
  })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true)
      }

      const response = await adminFetch('/api/admin/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data.products)

      if (showRefreshToast) {
        success('Success', 'Products refreshed successfully')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      error('Error', 'Failed to fetch products. Please try again.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchProducts(true)
  }

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory])

  const handleEditProduct = (productId: string) => {
    router.push(`/admin/products/edit/${productId}`)
  }

  const handleDeleteProduct = (productId: string, productName: string) => {
    setDeleteModal({ isOpen: true, productId, productName })
  }

  const confirmDelete = async () => {
    if (!deleteModal.productId) return

    setIsDeleting(true)
    try {
      const response = await adminFetch(`/api/admin/products/${deleteModal.productId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      success('Success', `Product "${deleteModal.productName}" deleted successfully`)
      setDeleteModal({ isOpen: false, productId: '', productName: '' })
      fetchProducts()
    } catch (err) {
      console.error('Failed to delete product:', err)
      error('Error', 'Failed to delete product. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, productId: '', productName: '' })
  }

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  if (isLoading) {
    return (
      <AdminLayout>
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SkeletonTable rows={8} />
        </motion.div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <h1 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-3xl font-bold">
              Products Management
            </h1>
            <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-white/60 mt-1">
              Manage your product inventory and details
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push('/admin/products/new')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Product
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 bg-black border border-white/10">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                />
              </div>
              <div className="sm:w-48">
                <Select
                  value={selectedCategory}
                  onChange={(value) => setSelectedCategory(value)}
                  options={categories.map(category => ({
                    value: category,
                    label: category === 'all' ? 'All Categories' : category
                  }))}
                  placeholder="Select category"
                  fullWidth
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Table
            data={filteredProducts}
            columns={[
              {
                key: 'product',
                title: 'Product',
                render: (product: Product) => (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img
                        className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                        src={product.image}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-black dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {product.description.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                )
              },
              {
                key: 'category',
                title: 'Category',
                render: (product: Product) => (
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {product.category}
                  </span>
                )
              },
              {
                key: 'price',
                title: 'Price',
                render: (product: Product) => (
                  <span className="text-sm font-semibold text-black dark:text-white">
                    ${product.price}
                  </span>
                )
              },
              {
                key: 'stock',
                title: 'Stock',
                render: (product: Product) => (
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {product.stock}
                  </span>
                )
              },
              {
                key: 'status',
                title: 'Status',
                render: (product: Product) => (
                  <StatusBadge status={getProductStatus(product.stock)} />
                )
              },
              {
                key: 'actions',
                title: 'Actions',
                align: 'right' as const,
                render: (product: Product) => (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduct(product.id)}
                      leftIcon={<Edit className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      disabled={isDeleting}
                      isLoading={isDeleting}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                )
              }
            ]}
            loading={isLoading}
            hover
            striped
          />
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.div
            className="text-center py-16 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              className="text-gray-400 dark:text-gray-600 mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
            >
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-2M4 9h2" />
              </svg>
            </motion.div>
            <motion.h3
              className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              No products found
            </motion.h3>
            <motion.p
              className="text-gray-500 dark:text-gray-400 mb-6"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your filters to find products' : 'Get started by adding your first product to the inventory'}
            </motion.p>
            {(!searchTerm && selectedCategory === 'all') && (
              <motion.button
                onClick={() => router.push('/admin/products/new')}
                className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm"
                style={{ fontFamily: 'Gilroy, sans-serif' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Add Your First Product
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal.productName}"? This action cannot be undone.`}
        confirmText="Delete Product"
        type="danger"
        isLoading={isDeleting}
      />
    </AdminLayout>
  )
}

export default function AdminProductsPage() {
  return (
    <ToastProvider>
      <AdminProductsPageContent />
    </ToastProvider>
  )
}