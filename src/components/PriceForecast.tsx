import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useItemLookup, usePriceForecast, usePricesAgg, usePricesAggJan, usePriceHistory } from "@/hooks/usePriceCatcher";
import {
  Search, TrendingDown, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { SkeletonCard } from "@/components/SkeletonCard";
import { BestTimeToBuy } from "@/components/BestTimeToBuy";
import type { ItemForecast, ItemLookup } from "@/lib/pricecatcher";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface EnrichedForecastItem {
  code: number;
  name: string;
  unit: string;
  group: string;
  category: string;
  todayPrice: number;
  growthPct: number;       // past period growth (jan → latest)
  predictedPrice: number;  // end of 14-day forecast
  predictedChange: number; // % change from today → predicted
  trend: "up" | "down" | "stable";
  forecast: ItemForecast;
}

const PAGE_SIZE = 100;

// Month labels for the history chart
const ALL_MONTHS = [
  "2025-07","2025-08","2025-09","2025-10","2025-11","2025-12",
  "2026-01","2026-02","2026-03",
];
const MONTH_LABELS: Record<string, string> = {
  "2025-07": "Jul '25", "2025-08": "Aug '25", "2025-09": "Sep '25",
  "2025-10": "Oct '25", "2025-11": "Nov '25", "2025-12": "Dec '25",
  "2026-01": "Jan '26", "2026-02": "Feb '26", "2026-03": "Mar '26",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function fmt(n: number) { return n.toFixed(2); }

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function PriceForecast() {
  const { data: items, isLoading: li } = useItemLookup();
  const { data: forecast, isLoading: lf } = usePriceForecast();
  const { data: pricesAgg, isLoading: lp } = usePricesAgg();
  const { data: pricesJan, isLoading: lj } = usePricesAggJan();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState<EnrichedForecastItem | null>(null);

  const isLoading = li || lf || lp || lj;

  // ── Build enriched list ──────────────────────────────────────────────────
  const enriched: EnrichedForecastItem[] = useMemo(() => {
    if (!items || !forecast || !pricesAgg) return [];
    const priceMap = new Map(pricesAgg.map((p) => [p.c, p.avg]));
    const janMap = new Map(pricesJan?.map((p) => [p.c, p.avg]) ?? []);

    return items
      .map((item: ItemLookup) => {
        const fc = forecast[String(item.c)];
        if (!fc || fc.forecast.length === 0) return null;
        const todayPrice = priceMap.get(item.c) ?? fc.last_price;
        const janPrice = janMap.get(item.c);
        const growthPct = janPrice && janPrice > 0 ? ((todayPrice - janPrice) / janPrice) * 100 : 0;
        const predictedPrice = fc.forecast[fc.forecast.length - 1].price;
        const predictedChange = ((predictedPrice - todayPrice) / todayPrice) * 100;

        return {
          code: item.c,
          name: item.n,
          unit: item.u,
          group: item.g,
          category: item.k,
          todayPrice,
          growthPct,
          predictedPrice,
          predictedChange,
          trend: fc.trend,
          forecast: fc,
        } as EnrichedForecastItem;
      })
      .filter(Boolean) as EnrichedForecastItem[];
  }, [items, forecast, pricesAgg, pricesJan]);

  // ── Top 5 predicted to go cheaper ────────────────────────────────────────
  const cheaperPicks = useMemo(() => {
    return [...enriched]
      .filter((i) => i.predictedChange < 0)
      .sort((a, b) => a.predictedChange - b.predictedChange)
      .slice(0, 5);
  }, [enriched]);

  // ── Filtered/searched table ──────────────────────────────────────────────
  const allFiltered = useMemo(() => {
    let data = [...enriched];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((i) => i.name.toLowerCase().includes(q));
    }
    data.sort((a, b) => b.todayPrice - a.todayPrice);
    return data;
  }, [enriched, search]);

  const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE);
  const tableData = allFiltered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const globalOffset = page * PAGE_SIZE;

  // ── Tomorrow's date string ───────────────────────────────────────────────
  const tomorrowLabel = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
  }, []);

  // Loading
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={3} />)}
        </div>
        <SkeletonCard lines={8} />
      </div>
    );
  }

  // ── Detail View ──────────────────────────────────────────────────────────
  if (selectedItem) {
    return (
      <ForecastDetailView
        item={selectedItem}
        onBack={() => setSelectedItem(null)}
      />
    );
  }

  // ── Main List View ───────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center pt-6 pb-2">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
          Product Price Predictions
        </h1>
        <p className="mt-2 text-base text-gray-500 max-w-xl mx-auto">
          ML-powered 14-day price forecasts based on 6 months of KPDN PriceCatcher data.
        </p>
      </div>

      {/* Top 5 Cheapest Picks (Kraken "Top Gainers" style) */}
      {cheaperPicks.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-3 text-center">
            Top {cheaperPicks.length} products predicted to get cheaper in the next 14 days
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {cheaperPicks.map((item) => (
              <button
                key={item.code}
                onClick={() => setSelectedItem(item)}
                className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-[9px] font-black text-emerald-600 shrink-0">
                    {initials(item.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-primary truncate group-hover:underline">{item.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{item.unit}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">14-day forecast</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {fmt(item.predictedChange)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Data Table Card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
          <div>
            <span className="text-sm font-bold text-gray-900">
              All Forecasts
            </span>
            <span className="text-sm text-gray-400 ml-2">
              {allFiltered.length} items
            </span>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(0); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Column headers (desktop) */}
        <div className="hidden sm:grid grid-cols-[2.5rem_1fr_7rem_7rem_7rem_5rem] gap-x-4 px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
          <span>#</span>
          <span>Asset</span>
          <span className="text-right">Today's price</span>
          <span className="text-right">Past 1mo growth</span>
          <span className="text-right">Predicted</span>
          <span></span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {tableData.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">No items found</div>
          )}
          {tableData.map((item, idx) => {
            const rank = globalOffset + idx + 1;
            const growthUp = item.growthPct > 0;
            return (
              <button
                key={item.code}
                onClick={() => setSelectedItem(item)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 text-left hover:bg-gray-50 transition-colors group"
              >
                {/* Mobile */}
                <div className="flex sm:hidden items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-gray-400 font-medium w-5 shrink-0 text-right">{rank}</span>
                    <div className="h-8 w-8 shrink-0 rounded-xl bg-primary/8 flex items-center justify-center text-[10px] font-black text-primary">
                      {initials(item.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">{item.name}</p>
                      <p className="text-xs text-gray-400">RM {fmt(item.todayPrice)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold font-mono text-gray-900">RM {fmt(item.predictedPrice)}</p>
                    <p className={`text-xs font-bold ${item.predictedChange < 0 ? "text-emerald-600" : item.predictedChange > 0 ? "text-red-500" : "text-gray-400"}`}>
                      {item.predictedChange > 0 ? "+" : ""}{fmt(item.predictedChange)}%
                    </p>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden sm:grid grid-cols-[2.5rem_1fr_7rem_7rem_7rem_5rem] gap-x-4 items-center">
                  <span className="text-sm text-gray-400 font-medium">{rank}</span>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/8 flex items-center justify-center text-[11px] font-black text-primary">
                      {initials(item.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">{item.name}</p>
                      <p className="text-xs text-gray-400 uppercase">{item.unit}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold font-mono text-gray-900 text-right">RM {fmt(item.todayPrice)}</p>
                  <p className={`text-sm font-bold font-mono text-right ${growthUp ? "text-red-500" : "text-emerald-600"}`}>
                    {growthUp ? "+" : ""}{fmt(item.growthPct)}%
                  </p>
                  <p className="text-sm font-bold font-mono text-gray-900 text-right">RM {fmt(item.predictedPrice)}</p>
                  <span className="ml-auto rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors">
                    View
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Showing <strong className="text-gray-700">{globalOffset + 1}–{Math.min(globalOffset + PAGE_SIZE, allFiltered.length)}</strong> of <strong className="text-gray-700">{allFiltered.length}</strong>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(0)} disabled={page === 0} className="flex items-center gap-0.5 rounded-lg px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all" aria-label="First">
                <ChevronLeft className="h-4 w-4" /><ChevronLeft className="h-4 w-4 -ml-2" />
              </button>
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="flex items-center rounded-lg px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all" aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
                .reduce<(number | "...")[]>((acc, i, idx, arr) => {
                  if (idx > 0 && (i as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(i);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`e-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <button key={item} onClick={() => setPage(item as number)} className={`rounded-lg w-9 h-9 text-sm font-bold transition-all ${page === item ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"}`}>{(item as number) + 1}</button>
                  )
                )}
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="flex items-center rounded-lg px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all" aria-label="Next">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1} className="flex items-center gap-0.5 rounded-lg px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all" aria-label="Last">
                <ChevronRight className="h-4 w-4" /><ChevronRight className="h-4 w-4 -ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Detail View (Kraken "Bitcoin price prediction" style) ────────────────────
function ForecastDetailView({
  item,
  onBack,
}: {
  item: EnrichedForecastItem;
  onBack: () => void;
}) {
  const { data: history } = usePriceHistory();

  const fc = item.forecast;
  const tomorrowPrice = fc.forecast[0]?.price ?? fc.last_price;
  const day14Price = fc.forecast[fc.forecast.length - 1]?.price ?? fc.last_price;

  // Build chart data: history + forecast line
  const chartData = useMemo(() => {
    const hist = fc.history.map((p) => ({
      date: p.date,
      label: formatDate(p.date),
      actual: p.price,
      forecast: null as number | null,
    }));
    const lastHist = hist[hist.length - 1];
    const fcLine = fc.forecast.map((p) => ({
      date: p.date,
      label: formatDate(p.date),
      actual: null as number | null,
      forecast: p.price,
    }));
    if (lastHist) {
      fcLine.unshift({ date: lastHist.date, label: lastHist.label, actual: null, forecast: lastHist.actual });
    }
    return [...hist, ...fcLine];
  }, [fc]);

  const boundaryDate = useMemo(() => {
    if (!fc.history.length) return "";
    return formatDate(fc.history[fc.history.length - 1].date);
  }, [fc]);

  // Historical monthly averages from prices_history.json
  const monthlyPrices = useMemo(() => {
    if (!history) return [];
    const itemHistory = history[String(item.code)];
    if (!itemHistory) return [];
    return ALL_MONTHS
      .filter((m) => itemHistory[m] && itemHistory[m].n > 0)
      .map((m) => ({
        month: MONTH_LABELS[m],
        avg: itemHistory[m].avg,
      }));
  }, [history, item.code]);

  // Past 6mo average, past 3mo average
  const past6moAvg = monthlyPrices.length > 0
    ? monthlyPrices.reduce((s, p) => s + p.avg, 0) / monthlyPrices.length
    : null;
  const past3moAvg = monthlyPrices.length >= 3
    ? monthlyPrices.slice(-3).reduce((s, p) => s + p.avg, 0) / 3
    : null;

  const predChangeFromToday = ((day14Price - item.todayPrice) / item.todayPrice) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <button onClick={onBack} className="hover:text-primary transition-colors">Home</button>
        <span>›</span>
        <button onClick={onBack} className="hover:text-primary transition-colors">Price Predictions</button>
        <span>›</span>
        <span className="text-gray-700 font-semibold truncate">{item.name}</span>
        <span>›</span>
        <span className="text-gray-500">Forecast</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
          {item.name} price prediction
        </h1>
        <p className="mt-2 text-sm text-gray-500 max-w-lg">
          What will <strong>{item.name}</strong> cost in the next 14 days?
          Our ML model forecasts the price using 6 months of KPDN PriceCatcher data.
        </p>
      </div>

      {/* Prediction summary card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <p className="text-sm text-gray-400">
          Price in 14 days with ML-predicted growth
        </p>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-black text-primary">
            {initials(item.name)}
          </div>
          <span className={`text-lg font-bold ${predChangeFromToday < 0 ? "text-emerald-600" : predChangeFromToday > 0 ? "text-red-500" : "text-gray-500"}`}>
            {predChangeFromToday > 0 ? "+" : ""}{fmt(predChangeFromToday)}% predicted change
          </span>
        </div>

        {/* Chart */}
        <div className="h-[280px] md:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `RM${v.toFixed(0)}`} domain={["auto", "auto"]} width={50} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "12px" }}
                formatter={(value: number, name: string) => [`RM ${value.toFixed(2)}`, name === "actual" ? "Actual" : "Forecast"]}
              />
              {boundaryDate && (
                <ReferenceLine x={boundaryDate} stroke="#1558E0" strokeDasharray="4 4"
                  label={{ value: "Today", position: "top", fill: "#1558E0", fontSize: 12, fontWeight: 700 }} />
              )}
              <Line type="monotone" dataKey="actual" stroke="#1558E0" strokeWidth={2.5} dot={{ r: 3, fill: "#1558E0" }} connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#7c3aed" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3, fill: "#7c3aed" }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price Stats Row (Kraken style) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <PriceStat label="Past 6mo avg" value={past6moAvg ? `RM ${fmt(past6moAvg)}` : "—"} />
        <PriceStat label="Past 3mo avg" value={past3moAvg ? `RM ${fmt(past3moAvg)}` : "—"} />
        <PriceStat label="Today's price" value={`RM ${fmt(item.todayPrice)}`} highlight />
        <PriceStat label="Tomorrow*" value={`RM ${fmt(tomorrowPrice)}`} />
        <PriceStat label="14 days later*" value={`RM ${fmt(day14Price)}`} accent />
      </div>

      {/* Best time to buy */}
      <BestTimeToBuy forecast={fc} itemName={item.name} />

      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 shadow-sm transition-all"
      >
        <ChevronLeft className="h-4 w-4" /> Back to all predictions
      </button>
    </div>
  );
}

function PriceStat({ label, value, highlight, accent }: { label: string; value: string; highlight?: boolean; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 text-center ${highlight ? "bg-primary/5 border border-primary/20" : accent ? "bg-violet-50 border border-violet-100" : "bg-gray-50 border border-gray-100"}`}>
      <p className="text-[11px] text-gray-400 font-medium mb-1">{label}</p>
      <p className={`text-lg font-black font-mono ${highlight ? "text-primary" : accent ? "text-violet-600" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
