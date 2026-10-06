import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ProductCard } from "@/components/common/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { getCategories, getProductsByCategory } from "@/lib/data"
import type { Category, Product } from "@/lib/types"

export default function CategoryPage() {
  const { categorySlug = "" } = useParams()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    setProducts(null)
    getCategories().then((cats) => {
      setCategory(cats.find((c) => c.slug === categorySlug) ?? null)
    })
    getProductsByCategory(categorySlug).then(setProducts)
  }, [categorySlug])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-foreground sm:text-4xl">
          {category?.name ?? "Our Cakes"}
        </h1>
        {category?.tagline && <p className="mt-2 text-muted-foreground">{category.tagline}</p>}
      </div>

      {!products ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No cakes found in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
