import { useEffect, useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { BarChart3, TrendingDown, ChevronUp, ChevronDown, Minus, StopCircle, Star, Search, ChevronLeft } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useFavouritesAll } from '@/hooks/useFavourites';
import { useItemLookup, usePriceForecast, usePricesAgg, usePricesAggJan, usePriceHistory } from '@/hooks/usePriceCatcher';
import { ItemPriceModal } from './ItemPriceModal';
import { BestTimeToBuy } from './BestTimeToBuy';
import { ThemeToggle } from './ThemeToggle';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { formatCurrency, formatPercent } from '@/lib/formatters';
import type { ItemForecast, ItemLookup, ForecastPoint } from '@/lib/pricecatcher';

const CATEGORY_LABELS: Record<string, string> = {
  "BARANGAN SEGAR": "Fresh Goods",
  "BARANGAN KERING": "Dry Goods",
  "BARANGAN BUNGKUSAN": "Packaged Goods",
  "SAYUR-SAYURAN": "Vegetables",
  "IKAN & LAUT": "Seafood",
  "DAGING": "Meats",
  "BUAH-BUAHAN": "Fruits"
};

interface FavouriteItem {
  item_id: number;
  item_name: string;
  category: string;
  unit: string;
  avg_price: number;
}

interface EnrichedDashboardItem {
  code: number;
  name: string;
  unit: string;
  category: string;
  price: number;
  min: number;
  max: number;
  janPrice: number | null;
  changePct: number | null;
}

interface EnrichedForecastItem {
  code: number;
  name: string;
  unit: string;
  group: string;
  category: string;
  todayPrice: number;
  growthPct: number;
  predictedPrice: number;
  predictedChange: number;
  trend: "up" | "down" | "stable";
  forecast: ItemForecast;
}

const ALL_MONTHS = [
  "2025-03","2025-04","2025-05","2025-06",
  "2025-07","2025-08","2025-09","2025-10","2025-11","2025-12",
  "2026-01","2026-02","2026-03",
];

const MONTH_LABELS: Record<string, string> = {
  "2025-03": "Mar '25", "2025-04": "Apr '25", "2025-05": "May '25", "2025-06": "Jun '25",
  "2025-07": "Jul '25", "2025-08": "Aug '25", "2025-09": "Sep '25",
  "2025-10": "Oct '25", "2025-11": "Nov '25", "2025-12": "Dec '25",
  "2026-01": "Jan '26", "2026-02": "Feb '26", "2026-03": "Mar '26",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function fmt(n: number) { return n.toFixed(2); }

const ExplorerTableRow = ({ 
  item, 
  index, 
  onRemove, 
  onClick 
}: { 
  item: EnrichedDashboardItem; 
  index: number; 
  onRemove: (e: React.MouseEvent) => void; 
  onClick: () => void;
}) => {
  const up = item.changePct !== null && item.changePct > 0;
  const down = item.changePct !== null && item.changePct < 0;

  return (
    <div
      onClick={onClick}
      className="w-full px-4 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group flex flex-col sm:block border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer"
    >
      {/* Mobile */}
      <div className="flex sm:hidden items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xs text-gray-400 font-medium w-5 shrink-0 text-right">{index + 1}</span>
          <div className="h-8 w-8 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-black text-blue-600 dark:text-blue-400">
            {initials(item.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.name}</p>
            <p className="text-xs text-gray-400">{CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ?? item.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRemove}
            className="p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Remove from favourites"
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
          </button>
          <div className="text-right">
            <p className="text-sm font-bold font-mono text-gray-900 dark:text-white">{formatCurrency(item.price)}</p>
            {item.changePct !== null && (
              <p className={`text-xs font-bold ${up ? "text-red-500" : down ? "text-emerald-600" : "text-gray-400"}`}>
                {up ? "+" : ""}{formatPercent(item.changePct)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:grid grid-cols-[2.5rem_1fr_7rem_7rem_6rem_3rem_5rem] gap-x-4 items-center">
        <span className="text-sm text-gray-400 font-medium">{index + 1}</span>
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[11px] font-black text-blue-600 dark:text-blue-400">
            {initials(item.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase truncate">{item.unit}</p>
          </div>
        </div>
        <p className="text-sm font-bold font-mono text-gray-900 dark:text-white text-right">{formatCurrency(item.price)}</p>
        <div className="text-right">
          {item.changePct !== null ? (
            <span className={`inline-flex items-center justify-end gap-0.5 text-sm font-bold ${up ? "text-red-500" : down ? "text-emerald-600" : "text-gray-400"}`}>
              {up ? <ChevronUp className="h-3.5 w-3.5" /> : down ? <ChevronDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
              {formatPercent(item.changePct)}
            </span>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
        <p className="text-sm font-mono text-gray-500 dark:text-gray-400 text-right">
          {item.janPrice ? formatCurrency(item.janPrice) : "—"}
        </p>
        <div className="flex justify-center">
          <button
            onClick={onRemove}
            className="p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Remove from favourites"
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
          </button>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <span className="rounded-lg bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">View</span>
        </div>
      </div>
    </div>
  );
};

const ForecastTableRow = ({
  item, 
  index, 
  onRemove, 
  onClick 
}: { 
  item: EnrichedForecastItem; 
  index: number; 
  onRemove: (e: React.MouseEvent) => void; 
  onClick: () => void;
}) => {
  const growthUp = item.growthPct > 0;
  const changeUp = item.predictedChange > 0;
  const changeDown = item.predictedChange < 0;

  return (
    <button
      onClick={onClick}
      className="w-full px-4 sm:px-5 py-3 sm:py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
    >
      {/* Mobile */}
      <div className="flex sm:hidden items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xs text-gray-400 font-medium w-5 shrink-0 text-right">{index + 1}</span>
          <div className="h-8 w-8 shrink-0 rounded-xl bg-primary/8 flex items-center justify-center text-[10px] font-black text-primary">
            {initials(item.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">{item.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">RM {fmt(item.todayPrice)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRemove}
            className="p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Remove from favourites"
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
          </button>
          <div className="text-right">
            <p className="text-sm font-bold font-mono text-gray-900 dark:text-white">RM {fmt(item.predictedPrice)}</p>
            <p className={`text-xs font-bold ${changeDown ? "text-emerald-600 dark:text-green-400" : changeUp ? "text-red-500 dark:text-red-400" : "text-gray-400"}`}>
              {changeUp ? "+" : ""}{fmt(item.predictedChange)}%
            </p>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:grid grid-cols-[2.5rem_1fr_7rem_7rem_7rem_3rem_5rem] gap-x-4 items-center">
        <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">{index + 1}</span>
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/8 flex items-center justify-center text-[11px] font-black text-primary">
            {initials(item.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary transition-colors">{item.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase">{item.unit}</p>
          </div>
        </div>
        <p className="text-sm font-bold font-mono text-gray-900 dark:text-gray-100 text-right">RM {fmt(item.todayPrice)}</p>
        <p className={`text-sm font-bold font-mono text-right ${growthUp ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-green-400"}`}>
          {growthUp ? "+" : ""}{fmt(item.growthPct)}%
        </p>
        <p className="text-sm font-bold font-mono text-gray-900 dark:text-gray-100 text-right">RM {fmt(item.predictedPrice)}</p>
        <div className="flex justify-center">
          <button
            onClick={onRemove}
            className="p-2 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Remove from favourites"
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
          </button>
        </div>
        <span className="rounded-lg bg-primary/10 dark:bg-blue-900/30 px-3 py-1.5 text-xs font-bold text-primary dark:text-blue-400 hover:bg-primary/20 dark:hover:bg-blue-900/50 transition-colors">
          View
        </span>
      </div>
    </button>
  );
};

const ForecastDetailModal = ({ 
  item, 
  onClose 
}: { 
  item: EnrichedForecastItem;
  onClose: () => void;
}) => {
  const fc = item.forecast;
  const tomorrowPrice = fc.forecast[0]?.price ?? fc.last_price;
  const day14Price = fc.forecast[fc.forecast.length - 1]?.price ?? fc.last_price;

  // Build chart data: history + forecast line (combined)
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

  // Historical monthly averages
  const { data: history } = usePriceHistory();
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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full my-8">
        <div className="p-8 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <button onClick={onClose} className="hover:text-primary transition-colors">Home</button>
            <span>›</span>
            <button onClick={onClose} className="hover:text-primary transition-colors">Profile</button>
            <span>›</span>
            <span className="text-gray-700 dark:text-gray-300 font-semibold truncate">{item.name}</span>
            <span>›</span>
            <span className="text-gray-500">Forecast</span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white md:text-3xl">
              {item.name} price prediction
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-lg">
              What will <strong>{item.name}</strong> cost in the next 14 days?
              Our ML model forecasts the price using 1 year of KPDN PriceCatcher data.
            </p>
          </div>

          {/* Prediction summary card with combined chart */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm space-y-4">
            <p className="text-sm text-gray-400">
              Price in 14 days with ML-predicted growth
            </p>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-black text-primary">
                {initials(item.name)}
              </div>
              <span className={`text-lg font-bold ${predChangeFromToday < 0 ? "text-emerald-600 dark:text-green-400" : predChangeFromToday > 0 ? "text-red-500 dark:text-red-400" : "text-gray-500"}`}>
                {predChangeFromToday > 0 ? "+" : ""}{fmt(predChangeFromToday)}% predicted change
              </span>
            </div>

            {/* Combined Chart */}
            <div className="h-[280px] md:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `RM${v.toFixed(0)}`} domain={["auto", "auto"]} width={65} />
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

          {/* Price Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <PriceStat label="Past 6mo avg" value={past6moAvg ? `RM ${fmt(past6moAvg)}` : "—"} />
            <PriceStat label="Past 3mo avg" value={past3moAvg ? `RM ${fmt(past3moAvg)}` : "—"} />
            <PriceStat label="Today's price" value={`RM ${fmt(item.todayPrice)}`} highlight />
            <PriceStat label="Tomorrow*" value={`RM ${fmt(tomorrowPrice)}`} />
            <PriceStat label="14 days later*" value={`RM ${fmt(day14Price)}`} accent />
          </div>

          {/* Best time to buy */}
          <BestTimeToBuy forecast={fc} itemName={item.name} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 shadow-sm transition-all"
          >
            <ChevronLeft className="h-4 w-4" /> Back to profiles
          </button>
        </div>
      </div>
    </div>
  );
};

function PriceStat({ label, value, highlight, accent }: { label: string; value: string; highlight?: boolean; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 text-center ${highlight ? "bg-primary/5 dark:bg-primary/20 border border-primary/20 dark:border-primary/30" : accent ? "bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-700" : "bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"}`}>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-lg font-black font-mono ${highlight ? "text-primary dark:text-blue-400" : accent ? "text-violet-600 dark:text-violet-400" : "text-gray-900 dark:text-gray-100"}`}>{value}</p>
    </div>
  );
}

export const ProfilePage = () => {
  const { user } = useAuthContext();
  const { explorer, forecast, getFavouriteItemsBySource } = useFavouritesAll();
  const { data: items } = useItemLookup();
  const { data: forecastData } = usePriceForecast();
  const { data: pricesAgg } = usePricesAgg();
  const { data: pricesJan } = usePricesAggJan();

const [explorerItems, setExplorerItems] = useState<FavouriteItem[]>([]);
  const [forecastItems, setForecastItems] = useState<FavouriteItem[]>([]);
  const [isLoadingExplorer, setIsLoadingExplorer] = useState(true);
  const [isLoadingForecast, setIsLoadingForecast] = useState(true);
  const [errorExplorer, setErrorExplorer] = useState<string | null>(null);
  const [errorForecast, setErrorForecast] = useState<string | null>(null);
  const [selectedExplorerItem, setSelectedExplorerItem] = useState<FavouriteItem | null>(null);
  const [selectedForecastItem, setSelectedForecastItem] = useState<EnrichedForecastItem | null>(null);

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'No email';
  const totalFavourites = explorerItems.length + forecastItems.length;

  // Load explorer favorites
  useEffect(() => {
    const loadExplorerFavourites = async () => {
      try {
        setIsLoadingExplorer(true);
        setErrorExplorer(null);
        const favs = await getFavouriteItemsBySource('explorer');
        setExplorerItems(favs);
      } catch (error) {
        console.error('Failed to load explorer favourite items:', error);
        setErrorExplorer('Failed to load explorer favorites. Using empty list.');
        setExplorerItems([]);
      } finally {
        setIsLoadingExplorer(false);
      }
    };
    loadExplorerFavourites();
  }, [getFavouriteItemsBySource]);

  // Load forecast favorites
  useEffect(() => {
    const loadForecastFavourites = async () => {
      try {
        setIsLoadingForecast(true);
        setErrorForecast(null);
        const favs = await getFavouriteItemsBySource('forecast');
        setForecastItems(favs);
      } catch (error) {
        console.error('Failed to load forecast favourite items:', error);
        setErrorForecast('Failed to load forecast favorites. Using empty list.');
        setForecastItems([]);
      } finally {
        setIsLoadingForecast(false);
      }
    };
    loadForecastFavourites();
  }, [getFavouriteItemsBySource]);

  const handleRemoveExplorerFavourite = async (itemId: number) => {
    await explorer.removeFavourite(itemId);
    setExplorerItems((prev) => prev.filter((item) => item.item_id !== itemId));
  };

  const handleRemoveForecastFavourite = async (itemId: number) => {
    await forecast.removeFavourite(itemId);
    setForecastItems((prev) => prev.filter((item) => item.item_id !== itemId));
  };

  const priceMap = useMemo(() => {
    const m = new Map<number, { c: number; avg: number; min: number; max: number; n: number }>();
    pricesAgg?.forEach((p) => m.set(p.c, p));
    return m;
  }, [pricesAgg]);

  const janMap = useMemo(() => {
    const m = new Map<number, number>();
    pricesJan?.forEach((p) => m.set(p.c, p.avg));
    return m;
  }, [pricesJan]);

  const enrichedExplorerItems = useMemo(() => {
    if (!explorerItems || !items || !pricesAgg || !pricesJan) return [];

    return explorerItems
      .map((favItem) => {
        const itemInfo = items.find((i) => i.c === favItem.item_id);
        const priceInfo = priceMap.get(favItem.item_id);
        const janPrice = janMap.get(favItem.item_id) ?? null;
        if (!itemInfo || !priceInfo) return null;

        const currentPrice = priceInfo.avg;

        let changePct: number | null = null;
        if (janPrice && currentPrice) {
          changePct = ((currentPrice - janPrice) / janPrice) * 100;
        }

        const result: EnrichedDashboardItem = {
          code: favItem.item_id,
          name: favItem.item_name,
          unit: favItem.unit,
          category: favItem.category,
          price: currentPrice,
          min: priceInfo.min,
          max: priceInfo.max,
          janPrice,
          changePct,
        };
        return result;
      })
      .filter((item): item is EnrichedDashboardItem => item !== null);
  }, [explorerItems, items, priceMap, janMap]);

  const enrichedForecastItems = useMemo(() => {
    if (!forecastItems || !items || !forecastData || !pricesAgg || !pricesJan) return [];
    
    return forecastItems
      .map((favItem) => {
        const itemInfo = items.find((i) => i.c === favItem.item_id);
        const forecast = forecastData[String(favItem.item_id)];
        const priceInfo = priceMap.get(favItem.item_id);
        const janPrice = janMap.get(favItem.item_id) ?? null;
        
        if (!itemInfo || !forecast || !priceInfo) return null;

        const todayPrice = priceInfo.avg;
        const growthPct = janPrice && janPrice > 0 ? ((todayPrice - janPrice) / janPrice) * 100 : 0;
        
        const predictedPrice = forecast.forecast[forecast.forecast.length - 1]?.price ?? forecast.last_price;
        const predictedChange = ((predictedPrice - todayPrice) / todayPrice) * 100;

        return {
          code: favItem.item_id,
          name: favItem.item_name,
          unit: favItem.unit,
          group: itemInfo.g || 'N/A',
          category: favItem.category,
          todayPrice,
          growthPct,
          predictedPrice,
          predictedChange,
          trend: predictedPrice > todayPrice ? 'up' : predictedPrice < todayPrice ? 'down' : 'stable',
          forecast,
        } as EnrichedForecastItem;
      })
      .filter((item): item is EnrichedForecastItem => item !== null);
  }, [forecastItems, items, forecastData, priceMap, janMap]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-700 text-white sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Profile</h1>
              <p className="text-blue-100 dark:text-gray-300">
                Welcome back, {username}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Profile Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">USERNAME</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white break-words">{username}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">EMAIL</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">{email}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">TOTAL FAVOURITES</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalFavourites}</p>
          </div>
        </div>

        {/* Explorer Favourites */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Price Explorer</h2>
            <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
              {enrichedExplorerItems.length}
            </span>
          </div>

{isLoadingExplorer ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading explorer favourites...</p>
            </div>
          ) : errorExplorer ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-8 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">{errorExplorer}</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">Add items from Explorer to track them.</p>
            </div>
          ) : enrichedExplorerItems.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No items tracked yet</p>
              <p className="text-gray-400 dark:text-gray-500 max-w-md mx-auto">Explore items in the main dashboard and click the star icon to track them here.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
              <div className="hidden sm:grid grid-cols-[2.5rem_1fr_7rem_7rem_6rem_3rem_5rem] gap-x-4 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <span>#</span>
                <span>Item</span>
                <span className="text-right">Price</span>
                <span className="text-right">1Mo Growth</span>
                <span className="text-right">Jan'25</span>
                <span className="text-center">Track</span>
                <span className="text-right">Action</span>
              </div>
              {enrichedExplorerItems.map((item, idx) => (
                <ExplorerTableRow
                  key={item.code}
                  item={item}
                  index={idx}
                  onRemove={(e) => {
                    e.stopPropagation();
                    handleRemoveExplorerFavourite(item.code);
                  }}
                  onClick={() => {
                    const originalFav = explorerItems.find((f) => f.item_id === item.code);
                    if (originalFav) setSelectedExplorerItem(originalFav);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Forecast Favourites */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <TrendingDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Price Forecast</h2>
            <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
              {enrichedForecastItems.length}
            </span>
          </div>

{isLoadingForecast ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading forecast favourites...</p>
            </div>
          ) : errorForecast ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-8 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">{errorForecast}</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">Add items from Forecast to track them.</p>
            </div>
          ) : enrichedForecastItems.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <TrendingDown className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No forecasts tracked</p>
              <p className="text-gray-400 dark:text-gray-500 max-w-md mx-auto">Visit the Best Time to Buy section and track items to monitor their future price movements.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-50 dark:divide-gray-700">
              <div className="hidden sm:grid grid-cols-[2.5rem_1fr_7rem_7rem_7rem_3rem_5rem] gap-x-4 px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <span>#</span>
                <span>Asset</span>
                <span className="text-right">Today's price</span>
                <span className="text-right">Past 1mo growth</span>
                <span className="text-right">Predicted</span>
                {user && <span className="text-center">Favourite</span>}
                <span></span>
              </div>
              {enrichedForecastItems.map((item, idx) => (
                <ForecastTableRow
                  key={item.code}
                  item={item}
                  index={idx}
                  onRemove={(e) => {
                    e.stopPropagation();
                    handleRemoveForecastFavourite(item.code);
                  }}
                  onClick={() => setSelectedForecastItem(item)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Explorer Item Modal */}
      {selectedExplorerItem && (
        <ItemPriceModal
          item={{
            code: selectedExplorerItem.item_id,
            name: selectedExplorerItem.item_name,
            unit: selectedExplorerItem.unit,
            category: selectedExplorerItem.category,
            price: selectedExplorerItem.avg_price,
            min: selectedExplorerItem.avg_price * 0.95,
            max: selectedExplorerItem.avg_price * 1.05,
            changePct: null,
          }}
          onClose={() => setSelectedExplorerItem(null)}
        />
      )}

      {/* Forecast Item Modal */}
      {selectedForecastItem && (
        <ForecastDetailModal
          item={selectedForecastItem}
          onClose={() => setSelectedForecastItem(null)}
        />
      )}
    </div>
  );
};
