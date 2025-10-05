'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ProductInfoProps {
  name: string
  price: number
  originalPrice?: number | null
  mrpText?: string
  description: string
  features?: string[]
  materials?: string
  careInstructions?: string
}

export default function ProductInfo({
  name,
  price,
  originalPrice,
  mrpText = 'MRP incl. of all taxes',
  description,
  features = [],
  materials,
  careInstructions
}: ProductInfoProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showCare, setShowCare] = useState(false)

  const formatPrice = (price: number) => {
    return `$${price}`
  }

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <h1 className="text-2xl font-normal text-label-primary tracking-wide" style={{ fontFamily: 'Gilroy, sans-serif' }}>
        {name}
      </h1>

      {/* Price */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-xl font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            {formatPrice(price)}
          </span>
          {originalPrice && (
            <span className="text-lg text-label-tertiary line-through" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
        {mrpText && (
          <p className="text-xs text-label-tertiary" style={{ fontFamily: 'Beatrice Trial, serif' }}>
            {mrpText}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-3">
        <p className="text-sm text-label-secondary leading-relaxed" style={{ fontFamily: 'Beatrice Trial, serif' }}>
          {description}
        </p>
      </div>

      {/* Product Details Accordion */}
      {(features.length > 0 || materials) && (
        <div className="border-t border-separator pt-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between py-3 text-left hover:bg-fill-secondary transition-colors rounded-lg px-3 -mx-3"
          >
            <span className="text-sm font-medium text-label-primary tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              PRODUCT DETAILS
            </span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-label-secondary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-label-secondary" />
            )}
          </button>
          
          {showDetails && (
            <div className="px-3 pb-3 space-y-4 animate-in slide-in-from-top-2 duration-200">
              {features.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-label-primary mb-2 tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    FEATURES
                  </h4>
                  <ul className="space-y-1">
                    {features.map((feature, index) => (
                      <li key={index} className="text-sm text-label-secondary flex items-start gap-2" style={{ fontFamily: 'Beatrice Trial, serif' }}>
                        <span className="w-1 h-1 bg-label-tertiary rounded-full mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {materials && (
                <div>
                  <h4 className="text-xs font-medium text-label-primary mb-2 tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    MATERIALS
                  </h4>
                  <p className="text-sm text-label-secondary" style={{ fontFamily: 'Beatrice Trial, serif' }}>
                    {materials}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Care Instructions Accordion */}
      {careInstructions && (
        <div className="border-t border-separator pt-6">
          <button
            onClick={() => setShowCare(!showCare)}
            className="w-full flex items-center justify-between py-3 text-left hover:bg-fill-secondary transition-colors rounded-lg px-3 -mx-3"
          >
            <span className="text-sm font-medium text-label-primary tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              CARE INSTRUCTIONS
            </span>
            {showCare ? (
              <ChevronUp className="w-4 h-4 text-label-secondary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-label-secondary" />
            )}
          </button>
          
          {showCare && (
            <div className="px-3 pb-3 animate-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-label-secondary" style={{ fontFamily: 'Beatrice Trial, serif' }}>
                {careInstructions}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}