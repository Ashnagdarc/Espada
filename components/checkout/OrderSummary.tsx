'use client'

import Image from 'next/image'
import { useCartWithToast } from '@/hooks/useCartWithToast'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, X } from 'lucide-react'

interface OrderSummaryProps {
  className?: string
}

export default function OrderSummary({ className }: OrderSummaryProps) {
  const { state, removeItem, updateQuantity } = useCartWithToast()

  const subtotal = state.total
  const shipping = 0 // Free shipping
  const total = subtotal + shipping

  return (
    <div className={`bg-fill-secondary p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
          YOUR ORDER
        </h2>
        <span className="text-sm text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
          ({state.itemCount})
        </span>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {state.items.map((item) => (
          <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4">
            <div className="relative w-16 h-16 bg-fill-tertiary rounded-md overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                {item.name}
              </h3>
              <div className="flex gap-2 text-xs text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                <span>{item.color}</span>
                <span>•</span>
                <span>{item.size}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.color, item.size, Math.max(0, item.quantity - 1))}
                    className="w-6 h-6 rounded-full border border-separator bg-background hover:bg-fill-secondary transition-colors flex items-center justify-center"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-3 h-3 text-label-secondary" />
                  </button>
                  <span className="text-xs text-label-primary min-w-[20px] text-center" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                    className="w-6 h-6 rounded-full border border-separator bg-background hover:bg-fill-secondary transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3 text-label-secondary" />
                  </button>
                </div>
                <span className="text-sm font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={() => removeItem(item.id, item.color, item.size)}
              className="w-6 h-6 rounded-full border border-separator bg-background hover:bg-fill-secondary transition-colors flex items-center justify-center group"
              title="Remove item"
            >
              <X className="w-3 h-3 text-label-secondary group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="space-y-3 pt-4 border-t border-separator">
        <div className="flex justify-between text-sm" style={{ fontFamily: 'Gilroy, sans-serif' }}>
          <span className="text-label-secondary">Subtotal</span>
          <span className="text-label-primary">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm" style={{ fontFamily: 'Gilroy, sans-serif' }}>
          <span className="text-label-secondary">Shipping</span>
          <span className="text-label-secondary">Calculated at next step</span>
        </div>
        <div className="flex justify-between text-lg font-medium pt-2 border-t border-separator" style={{ fontFamily: 'Gilroy, sans-serif' }}>
          <span className="text-label-primary">Total</span>
          <span className="text-label-primary">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}