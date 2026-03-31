import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, BarChart3, ShoppingCart, Database, Activity } from "lucide-react";
import { useItemLookup, usePricesAgg, usePricesAggJan, usePriceForecast } from "@/hooks/usePriceCatcher";
import { SkeletonCard } from "@/components/SkeletonCard";

export function DashboardHome() {
  const { data: items, isLoading: li } = useItemLookup();
  const { data: pricesAgg, isLoading: lp } = usePricesAgg();
  const { data: pricesAggJan, isLoading: lj } = usePricesAggJan();
  const { data: forecast, isLoading: lf } = usePriceForecast();

  const isLoading = li || lp || lj || lf;

  const kpis = useMemo(() => {
    if (!pricesAgg || !items) return null;
    const avgPrice = pricesAgg.reduce((s, p) => s + p.avg, 0) / pricesAgg.length;
    return { avgPrice, totalItems: pricesAgg.length, totalRecords: pricesAgg.reduce((s, p) => s + p.n, 0) };
  }, [pricesAgg, items]);

  const topMovers = useMemo(() => {
    if (!pricesAgg || !pricesAggJan || !items) return [];
    const itemMap = new Map(items.map((i) => [i.c, i.n]));
    const janMap = new Map(pricesAggJan.map((p) => [p.c, p.avg]));

    return pricesAgg
      .filter((p) => janMap.has(p.c) && itemMap.has(p.c))
      .map((p) => {
        const janAvg = janMap.get(p.c)!;
        const change = ((p.avg - janAvg) / janAvg) * 100;
        return { name: itemMap.get(p.c)!, price: p.avg, change: Math.round(change * 100) / 100 };
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 8);
  }, [pricesAgg, pricesAggJan, items]);

  const forecastSummary = useMemo(() => {
    if (!forecast || !items) return [];
    const itemMap = new Map(items.map((i) => [String(i.c), i.n]));
    return Object.entries(forecast)
      .filter(([, f]) => f.trend !== "stable")
      .map(([code, f]) => ({
        name: itemMap.get(code) || code,
        trend: f.trend,
        lastPrice: f.last_price,
        forecastEnd: f.forecast[f.forecast.length - 1]?.price || f.last_price,
      }))
      .sort((a, b) => Math.abs(b.forecastEnd - b.lastPrice) - Math.abs(a.forecastEnd - a.lastPrice))
      .slice(0, 5);
  }, [forecast, items]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1">
        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} lines={3} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-stagger">
        <KPICard icon={ShoppingCart} label="Avg Item Price" value={`RM ${kpis?.avgPrice.toFixed(2) || "—"}`} />
        <KPICard icon={Database} label="Items Tracked" value={kpis?.totalItems.toLocaleString() || "—"} />
        <KPICard icon={BarChart3} label="Total Records" value={kpis?.totalRecords.toLocaleString() || "—"} />
        <KPICard icon={Activity} label="Data Period" value="Feb 2026" accent />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Movers - 2 cols */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Top Price Movers (MoM)
          </h3>
          <div className="space-y-2">
            {topMovers.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <span className="text-sm truncate flex-1 mr-4">{m.name}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-mono font-semibold">RM {m.price.toFixed(2)}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    m.change > 0 ? "bg-destructive/10 text-chart-down" : "bg-primary/10 text-chart-up"
                  }`}>
                    {m.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {m.change > 0 ? "+" : ""}{m.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Forecast Summary - 1 col */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" /> AI Forecast Alerts
          </h3>
          <div className="space-y-3">
            {forecastSummary.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                {f.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-chart-down shrink-0" />
                ) : f.trend === "down" ? (
                  <TrendingDown className="w-4 h-4 text-chart-up shrink-0" />
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    RM{f.lastPrice.toFixed(2)} → RM{f.forecastEnd.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            {forecastSummary.length === 0 && (
              <p className="text-sm text-muted-foreground">All items are stable</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass-card rounded-xl p-4 glow-primary">
      <Icon className={`w-4 h-4 mb-2 ${accent ? "text-accent" : "text-primary"}`} />
      <p className="text-2xl font-bold font-mono">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
