import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Map", href: "/dashboard?s=map" },
  { label: "Forecast", href: "/dashboard?s=forecast" },
  { label: "Explorer", href: "/dashboard?s=explorer" },
  { label: "Recipes", href: "/recipe" },
  { label: "News", href: "/news" },
];

export function TopNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();

  const isActive = (href: string) => {
    if (href === "/dashboard" && location.pathname === "/dashboard" && !location.search) return true;
    if (href !== "/dashboard" && location.pathname + location.search === href) return true;
    if (href === "/news" && location.pathname === "/news") return true;
    return false;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12 sm:px-8">
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
        <nav className="hidden items-center gap-2 ml-6 md:flex flex-1">
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

        {/* Auth buttons (Desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold px-6">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-gray-900">
                  {user.email}
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-gray-500">
                  {user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-gray-600">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-white p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full">
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

              {/* Mobile auth buttons */}
              <div className="border-t border-gray-100 p-4 space-y-3">
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="block"
                    >
                      <Button variant="outline" className="w-full rounded-xl border-gray-200 text-gray-900 hover:bg-gray-50">
                        Log In
                      </Button>
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setOpen(false)}
                      className="block"
                    >
                      <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-sm text-gray-600">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="block"
                    >
                      <Button variant="outline" className="w-full rounded-xl border-gray-200 text-gray-900 hover:bg-gray-50">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      onClick={handleSignOut}
                      className="w-full rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                      variant="outline"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
