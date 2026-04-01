import { useState } from "react";
import { ArrowRight, TrendingUp, BarChart3, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useItemLookup, usePricesAgg } from "@/hooks/usePriceCatcher";

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
    <section className="relative overflow-hidden py-16 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:grid-cols-2 md:px-6">
        {/* Left — copy */}
        <div className="max-w-xl">
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-7xl">
            Plan your
            <br />
            <span className="text-primary">grocery</span>
            <br />
            shopping
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
            The first AI-powered platform forecasting daily grocery prices in
            Malaysia — powered by KPDN PriceCatcher data.
          </p>

          <div className="mt-8 flex max-w-md gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-border bg-card text-base"
            />
            <Button className="h-12 shrink-0 rounded-xl px-6 text-base font-semibold">
              Sign Up <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right — phone mockup */}
        <div className="flex justify-center">
          <div className="relative mx-auto h-[480px] w-[240px] overflow-hidden rounded-[2.5rem] border-[6px] border-foreground/10 bg-card shadow-2xl md:h-[560px] md:w-[280px]">
            {/* Status bar */}
            <div className="flex h-7 items-center justify-center bg-foreground/5 text-[10px] font-semibold text-muted-foreground">
              HargaRakyat
            </div>
            {/* Mini chart placeholder */}
            <div className="flex flex-col gap-3 p-4">
              <div className="h-3 w-3/4 rounded-full bg-primary/20" />
              <div className="h-3 w-1/2 rounded-full bg-primary/10" />
              <div className="mt-2 h-28 w-full rounded-xl bg-gradient-to-br from-primary/10 to-primary/5" />
              <div className="mt-1 flex gap-2">
                <div className="h-16 flex-1 rounded-lg bg-accent/10" />
                <div className="h-16 flex-1 rounded-lg bg-chart-up/10" />
              </div>
              <div className="mt-2 space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-secondary" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2.5 w-3/4 rounded-full bg-secondary" />
                      <div className="h-2 w-1/2 rounded-full bg-muted" />
                    </div>
                    <div className="h-3 w-12 rounded-full bg-accent/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mx-auto mt-16 max-w-3xl px-4 md:px-6">
        <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm md:gap-12">
          <Stat icon={<Database className="h-5 w-5 text-primary" />} value={itemCount.toLocaleString()} label="Items tracked" />
          <div className="hidden h-8 w-px bg-border md:block" />
          <Stat icon={<TrendingUp className="h-5 w-5 text-accent" />} value={`RM ${avgPrice}`} label="Avg item price" />
          <div className="hidden h-8 w-px bg-border md:block" />
          <Stat icon={<BarChart3 className="h-5 w-5 text-primary" />} value={totalRecords.toLocaleString()} label="Price records" />
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="font-mono text-lg font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
