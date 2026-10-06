export type CategorySlug = "birthday-cakes" | "wedding-cakes" | "cake-slices"

export interface Category {
  id: string
  slug: CategorySlug
  name: string
  tagline: string
  image: string
}

export interface WeightOption {
  label: string
  grams: number
  price: number
}

export interface Product {
  id: string
  slug: string
  categoryId: string
  categorySlug: CategorySlug
  name: string
  description: string
  images: string[]
  /** True for single-slice / by-the-slice items, priced per piece rather than by weight. */
  isSlice: boolean
  weightOptions: WeightOption[]
  tags: string[]
  featured?: boolean
  /** Kept in sync with offerId — true iff offerId is set. A product can belong to at most one offer. */
  isInOffer?: boolean
  offerId?: string | null
}

export interface Offer {
  id: string
  name: string
  description: string
  badge: string
  accent: "primary" | "gold"
  /** null = a purely informational banner, not an automatic cart discount. */
  discountPercent: number | null
  /** Minimum combined quantity of this offer's products needed in the cart to trigger the discount. */
  minQty: number
  startsAt: string
  endsAt: string | null
  isActive: boolean
}

export interface CartItem {
  /** Unique per product + weight option combination. */
  lineId: string
  productId: string
  productSlug: string
  name: string
  image: string
  weightLabel: string
  weightGrams: number
  unitPrice: number
  qty: number
  isSlice: boolean
  offerId: string | null
}

export interface DeliveryAddress {
  fullName: string
  phone: string
  email: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  notes?: string
}

export type OrderStatus = "placed"
export type PaymentMethod = "razorpay"
export type PaymentStatus = "pending" | "paid" | "failed"

export interface OrderItemRecord {
  product_id: string
  product_name: string
  weight_label: string
  weight_grams: number
  unit_price: number
  qty: number
  line_total: number
}

export interface OrderRecord {
  order_number: string
  user_id: string
  customer_name: string
  phone: string
  email: string
  address: DeliveryAddress
  items: OrderItemRecord[]
  subtotal: number
  discount: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  razorpay_order_id?: string
  razorpay_payment_id?: string
  status: OrderStatus
}

export type UserRole = "customer" | "admin"

export interface AuthUser {
  id: string
  email: string
  fullName: string | null
  role: UserRole
}
