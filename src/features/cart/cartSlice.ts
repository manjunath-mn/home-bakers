import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { CartItem } from "@/lib/types"

const STORAGE_KEY = "sweetly-baked-cart"

function loadInitialItems(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function persist(items: CartItem[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage unavailable (private browsing, quota) — cart just won't persist.
  }
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

const initialState: CartState = {
  items: loadInitialItems(),
  isOpen: false,
}

export type AddToCartPayload = Omit<CartItem, "qty"> & { qty?: number }

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const qty = action.payload.qty ?? 1
      const existing = state.items.find((item) => item.lineId === action.payload.lineId)
      if (existing) {
        existing.qty += qty
      } else {
        state.items.push({ ...action.payload, qty })
      }
      state.isOpen = true
      persist(state.items)
    },
    incrementItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.lineId === action.payload)
      if (item) item.qty += 1
      persist(state.items)
    },
    decrementItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.lineId === action.payload)
      if (item) {
        item.qty -= 1
        if (item.qty <= 0) {
          state.items = state.items.filter((i) => i.lineId !== action.payload)
        }
      }
      persist(state.items)
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.lineId !== action.payload)
      persist(state.items)
    },
    clearCart: (state) => {
      state.items = []
      persist(state.items)
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    },
  },
})

export const {
  addToCart,
  incrementItem,
  decrementItem,
  removeFromCart,
  clearCart,
  setCartOpen,
} = cartSlice.actions

export default cartSlice.reducer
