import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-heading text-3xl text-foreground">Page not found</h1>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist, or may have moved.
      </p>
      <Button render={<Link to="/" />}>Back to home</Button>
    </div>
  )
}
