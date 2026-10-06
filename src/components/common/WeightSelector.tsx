import { cn } from "@/lib/utils"
import { formatINR } from "@/lib/pricing"
import type { WeightOption } from "@/lib/types"

interface WeightSelectorProps {
  options: WeightOption[]
  selected: WeightOption
  onSelect: (option: WeightOption) => void
}

export function WeightSelector({ options, selected, onSelect }: WeightSelectorProps) {
  if (options.length <= 1) return null

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = option.label === selected.label
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50",
            )}
          >
            {option.label} · {formatINR(option.price)}
          </button>
        )
      })}
    </div>
  )
}
