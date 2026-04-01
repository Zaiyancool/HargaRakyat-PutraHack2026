import { TopNav } from "@/components/landing/TopNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { ItemGrid } from "@/components/landing/ItemGrid";
import { WhySection } from "@/components/landing/WhySection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Landing = () => (
  <div className="min-h-screen bg-background">
    <TopNav />
    <HeroSection />
    <ItemGrid />
    <WhySection />
    <LandingFooter />
  </div>
);

export default Landing;
