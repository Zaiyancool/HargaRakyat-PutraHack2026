import { TrendingUp, Brain, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";

const features = [
  {
    icon: TrendingUp,
    iconBg: "bg-blue-50",
    iconColor: "text-primary",
    tag: "Live Data",
    title: "Real-Time Prices",
    description:
      "Track prices across 10,000+ premises updated monthly from KPDN PriceCatcher — the most comprehensive grocery price dataset in Malaysia.",
    cta: "Explore prices",
    href: "/dashboard?s=explorer",
  },
  {
    icon: Brain,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    tag: "AI Powered",
    title: "AI Forecast",
    description:
      "ML-powered 14-day price predictions trained on 6 months of historical data. Know when prices will drop before you shop.",
    cta: "View forecasts",
    href: "/dashboard?s=forecast",
  },
  {
    icon: ShoppingCart,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    tag: "Smart Shopping",
    title: "Smart Savings",
    description:
      "Find the cheapest stores near you with geolocation-based search and optimize your basket to save up to 30% on groceries.",
    cta: "Find stores",
    href: "/dashboard?s=stores",
  },
];

export function WhySection() {
  const { user } = useAuthContext();
  return (
    <section className="bg-[#F7F9FC] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section label */}
        <div className="flex items-center justify-center">
          <span className="rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary">
            Why HargaRakyat?
          </span>
        </div>

        <h2 className="mx-auto mt-5 max-w-2xl text-center text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
          Built for Malaysians who stretch every Ringgit
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-gray-500">
          Powered by real government data and machine learning — not guesswork.
        </p>

        {/* Feature cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
            >
              {/* Icon */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.iconBg}`}>
                <f.icon className={`h-6 w-6 ${f.iconColor}`} />
              </div>

              {/* Tag */}
              <span className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                {f.tag}
              </span>

              <h3 className="mt-2 text-2xl font-black text-gray-900">{f.title}</h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-gray-500">
                {f.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center gap-4">
          {user ? (
            <Link to="/dashboard">
              <Button
                size="lg"
                className="h-14 rounded-xl px-10 text-[17px] font-black shadow-md hover:shadow-lg"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/signup">
              <Button
                size="lg"
                className="h-14 rounded-xl px-10 text-[17px] font-black shadow-md hover:shadow-lg"
              >
                Get started with HargaRakyat
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
          <p className="text-sm text-gray-400">Free to use · Open data for everyone</p>
        </div>
      </div>
    </section>
  );
}
