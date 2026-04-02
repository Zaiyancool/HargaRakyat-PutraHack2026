import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Map", href: "/dashboard?s=map" },
  { label: "Forecast", href: "/dashboard?s=forecast" },
  { label: "Explorer", href: "/dashboard?s=explorer" },
  { label: "News", href: "/news" },
];

export function TopNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/dashboard" && location.pathname === "/dashboard" && !location.search) return true;
    if (href !== "/dashboard" && location.pathname + location.search === href) return true;
    if (href === "/news" && location.pathname === "/news") return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-black text-white">HR</span>
          </div>
          <span className="text-lg font-black tracking-tight text-gray-900">
            Harga<span className="text-primary">Rakyat</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className={`rounded-lg px-4 py-2 text-[15px] font-semibold transition-all duration-150 ${
                isActive(l.href)
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>


        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-gray-600">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-white p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              {/* Mobile header */}
              <div className="flex items-center gap-2 p-5 border-b border-gray-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-xs font-black text-white">HR</span>
                </div>
                <span className="text-lg font-black tracking-tight text-gray-900">
                  Harga<span className="text-primary">Rakyat</span>
                </span>
              </div>

              {/* Mobile nav links */}
              <nav className="flex flex-col gap-1 p-4 flex-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                      isActive(l.href)
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
