import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAppSelector } from "@/app/hooks"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

/** Requires sign-in (via ProtectedRoute) *and* an admin-role profile. */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, status } = useAppSelector((s) => s.auth)

  return (
    <ProtectedRoute>
      {status === "authenticated" && user?.role !== "admin" ? (
        <Navigate to="/" replace />
      ) : (
        children
      )}
    </ProtectedRoute>
  )
}
