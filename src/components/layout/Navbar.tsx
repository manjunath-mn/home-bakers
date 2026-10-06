import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { CakeSlice, Menu, Settings, ShoppingBag, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { setCartOpen } from "@/features/cart/cartSlice"
import { cn } from "@/lib/utils"

const navLinks = [
  { to: "/category/birthday-cakes", label: "Birthday Cakes" },
  { to: "/category/wedding-cakes", label: "Wedding Cakes" },
  { to: "/category/cake-slices", label: "Cake Slices" },
]

export function Navbar() {
  const dispatch = useAppDispatch()
  const itemCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, item) => sum + item.qty, 0),
  )
  const { user, status } = useAppSelector((s) => s.auth)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl text-foreground">
          <CakeSlice className="size-6 text-primary" />
          Sweetly Baked
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                  isActive && "text-primary",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {status !== "loading" &&
            (user ? (
              <>
                {user.role === "admin" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Admin dashboard"
                    render={<Link to="/admin" />}
                  >
                    <Settings className="size-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="My account"
                  render={<Link to="/account" />}
                >
                  <User className="size-5" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" className="hidden sm:inline-flex" render={<Link to="/login" />}>
                Sign In
              </Button>
            ))}

          <Button
            variant="ghost"
            size="icon"
            aria-label="Open cart"
            className="relative"
            onClick={() => dispatch(setCartOpen(true))}
          >
            <ShoppingBag className="size-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="font-heading">Sweetly Baked</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent",
                        isActive && "bg-accent text-primary",
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <NavLink
                  to={user ? "/account" : "/login"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent",
                      isActive && "bg-accent text-primary",
                    )
                  }
                >
                  {user ? "My Account" : "Sign In"}
                </NavLink>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
