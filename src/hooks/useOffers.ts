import { useCallback, useEffect, useState } from "react"
import { getOffers } from "@/lib/data"
import type { Offer } from "@/lib/types"

export interface UseOffersResult {
  /** All offers (including inactive/expired/future ones) — filter with isOfferLive / isOfferCurrentlyActive. */
  offers: Offer[]
  loading: boolean
  refresh: () => void
}

export function useOffers(): UseOffersResult {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    getOffers().then((data) => {
      setOffers(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { offers, loading, refresh }
}
