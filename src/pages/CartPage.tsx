import { Link } from "react-router-dom"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SafeImage } from "@/components/common/SafeImage"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useOffers } from "@/hooks/useOffers"
import { decrementItem, incrementItem, removeFromCart } from "@/features/cart/cartSlice"
import { computeCartTotals, formatINR } from "@/lib/pricing"

export default function CartPage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.cart.items)
  const { offers } = useOffers()
  const totals = computeCartTotals(items, offers)

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingBag className="size-12 text-muted-foreground opacity-40" />
        <h1 className="font-heading text-2xl text-foreground">Your cart is empty</h1>
        <p className="text-muted-foreground">Browse our cakes and add something sweet.</p>
        <Button render={<Link to="/category/birthday-cakes" />}>Shop Birthday Cakes</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-heading text-3xl text-foreground">Your Cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <ul className="flex flex-col gap-5 lg:col-span-2">
          {items.map((item) => (
            <li key={item.lineId} className="flex gap-4 rounded-2xl border border-border p-4">
              <div className="size-24 shrink-0 overflow-hidden rounded-xl">
                <SafeImage src={item.image} alt={item.name} className="h-full w-full" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.weightLabel}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => dispatch(removeFromCart(item.lineId))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-border px-3 py-1.5">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => dispatch(decrementItem(item.lineId))}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-4 text-center text-sm">{item.qty}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => dispatch(incrementItem(item.lineId))}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <p className="font-medium text-foreground">
                    {formatINR(item.unitPrice * item.qty)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-2xl border border-border p-6">
          <h2 className="font-heading text-lg text-foreground">Order Summary</h2>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatINR(totals.subtotal)}</span>
            </div>
            {totals.discounts.map((d) => (
              <div key={d.offerId} className="flex justify-between text-primary">
                <span>{d.offerName}</span>
                <span>-{formatINR(d.amount)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
              <span>Total</span>
              <span>{formatINR(totals.total)}</span>
            </div>
          </div>
          <Button size="lg" className="mt-5 w-full" render={<Link to="/checkout" />}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}
