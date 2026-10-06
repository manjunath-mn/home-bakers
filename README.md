# Sweetly Baked

A storefront for a home bakery — birthday cakes, wedding cakes and cake slices — built with
React, TypeScript, Redux Toolkit, Tailwind CSS and shadcn/ui.

## Stack

- **React + TypeScript + Vite**
- **Redux Toolkit** for cart state (persisted to `localStorage`) and auth session state
- **Tailwind CSS v4 + shadcn/ui** for components, fonts (Playfair Display + Poppins) and theming
- **Framer Motion** for hand-built Aceternity-style effects (sparkles hero, cursor-glow cards)
- **Supabase** — Postgres database, Auth, and an Edge Function for payments. The app runs on
  local seed data with sign-in disabled until this is configured — see below.
- **Razorpay** for payment, via a Supabase Edge Function (see [Connecting Razorpay](#connecting-razorpay))

## Getting started

```bash
npm install
npm run dev
```

With no `.env`, the storefront still runs fully: product, category and offer data come from the
local seed files in `src/lib/data`. Sign-in, checkout and account pages will say they're not
configured yet until you connect Supabase (and Razorpay, for payment).

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). This creates:
   - `categories` — public read-only, admin-writable
   - `offers` — promotions. `discountPercent` is nullable: null means a pure marketing banner
     (no automatic discount); when set, it applies to whichever products reference this offer
     once their combined cart quantity reaches `minQty`, for as long as `isActive` and `now()`
     falls within `[startsAt, endsAt]` (`endsAt` null = no end date). Public read-only,
     admin-writable.
   - `products` — now carries `isInOffer` + `offerId` (a single nullable FK to `offers`, not a
     join table — so a product belongs to **at most one** promotion by construction). Public
     read-only, admin-writable.
   - `profiles` — one row per signed-up user, auto-created by a trigger on signup, with a
     `role` column (`customer` by default) that gates admin access everywhere above
   - `orders` — tied to `user_id`; customers can read only their own orders, and the browser
     has no insert policy at all (orders are written only by the `razorpay` Edge Function
     after it verifies a payment — see below)
3. Load the starter catalog: in the SQL Editor, run [`supabase/seed_data.sql`](supabase/seed_data.sql)
   — it inserts the current `categories`/`products`/`offers` rows generated from
   `src/lib/data`. Edit rows afterwards in the Table Editor, or regenerate the file if you
   change `src/lib/data` and want to reseed. **This matters once payment is live**: the
   `razorpay` Edge Function re-prices every cart item from the `products` table, so prices
   there must be correct and kept in sync with whatever the storefront displays.
4. In **Authentication -> Providers**, Email sign-up is on by default. Decide whether to
   require email confirmation (Authentication -> Settings) — if it's on, new users see a
   "check your email" screen after signing up instead of being logged in immediately.
5. Copy `.env.example` to `.env` and fill in your project's URL and anon key:
   ```bash
   cp .env.example .env
   ```
6. Restart `npm run dev`. Sign-up/sign-in and the data layer now talk to Supabase.

### Making someone an admin

The admin dashboard at `/admin` (Products + Promotions) is gated by `profiles.role = 'admin'`.
After that person has signed up once through the site (so their profile row exists), promote
them from the SQL editor:

```sql
update profiles set role = 'admin' where id = '<their auth.users id>';
```

They'll see a settings icon in the navbar linking to `/admin` once they next sign in (or refresh).
Orders still aren't manageable in-app — view/update those from the Supabase table editor (RLS
already grants `admin`-role profiles read/update access there too, for when that UI gets built).

## Connecting Razorpay

Payment happens through a Supabase Edge Function (`supabase/functions/razorpay`) so the
Razorpay **secret** key never reaches the browser, and so prices are always recomputed
server-side from the `products` table rather than trusted from the client.

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and log in:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
2. Get your Razorpay **test** API keys from the
   [Razorpay Dashboard](https://dashboard.razorpay.com/) -> Settings -> API Keys.
3. Deploy the function and set its secrets:
   ```bash
   supabase functions deploy razorpay
   supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx
   ```
   (`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are provided to every
   Edge Function automatically — nothing to set for those.)
4. Add the **publishable** Key ID (same `rzp_test_...` value, safe to expose in the browser —
   not the secret) to `.env`:
   ```
   VITE_RAZORPAY_KEY_ID=rzp_test_xxx
   ```
5. Restart `npm run dev`. The checkout page's "Pay ₹…" button becomes enabled, and a real
   (test-mode) Razorpay Checkout modal opens on submit.

Switch `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (Edge Function secrets) and
`VITE_RAZORPAY_KEY_ID` (frontend env var) to your **live** keys when you're ready to accept
real payments — nothing else needs to change.

## What's in v3 (current)

- Browse by Birthday Cakes / Wedding Cakes / Cake Slices
- Product detail pages with weight/serving selection and quantity
- Cart (drawer + full page), persisted across reloads
- **Time-bound promotions**: any number of offers, each with its own discount %, minimum
  quantity, and start/end window, computed identically client-side (for display) and
  server-side (authoritative, at payment time) — see `isOfferLive` / `isOfferCurrentlyActive` /
  `computeCartTotals` in `src/lib/pricing.ts`
- **Admin dashboard** (`/admin`, admin-role only): create/edit/delete products (name, category,
  description, images, weight/serving options, tags, featured flag) and promotions
  (discount %, minimum quantity, start/end dates, active toggle), with products assignable to
  at most one promotion
- **Accounts required to order**: email/password sign-up and sign-in (Supabase Auth)
- **Order history** on the Account page
- **Real payment** via Razorpay Checkout, with server-side signature verification and
  price recomputation (see [Connecting Razorpay](#connecting-razorpay))
- Order confirmation page

## What's deferred

- **Order management in-app** — view/update orders from the Supabase table editor for now;
  RLS already grants `admin`-role profiles read/update access there, so this is mostly a
  frontend task whenever it's wanted.
- **Saved addresses / richer profile** — checkout still collects a delivery address per order.
- Real product photography via Supabase Storage (placeholders are wired up in
  `src/components/common/SafeImage.tsx` — just swap the `image` URLs in the product data, or in
  the `products` table once you're on Supabase).

## Project structure

```
src/
  app/              Redux store + typed hooks
  components/
    ui/             shadcn/ui primitives
    common/         ProductCard, OfferBanner, WeightSelector, SafeImage
    layout/         Navbar, Footer, CartDrawer
    effects/        Sparkles, GlowCard (Aceternity-style)
    auth/           ProtectedRoute, AdminRoute
    admin/          ProductFormDialog, OfferFormDialog
  features/
    cart/           cartSlice (Redux Toolkit)
    auth/           authSlice + AuthListener (syncs Supabase session + profile role -> Redux)
  hooks/
    useOffers.ts    Fetches all offers; shared by storefront pages and the admin dashboard
  lib/
    data/           Local seed data + Supabase-aware data access layer (incl. admin
                     create/update/delete for products and offers)
    types.ts        Shared domain types
    pricing.ts      Price formatting + offer-discount calculation (client-side display only —
                     the Edge Function is the source of truth at payment time)
    auth.ts         signUp / signIn / signOut / fetchProfileRole helpers
    orders.ts       Order history + "last placed order" (for the confirmation page)
    payments.ts     Calls into the `razorpay` Edge Function
    razorpay.ts     Loads Razorpay Checkout.js and opens the payment modal
    slugify.ts      Product slug auto-generation for the admin form
  pages/            Route-level pages (incl. LoginPage, SignupPage, AccountPage)
  pages/admin/      AdminLayout, AdminProductsPage, AdminOffersPage (/admin, admin-role only)
supabase/
  schema.sql        Table definitions + RLS policies (safe to re-run — upgrades in place)
  seed_data.sql     Generated INSERT statements for categories/products/offers
  functions/
    razorpay/       Edge Function: creates Razorpay orders, verifies payments, writes orders
                     (re-prices from `products`/`offers` — never trusts client-sent prices)
```
