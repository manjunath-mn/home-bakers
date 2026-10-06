import { type FormEvent, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import { slugify } from "@/lib/slugify"
import type { Category, CategorySlug, Offer, Product, WeightOption } from "@/lib/types"

export interface ProductFormValues {
  id: string
  slug: string
  categoryId: string
  categorySlug: CategorySlug
  name: string
  description: string
  images: string[]
  isSlice: boolean
  weightOptions: WeightOption[]
  tags: string[]
  featured: boolean
  isInOffer: boolean
  offerId: string | null
}

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  offers: Offer[]
  product?: Product | null
  submitting: boolean
  onSubmit: (values: ProductFormValues, isNew: boolean) => void
}

export function ProductFormDialog({
  open,
  onOpenChange,
  categories,
  offers,
  product,
  submitting,
  onSubmit,
}: ProductFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {product ? "Edit Product" : "New Product"}
          </DialogTitle>
        </DialogHeader>
        <ProductForm
          key={product?.id ?? "new"}
          categories={categories}
          offers={offers}
          product={product}
          submitting={submitting}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function ProductForm({
  categories,
  offers,
  product,
  submitting,
  onSubmit,
}: Omit<ProductFormDialogProps, "open" | "onOpenChange">) {
  const isNew = !product

  const [name, setName] = useState(product?.name ?? "")
  const [slug, setSlug] = useState(product?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [images, setImages] = useState<string[]>(product?.images ?? [""])
  const [isSlice, setIsSlice] = useState(product?.isSlice ?? false)
  const [weightOptions, setWeightOptions] = useState<WeightOption[]>(
    product?.weightOptions?.length ? product.weightOptions : [{ label: "", grams: 0, price: 0 }],
  )
  const [tagsInput, setTagsInput] = useState((product?.tags ?? []).join(", "))
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [isInOffer, setIsInOffer] = useState(product?.isInOffer ?? false)
  const [offerId, setOfferId] = useState<string | null>(product?.offerId ?? offers[0]?.id ?? null)

  function updateName(value: string) {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  function updateWeightOption(index: number, patch: Partial<WeightOption>) {
    setWeightOptions((prev) => prev.map((w, i) => (i === index ? { ...w, ...patch } : w)))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    onSubmit(
      {
        id: product?.id ?? `prod-${slug}`,
        slug,
        categoryId,
        categorySlug: category.slug,
        name,
        description,
        images: images.map((i) => i.trim()).filter(Boolean),
        isSlice,
        weightOptions: weightOptions.filter((w) => w.label.trim() && w.price > 0),
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        featured,
        isInOffer,
        offerId: isInOffer ? offerId : null,
      },
      isNew,
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-name">Name</Label>
          <Input id="p-name" required value={name} onChange={(e) => updateName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-slug">Slug (URL)</Label>
          <Input
            id="p-slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Category</Label>
        <Select
          value={categoryId}
          onValueChange={(v) => setCategoryId(v as string)}
          items={categories.map((c) => ({ value: c.id, label: c.name }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p-description">Description</Label>
        <Textarea
          id="p-description"
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Image URLs</Label>
        {images.map((url, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={url}
              placeholder="https://images.unsplash.com/..."
              onChange={(e) =>
                setImages((prev) => prev.map((u, idx) => (idx === i ? e.target.value : u)))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove image"
              onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setImages((prev) => [...prev, ""])}
        >
          <Plus className="size-4" /> Add image
        </Button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={isSlice} onCheckedChange={(c) => setIsSlice(c === true)} />
        Sold by the slice (priced per piece, not by weight)
      </label>

      <div className="flex flex-col gap-2">
        <Label>{isSlice ? "Serving options" : "Weight options"}</Label>
        {weightOptions.map((option, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
            <Input
              placeholder="Label, e.g. 600 g"
              value={option.label}
              onChange={(e) => updateWeightOption(i, { label: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Grams"
              className="w-24"
              value={option.grams || ""}
              onChange={(e) => updateWeightOption(i, { grams: Number(e.target.value) })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Price ₹"
              className="w-24"
              value={option.price || ""}
              onChange={(e) => updateWeightOption(i, { price: Number(e.target.value) })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove option"
              onClick={() => setWeightOptions((prev) => prev.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setWeightOptions((prev) => [...prev, { label: "", grams: 0, price: 0 }])}
        >
          <Plus className="size-4" /> Add option
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p-tags">Tags (comma-separated)</Label>
        <Input
          id="p-tags"
          placeholder="Bestseller, Chocolate"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={featured} onCheckedChange={(c) => setFeatured(c === true)} />
        Show in "Customer Favourites" on the homepage
      </label>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={isInOffer}
          onCheckedChange={(c) => {
            const checked = c === true
            setIsInOffer(checked)
            if (checked && !offerId) setOfferId(offers[0]?.id ?? null)
          }}
        />
        Include in a promotion
      </label>

      {isInOffer && (
        <div className="flex flex-col gap-1.5 pl-6">
          <Label>Promotion</Label>
          <Select
            value={offerId ?? undefined}
            onValueChange={(v) => setOfferId(v as string)}
            items={offers.map((o) => ({ value: o.id, label: o.name }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a promotion" />
            </SelectTrigger>
            <SelectContent>
              {offers.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {offers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No promotions yet — create one on the Offers tab first.
            </p>
          )}
        </div>
      )}

      <DialogFooter>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save Product"}
        </Button>
      </DialogFooter>
    </form>
  )
}
