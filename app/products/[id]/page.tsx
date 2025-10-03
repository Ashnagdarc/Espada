'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Star, ArrowLeft, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCartWithToast } from '@/hooks/useCartWithToast'
// Using custom toast component instead of sonner

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  collection: string;
  stock: number;
  inStock: boolean;
  featured: boolean;
  tags: string[];
  rating: number;
  sizes: string[];
  colors: string[];
  createdAt: string;
  updatedAt: string;
}

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

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const { addItem } = useCartWithToast()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${productId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found')
          } else {
            setError('Failed to load product')
          }
          return
        }
        
        const productData = await response.json()
        setProduct(productData)
        setSelectedColor(productData.colors?.[0] || '')
        setSelectedSize(productData.sizes?.[0] || '')
      } catch (err) {
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Product Not Found'}</h1>
          <Link href="/products">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setIsLoading(true)
    
    try {
      // Add item to cart with selected options
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: parseInt(product.id),
          name: product.name,
          price: product.price,
          image: product.images[0] || product.image,
          color: selectedColor || product.colors?.[0] || 'Default',
          size: selectedSize || product.sizes?.[0] || 'M',
        })
      }
      
      // Brief loading for UX
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleLike = () => {
    setIsLiked(!isLiked)
    console.log(isLiked ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <>
      <Header />
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/products" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-gray-900' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">${product.price}</span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{product.description}</p>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Color</h3>
                <div className="flex space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        selectedColor === color
                          ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-black'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Size</h3>
                <div className="flex space-x-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        selectedSize === size
                          ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-black'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-md border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 dark:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded-md border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 dark:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <Badge variant={product.inStock ? 'default' : 'destructive'}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
              {product.inStock && (
                <span className="text-sm text-gray-600 dark:text-gray-300">{product.stock} available</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleLike}
                className="px-4"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}