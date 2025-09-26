'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from './Button'
import { useCart } from '@/contexts/CartContext'

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  badge?: 'New' | 'Sale'
  isLiked?: boolean
  colors?: Array<{ name: string; value: string }>
}

interface ProductCardProps {
  product: Product
  layout?: 'grid' | 'list'
  className?: string
}

export default function ProductCard({ product, layout = 'grid', className }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(product.isLiked || false)
  const [isLoading, setIsLoading] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = async () => {
    setIsLoading(true)
    
    try {
      // Add item to cart with default values for size and color
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.colors?.[0]?.name || 'Default',
        size: 'M' // Default size for quick add from product card
      })
      
      // Simulate brief loading for UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Could show a toast notification here instead of alert
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

  if (layout === 'list') {
    return (
      <motion.div
        className={cn(
          'card-apple flex items-center p-4 transition-all hover:shadow-lg',
          className
        )}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="relative h-20 w-20 flex-shrink-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="rounded-lg object-cover"
          />
          {product.badge && (
            <span className={cn(
              'absolute -top-1 -right-1 rounded-full px-2 py-1 text-caption-1 font-semibold',
              product.badge === 'New' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            )}>
              {product.badge}
            </span>
          )}
        </div>
        
        <div className="flex-1 ml-4">
          <h3 className="text-callout font-semibold text-foreground">{product.name}</h3>
          <div className="mt-1 flex items-center space-x-2">
            <span className="text-headline font-bold text-foreground">${product.price}</span>
            {product.originalPrice && (
              <span className="text-footnote text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleLike}
            className="h-11 w-11 p-0 rounded-full"
          >
            <Heart
              className={cn(
                'h-5 w-5',
                isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              )}
            />
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            loading={isLoading}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn(
        'card-apple group relative overflow-hidden transition-all hover:shadow-xl',
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        
        {product.badge && (
          <span className={cn(
            'absolute top-3 left-3 rounded-full px-3 py-1 text-caption-1 font-semibold shadow-sm',
            product.badge === 'New' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          )}>
            {product.badge}
          </span>
        )}
        
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleToggleLike()
            }}
            className="absolute top-3 right-3 h-11 w-11 rounded-full bg-white/90 p-0 backdrop-blur-sm hover:bg-white shadow-sm z-10"
          >
            <Heart
              className={cn(
                'h-5 w-5',
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
              )}
            />
          </Button>
        </div>
        
        <div className="p-4 space-y-3">
          <h3 className="text-callout font-semibold text-foreground line-clamp-2">{product.name}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-headline font-bold text-foreground">${product.price}</span>
              {product.originalPrice && (
                <span className="text-footnote text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>
          
          {/* Color Options Preview */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1">
              {product.colors.slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-separator"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground ml-1">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </Link>
      
      <div className="px-4 pb-4">
        <Button
          variant="primary"
          size="md"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleAddToCart()
          }}
          loading={isLoading}
          className="w-full"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  )
}