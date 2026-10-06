import { supabase } from "@/lib/supabaseClient"
import type { CartItem, DeliveryAddress, OrderRecord } from "@/lib/types"

/**
 * Both calls go through the `razorpay` Supabase Edge Function (see
 * supabase/functions/razorpay) — the Razorpay key *secret* never reaches the
 * browser, prices are always recomputed server-side from the `products`
 * table (never trusted from the client), and the order row is only ever
 * written server-side, after the function has verified the payment signature.
 */

export const isPaymentConfigured = Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID)

function toItemInput(items: CartItem[]) {
  return items.map((item) => ({
    productId: item.productId,
    weightLabel: item.weightLabel,
    qty: item.qty,
  }))
}

interface CreateOrderResponse {
  razorpayOrderId: string
  amount: number
  currency: string
}

export async function createRazorpayOrder(items: CartItem[]): Promise<CreateOrderResponse> {
  if (!supabase) throw new Error("Payments aren't available yet — Supabase isn't configured.")
  const { data, error } = await supabase.functions.invoke<CreateOrderResponse>("razorpay", {
    body: { action: "create_order", items: toItemInput(items) },
  })
  if (error) throw error
  if (!data) throw new Error("No response from payment service.")
  return data
}

export interface VerifyPaymentInput {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
  address: DeliveryAddress
  items: CartItem[]
}

export async function verifyPaymentAndPlaceOrder(input: VerifyPaymentInput): Promise<OrderRecord> {
  if (!supabase) throw new Error("Payments aren't available yet — Supabase isn't configured.")
  const { data, error } = await supabase.functions.invoke<OrderRecord>("razorpay", {
    body: {
      action: "verify_payment",
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      razorpaySignature: input.razorpaySignature,
      address: input.address,
      items: toItemInput(input.items),
    },
  })
  if (error) throw error
  if (!data) throw new Error("Payment verification returned no order.")
  return data
}
