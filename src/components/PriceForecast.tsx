import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { useItemLookup, usePriceForecast, useNewsContext } from "@/hooks/usePriceCatcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search, TrendingUp, TrendingDown, Minus, Brain,
  ChevronDown, ChevronUp, AlertTriangle, FlaskConical,
  Globe, Thermometer, DollarSign,
} from "lucide-react";
import { SkeletonChart } from "@/components/SkeletonCard";
import { ITEM_GROUPS } from "@/lib/pricecatcher";
import { getProductImage } from "@/lib/image-mapper";
import { BestTimeToBuy } from "@/components/BestTimeToBuy";

// News-to-item-group keyword mapping for cross-referencing
const NEWS_CATEGORY_KEYWORDS: Record<string, string[]> = {
  Geopolitical: ["Cooking Oil", "Chicken", "Transportation", "Poultry", "Vegetables"],
  Currency: ["Wheat Products", "Sugar", "Cooking Oil", "Rice"],
  Climate: ["Vegetables", "Leafy Greens", "Tomatoes", "Chili", "Fresh Produce"],
  Supply: ["Eggs", "Poultry", "Rice", "White Rice"],
  Commodity: ["Cooking Oil", "Palm Oil"],
};

const GEOPOLITICAL_CATEGORIES = ["BARANGAN SEGAR", "BARANGAN KERING"];
const NEWS_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Geopolitical: <Globe className="w-3.5 h-3.5" />,
  Currency: <DollarSign className="w-3.5 h-3.5" />,
  Climate: <Thermometer className="w-3.5 h-3.5" />,
};

export function PriceForecast() {
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [showModelInfo, setShowModelInfo] = useState(false);

  const { data: items, isLoading: loadingItems } = useItemLookup();
  const { data: forecast, isLoading: loadingForecast } = usePriceForecast();
  const { data: news } = useNewsContext();

  const isLoading = loadingItems || loadingForecast;

  // Today's date for dynamic description
  const todayLabel = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" });
  }, []);

  const forecastEndLabel = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() + 13);
    return end.toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" });
  }, []);

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

  // Cross-reference selected item with news — find relevant news items
  const relevantNews = useMemo(() => {
    if (!news || !selectedItemData) return [];
    const itemName = selectedItemData.n.toLowerCase();
    const itemGroup = selectedItemData.g;

    return news.filter((n) => {
      // Check if any affected item keyword matches the selected item name
      const keywordMatch = n.items_affected.some(
        (kw) =>
          itemName.includes(kw.toLowerCase()) ||
          kw.toLowerCase().includes(itemName.split(" ")[0].toLowerCase())
      );
      // Also flag geopolitical/currency news for fresh & dry goods
      const categoryMatch =
        (n.category === "Geopolitical" || n.category === "Currency" || n.category === "Climate") &&
        GEOPOLITICAL_CATEGORIES.includes(itemGroup);
      return keywordMatch || categoryMatch;
    });
  }, [news, selectedItemData]);

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold tracking-tight">Price Forecast</h2>
          </div>
          <p className="text-muted-foreground mt-1">
            ML-powered 14-day price prediction from{" "}
            <span className="text-primary font-semibold">{todayLabel}</span>
            {" "}→{" "}
            <span className="text-accent font-semibold">{forecastEndLabel}</span>
            {" "}· Based on 6 months of KPDN PriceCatcher data
          </p>
        </div>

        {/* ML Model Info accordion */}
        <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden mt-4">
          <button
            className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium hover:bg-primary/5 transition-colors"
            onClick={() => setShowModelInfo(!showModelInfo)}
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <FlaskConical className="w-4 h-4 text-accent" />
              Model: Polynomial Regression (degree 3) on weekly KPDN data
            </span>
            {showModelInfo ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {showModelInfo && (
            <div className="px-5 pb-4 pt-2 border-t border-border/40 text-sm text-muted-foreground space-y-2 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-foreground mb-1">Training Data</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Source: data.gov.my PriceCatcher (KPDN)</li>
                    <li>• Window: Oct 2025 – Mar 2026 (6 months)</li>
                    <li>• Frequency: Weekly weighted averages</li>
                    <li>• Items: {filteredItems.length}+ goods tracked nationally</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Methodology</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Algorithm: <code className="bg-secondary px-1 rounded">numpy.polyfit</code> (degree 3)</li>
                    <li>• Forecast horizon: 14 days from today</li>
                    <li>• Trend classification: slope threshold ±0.05/day</li>
                    <li>• Note: Historical patterns only — external shocks not modeled</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg px-3 py-2 mt-2">
                ⚠ This model captures historical price trends. Real-world shocks (geopolitics, weather, policy) may cause deviations. See the news widget on the Dashboard for context.
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
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
          <div className="bg-white border border-border shadow-sm rounded-xl p-16 text-center">
            <Brain className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Select an item above to see its 14-day price forecast</p>
          </div>
        ) : !itemForecast ? (
          <div className="bg-white border border-border shadow-sm rounded-xl p-16 text-center">
            <p className="text-muted-foreground">No forecast data available for this item</p>
          </div>
        ) : (
          <>
            {/* News-aware warning for selected item */}
            {relevantNews.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-400 mb-1">
                      Market Risk Alert for {selectedItemData?.n}
                    </p>
                    <div className="space-y-1">
                      {relevantNews.slice(0, 2).map((n) => (
                        <p key={n.id} className="text-xs text-amber-300/80 flex items-center gap-1.5">
                          <span className="shrink-0">
                            {NEWS_CATEGORY_ICONS[n.category] || <Globe className="w-3.5 h-3.5" />}
                          </span>
                          <span>
                            <span className="font-semibold">{n.category}:</span> {n.headline.substring(0, 90)}
                            {n.headline.length > 90 ? "…" : ""}
                          </span>
                        </p>
                      ))}
                    </div>
                    <p className="text-[11px] text-amber-500/70 mt-1.5">
                      These external factors are not captured by the polynomial regression model.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-stagger">
              <div className="bg-white border border-border shadow-sm rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Current Price</p>
                <p className="text-2xl font-bold font-mono mt-1 text-primary">RM {itemForecast.last_price.toFixed(2)}</p>
              </div>
              <div className="bg-white border border-border shadow-sm rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">14-Day Forecast</p>
                <p className="text-2xl font-bold font-mono mt-1">
                  RM {itemForecast.forecast[itemForecast.forecast.length - 1]?.price.toFixed(2)}
                </p>
              </div>
              <div className="bg-white border border-border shadow-sm rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Trend</p>
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
                <div className="bg-white border border-border shadow-sm rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Predicted Change</p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${
                    forecastSummary.change > 0 ? "text-chart-down" : "text-chart-up"
                  }`}>
                    {forecastSummary.change > 0 ? "+" : ""}{forecastSummary.change}%
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white border border-border shadow-sm rounded-xl p-6">
              <div className="flex items-start gap-4 mb-8">
                <div>
                  <h3 className="font-bold text-xl md:text-2xl mb-2 text-foreground leading-tight px-1">{selectedItemData?.n}</h3>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                    <span className="bg-primary/10 text-primary border border-primary/20 px-2 rounded-md py-1">{selectedItemData?.k}</span>
                    <span className="bg-secondary text-muted-foreground px-2 rounded-md py-1">Unit: {selectedItemData?.u}</span>
                  </div>
                </div>
              </div>

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
                Polynomial regression (degree 3) · Trained on 6 months of weekly national averages · data.gov.my PriceCatcher
              </p>
            </div>

            {itemForecast && selectedItemData && (
              <BestTimeToBuy forecast={itemForecast} itemName={selectedItemData.n} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
}
