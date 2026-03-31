import { TrendingUp, Database, MapPin, ShieldCheck, Brain, ShoppingCart } from "lucide-react";

const stats = [
  { icon: Brain, label: "AI Forecasting", value: "14-Day" },
  { icon: ShoppingCart, label: "Smart Optimizer", value: "Basket" },
  { icon: MapPin, label: "Premises Mapped", value: "10K+" },
  { icon: Database, label: "Monthly Records", value: "2M+" },
];

const features = [
  "AI Price Forecasting",
  "Smart Grocery Optimizer",
  "Store Price Map",
  "6-Month Trend Analysis",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            Food Security Intelligence Platform
          </div>

          <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight">
            Harga
            <span className="text-gradient">Rakyat</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Beyond price checking — AI-powered food security intelligence.
            Smart grocery optimization, price forecasting & store mapping for every Malaysian.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {features.map((f) => (
              <span key={f} className="text-xs px-3 py-1 rounded-full bg-secondary border border-border text-muted-foreground">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4 text-center glow-primary">
              <s.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
              <div className="text-xl font-bold font-heading">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Powered by KPDN PriceCatcher open data from{" "}
          <a href="https://data.gov.my" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            data.gov.my
          </a>
        </p>
      </div>
    </section>
  );
}
