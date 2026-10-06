import { NavLink, Outlet } from "react-router-dom"
import { cn } from "@/lib/utils"

const tabs = [
  { to: "/admin/products", label: "Products" },
  { to: "/admin/offers", label: "Promotions" },
]

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-3xl text-foreground">Admin</h1>
      <nav className="mt-6 flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
                isActive && "border-primary text-primary",
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  )
}
