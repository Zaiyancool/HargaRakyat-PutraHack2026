import { HeroSection } from "@/components/HeroSection";
import { PriceChart } from "@/components/PriceChart";
import { PriceForecast } from "@/components/PriceForecast";
import { GroceryOptimizer } from "@/components/GroceryOptimizer";
import { PriceMap } from "@/components/PriceMap";
import { PriceExplorer } from "@/components/PriceExplorer";
import { StoreFinder } from "@/components/StoreFinder";
import { Footer } from "@/components/Footer";
import { NavLink } from "@/components/NavLink";

const sections = [
  { id: "forecast", label: "AI Forecast" },
  { id: "optimizer", label: "Smart Basket" },
  { id: "map", label: "Price Map" },
  { id: "timeline", label: "Timeline" },
  { id: "stores", label: "Stores" },
  { id: "explorer", label: "Explorer" },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container flex items-center justify-between py-3">
          <span className="font-heading font-bold text-lg">
            Harga<span className="text-gradient">Rakyat</span>
          </span>
          <div className="hidden md:flex items-center gap-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <HeroSection />
      <div id="forecast"><PriceForecast /></div>
      <div id="optimizer"><GroceryOptimizer /></div>
      <div id="map"><PriceMap /></div>
      <div id="timeline"><PriceChart /></div>
      <div id="stores"><StoreFinder /></div>
      <div id="explorer"><PriceExplorer /></div>
      <Footer />
    </div>
  );
};

export default Index;
