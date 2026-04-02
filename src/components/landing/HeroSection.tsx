import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useItemLookup, usePricesAgg } from "@/hooks/usePriceCatcher";
import { Link } from "react-router-dom";

export function HeroSection() {
  const { data: items } = useItemLookup();
  const { data: pricesAgg } = usePricesAgg();

  const itemCount = items?.length ?? 0;
  const totalRecords = pricesAgg?.reduce((s, p) => s + p.n, 0) ?? 0;
  const avgPrice =
    pricesAgg && pricesAgg.length > 0
      ? (pricesAgg.reduce((s, p) => s + p.avg, 0) / pricesAgg.length).toFixed(2)
      : "0.00";

  return (
    <section className="relative overflow-visible bg-white">
      {/* Subtle grid background like Kraken */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e5eaf3 1px, transparent 1px), linear-gradient(to bottom, #e5eaf3 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.5,
        }}
      />
      {/* Blue glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-32 pt-24 md:grid-cols-2">
        {/* Left — copy */}
        <div className="max-w-xl">
          <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.03em] text-gray-900 sm:text-6xl md:text-7xl">
            Plan your
            <br />
            <span className="text-primary">grocery</span>
            <br />
            shopping
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-gray-500 md:text-xl">
            Malaysia's first AI-powered platform forecasting daily grocery prices
            — powered by KPDN PriceCatcher data across 10,000+ premises.
          </p>

          {/* Trust bullets */}
          <ul className="mt-5 space-y-2">
            {[
              "Real government data, updated monthly",
              "14-day AI price forecast",
              "Find cheapest stores near you",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-gray-500">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </span>
                {t}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="mt-8">
            <Link to="/dashboard">
              <Button className="h-[50px] shrink-0 rounded-xl px-8 text-base font-bold shadow-sm">
                Explore Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right — phone mockup */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Glow behind phone */}
            <div className="absolute inset-0 scale-90 rounded-[3rem] bg-primary/15 blur-2xl" />

            <img
              src="/images/mockup_phone.webp"
              alt="HargaRakyat app preview"
              loading="eager"
              className="relative h-[600px] w-auto drop-shadow-2xl transition-transform duration-700 ease-out hover:scale-105 md:h-[720px]"
            />
          </div>
        </div>
      </div>

      {/* ── Stats bar — Kraken-style floating card ── */}
      <div className="relative z-10 mx-auto mt-[-5rem] max-w-5xl px-6 pb-20">
        <div className="rounded-[2.5rem] bg-white px-8 py-10 shadow-[0_8px_40px_rgba(0,0,0,0.06)] md:py-14">
          <p className="mb-10 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Powered by KPDN PriceCatcher Data
          </p>
          <div className="grid grid-cols-1 gap-12 text-center sm:grid-cols-3 sm:gap-8">
            <StatBlock
              value={itemCount > 0 ? itemCount.toLocaleString() : "756"}
              sublabel="Items tracked"
            />
            <StatBlock
              value={`RM ${avgPrice !== "0.00" ? avgPrice : "16.53"}`}
              sublabel="Avg item price"
            />
            <StatBlock
              value={totalRecords > 0 ? totalRecords.toLocaleString() : "1,369,552"}
              sublabel="Price records"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBlock({
  value,
  sublabel,
}: {
  value: string;
  sublabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-5xl font-medium tracking-tight text-gray-900 md:text-[56px]">{value}</p>
      <p className="text-[13px] text-gray-500">{sublabel}</p>
    </div>
  );
}
