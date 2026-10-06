import { useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SparklesProps {
  count?: number
  className?: string
}

interface Particle {
  id: number
  left: string
  top: string
  size: number
  delay: number
  duration: number
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1.5,
    delay: Math.random() * 4,
    duration: Math.random() * 2.5 + 2,
  }))
}

/** Aceternity-style ambient sparkle field, used behind hero copy for a touch of magic. */
export function Sparkles({ count = 40, className }: SparklesProps) {
  const particles = useMemo(() => generateParticles(count), [count])

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-gold"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
