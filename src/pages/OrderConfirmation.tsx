import { Navigate, Link } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getLastOrder } from "@/lib/orders"
import { formatINR } from "@/lib/pricing"

export default function OrderConfirmation() {
  const order = getLastOrder()

  if (!order) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto size-14 text-primary" />
      <h1 className="mt-4 font-heading text-3xl text-foreground">Order placed!</h1>
      <p className="mt-2 text-muted-foreground">
        Thank you, {order.customer_name}. Your payment was received and order{" "}
        <span className="font-medium text-foreground">{order.order_number}</span> is confirmed.
        We'll reach out on {order.phone} to confirm delivery details.
      </p>

      <div className="mt-8 rounded-2xl border border-border p-6 text-left">
        <h2 className="font-heading text-lg text-foreground">Order Summary</h2>
        <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          {order.items.map((item) => (
            <li key={`${item.product_id}-${item.weight_label}`} className="flex justify-between gap-2">
              <span>
                {item.product_name} ({item.weight_label}) × {item.qty}
              </span>
              <span className="shrink-0 text-foreground">{formatINR(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
          <span>Total (Paid)</span>
          <span>{formatINR(order.total)}</span>
        </div>
      </div>

      <Button size="lg" className="mt-8" render={<Link to="/" />}>
        Continue Shopping
      </Button>
    </div>
  )
}
