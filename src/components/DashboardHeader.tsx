import { Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
    </header>
  );
}
