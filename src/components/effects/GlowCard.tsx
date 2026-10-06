import { useRef, useState, type MouseEvent, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlowCardProps {
  children: ReactNode
  className?: string
}

/** Aceternity-style card with a glow that follows the cursor on hover. */
export function GlowCard({ children, className }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const [active, setActive] = useState(false)

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300",
        active && "shadow-lg shadow-primary/10",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${pos.x}% ${pos.y}%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 70%)`,
        }}
      />
      {children}
    </div>
  )
}
