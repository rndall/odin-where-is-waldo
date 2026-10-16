import { Link } from "@tanstack/react-router"

export function SiteHeader() {
  return (
    <header className="flex p-4">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary p-1 font-bold text-primary-foreground">
          W?
        </div>
        <h1 className="text-lg font-bold">Where's Waldo?</h1>
      </Link>
    </header>
  )
}
