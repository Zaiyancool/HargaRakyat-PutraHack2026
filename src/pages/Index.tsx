import { HeroSection } from "@/components/HeroSection";
import { PriceExplorer } from "@/components/PriceExplorer";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PriceExplorer />
      <Footer />
    </div>
  );
};

export default Index;
