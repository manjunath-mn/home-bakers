import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SafeImage } from "@/components/common/SafeImage"
import { WeightSelector } from "@/components/common/WeightSelector"
import { useAppDispatch } from "@/app/hooks"
import { useOffers } from "@/hooks/useOffers"
import { addToCart } from "@/features/cart/cartSlice"
import { getProductBySlug } from "@/lib/data"
import { formatINR, isOfferCurrentlyActive } from "@/lib/pricing"
import type { Product, WeightOption } from "@/lib/types"

export default function ProductDetail() {
  const { productSlug = "" } = useParams()
  const dispatch = useAppDispatch()
  const [product, setProduct] = useState<Product | null | undefined>(undefined)
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(null)
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const { offers } = useOffers()

  useEffect(() => {
    setProduct(undefined)
    setQty(1)
    setActiveImage(0)
    getProductBySlug(productSlug).then((p) => {
      setProduct(p ?? null)
      setSelectedWeight(p?.weightOptions[0] ?? null)
    })
  }, [productSlug])

  const activeOffer =
    product?.isInOffer && product.offerId
      ? (offers.find((o) => o.id === product.offerId && isOfferCurrentlyActive(o)) ?? null)
      : null

  if (product === undefined) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">Loading…</div>
  }

  if (product === null) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-muted-foreground">We couldn't find that cake.</p>
        <Button variant="link" render={<Link to="/" />}>
          Back to home
        </Button>
      </div>
    )
  }

  if (!selectedWeight) return null

  function handleAddToCart() {
    if (!product || !selectedWeight) return
    dispatch(
      addToCart({
        lineId: `${product.id}-${selectedWeight.label}`,
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        image: product.images[0],
        weightLabel: selectedWeight.label,
        weightGrams: selectedWeight.grams,
        unitPrice: selectedWeight.price,
        isSlice: product.isSlice,
        offerId: product.isInOffer ? (product.offerId ?? null) : null,
        qty,
      }),
    )
    toast.success(`${product.name} added to cart`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="aspect-square w-full overflow-hidden rounded-2xl">
            <SafeImage
              src={product.images[activeImage]}
              alt={product.name}
              className="h-full w-full"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`size-16 overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? "border-primary" : "border-transparent"
                  }`}
                >
                  <SafeImage src={img} alt="" className="h-full w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="font-heading text-3xl text-foreground sm:text-4xl">{product.name}</h1>
          <p className="text-muted-foreground">{product.description}</p>

          <p className="font-heading text-2xl text-primary">{formatINR(selectedWeight.price)}</p>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              {product.isSlice ? "Serving" : "Weight"}
            </p>
            <WeightSelector
              options={product.weightOptions}
              selected={selectedWeight}
              onSelect={setSelectedWeight}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Quantity</p>
            <div className="flex w-fit items-center gap-3 rounded-full border border-border px-3 py-2">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <Button size="lg" className="w-fit" onClick={handleAddToCart}>
            Add to Cart
          </Button>

          {activeOffer && (
            <p className="text-sm text-primary">
              {activeOffer.name}
              {activeOffer.minQty > 1 ? ` — add ${activeOffer.minQty} or more to unlock it.` : "."}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
