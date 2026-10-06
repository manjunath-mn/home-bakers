import { Percent, Sparkle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Offer } from "@/lib/types"

interface OfferBannerProps {
  offer: Offer
}

export function OfferBanner({ offer }: OfferBannerProps) {
  const Icon = offer.accent === "gold" ? Sparkle : Percent

  return (
    <div
      className={cn(
        "flex min-w-[280px] flex-1 items-center gap-4 rounded-2xl border p-5",
        offer.accent === "gold"
          ? "border-gold/40 bg-gold/10"
          : "border-primary/30 bg-primary/5",
      )}
    >
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          offer.accent === "gold" ? "bg-gold text-gold-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {offer.badge}
        </p>
        <p className="font-heading text-base text-foreground">{offer.name}</p>
        <p className="text-sm text-muted-foreground">{offer.description}</p>
      </div>
    </div>
  )
}
