import { LayoutDashboard, BarChart3, Brain, Map, Activity, ShieldCheck } from "lucide-react";
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
  { id: "map", title: "Price Map", icon: Map },
  { id: "timeline", title: "Timeline", icon: Activity },
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
      <SidebarContent style={{ background: "hsl(var(--sidebar-background))" }}>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-widest opacity-50" style={{ color: "hsl(var(--sidebar-foreground))" }}>
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
                        ? "bg-primary/20 text-primary border-l-2 border-primary font-semibold"
                        : "opacity-70 hover:opacity-100 hover:bg-white/10"
                    }`}
                    style={{ color: activeSection === item.id ? "hsl(var(--sidebar-primary))" : "hsl(var(--sidebar-foreground))" }}
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter style={{ background: "hsl(var(--sidebar-background))", borderTop: "1px solid hsl(var(--sidebar-border))" }} className="p-4">
          <div className="text-[10px] space-y-1" style={{ color: "hsl(var(--sidebar-foreground) / 0.5)" }}>
            <p className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" style={{ color: "hsl(var(--sidebar-primary) / 0.6)" }} />
              <a href="https://data.gov.my" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                data.gov.my
              </a>
            </p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
