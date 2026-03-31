import { HeroSection } from "@/components/HeroSection";
import { PriceChart } from "@/components/PriceChart";
import { PriceForecast } from "@/components/PriceForecast";
import { PriceExplorer } from "@/components/PriceExplorer";
import { StoreFinder } from "@/components/StoreFinder";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PriceChart />
      <PriceForecast />
      <StoreFinder />
      <PriceExplorer />
      <Footer />
    </div>
  );
};

export default Index;
