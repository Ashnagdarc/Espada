export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  color: string
  size: string
  quantity: number
}

export interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isLoaded: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { id: number; color: string; size: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; color: string; size: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_LOADED'; payload: boolean }

export type { CartAction }

export interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: number, color: string, size: string) => void
  updateQuantity: (id: number, color: string, size: string, quantity: number) => void
  clearCart: () => void
}
