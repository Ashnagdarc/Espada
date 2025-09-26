'use client'

import { useState } from 'react'
import { Search, ChevronDown, Heart, ShoppingBag } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const categories = [
  'NEW',
  'BEST SELLERS', 
  'T-SHIRTS',
  'POLO SHIRTS',
  'SHORTS',
  'JACKETS'
]

const products = [
  {
    id: 1,
    name: 'ABSTRACT PRINT SHIRT',
    description: 'Relaxed-fit shirt. Camp collar and short sleeves. Button-up front.',
    price: 99,
    image: '/images/mg0tjbpx-alzkptj.png',
    category: 'T-SHIRTS',
    colors: [
      { name: 'Light Gray', value: '#D9D9D9' },
      { name: 'Black', value: '#1E1E1E' },
      { name: 'Mint', value: '#A6D6CA' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Lavender', value: '#B9C1E8' }
    ],
    inStock: true,
    collection: 'Essentials',
    tags: ['Popular'],
    rating: 4.3
  },
  {
    id: 2,
    name: 'Crewneck T-Shirt',
    description: 'Basic Heavy Weight T-Shirt',
    price: 109,
    image: '/images/mg0tjbpx-alzkptj.png',
    category: 'T-SHIRTS',
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Gray', value: '#808080' }
    ],
    inStock: true,
    collection: 'Essentials',
    tags: ['Popular', 'Bestseller'],
    rating: 4.5
  },
  {
    id: 3,
    name: 'Cotton T-Shirt',
    description: 'Full Sleeve Zipper',
    price: 109,
    image: '/images/mg0tjbpx-e6qwv49.png',
    category: 'T-SHIRTS',
    colors: [
      { name: 'Brown', value: '#8B4513' },
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' }
    ],
    inStock: true,
    collection: 'Winter Collection',
    tags: ['New'],
    rating: 4.2
  },
  {
    id: 4,
    name: 'Polo Shirt',
    description: 'Classic Polo Shirt',
    price: 129,
    image: '/images/mg0tjbpx-ed9lslb.png',
    category: 'POLO SHIRTS',
    colors: [
      { name: 'Beige', value: '#F5F5DC' },
      { name: 'Black', value: '#000000' },
      { name: 'Gray', value: '#808080' }
    ],
    inStock: true,
    collection: 'Summer 2024',
    tags: ['Popular'],
    rating: 4.6
  },
  {
    id: 5,
    name: 'Summer Shorts',
    description: 'Casual Cotton Shorts',
    price: 89,
    image: '/images/mg0tjbpx-j2fwoy5.png',
    category: 'SHORTS',
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Gray', value: '#808080' }
    ],
    inStock: false,
    collection: 'Summer 2024',
    tags: ['Sale'],
    rating: 4.1
  },
  {
    id: 6,
    name: 'Denim Jacket',
    description: 'Classic Denim Jacket',
    price: 199,
    image: '/images/mg0tjbpx-ls0hfxw.png',
    category: 'JACKETS',
    colors: [
      { name: 'Light Blue', value: '#87CEEB' },
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' }
    ],
    inStock: true,
    collection: 'Limited Edition',
    tags: ['Limited Edition', 'Bestseller'],
    rating: 4.8
  }
]

const sizes = ['XS', 'S', 'M', 'L', 'XL', '2X', '3X', '4X']

const colors = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Gray', value: '#808080' },
  { name: 'Brown', value: '#8B4513' },
  { name: 'Blue', value: '#87CEEB' },
  { name: 'Beige', value: '#F5F5DC' }
]

const priceRanges = [
  { label: '$0 - $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: '$200+', min: 200, max: Infinity }
]

const collections = ['Summer 2024', 'Winter Collection', 'Essentials', 'Limited Edition']
const tags = ['New', 'Sale', 'Popular', 'Limited Edition', 'Bestseller']
const ratings = [5, 4, 3, 2, 1]

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('NEW')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])
  const [showAvailable, setShowAvailable] = useState(true)
  const [showOutOfStock, setShowOutOfStock] = useState(false)

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
  }

  const toggleColor = (colorName: string) => {
    setSelectedColors(prev => 
      prev.includes(colorName) 
        ? prev.filter(c => c !== colorName)
        : [...prev, colorName]
    )
  }

  const togglePriceRange = (rangeLabel: string) => {
    setSelectedPriceRanges(prev => 
      prev.includes(rangeLabel) 
        ? prev.filter(r => r !== rangeLabel)
        : [...prev, rangeLabel]
    )
  }

  const toggleCollection = (collection: string) => {
    setSelectedCollections(prev => 
      prev.includes(collection) 
        ? prev.filter(c => c !== collection)
        : [...prev, collection]
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating) 
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    )
  }

  const clearAllFilters = () => {
    setSelectedSizes([])
    setSelectedColors([])
    setSelectedPriceRanges([])
    setSelectedCollections([])
    setSelectedTags([])
    setSelectedRatings([])
    setActiveCategory('NEW')
    setSearchQuery('')
    setShowAvailable(true)
    setShowOutOfStock(false)
  }

  const hasActiveFilters = selectedSizes.length > 0 || selectedColors.length > 0 || selectedPriceRanges.length > 0 || selectedCollections.length > 0 || selectedTags.length > 0 || selectedRatings.length > 0 || activeCategory !== 'NEW' || searchQuery !== ''

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="px-8 py-6 border-b border-separator bg-fill-secondary">
        <div className="flex items-center gap-2 text-sm text-label-tertiary">
          <span className="font-medium">Home</span>
          <span className="text-label-quaternary">/</span>
          <span className="text-label-primary font-semibold">Shop</span>
        </div>
      </div>

      <div className="flex">
        {/* Filters Sidebar */}
        <div className="w-80 bg-background border-r border-separator p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>Filters</h2>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-label-tertiary hover:text-label-primary transition-colors underline"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          
          {/* Size Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>Size</h3>
            <div className="grid grid-cols-3 gap-3">
                {sizes.map((size) => (
                 <button
                   key={size}
                   onClick={() => toggleSize(size)}
                   className={`h-11 min-w-[44px] border border-separator rounded-xl text-sm font-medium transition-all duration-200 ${
                     selectedSizes.includes(size)
                       ? 'bg-label-primary text-background border-label-primary shadow-sm'
                       : 'bg-background text-label-secondary hover:border-label-tertiary hover:shadow-sm'
                   }`}
                   style={{ fontFamily: 'Gilroy, sans-serif' }}
                 >
                   {size}
                 </button>
                ))}
              </div>
          </div>

          {/* Availability Filter */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>Availability</h3>
              <ChevronDown className="w-5 h-5 text-label-quaternary" />
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAvailable}
                  onChange={(e) => setShowAvailable(e.target.checked)}
                  className="w-5 h-5 rounded border-separator text-label-primary focus:ring-label-primary focus:ring-2"
                />
                <span className="text-sm font-medium text-label-secondary">Available</span>
                <span className="text-sm text-label-quaternary ml-auto">(450)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOutOfStock}
                  onChange={(e) => setShowOutOfStock(e.target.checked)}
                  className="w-5 h-5 rounded border-separator text-label-primary focus:ring-label-primary focus:ring-2"
                />
                <span className="text-sm font-medium text-label-secondary">Out Of Stock</span>
                <span className="text-sm text-label-quaternary ml-auto">(18)</span>
              </label>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>Category</h3>
              <ChevronDown className="w-5 h-5 text-label-quaternary" />
            </div>
            <div className="space-y-3">
              {['T-SHIRTS', 'POLO SHIRTS', 'SHORTS', 'JACKETS'].map((category) => (
                <label key={category} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-separator text-label-primary focus:ring-label-primary focus:ring-2 focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-sm font-medium text-label-secondary">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>Colors</h3>
              <ChevronDown className="w-5 h-5 text-label-quaternary" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  className={`relative h-11 min-w-[44px] rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    selectedColors.includes(color.name)
                      ? 'border-label-primary shadow-md'
                      : 'border-separator hover:border-label-tertiary'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColors.includes(color.name) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-label-primary rounded-full" style={{
                        backgroundColor: color.value === '#FFFFFF' ? '#000000' : '#FFFFFF'
                      }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>Price Range</h3>
              <ChevronDown className="w-5 h-5 text-label-quaternary" />
            </div>
            <div className="space-y-3">
              {priceRanges.map((range) => (
                <label key={range.label} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes(range.label)}
                    onChange={() => togglePriceRange(range.label)}
                    className="w-5 h-5 rounded border-separator text-label-primary focus:ring-label-primary focus:ring-2 focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-label-secondary group-hover:text-label-primary transition-colors" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Collections Filter */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>Collections</h3>
              <ChevronDown className="w-5 h-5 text-label-quaternary" />
            </div>
            <div className="space-y-3">
              {collections.map((collection) => (
                <label key={collection} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(collection)}
                    onChange={() => toggleCollection(collection)}
                    className="w-5 h-5 rounded border-separator text-label-primary focus:ring-label-primary focus:ring-2 focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-label-secondary group-hover:text-label-primary transition-colors" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    {collection}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>Tags</h3>
              <ChevronDown className="w-5 h-5 text-label-quaternary" />
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? 'bg-label-primary text-background'
                      : 'bg-fill-tertiary text-label-secondary hover:bg-fill-secondary hover:text-label-primary'
                  }`}
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Ratings Filter */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>Ratings</h3>
              <ChevronDown className="w-5 h-5 text-label-quaternary" />
            </div>
            <div className="space-y-3">
              {ratings.map((rating) => (
                <label key={rating} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedRatings.includes(rating)}
                    onChange={() => toggleRating(rating)}
                    className="w-5 h-5 rounded border-separator text-label-primary focus:ring-label-primary focus:ring-2 focus:ring-offset-0 transition-colors"
                  />
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating ? 'text-yellow-400' : 'text-separator'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-label-secondary group-hover:text-label-primary transition-colors" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      {rating} star{rating !== 1 ? 's' : ''} & up
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 bg-background">
          {/* Page Title */}
          <h1 className="text-4xl font-bold mb-8 text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>SHOP</h1>
          
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-label-quaternary" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 border border-separator rounded-xl bg-fill-secondary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-label-primary focus:border-transparent focus:bg-background transition-all duration-200 text-label-primary placeholder:text-label-quaternary"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 min-h-[44px] rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-label-primary text-background shadow-md'
                    : 'bg-fill-secondary text-label-secondary hover:bg-fill-tertiary hover:shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.filter(product => {
               const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
               const matchesCategory = activeCategory === 'NEW' || product.category === activeCategory
               const matchesAvailability = showAvailable && product.inStock || showOutOfStock && !product.inStock
               
               // Color filter
               const matchesColor = selectedColors.length === 0 || selectedColors.some(color => {
                 return product.colors.some(productColor => productColor.name === color)
               })
               
               // Price range filter
               const matchesPrice = selectedPriceRanges.length === 0 || selectedPriceRanges.some(rangeLabel => {
                 const range = priceRanges.find(r => r.label === rangeLabel)
                 if (!range) return false
                 return product.price >= range.min && (range.max === Infinity || product.price <= range.max)
               })
               
               // Collections filter
               const matchesCollection = selectedCollections.length === 0 || selectedCollections.includes(product.collection)
               
               // Tags filter
               const matchesTag = selectedTags.length === 0 || selectedTags.some(tag => product.tags.includes(tag))
               
               // Ratings filter
               const matchesRating = selectedRatings.length === 0 || selectedRatings.some(rating => product.rating >= rating)
               
               return matchesSearch && matchesCategory && matchesAvailability && matchesColor && matchesPrice && matchesCollection && matchesTag && matchesRating
             }).map((product) => {
               // Transform product data to match ProductCard interface
               const productCardData = {
                 id: product.id,
                 name: product.name,
                 price: product.price,
                 image: product.image,
                 colors: product.colors
               }
               
               return (
                 <ProductCard
                   key={product.id}
                   product={productCardData}
                   layout="grid"
                 />
               )
             })}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}