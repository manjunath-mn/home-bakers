import { categories as localCategories } from "@/lib/data/categories"
import { offers as localOffers } from "@/lib/data/offers"
import {
  getFeaturedProducts as getLocalFeaturedProducts,
  getProductBySlug as getLocalProductBySlug,
  getProductsByCategory as getLocalProductsByCategory,
  products as localProducts,
} from "@/lib/data/products"
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient"
import type { Category, Offer, Product } from "@/lib/types"

/**
 * Thin data-access layer: reads from Supabase when VITE_SUPABASE_URL /
 * VITE_SUPABASE_ANON_KEY are configured (see supabase/schema.sql for the
 * expected tables), otherwise serves the local seed data in `src/lib/data`
 * so the storefront works fully offline during development.
 */

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("categories").select("*")
    if (!error && data?.length) return data as Category[]
  }
  return localCategories
}

export async function getAllProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("products").select("*")
    if (!error && data?.length) return data as Product[]
  }
  return localProducts
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("categorySlug", categorySlug)
    if (!error && data?.length) return data as Product[]
  }
  return getLocalProductsByCategory(categorySlug)
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
    if (!error && data) return data as Product
  }
  return getLocalProductBySlug(slug)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("featured", true)
    if (!error && data?.length) return data as Product[]
  }
  return getLocalFeaturedProducts()
}

export async function getOffers(): Promise<Offer[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("offers").select("*")
    if (!error && data?.length) return data as Offer[]
  }
  return localOffers
}

/**
 * Admin writes: unlike the read functions above, these have no local-data
 * fallback — there's nowhere to durably persist a write without a real
 * database, so they require Supabase to be configured. RLS enforces that
 * the caller's profile actually has role = 'admin'.
 */
function requireSupabaseForWrite() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("The admin dashboard needs Supabase configured — see .env.example.")
  }
  return supabase
}

export async function createProduct(product: Product): Promise<void> {
  const client = requireSupabaseForWrite()
  const { error } = await client.from("products").insert(product)
  if (error) throw error
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<void> {
  const client = requireSupabaseForWrite()
  const { error } = await client.from("products").update(patch).eq("id", id)
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const client = requireSupabaseForWrite()
  const { error } = await client.from("products").delete().eq("id", id)
  if (error) throw error
}

export type NewOffer = Omit<Offer, "id">

export async function createOffer(offer: NewOffer): Promise<Offer> {
  const client = requireSupabaseForWrite()
  const { data, error } = await client.from("offers").insert(offer).select().single()
  if (error) throw error
  return data as Offer
}

export async function updateOffer(id: string, patch: Partial<Offer>): Promise<void> {
  const client = requireSupabaseForWrite()
  const { error } = await client.from("offers").update(patch).eq("id", id)
  if (error) throw error
}

export async function deleteOffer(id: string): Promise<void> {
  const client = requireSupabaseForWrite()
  const { error } = await client.from("offers").delete().eq("id", id)
  if (error) throw error
}
