'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ImageGallery from '@/components/ui/ImageGallery'
import ColorSelector from '@/components/ui/ColorSelector'
import SizeSelector from '@/components/ui/SizeSelector'
import ProductInfo from '@/components/ui/ProductInfo'
import { useCart } from '@/contexts/CartContext'

// Extended product data structure with detailed information
const productData = {
  1: {
    id: 1,
    name: 'ABSTRACT PRINT SHIRT',
    description: 'Relaxed-fit shirt. Camp collar and short sleeves. Button-up front.',
    price: 99,
    originalPrice: null,
    mrpText: 'MRP incl. of all taxes',
    images: [
      '/images/mg0tjbpx-alzkptj.png',
      '/images/mg0wgh8g-uqjccn5.png',
      '/images/mg0wgh8g-sftf7ca.png',
      '/images/mg0wgh8g-vjk4nfq.png',
      '/images/mg0wgh8g-hbg81v6.png'
    ],
    colors: [
      { name: 'Light Gray', value: '#D9D9D9' },
      { name: 'Black', value: '#1E1E1E' },
      { name: 'Mint', value: '#A6D6CA' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Lavender', value: '#B9C1E8' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2X'],
    category: 'T-SHIRTS',
    inStock: true,
    collection: 'Essentials',
    tags: ['Popular'],
    rating: 4.3,
    detailedDescription: 'Relaxed-fit shirt. Camp collar and short sleeves. Button-up front.',
    features: [
      'Relaxed fit for comfort',
      'Camp collar design',
      'Short sleeves',
      'Button-up front closure',
      'Abstract print pattern'
    ],
    materials: '100% Cotton',
    careInstructions: 'Machine wash cold, tumble dry low'
  },
  2: {
    id: 2,
    name: 'Crewneck T-Shirt',
    description: 'Basic Heavy Weight T-Shirt',
    price: 109,
    originalPrice: null,
    mrpText: 'MRP incl. of all taxes',
    images: [
      '/images/mg0tjbpx-alzkptj.png',
      '/images/mg0tjbpx-2myp9b6.png',
      '/images/mg0tjbpx-e6qwv49.png'
    ],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Gray', value: '#808080' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2X', '3X', '4X'],
    category: 'T-SHIRTS',
    inStock: true,
    collection: 'Essentials',
    tags: ['Popular', 'Bestseller'],
    rating: 4.5,
    detailedDescription: 'Basic Heavy Weight T-Shirt with premium cotton blend for durability and comfort.',
    features: [
      'Heavy weight fabric',
      'Classic crewneck design',
      'Reinforced seams',
      'Pre-shrunk cotton',
      'Tagless label'
    ],
    materials: '100% Premium Cotton',
    careInstructions: 'Machine wash cold, tumble dry low'
  },
  3: {
    id: 3,
    name: 'Cotton T-Shirt',
    description: 'Full Sleeve Zipper',
    price: 109,
    originalPrice: null,
    mrpText: 'MRP incl. of all taxes',
    images: [
      '/images/mg0tjbpx-e6qwv49.png',
      '/images/mg0tjbpx-alzkptj.png',
      '/images/mg0tjbpx-2myp9b6.png'
    ],
    colors: [
      { name: 'Brown', value: '#8B4513' },
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2X'],
    category: 'T-SHIRTS',
    inStock: true,
    collection: 'Winter Collection',
    tags: ['New'],
    rating: 4.2,
    detailedDescription: 'Full sleeve cotton t-shirt with zipper detail for modern style and comfort.',
    features: [
      'Full sleeve design',
      'Zipper detail',
      'Soft cotton fabric',
      'Modern fit',
      'Versatile styling'
    ],
    materials: '100% Cotton',
    careInstructions: 'Machine wash cold, tumble dry low'
  },
  4: {
    id: 4,
    name: 'Polo Shirt',
    description: 'Classic Polo Shirt',
    price: 129,
    originalPrice: null,
    mrpText: 'MRP incl. of all taxes',
    images: [
      '/images/mg0tjbpx-ed9lslb.png',
      '/images/mg0tjbpx-alzkptj.png',
      '/images/mg0tjbpx-e6qwv49.png'
    ],
    colors: [
      { name: 'Beige', value: '#F5F5DC' },
      { name: 'Black', value: '#000000' },
      { name: 'Gray', value: '#808080' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2X'],
    category: 'POLO SHIRTS',
    inStock: true,
    collection: 'Summer 2024',
    tags: ['Popular'],
    rating: 4.6,
    detailedDescription: 'Classic polo shirt with timeless design and premium quality fabric.',
    features: [
      'Classic polo collar',
      'Three-button placket',
      'Short sleeves',
      'Ribbed cuffs',
      'Timeless design'
    ],
    materials: '100% Pique Cotton',
    careInstructions: 'Machine wash cold, tumble dry low'
  },
  5: {
    id: 5,
    name: 'Summer Shorts',
    description: 'Casual Cotton Shorts',
    price: 89,
    originalPrice: null,
    mrpText: 'MRP incl. of all taxes',
    images: [
      '/images/mg0tjbpx-j2fwoy5.png',
      '/images/mg0tjbpx-alzkptj.png',
      '/images/mg0tjbpx-e6qwv49.png'
    ],
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Gray', value: '#808080' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2X'],
    category: 'SHORTS',
    inStock: false,
    collection: 'Summer 2024',
    tags: ['Sale'],
    rating: 4.1,
    detailedDescription: 'Casual cotton shorts perfect for summer days and relaxed occasions.',
    features: [
      'Lightweight cotton',
      'Elastic waistband',
      'Side pockets',
      'Comfortable fit',
      'Summer ready'
    ],
    materials: '100% Cotton',
    careInstructions: 'Machine wash cold, tumble dry low'
  },
  6: {
    id: 6,
    name: 'Denim Jacket',
    description: 'Classic Denim Jacket',
    price: 199,
    originalPrice: null,
    mrpText: 'MRP incl. of all taxes',
    images: [
      '/images/mg0tjbpx-ls0hfxw.png',
      '/images/mg0tjbpx-alzkptj.png',
      '/images/mg0tjbpx-e6qwv49.png'
    ],
    colors: [
      { name: 'Light Blue', value: '#87CEEB' },
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2X'],
    category: 'JACKETS',
    inStock: true,
    collection: 'Limited Edition',
    tags: ['Limited Edition', 'Bestseller'],
    rating: 4.8,
    detailedDescription: 'Classic denim jacket with premium construction and timeless appeal.',
    features: [
      'Premium denim fabric',
      'Classic button closure',
      'Chest pockets',
      'Adjustable cuffs',
      'Vintage styling'
    ],
    materials: '100% Cotton Denim',
    careInstructions: 'Machine wash cold, tumble dry low'
  }
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const unwrappedParams = React.use(params)
  const productId = parseInt(unwrappedParams.id)
  const product = productData[productId as keyof typeof productData]
  
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-label-primary mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Product Not Found
          </h1>
          <button
            onClick={() => router.push('/products')}
            className="text-label-secondary hover:text-label-primary transition-colors"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            ← Back to Products
          </button>
        </div>
      </div>
    )
  }

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('Please select a size')
      return
    }
    
    if (!selectedColor) {
      alert('Please select a color')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Add item to cart
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        color: selectedColor.name,
        size: selectedSize
      })
      
      // Simulate brief loading for UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Show success message
      alert('Added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleLike = () => {
    setIsLiked(!isLiked)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="px-8 py-6 border-b border-separator bg-fill-secondary">
        <div className="flex items-center gap-2 text-sm text-label-tertiary">
          <button
            onClick={() => router.push('/')}
            className="font-medium hover:text-label-primary transition-colors"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Home
          </button>
          <span className="text-label-quaternary">/</span>
          <button
            onClick={() => router.push('/products')}
            className="font-medium hover:text-label-primary transition-colors"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Shop
          </button>
          <span className="text-label-quaternary">/</span>
          <span className="text-label-primary font-semibold" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            {product.name}
          </span>
        </div>
      </div>

      {/* Back Button */}
      <div className="px-8 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-label-secondary hover:text-label-primary transition-colors"
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Product Detail Content */}
      <div className="px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Image Gallery */}
            <div className="space-y-6">
              <ImageGallery
                images={product.images}
                selectedIndex={selectedImageIndex}
                onImageSelect={setSelectedImageIndex}
                productName={product.name}
              />
            </div>

            {/* Product Information */}
            <div className="space-y-8">
              {/* Favorite Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleToggleLike}
                  className="w-11 h-11 rounded-full border border-separator bg-background hover:bg-fill-secondary transition-all duration-200 flex items-center justify-center"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isLiked ? 'fill-red-500 text-red-500' : 'text-label-secondary'
                    }`}
                  />
                </button>
              </div>

              {/* Product Title and Price */}
              <div className="space-y-2">
                <h1 className="text-2xl font-normal text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {product.name}
                </h1>
                <p className="text-xl font-normal text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  ${product.price}
                </p>
              </div>

              {/* Product Description */}
              <div className="space-y-3">
                <p className="text-sm text-label-secondary leading-relaxed" style={{ fontFamily: 'Beatrice Trial, serif' }}>
                  {product.detailedDescription}
                </p>
              </div>

              {/* Color Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-normal text-label-primary tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  COLOR
                </h3>
                <ColorSelector
                  colors={product.colors}
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                />
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Size
                  </h3>
                  <div className="flex items-center gap-4">
                    <button className="text-xs text-label-secondary underline hover:text-label-primary transition-colors">
                      FIND YOUR SIZE
                    </button>
                    <button className="text-xs text-label-secondary underline hover:text-label-primary transition-colors">
                      MEASUREMENT GUIDE
                    </button>
                  </div>
                </div>
                <SizeSelector
                  sizes={product.sizes}
                  selectedSize={selectedSize}
                  onSizeSelect={setSelectedSize}
                />
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full h-[50px] bg-label-primary text-background font-medium text-sm tracking-[2px] transition-all duration-200 hover:bg-label-secondary disabled:bg-fill-secondary disabled:text-label-quaternary disabled:cursor-not-allowed flex items-center justify-center"
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                {!selectedSize ? 'SELECT SIZE' : 'ADD'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}