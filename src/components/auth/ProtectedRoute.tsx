import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAppSelector } from "@/app/hooks"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAppSelector((s) => s.auth)
  const location = useLocation()

  if (status === "loading") {
    return <div className="mx-auto max-w-6xl px-4 py-24 text-center text-muted-foreground">Loading…</div>
  }

  if (status === "unauthenticated") {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return <>{children}</>
}
