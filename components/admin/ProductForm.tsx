'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/admin/data';
import { X, Plus, Minus, AlertCircle, CheckCircle } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSubmit: (productData: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  'T-Shirts',
  'Jeans',
  'Jackets',
  'Sweaters',
  'Shoes',
  'Accessories',
  'Dresses',
  'Shorts',
  'Pants',
  'Hoodies'
];

const COMMON_SIZES = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['6', '7', '8', '9', '10', '11', '12'],
  jeans: ['28', '30', '32', '34', '36', '38', '40']
};

const COMMON_COLORS = [
  'Black', 'White', 'Gray', 'Navy', 'Blue', 'Red', 'Green', 
  'Brown', 'Beige', 'Pink', 'Purple', 'Yellow', 'Orange'
];

export default function ProductForm({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[],
    stock: '',
    featured: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        sizes: [...product.sizes],
        colors: [...product.colors],
        images: [...product.images],
        stock: product.stock.toString(),
        featured: product.featured
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.sizes.length === 0) newErrors.sizes = 'At least one size is required';
    if (formData.colors.length === 0) newErrors.colors = 'At least one color is required';
    if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
      sizes: formData.sizes,
      colors: formData.colors,
      images: formData.images,
      stock: Number(formData.stock),
      featured: formData.featured
    };

    await onSubmit(productData);
  };

  const addSize = (size: string) => {
    if (size && !formData.sizes.includes(size)) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
    }
  };

  const removeSize = (size: string) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
  };

  const addColor = (color: string) => {
    if (color && !formData.colors.includes(color)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, color] }));
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }));
  };

  const addImage = () => {
    if (newImage && !formData.images.includes(newImage)) {
      setFormData(prev => ({ ...prev, images: [...prev.images, newImage] }));
      setNewImage('');
    }
  };

  const removeImage = (image: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(img => img !== image) }));
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.target === e.currentTarget && onCancel()}
      >
        <motion.div 
          className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div 
            className="p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.div 
              className="flex justify-between items-center mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.h2 
                className="text-2xl font-bold text-black dark:text-white" 
                style={{ fontFamily: 'Gilroy, sans-serif' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {product ? 'Edit Product' : 'Add New Product'}
              </motion.h2>
              <motion.button
                onClick={onCancel}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                disabled={isLoading}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </motion.div>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {/* Basic Information */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <motion.label 
                    className="block text-sm font-medium text-black dark:text-white mb-2" 
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.6 }}
                  >
                    Product Name *
                  </motion.label>
                  <motion.div className="relative">
                    <motion.input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-gray-800 transition-all duration-300 ${
                        errors.name ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                      disabled={isLoading}
                      whileFocus={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                    />
                    <AnimatePresence>
                      {errors.name && (
                        <motion.div
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p 
                        className="text-red-500 text-sm mt-2 flex items-center gap-1"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <motion.label 
                    className="block text-sm font-medium text-black dark:text-white mb-2" 
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.7 }}
                  >
                    Category *
                  </motion.label>
                  <motion.div className="relative">
                    <motion.select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-gray-800 transition-all duration-300 ${
                        errors.category ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                      disabled={isLoading}
                      whileFocus={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </motion.select>
                    <AnimatePresence>
                      {errors.category && (
                        <motion.div
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <AnimatePresence>
                    {errors.category && (
                      <motion.p 
                        className="text-red-500 text-sm mt-2 flex items-center gap-1"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.category}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                <motion.label 
                  className="block text-sm font-medium text-black dark:text-white mb-2" 
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.8 }}
                >
                  Description *
                </motion.label>
                <motion.div className="relative">
                  <motion.textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-gray-800 resize-none transition-all duration-300 ${
                      errors.description ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                    disabled={isLoading}
                    whileFocus={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.2 }}
                  />
                  <AnimatePresence>
                    {errors.description && (
                      <motion.div
                        className="absolute right-3 top-3"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <AnimatePresence>
                  {errors.description && (
                    <motion.p 
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  <motion.label 
                    className="block text-sm font-medium text-black dark:text-white mb-2" 
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 1.0 }}
                  >
                    Price ($) *
                  </motion.label>
                  <motion.div className="relative">
                    <motion.input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-gray-800 transition-all duration-300 ${
                        errors.price ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                      disabled={isLoading}
                      whileFocus={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                    />
                    <AnimatePresence>
                      {errors.price && (
                        <motion.div
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <AnimatePresence>
                    {errors.price && (
                      <motion.p 
                        className="text-red-500 text-sm mt-2 flex items-center gap-1"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.price}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                >
                  <motion.label 
                    className="block text-sm font-medium text-black dark:text-white mb-2" 
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 1.1 }}
                  >
                    Stock Quantity *
                  </motion.label>
                  <motion.div className="relative">
                    <motion.input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-gray-800 transition-all duration-300 ${
                        errors.stock ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                      disabled={isLoading}
                      whileFocus={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                    />
                    <AnimatePresence>
                      {errors.stock && (
                        <motion.div
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <AnimatePresence>
                    {errors.stock && (
                      <motion.p 
                        className="text-red-500 text-sm mt-2 flex items-center gap-1"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.stock}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* Sizes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.1 }}
              >
                <motion.label 
                  className="block text-sm font-medium text-black dark:text-white mb-3" 
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 1.2 }}
                >
                  Sizes *
                </motion.label>
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.3 }}
                >
                  <motion.div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {formData.sizes.map((size, index) => (
                        <motion.span 
                          key={size} 
                          className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-xl text-sm font-medium shadow-sm"
                          initial={{ opacity: 0, scale: 0, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0, x: 20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          {size}
                          <motion.button
                            type="button"
                            onClick={() => removeSize(size)}
                            className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            disabled={isLoading}
                            whileHover={{ scale: 1.2, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus className="w-3 h-3" />
                          </motion.button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div 
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.4 }}
                  >
                    <motion.input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      placeholder="Add custom size"
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-gray-800 transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500"
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                      disabled={isLoading}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize(newSize), setNewSize(''))}
                      whileFocus={{ scale: 1.02, y: -2 }}
                    />
                    <motion.button
                      type="button"
                      onClick={() => { addSize(newSize); setNewSize(''); }}
                      className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 shadow-lg"
                      disabled={isLoading || !newSize.trim()}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                  <motion.div 
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.5 }}
                  >
                    {COMMON_SIZES.clothing.map((size, index) => (
                      <motion.button
                        key={size}
                        type="button"
                        onClick={() => addSize(size)}
                        className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all duration-300 ${
                          formData.sizes.includes(size)
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 cursor-not-allowed'
                            : 'border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        disabled={isLoading || formData.sizes.includes(size)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: 1.6 + index * 0.05 }}
                        whileHover={!formData.sizes.includes(size) ? { scale: 1.05, y: -2 } : {}}
                        whileTap={!formData.sizes.includes(size) ? { scale: 0.95 } : {}}
                      >
                        {size}
                        {formData.sizes.includes(size) && (
                          <CheckCircle className="w-3 h-3 ml-1 inline" />
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
                <AnimatePresence>
                  {errors.sizes && (
                    <motion.p 
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.sizes}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Colors */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.7 }}
              >
                <motion.label 
                  className="block text-sm font-medium text-black dark:text-white mb-3" 
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 1.8 }}
                >
                  Colors *
                </motion.label>
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.9 }}
                >
                  <motion.div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {formData.colors.map((color, index) => (
                        <motion.span 
                          key={color} 
                          className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-xl text-sm font-medium shadow-sm"
                          initial={{ opacity: 0, scale: 0, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0, x: 20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-2 border border-gray-300 dark:border-gray-500" 
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                          {color}
                          <motion.button
                            type="button"
                            onClick={() => removeColor(color)}
                            className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            disabled={isLoading}
                            whileHover={{ scale: 1.2, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus className="w-3 h-3" />
                          </motion.button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div 
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 2.0 }}
                  >
                    <motion.input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Add custom color"
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-gray-800 transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500"
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                      disabled={isLoading}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor(newColor), setNewColor(''))}
                      whileFocus={{ scale: 1.02, y: -2 }}
                    />
                    <motion.button
                      type="button"
                      onClick={() => { addColor(newColor); setNewColor(''); }}
                      className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 shadow-lg"
                      disabled={isLoading || !newColor.trim()}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                  <motion.div 
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 2.1 }}
                  >
                    {COMMON_COLORS.map((color, index) => (
                      <motion.button
                        key={color}
                        type="button"
                        onClick={() => addColor(color)}
                        className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                          formData.colors.includes(color)
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 cursor-not-allowed'
                            : 'border-gray-300 dark:border-gray-600 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        disabled={isLoading || formData.colors.includes(color)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: 2.2 + index * 0.05 }}
                        whileHover={!formData.colors.includes(color) ? { scale: 1.05, y: -2 } : {}}
                        whileTap={!formData.colors.includes(color) ? { scale: 0.95 } : {}}
                      >
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-500" 
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                        {color}
                        {formData.colors.includes(color) && (
                          <CheckCircle className="w-3 h-3 ml-1" />
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
                <AnimatePresence>
                  {errors.colors && (
                    <motion.p 
                      className="text-red-500 text-sm mt-2 flex items-center gap-1"
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.colors}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Images */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 2.3 }}
              >
                <motion.label 
                  className="block text-sm font-medium text-black dark:text-white mb-3" 
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 2.4 }}
                >
                  Product Images
                </motion.label>
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 2.5 }}
                >
                  <motion.div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                      {formData.images.map((image, index) => (
                        <motion.div 
                          key={index} 
                          className="relative group"
                          initial={{ opacity: 0, scale: 0, rotate: -10 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0, rotate: 10 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                        >
                          <motion.img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-lg"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          />
                          <motion.button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                            disabled={isLoading}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.2, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus className="w-3 h-3" />
                          </motion.button>
                          <motion.div 
                            className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div 
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 2.6 }}
                  >
                    <motion.input
                      type="text"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="Add image URL (https://...)"
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-gray-800 transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500"
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                      disabled={isLoading}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage(newImage), setNewImage(''))}
                      whileFocus={{ scale: 1.02, y: -2 }}
                    />
                    <motion.button
                      type="button"
                      onClick={() => { addImage(newImage); setNewImage(''); }}
                      className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 shadow-lg"
                      disabled={isLoading || !newImage.trim()}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Featured */}
              <motion.div 
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 2.7 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <motion.input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-5 w-5 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 transition-all duration-300"
                  disabled={isLoading}
                  whileTap={{ scale: 0.95 }}
                />
                <motion.label 
                  htmlFor="featured" 
                  className="text-sm font-medium text-black dark:text-white cursor-pointer select-none" 
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                  whileHover={{ x: 2 }}
                >
                  Featured Product
                  <motion.span 
                    className="block text-xs text-gray-500 dark:text-gray-400 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 2.8 }}
                  >
                    This product will be highlighted on the homepage
                  </motion.span>
                </motion.label>
              </motion.div>

              {/* Actions */}
              <motion.div 
                className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 2.9 }}
              >
                <motion.button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-all duration-300 font-medium shadow-sm"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 3.0 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 3.1 }}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Saving...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {product ? 'Update Product' : 'Create Product'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}