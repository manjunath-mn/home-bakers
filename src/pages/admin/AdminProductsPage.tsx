import { useEffect, useState } from "react"
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
import {
  ProductFormDialog,
  type ProductFormValues,
} from "@/components/admin/ProductFormDialog"
import { getAllProducts, getCategories, createProduct, deleteProduct, updateProduct } from "@/lib/data"
import { useOffers } from "@/hooks/useOffers"
import { formatINR } from "@/lib/pricing"
import type { Category, Product } from "@/lib/types"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const { offers } = useOffers()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function refresh() {
    getAllProducts().then(setProducts)
  }

  useEffect(() => {
    refresh()
    getCategories().then(setCategories)
  }, [])

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setDialogOpen(true)
  }

  async function handleSubmit(values: ProductFormValues, isNew: boolean) {
    setSubmitting(true)
    try {
      if (isNew) {
        await createProduct(values)
        toast.success(`${values.name} created`)
      } else {
        await updateProduct(values.id, values)
        toast.success(`${values.name} updated`)
      }
      setDialogOpen(false)
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save product.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return
    try {
      await deleteProduct(product.id)
      toast.success(`${product.name} deleted`)
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete product.")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {products?.length ?? "…"} product{products?.length === 1 ? "" : "s"}
        </p>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Add Product
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Promotion</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!products ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No products yet.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const offer = product.isInOffer
                  ? offers.find((o) => o.id === product.offerId)
                  : undefined
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">{product.categorySlug}</TableCell>
                    <TableCell>{formatINR(product.weightOptions[0]?.price ?? 0)}</TableCell>
                    <TableCell>
                      {offer ? (
                        <Badge variant="secondary">{offer.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{product.featured ? "Yes" : "—"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit"
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          onClick={() => handleDelete(product)}
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

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        offers={offers}
        product={editing}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
