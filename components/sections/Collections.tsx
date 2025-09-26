'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '@/components/ui/ProductCard'
import Button from '@/components/ui/Button'
import { Filter, Grid, List } from 'lucide-react'

const collections = [
  {
    id: 1,
    name: 'Oversized Vintage T-Shirt',
    price: 129,
    originalPrice: 159,
    image: '/images/mg0tjbpx-2myp9b6.png',
    category: 'Essentials',
    isNew: false,
    isSale: true,
    season: '23-24'
  },
  {
    id: 2,
    name: 'Premium Hoodie Collection',
    price: 189,
    image: '/images/mg0tjbq2-3h6yy6x.png',
    category: 'Outerwear',
    isNew: true,
    isSale: false,
    season: '23-24'
  },
  {
    id: 3,
    name: 'Classic Crew Neck',
    price: 79,
    image: '/images/mg0tjbq2-os8uxlp.png',
    isNew: false,
    isSale: true,
    category: 'Shirts',
    description: 'Timeless crew neck design',
    season: '23-24'
  },
  {
    id: 4,
    name: 'Organic Cotton Tee',
    price: 69,
    image: '/images/mg0tjbq2-roofka9.png',
    isNew: false,
    isSale: false,
    category: 'T-Shirts',
    description: 'Sustainable organic cotton',
    season: '23-24'
  },
  {
    id: 5,
    name: 'Designer Polo',
    price: 95,
    image: '/images/mg0tjbq2-zukhwj1.png',
    isNew: true,
    isSale: false,
    category: 'Polo',
    description: 'Elegant polo shirt',
    season: '23-24'
  },
  {
    id: 6,
    name: 'Urban Streetwear Hoodie',
    price: 199,
    image: '/images/mg0tjbq2-zukhwj1.png',
    category: 'Streetwear',
    isNew: true,
    isSale: false,
    season: '23-24'
  }
]

const categories = ['All', 'Essentials', 'Outerwear', 'Sustainable', 'Formal', 'Streetwear']
const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: {
      duration: 0.3
    }
  }
}

export default function Collections() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const filteredProducts = collections
    .filter(product => selectedCategory === 'All' || product.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'Price: Low to High':
          return a.price - b.price
        case 'Price: High to Low':
          return b.price - a.price
        case 'Newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
        default:
          return 0
      }
    })

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            XIV Collections
            <span className="block text-2xl sm:text-3xl text-muted-foreground font-normal mt-2">
              23-24
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore our curated seasonal collection featuring contemporary designs 
            and premium quality materials.
          </p>
        </motion.div>
        
        {/* Filters and Controls */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile Filter Toggle */}
          <div className="flex justify-between items-center mb-6 lg:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Desktop Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="transition-all duration-200"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              {/* Sort and View Controls */}
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                
                <div className="hidden lg:flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Products Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${sortBy}-${viewMode}`}
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                layout
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <ProductCard
                  product={product}
                  layout={viewMode}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {/* Load More Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button variant="outline" size="lg">
            Load More Items
          </Button>
        </motion.div>
      </div>
    </section>
  )
}