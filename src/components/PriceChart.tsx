import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area, AreaChart,
} from "recharts";
import { useItemLookup, usePriceHistory } from "@/hooks/usePriceCatcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { SkeletonChart } from "@/components/SkeletonCard";
import { ITEM_GROUPS } from "@/lib/pricecatcher";

const MONTHS = [
  "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
  "2026-01", "2026-02",
];

const MONTH_LABELS: Record<string, string> = {
  "2025-07": "Jul '25", "2025-08": "Aug '25", "2025-09": "Sep '25",
  "2025-10": "Oct '25", "2025-11": "Nov '25", "2025-12": "Dec '25",
  "2026-01": "Jan '26", "2026-02": "Feb '26",
};

export function PriceChart() {
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const { data: items, isLoading: loadingItems } = useItemLookup();
  const { data: history, isLoading: loadingHistory } = usePriceHistory();

  const isLoading = loadingItems || loadingHistory;

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items
      .filter((i) => {
        if (selectedGroup !== "all" && i.g !== selectedGroup) return false;
        if (search && !i.n.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.n.localeCompare(b.n));
  }, [items, search, selectedGroup]);

  const selectedItemData = useMemo(() => {
    if (!items) return null;
    return items.find((i) => String(i.c) === selectedItem) || null;
  }, [items, selectedItem]);

  const chartData = useMemo(() => {
    if (!history || !selectedItem) return [];
    const itemHistory = history[selectedItem];
    if (!itemHistory) return [];
    return MONTHS
      .filter((m) => itemHistory[m])
      .map((m) => ({
        month: MONTH_LABELS[m], avg: itemHistory[m].avg,
        min: itemHistory[m].min, max: itemHistory[m].max, records: itemHistory[m].n,
      }));
  }, [history, selectedItem]);

  const priceChange = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].avg;
    const last = chartData[chartData.length - 1].avg;
    const change = ((last - first) / first) * 100;
    return { change: Math.round(change * 100) / 100, first, last };
  }, [chartData]);

  return (
    <section className="container py-12">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Price Timeline</h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Track price trends for individual items over the past 8 months
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search items to filter list..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary border-border" />
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
          <SelectTrigger className="w-full bg-secondary border-border"><SelectValue placeholder="Select an item to view price history..." /></SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {filteredItems.map((i) => (<SelectItem key={i.c} value={String(i.c)}>{i.n} ({i.u})</SelectItem>))}
          </SelectContent>
        </Select>

        {isLoading ? (
          <SkeletonChart />
        ) : !selectedItem ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-muted-foreground">Select an item above to view its price history</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No historical data available for this item</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-stagger">
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Current Avg</p>
                <p className="text-2xl font-bold font-mono mt-1">RM {chartData[chartData.length - 1].avg.toFixed(2)}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">All-Time Min</p>
                <p className="text-2xl font-bold font-mono mt-1 text-chart-up">
                  RM {Math.min(...chartData.map((d) => d.min)).toFixed(2)}
                </p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">All-Time Max</p>
                <p className="text-2xl font-bold font-mono mt-1 text-chart-down">
                  RM {Math.max(...chartData.map((d) => d.max)).toFixed(2)}
                </p>
              </div>
              {priceChange && (
                <div className="glass-card rounded-xl p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    8-Month Change
                    {priceChange.change > 1 ? <TrendingUp className="w-3 h-3 text-chart-down" /> :
                     priceChange.change < -1 ? <TrendingDown className="w-3 h-3 text-chart-up" /> :
                     <Minus className="w-3 h-3" />}
                  </p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${
                    priceChange.change > 0 ? "text-chart-down" : "text-chart-up"
                  }`}>
                    {priceChange.change > 0 ? "+" : ""}{priceChange.change}%
                  </p>
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-1">{selectedItemData?.n}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {selectedItemData?.k} · {selectedItemData?.u} · Jul 2025 – Feb 2026
              </p>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `RM${v}`} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "13px" }}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = { avg: "Average", min: "Minimum", max: "Maximum" };
                        return [`RM ${value.toFixed(2)}`, labels[name] || name];
                      }}
                    />
                    <Legend formatter={(value) => {
                      const labels: Record<string, string> = { avg: "Average", min: "Minimum", max: "Maximum" };
                      return labels[value] || value;
                    }} />
                    <Area type="monotone" dataKey="avg" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#avgGradient)" dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="min" stroke="hsl(var(--chart-up))" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="max" stroke="hsl(var(--chart-down))" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Month</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Price</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Records</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">MoM Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row, idx) => {
                      const prev = idx > 0 ? chartData[idx - 1].avg : null;
                      const change = prev ? ((row.avg - prev) / prev) * 100 : null;
                      return (
                        <tr key={row.month} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-sm">{row.month}</td>
                          <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-primary">RM {row.avg.toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm text-right font-mono text-chart-up">RM {row.min.toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm text-right font-mono text-chart-down">RM {row.max.toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm text-right font-mono text-muted-foreground">{row.records.toLocaleString()}</td>
                          <td className={`py-3 px-4 text-sm text-right font-mono font-semibold ${
                            change === null ? "text-muted-foreground" :
                            change > 0 ? "text-chart-down" : change < 0 ? "text-chart-up" : "text-muted-foreground"
                          }`}>
                            {change === null ? "—" : `${change > 0 ? "+" : ""}${change.toFixed(2)}%`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
