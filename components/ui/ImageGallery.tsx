'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: string[]
  selectedIndex: number
  onImageSelect: (index: number) => void
  productName: string
}

export default function ImageGallery({
  images,
  selectedIndex,
  onImageSelect,
  productName
}: ImageGalleryProps) {
  const [imageLoadError, setImageLoadError] = useState<{ [key: number]: boolean }>({})

  const handleImageError = (index: number) => {
    setImageLoadError(prev => ({ ...prev, [index]: true }))
  }

  const handleImageLoad = (index: number) => {
    setImageLoadError(prev => ({ ...prev, [index]: false }))
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-fill-secondary rounded-lg overflow-hidden relative group">
        {imageLoadError[selectedIndex] ? (
          <div className="w-full h-full flex items-center justify-center bg-fill-secondary">
            <div className="text-center">
              <div className="w-16 h-16 bg-fill-tertiary rounded-lg mb-3 mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-label-quaternary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-label-tertiary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                Image not available
              </p>
            </div>
          </div>
        ) : (
          <Image
            src={images[selectedIndex]}
            alt={`${productName} - View ${selectedIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
            onError={() => handleImageError(selectedIndex)}
            onLoad={() => handleImageLoad(selectedIndex)}
          />
        )}
        
        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-xs text-label-primary font-medium" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            {selectedIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onImageSelect(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              selectedIndex === index
                ? 'border-label-primary shadow-md'
                : 'border-separator hover:border-label-secondary'
            }`}
          >
            {imageLoadError[index] ? (
              <div className="w-full h-full bg-fill-secondary flex items-center justify-center">
                <svg className="w-6 h-6 text-label-quaternary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            ) : (
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover transition-opacity duration-200 hover:opacity-80"
                onError={() => handleImageError(index)}
                onLoad={() => handleImageLoad(index)}
              />
            )}
          </button>
        ))}
      </div>

      {/* Navigation Arrows for Mobile */}
      <div className="flex justify-between items-center md:hidden">
        <button
          onClick={() => onImageSelect(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1)}
          className="w-10 h-10 rounded-full bg-background border border-separator flex items-center justify-center hover:bg-fill-secondary transition-colors"
          aria-label="Previous image"
        >
          <svg className="w-5 h-5 text-label-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <span className="text-sm text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
          {selectedIndex + 1} of {images.length}
        </span>
        
        <button
          onClick={() => onImageSelect(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0)}
          className="w-10 h-10 rounded-full bg-background border border-separator flex items-center justify-center hover:bg-fill-secondary transition-colors"
          aria-label="Next image"
        >
          <svg className="w-5 h-5 text-label-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}