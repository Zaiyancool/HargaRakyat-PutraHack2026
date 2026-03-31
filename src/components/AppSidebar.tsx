import { LayoutDashboard, BarChart3, Brain, ShoppingCart, Map, Activity, Store, ShieldCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { id: "explorer", title: "Explorer", icon: BarChart3 },
  { id: "forecast", title: "AI Forecast", icon: Brain },
  { id: "optimizer", title: "Smart Basket", icon: ShoppingCart },
  { id: "map", title: "Price Map", icon: Map },
  { id: "timeline", title: "Timeline", icon: Activity },
  { id: "stores", title: "Store Finder", icon: Store },
];

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="bg-[hsl(222_47%_9%)]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => {
                      onSectionChange(item.id);
                      setOpenMobile(false);
                    }}
                    className={`transition-all duration-200 ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="bg-[hsl(222_47%_9%)] border-t border-border/30 p-4">
          <div className="text-[10px] text-muted-foreground/50 space-y-1">
            <p className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary/50" />
              <a href="https://data.gov.my" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                data.gov.my
              </a>
            </p>
            <p>PutraHack 2026</p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
