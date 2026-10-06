import { type FormEvent, useRef, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useOffers } from "@/hooks/useOffers"
import { clearCart } from "@/features/cart/cartSlice"
import { computeCartTotals, formatINR } from "@/lib/pricing"
import { createRazorpayOrder, isPaymentConfigured, verifyPaymentAndPlaceOrder } from "@/lib/payments"
import { rememberLastOrder } from "@/lib/orders"
import { openRazorpayCheckout } from "@/lib/razorpay"
import type { DeliveryAddress } from "@/lib/types"

const emptyAddress: DeliveryAddress = {
  fullName: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
}

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)
  const items = useAppSelector((s) => s.cart.items)
  const { offers } = useOffers()
  const totals = computeCartTotals(items, offers)

  const [address, setAddress] = useState<DeliveryAddress>({
    ...emptyAddress,
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Once an order is placed we clear the cart, which would otherwise make the
  // `items.length === 0` guard below fire and redirect here to /cart instead
  // of letting the navigate("/order-confirmed") below win.
  const orderPlaced = useRef(false)

  if (items.length === 0 && !orderPlaced.current) {
    return <Navigate to="/cart" replace />
  }

  function update<K extends keyof DeliveryAddress>(key: K, value: DeliveryAddress[K]) {
    setAddress((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)
    try {
      const razorpayOrder = await createRazorpayOrder(items)
      const payment = await openRazorpayCheckout({
        keyId: import.meta.env.VITE_RAZORPAY_KEY_ID as string,
        razorpayOrderId: razorpayOrder.razorpayOrderId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        customerName: address.fullName,
        customerEmail: address.email,
        customerPhone: address.phone,
      })
      const order = await verifyPaymentAndPlaceOrder({
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
        address,
        items,
      })
      rememberLastOrder(order)
      orderPlaced.current = true
      dispatch(clearCart())
      navigate("/order-confirmed")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment couldn't be completed.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-heading text-3xl text-foreground">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <h2 className="font-heading text-lg text-foreground">Delivery Address</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                required
                value={address.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                required
                pattern="[0-9]{10}"
                title="10-digit phone number"
                value={address.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={address.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="line1">Address line 1</Label>
            <Input
              id="line1"
              required
              value={address.line1}
              onChange={(e) => update("line1", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="line2">Address line 2 (optional)</Label>
            <Input
              id="line2"
              value={address.line2}
              onChange={(e) => update("line2", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                required
                value={address.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                required
                value={address.state}
                onChange={(e) => update("state", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                required
                pattern="[0-9]{6}"
                title="6-digit pincode"
                value={address.pincode}
                onChange={(e) => update("pincode", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Delivery notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g. cake message, delivery time preference"
              value={address.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>

          {!isPaymentConfigured && (
            <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              Online payment isn't configured yet on this deployment — add{" "}
              <code className="rounded bg-muted px-1">VITE_RAZORPAY_KEY_ID</code> (and the Edge
              Function secrets) to enable checkout. See <code className="rounded bg-muted px-1">README.md</code>.
            </div>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-border p-6">
          <h2 className="font-heading text-lg text-foreground">Order Summary</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            {items.map((item) => (
              <li key={item.lineId} className="flex justify-between gap-2">
                <span>
                  {item.name} ({item.weightLabel}) × {item.qty}
                </span>
                <span className="shrink-0 text-foreground">
                  {formatINR(item.unitPrice * item.qty)}
                </span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="flex flex-col gap-2 text-sm">
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

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full"
            disabled={submitting || !isPaymentConfigured}
          >
            {submitting ? "Processing…" : `Pay ${formatINR(totals.total)}`}
          </Button>
        </div>
      </form>
    </div>
  )
}
