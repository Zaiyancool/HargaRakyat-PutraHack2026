import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TopNav } from "@/components/landing/TopNav";
import { PriceTicker } from "@/components/PriceTicker";
import { DashboardHome } from "@/components/DashboardHome";
import { PriceExplorer } from "@/components/PriceExplorer";
import { PriceForecast } from "@/components/PriceForecast";
import { GroceryOptimizer } from "@/components/GroceryOptimizer";
import { PriceMap } from "@/components/PriceMap";
import { StoreFinder } from "@/components/StoreFinder";
import { AIChatAdvisor } from "@/components/AIChatAdvisor";

export default function Index() {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    const s = searchParams.get("s");
    setActiveSection(s ?? "dashboard");
  }, [searchParams]);

  const renderSection = () => {
    switch (activeSection) {
      case "explorer":  return <PriceExplorer />;
      case "forecast":  return <PriceForecast />;
      case "optimizer": return <GroceryOptimizer />;
      case "map":       return <PriceMap />;
      case "stores":    return <PriceMap />;
      default:          return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased">
      <TopNav />
      <PriceTicker />
      <main className="flex-1 w-full px-4 py-6 md:px-6 md:py-8">
        {renderSection()}
      </main>
      <AIChatAdvisor />
    </div>
  );
}
