import { TrendingUp, Brain, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: TrendingUp,
    title: "Real-Time Prices",
    description:
      "Track prices across 10,000+ premises updated monthly from KPDN PriceCatcher — the most comprehensive grocery price dataset in Malaysia.",
    cta: "Explore prices",
    href: "/dashboard?s=explorer",
  },
  {
    icon: Brain,
    title: "AI Forecast",
    description:
      "ML-powered 14-day price predictions trained on 6 months of historical data. Know when prices will drop before you shop.",
    cta: "View forecasts",
    href: "/dashboard?s=forecast",
  },
  {
    icon: ShoppingCart,
    title: "Smart Savings",
    description:
      "Find the cheapest stores near you with geolocation-based search and optimize your basket to save up to 30% on groceries.",
    cta: "Find stores",
    href: "/dashboard?s=stores",
  },
];

export function WhySection() {
  return (
    <section className="bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="text-center text-3xl font-black tracking-tight text-foreground md:text-4xl">
          Why HargaRakyat?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-muted-foreground md:text-lg">
          Built for Malaysians who want to stretch every Ringgit. Powered by
          real government data and machine learning.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
              <Link to={f.href} className="mt-6">
                <Button variant="outline" className="rounded-xl text-sm">
                  {f.cta} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link to="/dashboard">
            <Button size="lg" className="rounded-xl px-8 text-base font-semibold">
              Get started with HargaRakyat <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
