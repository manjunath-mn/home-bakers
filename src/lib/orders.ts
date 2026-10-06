import { supabase } from "@/lib/supabaseClient"
import type { OrderRecord } from "@/lib/types"

const LAST_ORDER_KEY = "sweetly-baked-last-order"

/** Called after the `razorpay` Edge Function confirms payment and returns the order. */
export function rememberLastOrder(order: OrderRecord) {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order))
}

export function getLastOrder(): OrderRecord | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(LAST_ORDER_KEY)
    return raw ? (JSON.parse(raw) as OrderRecord) : null
  } catch {
    return null
  }
}

export async function getMyOrders(userId: string): Promise<OrderRecord[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as OrderRecord[]
}
