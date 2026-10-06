import type { CartItem, Offer, WeightOption } from "@/lib/types"

export const BASE_PRICE_600G = 999

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

export function formatINR(amount: number): string {
  return currencyFormatter.format(amount)
}

/** Standard 600g / 1kg / 1.5kg / 2kg ladder for birthday-style cakes, priced off a 600g base. */
export function standardWeightOptions(base600g: number = BASE_PRICE_600G): WeightOption[] {
  return [
    { label: "600 g", grams: 600, price: base600g },
    { label: "1 kg", grams: 1000, price: Math.round(base600g * 1.55) },
    { label: "1.5 kg", grams: 1500, price: Math.round(base600g * 2.2) },
    { label: "2 kg", grams: 2000, price: Math.round(base600g * 2.75) },
  ]
}

/** Larger ladder for multi-tier wedding cakes. */
export function weddingWeightOptions(base600g: number = BASE_PRICE_600G): WeightOption[] {
  return [
    { label: "2 kg", grams: 2000, price: Math.round(base600g * 2.75) },
    { label: "3 kg", grams: 3000, price: Math.round(base600g * 3.9) },
    { label: "4 kg", grams: 4000, price: Math.round(base600g * 4.9) },
    { label: "5 kg", grams: 5000, price: Math.round(base600g * 5.8) },
  ]
}

/**
 * True when an offer is turned on by the admin and currently inside its
 * [startsAt, endsAt] window (endsAt null = runs indefinitely). Use this to
 * decide whether to *display* an offer (banner or product hint) — it says
 * nothing about whether it carries an automatic discount.
 */
export function isOfferLive(offer: Offer, now: Date = new Date()): boolean {
  const nowTime = now.getTime()
  if (!offer.isActive) return false
  if (nowTime < new Date(offer.startsAt).getTime()) return false
  if (offer.endsAt && nowTime > new Date(offer.endsAt).getTime()) return false
  return true
}

/** isOfferLive, plus it actually carries a discount (discountPercent is set) — use this to decide whether to apply a cart discount. */
export function isOfferCurrentlyActive(offer: Offer, now: Date = new Date()): boolean {
  return offer.discountPercent !== null && isOfferLive(offer, now)
}

export interface AppliedDiscount {
  offerId: string
  offerName: string
  amount: number
}

export interface CartTotals {
  subtotal: number
  discounts: AppliedDiscount[]
  totalDiscount: number
  total: number
}

/**
 * Groups cart items by the single offer each product belongs to (if any) and,
 * for every offer that's currently active, applies its discountPercent once
 * that offer's combined quantity in the cart reaches minQty. A product can
 * only ever be in one offer's group, since CartItem.offerId is a single value
 * — so discounts never stack on the same item.
 */
export function computeCartTotals(items: CartItem[], offers: Offer[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)

  const activeOffersById = new Map(
    offers.filter((o) => isOfferCurrentlyActive(o)).map((o) => [o.id, o]),
  )

  const discounts: AppliedDiscount[] = []
  for (const [offerId, offer] of activeOffersById) {
    const offerItems = items.filter((item) => item.offerId === offerId)
    const qty = offerItems.reduce((sum, item) => sum + item.qty, 0)
    if (qty < offer.minQty) continue

    const offerSubtotal = offerItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
    const amount = Math.round((offerSubtotal * (offer.discountPercent ?? 0)) / 100)
    if (amount > 0) discounts.push({ offerId, offerName: offer.name, amount })
  }

  const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0)

  return {
    subtotal,
    discounts,
    totalDiscount,
    total: subtotal - totalDiscount,
  }
}
