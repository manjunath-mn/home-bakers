import { type FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { NewOffer } from "@/lib/data"
import type { Offer } from "@/lib/types"

/** <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in LOCAL time, not UTC. */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString()
}

export interface OfferFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer?: Offer | null
  submitting: boolean
  onSubmit: (values: NewOffer, isNew: boolean) => void
}

export function OfferFormDialog({
  open,
  onOpenChange,
  offer,
  submitting,
  onSubmit,
}: OfferFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {offer ? "Edit Promotion" : "New Promotion"}
          </DialogTitle>
        </DialogHeader>
        <OfferForm key={offer?.id ?? "new"} offer={offer} submitting={submitting} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  )
}

function OfferForm({
  offer,
  submitting,
  onSubmit,
}: Omit<OfferFormDialogProps, "open" | "onOpenChange">) {
  const isNew = !offer
  const now = new Date().toISOString()

  const [name, setName] = useState(offer?.name ?? "")
  const [description, setDescription] = useState(offer?.description ?? "")
  const [badge, setBadge] = useState(offer?.badge ?? "Limited time")
  const [accent, setAccent] = useState<"primary" | "gold">(offer?.accent ?? "primary")
  const [hasDiscount, setHasDiscount] = useState(offer ? offer.discountPercent !== null : true)
  const [discountPercent, setDiscountPercent] = useState(offer?.discountPercent ?? 20)
  const [minQty, setMinQty] = useState(offer?.minQty ?? 2)
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(offer?.startsAt ?? now))
  const [noEndDate, setNoEndDate] = useState(!offer?.endsAt)
  const [endsAt, setEndsAt] = useState(offer?.endsAt ? toDatetimeLocal(offer.endsAt) : "")
  const [isActive, setIsActive] = useState(offer?.isActive ?? true)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(
      {
        name,
        description,
        badge,
        accent,
        discountPercent: hasDiscount ? discountPercent : null,
        minQty: hasDiscount ? minQty : 1,
        startsAt: fromDatetimeLocal(startsAt),
        endsAt: !noEndDate && endsAt ? fromDatetimeLocal(endsAt) : null,
        isActive,
      },
      isNew,
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="o-name">Name</Label>
        <Input
          id="o-name"
          required
          placeholder="Diwali Buy 2 Get 20% Off"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="o-description">Description</Label>
        <Textarea
          id="o-description"
          required
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="o-badge">Badge text</Label>
          <Input id="o-badge" value={badge} onChange={(e) => setBadge(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Banner colour</Label>
          <Select
            value={accent}
            onValueChange={(v) => setAccent(v as "primary" | "gold")}
            items={[
              { value: "primary", label: "Rose (primary)" },
              { value: "gold", label: "Gold" },
            ]}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Rose (primary)</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Switch checked={hasDiscount} onCheckedChange={setHasDiscount} />
        Automatically discount eligible products in the cart
      </label>

      {hasDiscount && (
        <div className="grid gap-4 pl-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="o-discount">Discount %</Label>
            <Input
              id="o-discount"
              type="number"
              min={1}
              max={100}
              required
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="o-minqty">Minimum quantity</Label>
            <Input
              id="o-minqty"
              type="number"
              min={1}
              required
              value={minQty}
              onChange={(e) => setMinQty(Number(e.target.value))}
            />
          </div>
        </div>
      )}
      {!hasDiscount && (
        <p className="pl-6 text-sm text-muted-foreground">
          This promotion will only show as a marketing banner — no automatic discount.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="o-starts">Starts</Label>
          <Input
            id="o-starts"
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="o-ends" className="flex items-center justify-between">
            Ends
            <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
              <Switch checked={noEndDate} onCheckedChange={setNoEndDate} size="sm" />
              No end date
            </span>
          </Label>
          <Input
            id="o-ends"
            type="datetime-local"
            disabled={noEndDate}
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Switch checked={isActive} onCheckedChange={setIsActive} />
        Active
      </label>

      <DialogFooter>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save Promotion"}
        </Button>
      </DialogFooter>
    </form>
  )
}
