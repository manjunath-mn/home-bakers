import { type FormEvent, useState } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppSelector } from "@/app/hooks"
import { signIn } from "@/lib/auth"
import { isSupabaseConfigured } from "@/lib/supabaseClient"

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { status } = useAppSelector((s) => s.auth)
  const redirectTo = searchParams.get("redirect") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (status === "authenticated") {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn({ email, password })
      navigate(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-heading text-3xl text-foreground">Sign In</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to place an order and view your order history.
      </p>

      {!isSupabaseConfigured && (
        <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          Sign-in isn't set up yet — this project needs a Supabase project connected. See{" "}
          <code className="rounded bg-muted px-1">.env.example</code>.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" disabled={submitting || !isSupabaseConfigured}>
          {submitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          to={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
