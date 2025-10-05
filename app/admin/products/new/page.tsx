'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Save, X, Plus, Trash2, Upload, Check, AlertCircle, 
  Info, ChevronRight, ChevronLeft, Eye, EyeOff, Hash, Tag, 
  Package, Ruler, Weight, Globe, Star, Clock, HelpCircle,
  Image as ImageIcon, DragDropIcon, CheckCircle2, AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useToastHelpers, ToastProvider } from '@/components/admin/ui/Toast'
import Button from '@/components/admin/ui/Button'
import Input from '@/components/admin/ui/Input'
import Select from '@/components/admin/ui/Select'
import Card from '@/components/admin/ui/Card'
import { supabase } from '@/lib/supabase'

interface ProductFormData {
  // Basic Info
  name: string
  description: string
  category: string
  sku: string
  tags: string[]
  status: 'draft' | 'published'
  
  // Pricing
  price: number
  compareAtPrice: number
  costPerItem: number
  
  // Inventory
  stock: number
  trackQuantity: boolean
  continueSellingWhenOutOfStock: boolean
  
  // Variants
  sizes: string[]
  colors: string[]
  
  // Media
  images: string[]
  
  // SEO & Details
  metaDescription: string
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  
  // Settings
  featured: boolean
}

const CATEGORIES = [
  'T-Shirts',
  'Polo Shirts', 
  'Shorts',
  'Jackets',
  'Jeans',
  'Sweaters',
  'Shoes',
  'Accessories'
]

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2X', '3X', '4X']
const AVAILABLE_COLORS = [
  'Black', 'White', 'Gray', 'Navy', 'Blue', 'Red', 'Green', 
  'Brown', 'Beige', 'Pink', 'Purple', 'Yellow', 'Orange'
]

const FORM_STEPS = [
  { id: 'basic', title: 'Basic Info' },
  { id: 'pricing', title: 'Pricing' },
  { id: 'inventory', title: 'Inventory' },
  { id: 'variants', title: 'Variants' },
  { id: 'media', title: 'Media' },
  { id: 'seo', title: 'SEO & Details' },
  { id: 'review', title: 'Review' }
]

const generateSKU = (name: string, category: string): string => {
  const nameCode = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, '')
  const categoryCode = category.slice(0, 2).toUpperCase().replace(/[^A-Z]/g, '')
  const timestamp = Date.now().toString().slice(-4)
  return `${categoryCode}${nameCode}${timestamp}`
}

function NewProductPageContent() {
  const router = useRouter()
  const { success, error } = useToastHelpers()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [imagePreviewLoading, setImagePreviewLoading] = useState<Set<number>>(new Set())
  const [tagInput, setTagInput] = useState('')
  
  const [formData, setFormData] = useState<ProductFormData>({
    // Basic Info
    name: '',
    description: '',
    category: '',
    sku: '',
    tags: [],
    status: 'draft',
    
    // Pricing
    price: 0,
    compareAtPrice: 0,
    costPerItem: 0,
    
    // Inventory
    stock: 0,
    trackQuantity: true,
    continueSellingWhenOutOfStock: false,
    
    // Variants
    sizes: [],
    colors: [],
    
    // Media
    images: [''],
    
    // SEO & Details
    metaDescription: '',
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    
    // Settings
    featured: false
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null)

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges) return
    
    setAutoSaveStatus('saving')
    try {
      // Simulate auto-save to localStorage
      localStorage.setItem('product-draft', JSON.stringify(formData))
      setAutoSaveStatus('saved')
      setHasUnsavedChanges(false)
      setTimeout(() => setAutoSaveStatus(null), 2000)
    } catch (err) {
      setAutoSaveStatus('error')
      setTimeout(() => setAutoSaveStatus(null), 3000)
    }
  }, [formData, hasUnsavedChanges])

  useEffect(() => {
    const timer = setTimeout(autoSave, 2000)
    return () => clearTimeout(timer)
  }, [autoSave])

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('product-draft')
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft)
        setFormData(parsedDraft)
      } catch (err) {
        console.error('Failed to load draft:', err)
      }
    }
  }, [])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleInputChange = (field: keyof ProductFormData, value: ProductFormData[keyof ProductFormData]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    setHasUnsavedChanges(true)
    
    // Auto-generate SKU when name or category changes
    if (field === 'name' || field === 'category') {
      const name = field === 'name' ? value : formData.name
      const category = field === 'category' ? value : formData.category
      if (name && category) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          sku: generateSKU(name, category)
        }))
      }
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
    
    // Real-time validation
    validateField(field, value)
  }

  const validateField = (field: keyof ProductFormData, value: ProductFormData[keyof ProductFormData]) => {
    let error = ''
    
    switch (field) {
      case 'name':
        if (!value?.trim()) error = 'Product name is required'
        else if (value.length < 3) error = 'Product name must be at least 3 characters'
        else if (value.length > 100) error = 'Product name must be less than 100 characters'
        break
      case 'description':
        if (!value?.trim()) error = 'Description is required'
        else if (value.length < 10) error = 'Description must be at least 10 characters'
        else if (value.length > 1000) error = 'Description must be less than 1000 characters'
        break
      case 'category':
        if (!value) error = 'Category is required'
        break
      case 'price':
        if (value <= 0) error = 'Price must be greater than 0'
        else if (value > 999999) error = 'Price must be less than $999,999'
        break
      case 'stock':
        if (value < 0) error = 'Stock cannot be negative'
        break
      case 'metaDescription':
        if (value && value.length > 160) error = 'Meta description should be under 160 characters'
        break
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
    setHasUnsavedChanges(true)
  }

  const handleColorToggle = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }))
    setHasUnsavedChanges(true)
  }

  const handleBulkSizeSelection = (selectAll: boolean) => {
    setFormData(prev => ({
      ...prev,
      sizes: selectAll ? [...AVAILABLE_SIZES] : []
    }))
    setHasUnsavedChanges(true)
  }

  const handleBulkColorSelection = (selectAll: boolean) => {
    setFormData(prev => ({
      ...prev,
      colors: selectAll ? [...AVAILABLE_COLORS] : []
    }))
    setHasUnsavedChanges(true)
  }

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
      setHasUnsavedChanges(true)
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
    setHasUnsavedChanges(true)
  }

  const handleImageChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }))
    setHasUnsavedChanges(true)
    
    // Load image preview
    if (value.trim()) {
      setImagePreviewLoading(prev => new Set([...prev, index]))
      const img = new Image()
      img.onload = () => {
        setImagePreviewLoading(prev => {
          const newSet = new Set(prev)
          newSet.delete(index)
          return newSet
        })
      }
      img.onerror = () => {
        setImagePreviewLoading(prev => {
          const newSet = new Set(prev)
          newSet.delete(index)
          return newSet
        })
      }
      img.src = value
    }
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
    setHasUnsavedChanges(true)
  }

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
      setHasUnsavedChanges(true)
    }
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newImages = [...prev.images]
      const [movedImage] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, movedImage)
      return { ...prev, images: newImages }
    })
    setHasUnsavedChanges(true)
  }

  // Step navigation
  const nextStep = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  // Calculate form completion
  const getFormCompletionPercentage = () => {
    const requiredFields = [
      formData.name,
      formData.description,
      formData.category,
      formData.price > 0,
      formData.images.some(img => img.trim())
    ]
    const completedFields = requiredFields.filter(Boolean).length
    return Math.round((completedFields / requiredFields.length) * 100)
  }

  // Check if step is completed
  const isStepCompleted = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Basic Info
        return formData.name && formData.description && formData.category
      case 1: // Pricing
        return formData.price > 0
      case 2: // Inventory
        return formData.stock >= 0
      case 3: // Variants
        return true // Optional
      case 4: // Media
        return formData.images.some(img => img.trim())
      case 5: // SEO & Details
        return true // Optional
      case 6: // Review
        return getFormCompletionPercentage() === 100
      default:
        return false
    }
  }

  // Update completed steps
  useEffect(() => {
    const newCompletedSteps = new Set<number>()
    FORM_STEPS.forEach((_, index) => {
      if (isStepCompleted(index)) {
        newCompletedSteps.add(index)
      }
    })
    setCompletedSteps(newCompletedSteps)
  }, [formData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Basic Info validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Product name must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    // Pricing validation
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }

    // Inventory validation
    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative'
    }

    // Media validation
    const validImages = formData.images.filter(img => img.trim())
    if (validImages.length === 0) {
      newErrors.images = 'At least one image is required'
    }

    // SEO validation
    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description should be under 160 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (asDraft = false) => {
    // Prevent multiple submissions
    if (isSubmitting) return

    if (!asDraft && !validateForm()) {
      error('Validation Error', 'Please fix the errors before publishing')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Get the current Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        error('Authentication Error', 'Please log in again')
        setTimeout(() => router.push('/admin/login'), 1000)
        return
      }

      // Filter out empty images
      const validImages = formData.images.filter(img => img.trim())
      
      const productData = {
        ...formData,
        images: validImages,
        status: asDraft ? 'draft' : 'published',
        // Convert dimensions object to match API expectations
        length: formData.dimensions.length,
        width: formData.dimensions.width,
        height: formData.dimensions.height
      }

      // Remove the nested dimensions object
      const { dimensions, ...apiData } = productData

      console.log('Submitting product data:', apiData)

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(apiData),
      })

      const responseData = await response.json()
      console.log('API Response:', responseData)

      if (!response.ok) {
        if (response.status === 401) {
          await supabase.auth.signOut()
          error('Authentication Error', 'Session expired. Please log in again')
          setTimeout(() => router.push('/admin/login'), 1000)
          return
        }
        throw new Error(responseData.error || `Server error: ${response.status}`)
      }

      // Clear draft from localStorage
      localStorage.removeItem('product-draft')
      
      success('Success', `Product ${asDraft ? 'saved as draft' : 'published'} successfully!`)
      
      // Use setTimeout to ensure the success message is shown before navigation
      setTimeout(() => {
        router.push('/admin/products')
      }, 1000)
      
    } catch (err) {
      console.error('Error creating product:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product'
      error('Error', errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        localStorage.removeItem('product-draft')
        router.push('/admin/products')
      }
    } else {
      router.push('/admin/products')
    }
  }

  // Helper component for tooltips
  const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {content}
      </div>
    </div>
  )

  return (
    <AdminLayout>
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <h1 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-2xl font-medium text-white">
                Add New Product
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-white/50" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {getFormCompletionPercentage()}% Complete
                </span>
                {autoSaveStatus && (
                  <span className="text-xs text-white/40">
                    {autoSaveStatus === 'saving' && 'Saving...'}
                    {autoSaveStatus === 'saved' && 'Saved'}
                    {autoSaveStatus === 'error' && 'Save failed'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || getFormCompletionPercentage() < 100}
              className="px-3 py-1.5 text-sm bg-white text-black hover:bg-white/90 rounded transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Product'}
            </button>
          </div>
        </div>

        {/* Progress Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="bg-black border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2">
              {FORM_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(index)}
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                      index === currentStep
                        ? 'bg-white text-black'
                        : completedSteps.has(index)
                        ? 'bg-white/80 text-black'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {completedSteps.has(index) ? (
                      <div className="w-2 h-2 rounded-full bg-black" />
                    ) : (
                      <span className="text-xs" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        {index + 1}
                      </span>
                    )}
                  </button>
                  {index < FORM_STEPS.length - 1 && (
                    <div className={`w-6 h-px mx-2 ${
                      completedSteps.has(index) ? 'bg-white/60' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <p className="text-sm text-white/80" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {FORM_STEPS[currentStep].title}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-black border border-white/10 rounded-lg p-6">
              {/* Step Content */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl text-white mb-6" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Basic Information
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Input
                        label="Product Name *"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter product name"
                        error={errors.name}
                      />

                      <div>
                        <label className="block text-sm text-white/80 mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          Description *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={3}
                          className="block w-full rounded-lg border bg-black text-white border-white/20 focus:border-white/60 px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-white/40"
                          style={{ fontFamily: 'Gilroy, sans-serif' }}
                          placeholder="Product description"
                        />
                        {errors.description && (
                          <p className="text-sm text-red-400 mt-1">{errors.description}</p>
                        )}
                      </div>

                      <Select
                        label="Category *"
                        value={formData.category}
                        onChange={(value) => handleInputChange('category', value)}
                        options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                        placeholder="Select category"
                        error={errors.category}
                      />
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="SKU"
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        placeholder="Auto-generated"
                      />

                      <div>
                        <label className="block text-sm text-white/80 mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          Tags
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                            className="flex-1 rounded-lg border bg-black text-white border-white/20 focus:border-white/60 px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-white/40"
                            style={{ fontFamily: 'Gilroy, sans-serif' }}
                            placeholder="Add tags"
                          />
                          <button
                            onClick={handleTagAdd}
                            className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                            style={{ fontFamily: 'Gilroy, sans-serif' }}
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-white text-xs rounded"
                              style={{ fontFamily: 'Gilroy, sans-serif' }}
                            >
                              {tag}
                              <button
                                onClick={() => handleTagRemove(tag)}
                                className="text-white/60 hover:text-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <Select
                        label="Product Status"
                        value={formData.status}
                        onChange={(value) => handleInputChange('status', value)}
                        options={[
                          { value: 'draft', label: 'Draft' },
                          { value: 'published', label: 'Published' }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-white" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Pricing Information
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Input
                        label="Price ($) *"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        error={errors.price}
                      />

                      <Input
                        label="Compare at Price ($)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.compareAtPrice || ''}
                        onChange={(e) => handleInputChange('compareAtPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Cost per Item ($)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costPerItem || ''}
                        onChange={(e) => handleInputChange('costPerItem', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />

                      {formData.price > 0 && formData.costPerItem > 0 && (
                        <div className="p-3 bg-white/5 rounded border border-white/10">
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/60">Profit:</span>
                              <span className="text-white">
                                ${(formData.price - formData.costPerItem).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Margin:</span>
                              <span className="text-white">
                                {((formData.price - formData.costPerItem) / formData.price * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-white" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Inventory Management
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Input
                        label="Stock Quantity *"
                        type="number"
                        min="0"
                        value={formData.stock || ''}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        error={errors.stock}
                      />

                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.trackQuantity}
                            onChange={(e) => handleInputChange('trackQuantity', e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-black text-white focus:ring-white/20"
                          />
                          <span className="text-sm text-white/80" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                            Track quantity
                          </span>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.continueSellingWhenOutOfStock}
                            onChange={(e) => handleInputChange('continueSellingWhenOutOfStock', e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-black text-white focus:ring-white/20"
                          />
                          <span className="text-sm text-white/80" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                            Continue selling when out of stock
                          </span>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => handleInputChange('featured', e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-black text-white focus:ring-white/20"
                          />
                          <span className="text-sm text-white/80" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                            Featured Product
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-3 bg-white/5 rounded border border-white/10">
                        <div className="text-sm text-white/80" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          {formData.stock > 10 ? 'In Stock' : 
                           formData.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </div>
                        <div className="text-xs text-white/60 mt-1" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          {formData.stock} units available
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-white" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Product Variants
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sizes */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-lg font-medium text-white">
                          Available Sizes
                        </h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleBulkSizeSelection(true)}
                            className="px-2 py-1 text-xs text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors"
                          >
                            All
                          </button>
                          <button
                            onClick={() => handleBulkSizeSelection(false)}
                            className="px-2 py-1 text-xs text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors"
                          >
                            None
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {AVAILABLE_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleSizeToggle(size)}
                            className={`px-3 py-2 rounded border text-sm transition-colors ${
                              formData.sizes.includes(size)
                                ? 'bg-white text-black border-white'
                                : 'bg-black text-white border-white/20 hover:border-white/40'
                            }`}
                            style={{ fontFamily: 'Gilroy, sans-serif' }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-lg font-medium text-white">
                          Available Colors
                        </h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleBulkColorSelection(true)}
                            className="px-2 py-1 text-xs text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors"
                          >
                            All
                          </button>
                          <button
                            onClick={() => handleBulkColorSelection(false)}
                            className="px-2 py-1 text-xs text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors"
                          >
                            None
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {AVAILABLE_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleColorToggle(color)}
                            className={`px-3 py-2 rounded border text-sm transition-colors ${
                              formData.colors.includes(color)
                                ? 'bg-white text-black border-white'
                                : 'bg-black text-white border-white/20 hover:border-white/40'
                            }`}
                            style={{ fontFamily: 'Gilroy, sans-serif' }}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-white" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Product Media
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-lg font-medium text-white">
                        Product Images *
                      </h3>
                      <button
                        onClick={addImageField}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Image
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {formData.images.map((image, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Input
                                value={image}
                                onChange={(e) => handleImageChange(index, e.target.value)}
                                placeholder="Enter image URL"
                                label={index === 0 ? 'Primary Image *' : `Image ${index + 1}`}
                                leftIcon={<ImageIcon className="h-4 w-4" />}
                              />
                            </div>
                            <div className="flex gap-2 mt-6">
                              {index > 0 && (
                                <Button
                                  variant="outline"
                                  onClick={() => moveImage(index, index - 1)}
                                  size="sm"
                                  title="Move up"
                                >
                                  ↑
                                </Button>
                              )}
                              {index < formData.images.length - 1 && (
                                <Button
                                  variant="outline"
                                  onClick={() => moveImage(index, index + 1)}
                                  size="sm"
                                  title="Move down"
                                >
                                  ↓
                                </Button>
                              )}
                              {formData.images.length > 1 && (
                                <Button
                                  variant="outline"
                                  onClick={() => removeImageField(index)}
                                  size="sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Image Preview */}
                          {image.trim() && (
                            <div className="relative">
                              {imagePreviewLoading.has(index) ? (
                                <div className="w-full h-32 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                              ) : (
                                <img
                                  src={image}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-white/10"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              )}
                              {index === 0 && (
                                <span className="absolute top-2 left-2 bg-white text-black text-xs px-2 py-1 rounded">
                                  Primary
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {errors.images && (
                      <p className="text-sm text-red-400">{errors.images}</p>
                    )}
                    
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <h4 className="text-sm font-semibold text-white mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        Image Guidelines
                      </h4>
                      <ul className="text-xs text-white/60 space-y-1" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        <li>• Use high-quality images (minimum 800x800px)</li>
                        <li>• The first image will be used as the primary product image</li>
                        <li>• Supported formats: JPG, PNG, WebP</li>
                        <li>• Use drag handles to reorder images</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Globe className="h-6 w-6 text-white" />
                    <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      SEO &amp; Product Details
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-white/80 mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          Meta Description
                        </label>
                        <textarea
                          value={formData.metaDescription}
                          onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                          rows={3}
                          className="block w-full rounded-xl border bg-black text-white border-white/20 focus:border-white/60 px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 placeholder-white/40"
                          style={{ fontFamily: 'Gilroy, sans-serif' }}
                          placeholder="Brief description for search engines"
                        />
                        <div className="flex justify-between items-center mt-2">
                          {errors.metaDescription && (
                            <p className="text-sm text-red-400">{errors.metaDescription}</p>
                          )}
                          <p className={`text-xs ml-auto ${
                            formData.metaDescription.length > 160 ? 'text-red-400' : 'text-white/60'
                          }`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
                            {formData.metaDescription.length}/160 characters
                          </p>
                        </div>
                      </div>

                      <Input
                        label="Weight (lbs)"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.weight || ''}
                        onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                        leftIcon={<Weight className="h-4 w-4" />}
                        helperText="Product weight for shipping calculations"
                      />
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-white/80 mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          Dimensions (inches)
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            label="Length"
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.dimensions.length || ''}
                            onChange={(e) => handleInputChange('dimensions', {
                              ...formData.dimensions,
                              length: parseFloat(e.target.value) || 0
                            })}
                            placeholder="0.0"
                          />
                          <Input
                            label="Width"
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.dimensions.width || ''}
                            onChange={(e) => handleInputChange('dimensions', {
                              ...formData.dimensions,
                              width: parseFloat(e.target.value) || 0
                            })}
                            placeholder="0.0"
                          />
                          <Input
                            label="Height"
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.dimensions.height || ''}
                            onChange={(e) => handleInputChange('dimensions', {
                              ...formData.dimensions,
                              height: parseFloat(e.target.value) || 0
                            })}
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                    <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      Review &amp; Publish
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Summary */}
                    <div className="space-y-6">
                      <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          Product Summary
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">Name:</span>
                            <span className="text-white font-semibold">{formData.name || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Category:</span>
                            <span className="text-white">{formData.category || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Price:</span>
                            <span className="text-white font-semibold">${formData.price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Stock:</span>
                            <span className="text-white">{formData.stock} units</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">SKU:</span>
                            <span className="text-white">{formData.sku || 'Auto-generated'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Status:</span>
                            <span className={`capitalize ${
                              formData.status === 'published' ? 'text-green-400' : 'text-yellow-400'
                            }`}>
                              {formData.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          Variants &amp; Media
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-white/60">Sizes: </span>
                            <span className="text-white">
                              {formData.sizes.length > 0 ? formData.sizes.join(', ') : 'None selected'}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/60">Colors: </span>
                            <span className="text-white">
                              {formData.colors.length > 0 ? formData.colors.join(', ') : 'None selected'}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/60">Images: </span>
                            <span className="text-white">
                              {formData.images.filter(img => img.trim()).length} image(s)
                            </span>
                          </div>
                          <div>
                            <span className="text-white/60">Tags: </span>
                            <span className="text-white">
                              {formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Completion Status */}
                    <div className="space-y-6">
                      <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          Completion Status
                        </h3>
                        <div className="space-y-3">
                          {FORM_STEPS.slice(0, -1).map((step, index) => (
                            <div key={step.id} className="flex items-center justify-between">
                              <span className="text-sm text-white/60" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                                {step.title}
                              </span>
                              {completedSteps.has(index) ? (
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 p-4 bg-black/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                              Overall Progress
                            </span>
                            <span className="text-sm text-white">{getFormCompletionPercentage()}%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div 
                              className="bg-green-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getFormCompletionPercentage()}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {getFormCompletionPercentage() < 100 && (
                        <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-semibold text-yellow-400" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                              Incomplete Information
                            </span>
                          </div>
                          <p className="text-xs text-yellow-400/80" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                            Please complete all required fields before publishing. You can save as draft to continue later.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-white/10">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1.5">
                  {FORM_STEPS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToStep(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === currentStep
                          ? 'bg-white'
                          : completedSteps.has(index)
                          ? 'bg-white/60'
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                {currentStep < FORM_STEPS.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white text-black hover:bg-white/90 rounded transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubmit(true)}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors disabled:opacity-50"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={() => handleSubmit(false)}
                      disabled={isSubmitting || getFormCompletionPercentage() < 100}
                      className="px-3 py-1.5 text-sm bg-white text-black hover:bg-white/90 rounded transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Publishing...' : 'Publish Product'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AdminLayout>
  )
}

export default function NewProductPage() {
  return (
    <ToastProvider>
      <NewProductPageContent />
    </ToastProvider>
  )
}