// Thin wrapper around Razorpay's Checkout.js (loaded from their CDN — this is
// Razorpay's own officially-documented integration script, not a bundled dependency).

interface RazorpayCheckoutOptions {
  key: string
  amount: number // paise
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { name: string; email: string; contact: string }
  theme?: { color?: string }
  handler: (response: RazorpaySuccessResponse) => void
  modal?: { ondismiss?: () => void }
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface RazorpayCheckoutInstance {
  open: () => void
  on: (event: "payment.failed", handler: (response: { error: { description: string } }) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js"

let scriptPromise: Promise<void> | null = null

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = SCRIPT_SRC
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Couldn't load the Razorpay checkout script."))
    document.body.appendChild(script)
  })
  return scriptPromise
}

export async function openRazorpayCheckout(options: {
  keyId: string
  razorpayOrderId: string
  amount: number
  currency: string
  customerName: string
  customerEmail: string
  customerPhone: string
}): Promise<RazorpaySuccessResponse> {
  await loadRazorpayScript()
  if (!window.Razorpay) throw new Error("Razorpay checkout script failed to load.")

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key: options.keyId,
      amount: options.amount,
      currency: options.currency,
      name: "Sweetly Baked",
      description: "Cake order",
      order_id: options.razorpayOrderId,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      theme: { color: "#a53b5e" },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled.")),
      },
    })
    checkout.on("payment.failed", (response) => {
      reject(new Error(response.error.description || "Payment failed."))
    })
    checkout.open()
  })
}
