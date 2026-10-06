import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OfferFormDialog } from "@/components/admin/OfferFormDialog"
import { createOffer, deleteOffer, updateOffer, type NewOffer } from "@/lib/data"
import { useOffers } from "@/hooks/useOffers"
import { isOfferLive } from "@/lib/pricing"
import type { Offer } from "@/lib/types"

export default function AdminOffersPage() {
  const { offers, loading, refresh } = useOffers()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Offer | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(offer: Offer) {
    setEditing(offer)
    setDialogOpen(true)
  }

  async function handleSubmit(values: NewOffer, isNew: boolean) {
    setSubmitting(true)
    try {
      if (isNew) {
        await createOffer(values)
        toast.success(`${values.name} created`)
      } else if (editing) {
        await updateOffer(editing.id, values)
        toast.success(`${values.name} updated`)
      }
      setDialogOpen(false)
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save promotion.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(offer: Offer) {
    if (
      !window.confirm(
        `Delete "${offer.name}"? Any products assigned to it will no longer be in a promotion.`,
      )
    )
      return
    try {
      await deleteOffer(offer.id)
      toast.success(`${offer.name} deleted`)
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete promotion.")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {offers?.length ?? "…"} promotion{offers?.length === 1 ? "" : "s"}
        </p>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Add Promotion
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : offers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No promotions yet.
                </TableCell>
              </TableRow>
            ) : (
              offers.map((offer) => {
                const live = isOfferLive(offer)
                return (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium text-foreground">{offer.name}</TableCell>
                    <TableCell>
                      {offer.discountPercent !== null
                        ? `${offer.discountPercent}% (min ${offer.minQty})`
                        : "Banner only"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(offer.startsAt).toLocaleDateString()} –{" "}
                      {offer.endsAt ? new Date(offer.endsAt).toLocaleDateString() : "no end date"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={live ? "default" : "secondary"}>
                        {!offer.isActive ? "Disabled" : live ? "Live" : "Scheduled/Expired"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit"
                          onClick={() => openEdit(offer)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          onClick={() => handleDelete(offer)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <OfferFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        offer={editing}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
