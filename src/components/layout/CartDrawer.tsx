import { Link } from "react-router-dom"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SafeImage } from "@/components/common/SafeImage"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useOffers } from "@/hooks/useOffers"
import {
  decrementItem,
  incrementItem,
  removeFromCart,
  setCartOpen,
} from "@/features/cart/cartSlice"
import { computeCartTotals, formatINR } from "@/lib/pricing"

export function CartDrawer() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((s) => s.cart.isOpen)
  const items = useAppSelector((s) => s.cart.items)
  const { offers } = useOffers()
  const totals = computeCartTotals(items, offers)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => dispatch(setCartOpen(open))}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center text-muted-foreground">
            <ShoppingBag className="size-10 opacity-40" />
            <p>Your cart is empty.</p>
            <Button
              variant="secondary"
              onClick={() => dispatch(setCartOpen(false))}
              render={<Link to="/category/birthday-cakes" />}
            >
              Browse cakes
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.lineId} className="flex gap-3">
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg">
                      <SafeImage src={item.image} alt={item.name} className="h-full w-full" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() => dispatch(removeFromCart(item.lineId))}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.weightLabel}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
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
                        <p className="text-sm font-medium text-foreground">
                          {formatINR(item.unitPrice * item.qty)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="flex-col gap-3 border-t border-border pt-4">
              <div className="flex w-full flex-col gap-1 text-sm">
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
                <div className="mt-1 flex justify-between text-base font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatINR(totals.total)}</span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => dispatch(setCartOpen(false))}
                render={<Link to="/checkout" />}
              >
                Checkout
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
