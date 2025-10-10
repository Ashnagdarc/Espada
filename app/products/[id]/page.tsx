'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Star, ArrowLeft, Plus, Minus, Camera } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
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
  features?: string[];
  materials?: string;
}



// Removed unused ProductDetailPageProps interface

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
  const [activeTab, setActiveTab] = useState('details')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/products/${productId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found')
          } else {
            setError(`Failed to load product: ${response.status} ${response.statusText}`)
          }
          return
        }

        const apiProductData = await response.json()
        setProduct(apiProductData)
        setSelectedColor(apiProductData.colors?.[0] || '')
        setSelectedSize(apiProductData.sizes?.[0] || '')
      } catch (err) {
        console.error('Error fetching product:', err)
        setError(err instanceof Error ? err.message : 'Failed to load product')
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-label-primary mx-auto mb-4"></div>
            <p className="text-label-secondary">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">😞</div>
            <h1 className="text-2xl font-bold text-label-primary mb-4">
              {error === 'Product not found' ? 'Product Not Found' : 'Something went wrong'}
            </h1>
            <p className="text-label-secondary mb-6">
              {error === 'Product not found'
                ? "The product you're looking for doesn't exist or has been removed."
                : error || 'We encountered an error while loading this product.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/products">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
              {error !== 'Product not found' && (
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
        <Footer />
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      console.log('File uploaded:', file.name)
      // Here you would typically upload the file to your server
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file)
      console.log('File dropped:', file.name)
    }
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
                  src={product.images[selectedImage] || product.image || '/images/mg0tjbpx-alzkptj.png'}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/mg0tjbpx-alzkptj.png';
                  }}
                  priority
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-gray-900' : 'border-gray-200'
                        }`}
                    >
                      <Image
                        src={image || '/images/mg0tjbpx-alzkptj.png'}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/mg0tjbpx-alzkptj.png';
                        }}
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
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
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
                    {product.colors.map((color: any) => {
                      const colorName = typeof color === 'object' ? color.name : color;
                      return (
                        <button
                          key={colorName}
                          onClick={() => setSelectedColor(colorName)}
                          className={`px-3 py-1 text-sm border rounded-md ${selectedColor === colorName
                              ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-black'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                            }`}
                        >
                          {colorName}
                        </button>
                      );
                    })}
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
                        className={`px-3 py-1 text-sm border rounded-md ${selectedSize === size
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

        {/* Product Information Tabs */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: 'details', label: 'View Product Details' },
                  { id: 'size', label: 'Size & Fit' },
                  { id: 'shipping', label: 'Shipping & Returns' },
                  { id: 'reviews', label: 'Reviews' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                        ? 'border-black dark:border-white text-black dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Product Details</h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {product.description}
                    </p>
                    {product.features && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Features:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                          {product.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {product.materials && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Materials:</h4>
                        <p className="text-gray-600 dark:text-gray-300">{product.materials}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'size' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Size & Fit</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Size Guide</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p><strong>XS:</strong> Chest 32-34", Waist 26-28"</p>
                        <p><strong>S:</strong> Chest 34-36", Waist 28-30"</p>
                        <p><strong>M:</strong> Chest 36-38", Waist 30-32"</p>
                        <p><strong>L:</strong> Chest 38-40", Waist 32-34"</p>
                        <p><strong>XL:</strong> Chest 40-42", Waist 34-36"</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Fit Information</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>• Regular fit</p>
                        <p>• True to size</p>
                        <p>• Comfortable stretch</p>
                        <p>• Model is 6'0" wearing size M</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Shipping & Returns</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Shipping Options</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p><strong>Standard Shipping:</strong> 5-7 business days - Free on orders over $50</p>
                        <p><strong>Express Shipping:</strong> 2-3 business days - $9.99</p>
                        <p><strong>Next Day Delivery:</strong> 1 business day - $19.99</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Returns & Exchanges</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>• 30-day return policy</p>
                        <p>• Free returns on all orders</p>
                        <p>• Items must be unworn with tags</p>
                        <p>• Easy online return process</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Customer Reviews</h3>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                      {product.rating} out of 5
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">(124 reviews)</span>
                  </div>
                  <div className="space-y-4">
                    {/* Sample reviews */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">Sarah M.</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Verified Purchase</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        "Great quality and perfect fit! The material is soft and comfortable. Highly recommend!"
                      </p>
                    </div>
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          <Star className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">Mike R.</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Verified Purchase</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        "Good product overall. Runs slightly large, so consider sizing down."
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How Others Are Wearing It Section */}
        <div className="bg-white dark:bg-black py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-medium text-black dark:text-white mb-2">
                How Others Are Wearing It
              </h2>
              <p className="text-sm text-black dark:text-white mb-6">
                Upload your photo or mention @espada on Instagram for a chance to be featured.
              </p>

              {/* Upload Area */}
              <div
                className="border border-black dark:border-white p-4 mb-4"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Camera className="w-6 h-6 text-black dark:text-white" />
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-black dark:text-white">
                      {uploadedFile ? uploadedFile.name : 'Drag and drop your photo here'}
                    </h3>
                    <p className="text-xs text-black dark:text-white">
                      or click below to browse
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload">
                    <button className="border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white px-4 py-2 text-sm cursor-pointer">
                      Upload your photo
                    </button>
                  </label>
                </div>
              </div>

              {uploadedFile && (
                <div className="text-center">
                  <p className="text-black dark:text-white text-sm">
                    Photo uploaded successfully! We'll review it for featuring.
                  </p>
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