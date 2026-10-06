import { standardWeightOptions, weddingWeightOptions } from "@/lib/pricing"
import type { Product } from "@/lib/types"

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`

export const products: Product[] = [
  // Birthday cakes
  {
    id: "prod-choco-truffle",
    slug: "chocolate-truffle-cake",
    categoryId: "cat-birthday",
    categorySlug: "birthday-cakes",
    name: "Chocolate Truffle Cake",
    description:
      "Rich dark chocolate sponge layered with silky truffle ganache and finished with a glossy chocolate drip. A birthday classic that never disappoints.",
    images: [img("photo-1578985545062-69928b1d9587"), img("photo-1517427294546-5aa121f68e8a")],
    isSlice: false,
    weightOptions: standardWeightOptions(999),
    tags: ["Bestseller", "Chocolate"],
    featured: true,
    isInOffer: true,
    offerId: "offer-buy2",
  },
  {
    id: "prod-rainbow-funfetti",
    slug: "rainbow-funfetti-cake",
    categoryId: "cat-birthday",
    categorySlug: "birthday-cakes",
    name: "Rainbow Funfetti Cake",
    description:
      "Vanilla sponge studded with rainbow sprinkles, layered with vanilla buttercream and a confetti crumb coat. Pure birthday joy.",
    images: [img("photo-1621303837174-89787a7d4729")],
    isSlice: false,
    weightOptions: standardWeightOptions(999),
    tags: ["Kids' favourite"],
    featured: true,
    isInOffer: true,
    offerId: "offer-buy2",
  },
  {
    id: "prod-red-velvet",
    slug: "red-velvet-cake",
    categoryId: "cat-birthday",
    categorySlug: "birthday-cakes",
    name: "Red Velvet Cake",
    description:
      "Velvety cocoa sponge with a hint of tang, layered with cream cheese frosting. Elegant enough for any milestone birthday.",
    images: [img("photo-1714949134591-d6f2c581b20d")],
    isSlice: false,
    weightOptions: standardWeightOptions(1099),
    tags: ["Signature"],
    isInOffer: true,
    offerId: "offer-buy2",
  },
  {
    id: "prod-butterscotch",
    slug: "butterscotch-crunch-cake",
    categoryId: "cat-birthday",
    categorySlug: "birthday-cakes",
    name: "Butterscotch Crunch Cake",
    description:
      "Caramelised butterscotch sponge with praline crunch and whipped butterscotch cream. A South Indian birthday favourite.",
    images: [img("photo-1547414368-ac947d00b91d")],
    isSlice: false,
    weightOptions: standardWeightOptions(949),
    tags: ["Caramel"],
    isInOffer: true,
    offerId: "offer-buy2",
  },

  // Wedding cakes
  {
    id: "prod-ivory-rose-tier",
    slug: "ivory-rose-tiered-cake",
    categoryId: "cat-wedding",
    categorySlug: "wedding-cakes",
    name: "Ivory Rose Tiered Cake",
    description:
      "A three-tier vanilla bean cake finished in smooth ivory buttercream with hand-piped sugar roses. Designed for the top table.",
    images: [img("photo-1535141192574-5d4897c12636")],
    isSlice: false,
    weightOptions: weddingWeightOptions(999),
    tags: ["Tiered", "Made to order"],
    featured: true,
    isInOffer: false,
    offerId: null,
  },
  {
    id: "prod-gold-drip-wedding",
    slug: "gold-drip-wedding-cake",
    categoryId: "cat-wedding",
    categorySlug: "wedding-cakes",
    name: "Gold Drip Wedding Cake",
    description:
      "Dark chocolate and salted caramel layers beneath an edible gold drip and fresh floral accents. A modern statement centrepiece.",
    images: [img("photo-1535254973040-607b474cb50d")],
    isSlice: false,
    weightOptions: weddingWeightOptions(1099),
    tags: ["Premium", "Made to order"],
    featured: true,
    isInOffer: false,
    offerId: null,
  },
  {
    id: "prod-pastel-floral-wedding",
    slug: "pastel-floral-wedding-cake",
    categoryId: "cat-wedding",
    categorySlug: "wedding-cakes",
    name: "Pastel Floral Wedding Cake",
    description:
      "Soft pastel ombre buttercream with cascading sugar blossoms across two elegant tiers.",
    images: [img("photo-1771850644794-83b32d4a0b50")],
    isSlice: false,
    weightOptions: weddingWeightOptions(1049),
    tags: ["Tiered"],
    isInOffer: false,
    offerId: null,
  },

  // Cake slices
  {
    id: "prod-slice-chocolate",
    slug: "chocolate-truffle-slice",
    categoryId: "cat-slices",
    categorySlug: "cake-slices",
    name: "Chocolate Truffle Slice",
    description: "One generous slice of our bestselling chocolate truffle cake, boxed fresh.",
    images: [img("photo-1517427294546-5aa121f68e8a")],
    isSlice: true,
    weightOptions: [{ label: "1 slice", grams: 150, price: 149 }],
    tags: ["Single serve"],
    isInOffer: false,
    offerId: null,
  },
  {
    id: "prod-slice-redvelvet",
    slug: "red-velvet-slice",
    categoryId: "cat-slices",
    categorySlug: "cake-slices",
    name: "Red Velvet Slice",
    description: "A single slice of red velvet with cream cheese frosting, perfect with coffee.",
    images: [img("photo-1714949134591-d6f2c581b20d")],
    isSlice: true,
    weightOptions: [{ label: "1 slice", grams: 150, price: 159 }],
    tags: ["Single serve"],
    isInOffer: false,
    offerId: null,
  },
  {
    id: "prod-slice-butterscotch",
    slug: "butterscotch-slice",
    categoryId: "cat-slices",
    categorySlug: "cake-slices",
    name: "Butterscotch Crunch Slice",
    description: "A single slice of butterscotch crunch cake with praline topping.",
    images: [img("photo-1547414368-ac947d00b91d")],
    isSlice: true,
    weightOptions: [{ label: "1 slice", grams: 150, price: 139 }],
    tags: ["Single serve"],
    isInOffer: false,
    offerId: null,
  },
]

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug)
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}
