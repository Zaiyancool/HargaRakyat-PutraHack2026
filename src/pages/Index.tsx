import { HeroSection } from "@/components/HeroSection";
import { PriceChart } from "@/components/PriceChart";
import { PriceExplorer } from "@/components/PriceExplorer";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PriceChart />
      <PriceExplorer />
      <Footer />
    </div>
  );
};

export default Index;
