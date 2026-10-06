import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { SafeImage } from "@/components/common/SafeImage"
import { GlowCard } from "@/components/effects/GlowCard"
import { formatINR } from "@/lib/pricing"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const fromPrice = product.weightOptions[0]?.price ?? 0

  return (
    <Link to={`/products/${product.slug}`} className="block h-full">
      <GlowCard className="flex h-full flex-col">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="font-heading text-lg leading-snug text-foreground">{product.name}</h3>
          <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
            {product.description}
          </p>
          <p className="pt-1 text-sm font-medium text-primary">
            {product.isSlice ? formatINR(fromPrice) : `From ${formatINR(fromPrice)}`}
          </p>
        </div>
      </GlowCard>
    </Link>
  )
}
