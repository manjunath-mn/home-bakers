import type { Offer } from "@/lib/types"

export const offers: Offer[] = [
  {
    id: "offer-buy2",
    name: "Buy 2 Cakes, Get 20% Off",
    description: "Add any 2 whole cakes to your cart and the discount applies automatically at checkout.",
    badge: "Limited time",
    accent: "primary",
    discountPercent: 20,
    minQty: 2,
    startsAt: "2024-01-01T00:00:00.000Z",
    endsAt: null,
    isActive: true,
  },
  {
    id: "offer-starting-price",
    name: "Cakes Start at just ₹999",
    description: "Freshly baked 600 g cakes starting at ₹999 — perfect for small celebrations.",
    badge: "Everyday price",
    accent: "gold",
    discountPercent: null,
    minQty: 1,
    startsAt: "2024-01-01T00:00:00.000Z",
    endsAt: null,
    isActive: true,
  },
]
