import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Map", href: "/dashboard?s=map" },
  { label: "Forecast", href: "/dashboard?s=forecast" },
  { label: "Explorer", href: "/dashboard?s=explorer" },
];

export function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-foreground">
            Harga<span className="text-primary">Rakyat</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            Sign In
          </Button>
          <Button className="rounded-lg px-5 text-sm font-semibold">
            Log In
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-background p-6">
            <nav className="mt-8 flex flex-col gap-2">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
              <hr className="my-4 border-border" />
              <Button variant="outline" className="w-full">Sign In</Button>
              <Button className="w-full">Log In</Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
