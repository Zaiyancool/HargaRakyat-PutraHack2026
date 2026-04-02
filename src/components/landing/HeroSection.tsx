import { useState } from "react";
import { ArrowRight, TrendingUp, BarChart3, Database, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useItemLookup, usePricesAgg } from "@/hooks/usePriceCatcher";
import { Link } from "react-router-dom";

export function HeroSection() {
  const [email, setEmail] = useState("");
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

            <div className="relative mx-auto h-[520px] w-[260px] overflow-hidden rounded-[2.5rem] border-[7px] border-gray-900 bg-white shadow-2xl md:h-[580px] md:w-[290px]">
              {/* Notch */}
              <div className="absolute left-1/2 top-0 h-7 w-24 -translate-x-1/2 rounded-b-2xl bg-gray-900" />

              {/* App header */}
              <div className="mt-7 flex items-center justify-between border-b border-gray-100 px-4 pb-3 pt-4">
                <span className="text-[11px] font-black text-gray-900">HargaRakyat</span>
                <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-white">LIVE</span>
              </div>

              {/* Trending section */}
              <div className="px-4 pt-4">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">Trending Today</p>
                <div className="mt-2 space-y-2">
                  {[
                    { name: "Ayam (Std)", price: "8.50", pct: "+2.1%", up: true },
                    { name: "Telur Gred A", price: "14.20", pct: "-0.8%", up: false },
                    { name: "Beras Super", price: "32.90", pct: "+0.3%", up: true },
                    { name: "Minyak Masak", price: "7.50", pct: "-1.2%", up: false },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-[8px] font-bold text-primary flex items-center justify-center">
                          {item.name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-800">{item.name}</p>
                          <p className="text-[9px] text-gray-400">per kg</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold font-mono text-gray-900">RM {item.price}</p>
                        <p className={`text-[9px] font-bold ${item.up ? "text-red-500" : "text-emerald-500"}`}>{item.pct}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini chart */}
              <div className="mt-4 mx-4 rounded-2xl bg-gradient-to-br from-primary/8 to-primary/3 p-3">
                <p className="text-[9px] font-semibold text-primary">Price Forecast — 14 days</p>
                <div className="mt-2 flex items-end gap-0.5 h-14">
                  {[60, 72, 55, 68, 80, 65, 75, 85, 70, 90, 78, 88, 82, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h}%`,
                        background: i >= 7 ? "rgba(21,88,224,0.25)" : "rgba(21,88,224,0.6)",
                      }}
                    />
                  ))}
                </div>
                <p className="mt-1 text-[8px] text-gray-400">Dashed = predicted</p>
              </div>
            </div>
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
