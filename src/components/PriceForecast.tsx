import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { useItemLookup, usePriceForecast } from "@/hooks/usePriceCatcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown, Minus, Brain } from "lucide-react";
import { SkeletonChart } from "@/components/SkeletonCard";
import { ITEM_GROUPS } from "@/lib/pricecatcher";

export function PriceForecast() {
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const { data: items, isLoading: loadingItems } = useItemLookup();
  const { data: forecast, isLoading: loadingForecast } = usePriceForecast();

  const isLoading = loadingItems || loadingForecast;

  const filteredItems = useMemo(() => {
    if (!items || !forecast) return [];
    return items
      .filter((i) => {
        if (!forecast[String(i.c)]) return false;
        if (selectedGroup !== "all" && i.g !== selectedGroup) return false;
        if (search && !i.n.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.n.localeCompare(b.n));
  }, [items, forecast, search, selectedGroup]);

  const selectedItemData = useMemo(() => {
    if (!items) return null;
    return items.find((i) => String(i.c) === selectedItem) || null;
  }, [items, selectedItem]);

  const itemForecast = useMemo(() => {
    if (!forecast || !selectedItem) return null;
    return forecast[selectedItem] || null;
  }, [forecast, selectedItem]);

  const chartData = useMemo(() => {
    if (!itemForecast) return [];
    const hist = itemForecast.history.map((p) => ({
      date: p.date, label: formatDate(p.date),
      actual: p.price, forecast: null as number | null,
    }));
    const lastHist = hist[hist.length - 1];
    const fc = itemForecast.forecast.map((p) => ({
      date: p.date, label: formatDate(p.date),
      actual: null as number | null, forecast: p.price,
    }));
    if (lastHist) {
      fc.unshift({ date: lastHist.date, label: lastHist.label, actual: null, forecast: lastHist.actual });
    }
    return [...hist, ...fc];
  }, [itemForecast]);

  const forecastSummary = useMemo(() => {
    if (!itemForecast) return null;
    const first = itemForecast.forecast[0]?.price;
    const last = itemForecast.forecast[itemForecast.forecast.length - 1]?.price;
    if (!first || !last) return null;
    const change = ((last - first) / first) * 100;
    return { change: Math.round(change * 100) / 100, trend: itemForecast.trend };
  }, [itemForecast]);

  const boundaryDate = useMemo(() => {
    if (!itemForecast?.history.length) return "";
    return formatDate(itemForecast.history[itemForecast.history.length - 1].date);
  }, [itemForecast]);

  return (
    <section className="container py-12">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold tracking-tight">Price Forecast</h2>
          </div>
          <p className="text-muted-foreground mt-1">
            ML-powered 14-day price prediction based on 6 months of government data (Oct 2025 – Mar 2026)
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary border-border" />
          </div>
          <Select value={selectedGroup} onValueChange={(v) => { setSelectedGroup(v); setSelectedItem(""); }}>
            <SelectTrigger className="w-[220px] bg-secondary border-border"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {ITEM_GROUPS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <Select value={selectedItem} onValueChange={setSelectedItem}>
          <SelectTrigger className="w-full bg-secondary border-border"><SelectValue placeholder="Select an item to forecast..." /></SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {filteredItems.map((i) => (<SelectItem key={i.c} value={String(i.c)}>{i.n} ({i.u})</SelectItem>))}
          </SelectContent>
        </Select>

        {isLoading ? (
          <SkeletonChart />
        ) : !selectedItem ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-muted-foreground">Select an item to see its 14-day price forecast</p>
          </div>
        ) : !itemForecast ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No forecast data available for this item</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-stagger">
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold font-mono mt-1">RM {itemForecast.last_price.toFixed(2)}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">14-Day Forecast</p>
                <p className="text-2xl font-bold font-mono mt-1">
                  RM {itemForecast.forecast[itemForecast.forecast.length - 1]?.price.toFixed(2)}
                </p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Trend</p>
                <div className="flex items-center gap-2 mt-1">
                  {itemForecast.trend === "up" ? (
                    <TrendingUp className="w-5 h-5 text-chart-down" />
                  ) : itemForecast.trend === "down" ? (
                    <TrendingDown className="w-5 h-5 text-chart-up" />
                  ) : (
                    <Minus className="w-5 h-5 text-accent" />
                  )}
                  <span className={`text-2xl font-bold font-mono capitalize ${
                    itemForecast.trend === "up" ? "text-chart-down" :
                    itemForecast.trend === "down" ? "text-chart-up" : "text-accent"
                  }`}>
                    {itemForecast.trend}
                  </span>
                </div>
              </div>
              {forecastSummary && (
                <div className="glass-card rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">Predicted Change</p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${
                    forecastSummary.change > 0 ? "text-chart-down" : "text-chart-up"
                  }`}>
                    {forecastSummary.change > 0 ? "+" : ""}{forecastSummary.change}%
                  </p>
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-1">{selectedItemData?.n}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {selectedItemData?.k} · {selectedItemData?.u} · Oct 2025 – Mar 2026 + 14-day forecast
              </p>
              <div className="h-[300px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `RM${v}`} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "13px" }}
                      formatter={(value: number, name: string) => [`RM ${value.toFixed(2)}`, name === "actual" ? "Actual Price" : "Forecasted Price"]}
                    />
                    <Legend formatter={(value) => value === "actual" ? "Actual (Weekly Avg)" : "Forecast (14 days)"} />
                    {boundaryDate && (
                      <ReferenceLine x={boundaryDate} stroke="hsl(var(--accent))" strokeDasharray="4 4"
                        label={{ value: "Today", position: "top", fill: "hsl(var(--accent))", fontSize: 12 }} />
                    )}
                    <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} connectNulls={false} />
                    <Line type="monotone" dataKey="forecast" stroke="hsl(var(--accent))" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3, fill: "hsl(var(--accent))" }} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Forecast uses polynomial regression on 6 months of data from data.gov.my PriceCatcher
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
}
