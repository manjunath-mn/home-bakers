import { Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CartDrawer } from "@/components/layout/CartDrawer"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminRoute } from "@/components/auth/AdminRoute"
import { AuthListener } from "@/features/auth/AuthListener"
import Home from "@/pages/Home"
import CategoryPage from "@/pages/CategoryPage"
import ProductDetail from "@/pages/ProductDetail"
import CartPage from "@/pages/CartPage"
import CheckoutPage from "@/pages/CheckoutPage"
import OrderConfirmation from "@/pages/OrderConfirmation"
import LoginPage from "@/pages/LoginPage"
import SignupPage from "@/pages/SignupPage"
import AccountPage from "@/pages/AccountPage"
import AdminLayout from "@/pages/admin/AdminLayout"
import AdminProductsPage from "@/pages/admin/AdminProductsPage"
import AdminOffersPage from "@/pages/admin/AdminOffersPage"
import NotFound from "@/pages/NotFound"

export default function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <AuthListener />
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />
          <Route path="/products/:productSlug" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmed"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="offers" element={<AdminOffersPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  )
}
