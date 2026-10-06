import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { signOut } from "@/lib/auth"
import { setSession } from "@/features/auth/authSlice"
import { getMyOrders } from "@/lib/orders"
import { formatINR } from "@/lib/pricing"
import type { OrderRecord } from "@/lib/types"

export default function AccountPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const [orders, setOrders] = useState<OrderRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getMyOrders(user.id)
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load orders."))
  }, [user])

  async function handleSignOut() {
    await signOut()
    dispatch(setSession(null))
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-foreground">My Account</h1>
          {user && <p className="mt-1 text-muted-foreground">{user.email}</p>}
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <h2 className="mt-10 font-heading text-xl text-foreground">Order History</h2>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {!orders && !error ? (
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : orders && orders.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-border p-8 text-center text-muted-foreground">
          <p>You haven't placed any orders yet.</p>
          <Button render={<Link to="/category/birthday-cakes" />} className="mt-4">
            Shop Birthday Cakes
          </Button>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {orders?.map((order) => (
            <li key={order.order_number} className="rounded-2xl border border-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">{order.order_number}</p>
                <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                  {order.payment_status === "paid" ? "Paid" : order.payment_status}
                </Badge>
              </div>
              <ul className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                {order.items.map((item) => (
                  <li key={`${item.product_id}-${item.weight_label}`}>
                    {item.product_name} ({item.weight_label}) × {item.qty}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-right font-medium text-foreground">{formatINR(order.total)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
