import { Link } from "react-router-dom"
import { AtSign, CakeSlice, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2 font-heading text-xl text-foreground">
            <CakeSlice className="size-6 text-primary" />
            Sweetly Baked
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A home bakery crafting birthday cakes, wedding cakes and cake slices — baked fresh
            to order, with love.
          </p>
        </div>

        <div>
          <h4 className="font-heading text-sm text-foreground">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/category/birthday-cakes" className="hover:text-primary">Birthday Cakes</Link></li>
            <li><Link to="/category/wedding-cakes" className="hover:text-primary">Wedding Cakes</Link></li>
            <li><Link to="/category/cake-slices" className="hover:text-primary">Cake Slices</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm text-foreground">Get in touch</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="size-4" /> +91 90000 00000
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4" /> Bengaluru, India
            </li>
            <li className="flex items-center gap-2">
              <AtSign className="size-4" /> sweetlybaked
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Sweetly Baked. All cakes made fresh to order.
      </div>
    </footer>
  )
}
