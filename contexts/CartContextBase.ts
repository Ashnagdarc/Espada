import { createContext } from 'react'
import type { CartContextType } from './CartContextTypes'

export const CartContext = createContext<CartContextType | undefined>(undefined)
