import { useState } from "react"
import { CakeSlice } from "lucide-react"
import { cn } from "@/lib/utils"

interface SafeImageProps {
  src: string
  alt: string
  className?: string
}

/** Falls back to a soft gradient + icon if the placeholder photo fails to load. */
export function SafeImage({ src, alt, className }: SafeImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-accent to-secondary text-primary/40",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <CakeSlice className="size-10" strokeWidth={1.25} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  )
}
