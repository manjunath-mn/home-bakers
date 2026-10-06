// Supabase Edge Function: handles both steps of the Razorpay flow.
//
//   action "create_order"  -> creates a Razorpay order for the authoritative,
//                             server-recomputed total of the given cart items.
//   action "verify_payment" -> verifies the payment signature Razorpay returns,
//                              re-verifies the amount actually paid against the
//                              same recomputed total, and only then writes the
//                              order row (using the service role key, which
//                              bypasses RLS — this is the one place orders get
//                              inserted; the browser has no insert policy).
//
// Prices are NEVER trusted from the browser — every item is re-priced here
// from the `products` table so a tampered client request can't under-charge
// or write a forged order.
//
// Deploy with the Supabase CLI:
//   supabase functions deploy razorpay
//   supabase secrets set RAZORPAY_KEY_ID=rzp_test_... RAZORPAY_KEY_SECRET=...
//
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically to
// every Edge Function by the Supabase runtime — no need to set them yourself.)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface CartItemInput {
  productId: string
  weightLabel: string
  qty: number
}

interface DeliveryAddress {
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

interface OrderItemRecord {
  product_id: string
  product_name: string
  weight_label: string
  weight_grams: number
  unit_price: number
  qty: number
  line_total: number
}

interface OfferRow {
  id: string
  discountPercent: number | null
  minQty: number
  startsAt: string
  endsAt: string | null
  isActive: boolean
}

function isOfferLive(offer: OfferRow, now: number): boolean {
  if (!offer.isActive || offer.discountPercent === null) return false
  if (now < new Date(offer.startsAt).getTime()) return false
  if (offer.endsAt && now > new Date(offer.endsAt).getTime()) return false
  return true
}

/**
 * Re-prices every cart item from the `products` table (never trusting the
 * client's price), then groups items by the single offer each product
 * belongs to and applies that offer's discountPercent once its combined
 * quantity reaches minQty — mirroring src/lib/pricing.ts's computeCartTotals,
 * but as the authoritative, server-side version.
 */
async function recomputeTotals(
  supabaseAdmin: ReturnType<typeof createClient>,
  items: CartItemInput[],
) {
  if (!items.length) throw new Error("Cart is empty.")

  const productIds = [...new Set(items.map((i) => i.productId))]
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select('id, name, isSlice, weightOptions, isInOffer, offerId')
    .in("id", productIds)
  if (error) throw error

  const lineItems: OrderItemRecord[] = []
  let subtotal = 0
  // offerId -> { qty, subtotal } for every offer referenced by an item in this cart.
  const offerGroups = new Map<string, { qty: number; subtotal: number }>()

  for (const item of items) {
    const product = products?.find((p: Record<string, unknown>) => p.id === item.productId)
    if (!product) throw new Error(`Unknown product: ${item.productId}`)

    const weightOptions = product.weightOptions as { label: string; grams: number; price: number }[]
    const weightOption = weightOptions.find((w) => w.label === item.weightLabel)
    if (!weightOption) {
      throw new Error(`Unknown weight option "${item.weightLabel}" for ${product.name}`)
    }
    if (!Number.isInteger(item.qty) || item.qty < 1) {
      throw new Error(`Invalid quantity for ${product.name}`)
    }

    const lineTotal = weightOption.price * item.qty
    subtotal += lineTotal
    lineItems.push({
      product_id: product.id as string,
      product_name: product.name as string,
      weight_label: weightOption.label,
      weight_grams: weightOption.grams,
      unit_price: weightOption.price,
      qty: item.qty,
      line_total: lineTotal,
    })

    if (product.isInOffer && product.offerId) {
      const group = offerGroups.get(product.offerId as string) ?? { qty: 0, subtotal: 0 }
      group.qty += item.qty
      group.subtotal += lineTotal
      offerGroups.set(product.offerId as string, group)
    }
  }

  let discount = 0
  if (offerGroups.size > 0) {
    const { data: offers, error: offersError } = await supabaseAdmin
      .from("offers")
      .select('id, "discountPercent", "minQty", "startsAt", "endsAt", "isActive"')
      .in("id", [...offerGroups.keys()])
    if (offersError) throw offersError

    const now = Date.now()
    for (const offer of (offers ?? []) as OfferRow[]) {
      if (!isOfferLive(offer, now)) continue
      const group = offerGroups.get(offer.id)
      if (!group || group.qty < offer.minQty) continue
      discount += Math.round((group.subtotal * (offer.discountPercent ?? 0)) / 100)
    }
  }

  const total = subtotal - discount

  return { lineItems, subtotal, discount, total }
}

async function razorpayRequest(path: string, init: RequestInit) {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID")
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")
  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not configured on this Edge Function.")
  }
  const auth = btoa(`${keyId}:${keySecret}`)
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: { ...init.headers, Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.description ?? "Razorpay request failed.")
  return json
}

async function verifySignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")
  if (!keySecret) throw new Error("RAZORPAY_KEY_SECRET is not configured.")

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keySecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${orderId}|${paymentId}`))
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return expected === signature
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    // Identify the caller from their own JWT (never trust a client-supplied user id).
    const authHeader = req.headers.get("Authorization") ?? ""
    const supabaseAsUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const {
      data: { user },
    } = await supabaseAsUser.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const body = await req.json()

    if (body.action === "create_order") {
      const items: CartItemInput[] = body.items
      const { total } = await recomputeTotals(supabaseAdmin, items)
      if (total <= 0) throw new Error("Order total must be greater than zero.")

      const order = await razorpayRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          amount: total * 100, // paise
          currency: "INR",
          receipt: `sb_${Date.now()}`,
        }),
      })

      return new Response(
        JSON.stringify({ razorpayOrderId: order.id, amount: order.amount, currency: order.currency }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    if (body.action === "verify_payment") {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, address, items } = body as {
        razorpayOrderId: string
        razorpayPaymentId: string
        razorpaySignature: string
        address: DeliveryAddress
        items: CartItemInput[]
      }

      const isValid = await verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Payment signature verification failed." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Re-derive the same authoritative total and cross-check it against
      // what Razorpay actually captured, so a tampered `items` payload here
      // can't make us record a different (cheaper) order than was paid for.
      const { lineItems, subtotal, discount, total } = await recomputeTotals(supabaseAdmin, items)
      const razorpayOrder = await razorpayRequest(`/orders/${razorpayOrderId}`, { method: "GET" })
      if (razorpayOrder.amount !== total * 100) {
        throw new Error("Paid amount does not match the order total.")
      }

      const orderNumber = `SB-${Date.now().toString(36).toUpperCase()}-${crypto
        .randomUUID()
        .slice(0, 4)
        .toUpperCase()}`

      const order = {
        order_number: orderNumber,
        user_id: user.id,
        customer_name: address.fullName,
        phone: address.phone,
        email: address.email,
        address,
        items: lineItems,
        subtotal,
        discount,
        total,
        payment_method: "razorpay",
        payment_status: "paid",
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        status: "placed",
      }

      const { error: insertError } = await supabaseAdmin.from("orders").insert(order)
      if (insertError) throw insertError

      return new Response(JSON.stringify(order), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${body.action}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
