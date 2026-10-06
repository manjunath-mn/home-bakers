import { type FormEvent, useState } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppSelector } from "@/app/hooks"
import { signUp } from "@/lib/auth"
import { isSupabaseConfigured } from "@/lib/supabaseClient"

export default function SignupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { status } = useAppSelector((s) => s.auth)
  const redirectTo = searchParams.get("redirect") || "/"

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)

  if (status === "authenticated") {
    return <Navigate to={redirectTo} replace />
  }

  if (needsEmailConfirmation) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="font-heading text-3xl text-foreground">Check your email</h1>
        <p className="mt-3 text-muted-foreground">
          We've sent a confirmation link to <strong className="text-foreground">{email}</strong>.
          Click it to activate your account, then come back and sign in.
        </p>
        <Button render={<Link to="/login" />} size="lg" className="mt-6">
          Go to Sign In
        </Button>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { needsEmailConfirmation } = await signUp({ fullName, email, phone, password })
      if (needsEmailConfirmation) {
        setNeedsEmailConfirmation(true)
      } else {
        navigate(redirectTo)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your account.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-heading text-3xl text-foreground">Create an Account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        An account is needed to place an order and track it afterwards.
      </p>

      {!isSupabaseConfigured && (
        <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          Sign-up isn't set up yet — this project needs a Supabase project connected. See{" "}
          <code className="rounded bg-muted px-1">.env.example</code>.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
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
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            required
            pattern="[0-9]{10}"
            title="10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" disabled={submitting || !isSupabaseConfigured}>
          {submitting ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
