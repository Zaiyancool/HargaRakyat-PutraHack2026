import { Menu, LogOut, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sectionLabels: Record<string, string> = {
  dashboard: "Dashboard",
  explorer: "Price Explorer",
  forecast: "AI Forecast",
  optimizer: "Smart Basket",
  map: "Price Map",
  timeline: "Price Timeline",
  stores: "Store Finder",
};

interface DashboardHeaderProps {
  activeSection: string;
}

export function DashboardHeader({ activeSection }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center px-4 gap-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground">
        <Menu className="w-5 h-5" />
      </SidebarTrigger>
      <div className="flex items-center gap-3 flex-1">
        <span className="font-heading font-bold text-lg">
          Harga<span className="text-primary">Rakyat</span>
        </span>
        <span className="text-border">/</span>
        <span className="text-sm text-muted-foreground">{sectionLabels[activeSection] || "Dashboard"}</span>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-2 ml-auto">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">{user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">{user.user_metadata?.username || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/signup")}
              className="bg-primary hover:bg-primary/90"
            >
              Sign Up
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
