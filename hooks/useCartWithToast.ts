'use client'

import { useCart } from '@/contexts/CartContext'
import { useToastActions } from '@/contexts/ToastContext'
import { CartItem } from '@/contexts/CartContext'

export function useCartWithToast() {
  const cart = useCart()
  const { success, error, info } = useToastActions()

  const addItemWithToast = (item: Omit<CartItem, 'quantity'>) => {
    try {
      cart.addItem(item)
      success(
        'Added to cart!',
        `${item.name} in ${item.color}, size ${item.size}`
      )
    } catch (err) {
      console.error('Error adding item to cart:', err)
      error(
        'Failed to add to cart',
        'Please try again or contact support'
      )
    }
  }

  const removeItemWithToast = (id: number, color: string, size: string) => {
    try {
      // Find the item to get its name for the toast
      const item = cart.state.items.find(
        item => item.id === id && item.color === color && item.size === size
      )
      
      cart.removeItem(id, color, size)
      
      if (item) {
        info(
          'Removed from cart',
          `${item.name} in ${color}, size ${size}`
        )
      } else {
        info('Item removed from cart')
      }
    } catch (err) {
      console.error('Error removing item from cart:', err)
      error(
        'Failed to remove item',
        'Please try again or refresh the page'
      )
    }
  }

  const updateQuantityWithToast = (id: number, color: string, size: string, quantity: number) => {
    try {
      const item = cart.state.items.find(
        item => item.id === id && item.color === color && item.size === size
      )
      
      cart.updateQuantity(id, color, size, quantity)
      
      if (item) {
        if (quantity === 0) {
          info(
            'Removed from cart',
            `${item.name} in ${color}, size ${size}`
          )
        } else {
          info(
            'Quantity updated',
            `${item.name} quantity changed to ${quantity}`
          )
        }
      }
    } catch (err) {
      console.error('Error updating quantity:', err)
      error(
        'Failed to update quantity',
        'Please try again or refresh the page'
      )
    }
  }

  const clearCartWithToast = () => {
    try {
      const itemCount = cart.state.itemCount
      cart.clearCart()
      
      if (itemCount > 0) {
        success(
          'Cart cleared',
          `Removed ${itemCount} item${itemCount > 1 ? 's' : ''} from cart`
        )
      }
    } catch (err) {
      console.error('Error clearing cart:', err)
      error(
        'Failed to clear cart',
        'Please try again or refresh the page'
      )
    }
  }

  return {
    ...cart,
    addItem: addItemWithToast,
    removeItem: removeItemWithToast,
    updateQuantity: updateQuantityWithToast,
    clearCart: clearCartWithToast
  }
}