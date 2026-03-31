import { TrendingUp, Database, MapPin } from "lucide-react";

const stats = [
  { icon: TrendingUp, label: "Items Tracked", value: "480+" },
  { icon: Database, label: "Monthly Records", value: "2M+" },
  { icon: MapPin, label: "Premises", value: "10K+" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-pulse-glow pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            Live from data.gov.my
          </div>

          <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight">
            Malaysia Food
            <span className="text-gradient"> Price Tracker</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Track and compare food prices across 10,000+ premises nationwide.
            Powered by KPDN PriceCatcher open data.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4 text-center glow-primary">
              <s.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
              <div className="text-xl font-bold font-heading">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
