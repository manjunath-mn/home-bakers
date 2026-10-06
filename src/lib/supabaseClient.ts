import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined

/**
 * `null` until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set (see .env.example).
 * Until then the app runs entirely on the local seed data in `src/lib/data`,
 * so the storefront works out of the box with no backend configured.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const isSupabaseConfigured = supabase !== null
