import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/common/ProductCard"
import { OfferBanner } from "@/components/common/OfferBanner"
import { SafeImage } from "@/components/common/SafeImage"
import { GlowCard } from "@/components/effects/GlowCard"
import { Sparkles } from "@/components/effects/Sparkles"
import { getCategories, getFeaturedProducts, getOffers } from "@/lib/data"
import { isOfferLive } from "@/lib/pricing"
import type { Category, Offer, Product } from "@/lib/types"

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [offers, setOffers] = useState<Offer[]>([])

  useEffect(() => {
    getCategories().then(setCategories)
    getFeaturedProducts().then(setFeatured)
    getOffers().then((all) => setOffers(all.filter((o) => isOfferLive(o))))
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <Sparkles className="opacity-70" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
          >
            Freshly baked, delivered with love
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl text-4xl text-foreground sm:text-6xl"
          >
            Cakes made from scratch, for every celebration
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-lg text-balance text-muted-foreground"
          >
            Birthday cakes, wedding cakes and cake slices — handcrafted in small batches.
            600&nbsp;g cakes start at just ₹999.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Button size="lg" render={<Link to="/category/birthday-cakes" />}>
              Shop Birthday Cakes <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link to="/category/wedding-cakes" />}>
              Shop Wedding Cakes
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Offers */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row">
          {offers.map((offer) => (
            <OfferBanner key={offer.id} offer={offer} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <h2 className="font-heading text-2xl text-foreground sm:text-3xl">Shop by Occasion</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} to={`/category/${category.slug}`}>
              <GlowCard className="group">
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <SafeImage
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-lg text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.tagline}</p>
                </div>
              </GlowCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10 pb-20">
        <div className="flex items-end justify-between">
          <h2 className="font-heading text-2xl text-foreground sm:text-3xl">Customer Favourites</h2>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
