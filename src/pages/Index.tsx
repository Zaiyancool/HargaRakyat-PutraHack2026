import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PriceTicker } from "@/components/PriceTicker";
import { DashboardHome } from "@/components/DashboardHome";
import { PriceExplorer } from "@/components/PriceExplorer";
import { PriceForecast } from "@/components/PriceForecast";
import { GroceryOptimizer } from "@/components/GroceryOptimizer";
import { PriceMap } from "@/components/PriceMap";
import { PriceChart } from "@/components/PriceChart";
import { StoreFinder } from "@/components/StoreFinder";
import { AIChatAdvisor } from "@/components/AIChatAdvisor";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardHome />;
      case "explorer": return <PriceExplorer />;
      case "forecast": return <PriceForecast />;
      case "optimizer": return <GroceryOptimizer />;
      case "map": return <PriceMap />;
      case "timeline": return <PriceChart />;
      case "stores": return <StoreFinder />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PriceTicker />
      <SidebarProvider>
        <div className="flex flex-1 w-full overflow-hidden">
          <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <DashboardHeader activeSection={activeSection} />
            <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
              {renderSection()}
            </main>
          </div>
        </div>
      </SidebarProvider>
      <AIChatAdvisor />
    </div>
  );
};

export default Index;
