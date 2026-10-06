import { supabase } from "@/lib/supabaseClient"
import type { AuthUser, UserRole } from "@/lib/types"

export interface SignUpInput {
  email: string
  password: string
  fullName: string
  phone: string
}

export interface SignInInput {
  email: string
  password: string
}

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Sign-in isn't available yet — this project needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY configured. See .env.example.",
    )
  }
  return supabase
}

/**
 * Returns { needsEmailConfirmation: true } when the Supabase project has
 * "Confirm email" enabled, since no session is issued until the user clicks
 * the confirmation link in that case.
 */
export async function signUp(input: SignUpInput): Promise<{ needsEmailConfirmation: boolean }> {
  const client = requireSupabase()
  const { data, error } = await client.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName, phone: input.phone },
    },
  })
  if (error) throw error
  return { needsEmailConfirmation: data.session === null }
}

export async function signIn(input: SignInInput): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.auth.signInWithPassword(input)
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.auth.signOut()
  if (error) throw error
}

/** Looks up the caller's role from `profiles`; defaults to "customer" if the row isn't there yet or on error. */
export async function fetchProfileRole(userId: string): Promise<UserRole> {
  if (!supabase) return "customer"
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle()
  return (data?.role as UserRole | undefined) ?? "customer"
}

export async function toAuthUser(
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null,
): Promise<AuthUser | null> {
  if (!user) return null
  const role = await fetchProfileRole(user.id)
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
    role,
  }
}
