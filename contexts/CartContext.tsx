'use client'

import React, { useEffect, useReducer } from 'react'
import { CartContext } from './CartContextBase'
import type { CartContextType, CartItem, CartState, CartAction } from './CartContextTypes'

export type { CartItem, CartContextType } from './CartContextTypes'

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id &&
                item.color === action.payload.color &&
                item.size === action.payload.size
      )

      let newItems: CartItem[]
      if (existingItemIndex > -1) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }]
      }

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount, isLoaded: state.isLoaded }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        item => !(item.id === action.payload.id &&
                  item.color === action.payload.color &&
                  item.size === action.payload.size)
      )
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount, isLoaded: state.isLoaded }
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, {
          type: 'REMOVE_ITEM',
          payload: { id: action.payload.id, color: action.payload.color, size: action.payload.size }
        })
      }

      const newItems = state.items.map(item =>
        item.id === action.payload.id &&
        item.color === action.payload.color &&
        item.size === action.payload.size
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount, isLoaded: state.isLoaded }
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0, isLoaded: state.isLoaded }

    case 'LOAD_CART': {
      const total = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      return { items: action.payload, total, itemCount, isLoaded: true }
    }

    case 'SET_LOADED':
      return { ...state, isLoaded: action.payload }

    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoaded: false
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart)
        dispatch({ type: 'LOAD_CART', payload: parsedCart })
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error)
      }
    } else {
      dispatch({ type: 'SET_LOADED', payload: true })
    }
  }, [])

  useEffect(() => {
    if (state.isLoaded) {
      localStorage.setItem('cart', JSON.stringify(state.items))
    }
  }, [state.items, state.isLoaded])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: number, color: string, size: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, color, size } })
  }

  const updateQuantity = (id: number, color: string, size: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, color, size, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const contextValue: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}
