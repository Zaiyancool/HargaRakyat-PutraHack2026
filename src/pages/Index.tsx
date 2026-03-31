import { HeroSection } from "@/components/HeroSection";
import { PriceChart } from "@/components/PriceChart";
import { PriceForecast } from "@/components/PriceForecast";
import { GroceryOptimizer } from "@/components/GroceryOptimizer";
import { PriceMap } from "@/components/PriceMap";
import { PriceExplorer } from "@/components/PriceExplorer";
import { StoreFinder } from "@/components/StoreFinder";
import { Footer } from "@/components/Footer";
import { AIChatAdvisor } from "@/components/AIChatAdvisor";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

const sections = [
  { id: "explorer", label: "Explorer" },
  { id: "forecast", label: "AI Forecast" },
  { id: "optimizer", label: "Smart Basket" },
  { id: "map", label: "Price Map" },
  { id: "timeline", label: "Timeline" },
  { id: "stores", label: "Stores" },
];

const Index = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container flex items-center justify-between py-3">
          <span className="font-heading font-bold text-lg">
            Harga<span className="text-primary">Rakyat</span>
          </span>

          {/* Desktop nav */}
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

          {/* Mobile hamburger */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 rounded-md hover:bg-secondary" aria-label="Menu">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[260px] bg-background/95 backdrop-blur-xl">
              <SheetTitle className="font-heading font-bold text-lg mb-6">
                Harga<span className="text-primary">Rakyat</span>
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setMobileNavOpen(false)}
                    className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <HeroSection />
      <div id="explorer"><PriceExplorer /></div>
      <div id="forecast"><PriceForecast /></div>
      <div id="optimizer"><GroceryOptimizer /></div>
      <div id="map"><PriceMap /></div>
      <div id="timeline"><PriceChart /></div>
      <div id="stores"><StoreFinder /></div>
      <Footer />
      <AIChatAdvisor />
    </div>
  );
};

export default Index;
