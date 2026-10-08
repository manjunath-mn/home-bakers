-- Sweetly Baked — Supabase schema
-- Run this in the Supabase SQL editor for your project (SQL Editor -> New query -> paste -> Run).
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS guards, so running this again
-- after pulling schema changes upgrades an existing project instead of erroring.
-- Until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set in .env, the app
-- runs entirely on the local seed data in src/lib/data and none of this is required.

create extension if not exists pgcrypto;

create table if not exists categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  tagline text not null,
  image text not null
);

-- A promotion. Column names are quoted camelCase (matching `products` below)
-- so the frontend can cast Supabase rows straight to the Offer TypeScript
-- type with no mapping layer — see src/lib/data/index.ts.
-- `"discountPercent"` is nullable: null means this row is purely a marketing
-- banner (e.g. "Cakes start at ₹999") with no automatic discount. When set,
-- it's applied to whichever products reference this offer (see
-- products."offerId" below) once their combined cart quantity reaches
-- `"minQty"`, for as long as `"isActive"` and `now()` falls within
-- `["startsAt", "endsAt"]` (`"endsAt"` null = no end date).
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  badge text not null default '',
  accent text not null default 'primary' check (accent in ('primary', 'gold')),
  "discountPercent" integer check ("discountPercent" is null or ("discountPercent" > 0 and "discountPercent" <= 100)),
  "minQty" integer not null default 1 check ("minQty" >= 1),
  "startsAt" timestamptz not null default now(),
  "endsAt" timestamptz,
  "isActive" boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  slug text unique not null,
  "categoryId" text not null references categories(id),
  "categorySlug" text not null,
  name text not null,
  description text not null,
  images jsonb not null default '[]',
  "isSlice" boolean not null default false,
  "weightOptions" jsonb not null default '[]', -- [{ label, grams, price }]
  tags jsonb not null default '[]',
  featured boolean not null default false
);

-- Promotion assignment. A product belongs to at most one offer at a time —
-- `"offerId"` is a single nullable foreign key, not a join table, so
-- "eligible for more than one offer" can't happen by construction, not just
-- by convention. `"isInOffer"` is a denormalized flag kept consistent with
-- `"offerId"` via the check constraint below, so the admin UI and queries can
-- filter on a plain boolean without a join.
alter table products add column if not exists "isInOffer" boolean not null default false;
alter table products add column if not exists "offerId" uuid references offers(id) on delete set null;
alter table products drop column if exists "eligibleForBuy2Offer";

do $$ begin
  alter table products add constraint products_offer_consistency check (
    ("isInOffer" and "offerId" is not null) or
    (not "isInOffer" and "offerId" is null)
  );
exception when duplicate_object then null;
end $$;

-- One row per authenticated user, auto-created on signup (see trigger below).
-- `role` drives admin access in the RLS policies further down — promote
-- someone to admin from the Supabase dashboard with:
--   update profiles set role = 'admin' where id = '<their auth.users id>';
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists orders (
  order_number text primary key,
  user_id uuid not null references auth.users(id),
  customer_name text not null,
  phone text not null,
  email text not null,
  address jsonb not null,
  items jsonb not null, -- array of { product_id, product_name, weight_label, weight_grams, unit_price, qty, line_total }
  subtotal integer not null,
  discount integer not null default 0,
  total integer not null,
  payment_method text not null default 'razorpay',
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  razorpay_order_id text,
  razorpay_payment_id text,
  status text not null default 'placed',
  created_at timestamptz not null default now()
);

-- `is_admin()` centralizes the admin check used by the policies below.
-- SECURITY DEFINER makes its inner `profiles` lookup run as the function
-- owner, which bypasses RLS on that lookup — this is required, not just
-- tidiness: a policy on `profiles` that re-queries `profiles` through a
-- plain (non-bypassing) subquery causes Postgres to report "infinite
-- recursion detected in policy for relation profiles", because evaluating
-- the subquery re-triggers the same policy. Routing through this function
-- breaks that cycle.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Row Level Security.
-- products/categories/offers: public read-only, plus full read/write for
-- `admin`-role profiles (the admin dashboard writes straight to these tables
-- via supabase-js — no Edge Function needed for product/offer management,
-- unlike payments, which must touch a secret key server-side).
-- profiles: a user can read/update only their own row; admins read all.
-- orders: a user can read only their own orders. Orders are never inserted
-- directly by the browser (insert has no public or admin policy) — they're
-- written by the `razorpay` Edge Function (using the service role key, which
-- bypasses RLS) only after a payment is verified. See supabase/functions/razorpay.
alter table categories enable row level security;
alter table products enable row level security;
alter table offers enable row level security;
alter table profiles enable row level security;
alter table orders enable row level security;

drop policy if exists "Public read access" on categories;
drop policy if exists "Public read access" on products;
drop policy if exists "Public read access" on offers;
create policy "Public read access" on categories for select using (true);
create policy "Public read access" on products for select using (true);
create policy "Public read access" on offers for select using (true);

drop policy if exists "Admins manage categories" on categories;
drop policy if exists "Admins manage products" on products;
drop policy if exists "Admins manage offers" on offers;
create policy "Admins manage categories" on categories for all using (is_admin()) with check (is_admin());
create policy "Admins manage products" on products for all using (is_admin()) with check (is_admin());
create policy "Admins manage offers" on offers for all using (is_admin()) with check (is_admin());

drop policy if exists "Users read own profile" on profiles;
drop policy if exists "Users update own profile" on profiles;
drop policy if exists "Admins read all profiles" on profiles;
create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins read all profiles" on profiles for select using (is_admin());

drop policy if exists "Users read own orders" on orders;
drop policy if exists "Admins read all orders" on orders;
drop policy if exists "Admins update orders" on orders;
create policy "Users read own orders" on orders for select using (auth.uid() = user_id);
create policy "Admins read all orders" on orders for select using (is_admin());
create policy "Admins update orders" on orders for update using (is_admin());
