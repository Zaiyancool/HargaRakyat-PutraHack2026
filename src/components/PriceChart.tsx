import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useItemLookup, usePricesAgg, usePricesAggJan } from "@/hooks/usePriceCatcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { ITEM_GROUPS } from "@/lib/pricecatcher";

export function PriceChart() {
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showCount, setShowCount] = useState(20);

  const { data: items, isLoading: loadingItems } = useItemLookup();
  const { data: pricesFeb, isLoading: loadingFeb } = usePricesAgg();
  const { data: pricesJan, isLoading: loadingJan } = usePricesAggJan();

  const isLoading = loadingItems || loadingFeb || loadingJan;

  const chartData = useMemo(() => {
    if (!items || !pricesFeb || !pricesJan) return [];

    const itemMap = new Map<number, (typeof items)[0]>();
    items.forEach((i) => itemMap.set(i.c, i));

    const janMap = new Map<number, number>();
    pricesJan.forEach((p) => janMap.set(p.c, p.avg));

    return pricesFeb
      .map((p) => {
        const item = itemMap.get(p.c);
        if (!item) return null;
        if (selectedGroup !== "all" && item.g !== selectedGroup) return null;

        const janAvg = janMap.get(p.c);
        if (janAvg === undefined) return null;

        const change = ((p.avg - janAvg) / janAvg) * 100;

        return {
          name: item.n,
          category: item.k,
          unit: item.u,
          jan: janAvg,
          feb: p.avg,
          change: Math.round(change * 100) / 100,
        };
      })
      .filter((r): r is NonNullable<typeof r> => {
        if (!r) return false;
        if (!search) return true;
        return r.name.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [items, pricesFeb, pricesJan, selectedGroup, search]);

  const topItems = chartData.slice(0, showCount);

  const summaryStats = useMemo(() => {
    if (!chartData.length) return { up: 0, down: 0, stable: 0, avgChange: 0 };
    const up = chartData.filter((d) => d.change > 1).length;
    const down = chartData.filter((d) => d.change < -1).length;
    const stable = chartData.length - up - down;
    const avgChange = chartData.reduce((s, d) => s + d.change, 0) / chartData.length;
    return { up, down, stable, avgChange: Math.round(avgChange * 100) / 100 };
  }, [chartData]);

  return (
    <section className="container py-12">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Price Trends: Jan vs Feb 2026
          </h2>
          <p className="text-muted-foreground mt-1">
            Month-over-month average price comparison
          </p>
        </div>

        {/* Summary Cards */}
        {!isLoading && chartData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-chart-down" />
                Price Increased
              </div>
              <p className="text-2xl font-bold mt-1">{summaryStats.up}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingDown className="w-4 h-4 text-chart-up" />
                Price Decreased
              </div>
              <p className="text-2xl font-bold mt-1">{summaryStats.down}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Minus className="w-4 h-4 text-muted-foreground" />
                Stable (±1%)
              </div>
              <p className="text-2xl font-bold mt-1">{summaryStats.stable}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Avg Change
              </div>
              <p className={`text-2xl font-bold mt-1 ${summaryStats.avgChange > 0 ? "text-chart-down" : "text-chart-up"}`}>
                {summaryStats.avgChange > 0 ? "+" : ""}{summaryStats.avgChange}%
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[220px] bg-secondary border-border">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {ITEM_GROUPS.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Loading price data...</p>
          </div>
        ) : (
          <>
            {/* Line Chart */}
            <div className="glass-card rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Top {topItems.length} items by largest price change (showing avg price in RM)
              </p>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={topItems}
                    margin={{ top: 5, right: 30, left: 20, bottom: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => `RM${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      formatter={(value: number, name: string) => [
                        `RM ${value.toFixed(2)}`,
                        name === "jan" ? "January" : "February",
                      ]}
                      labelFormatter={(label) => label}
                    />
                    <Legend
                      verticalAlign="top"
                      formatter={(value) => (value === "jan" ? "January 2026" : "February 2026")}
                    />
                    <Line
                      type="monotone"
                      dataKey="jan"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "hsl(var(--muted-foreground))" }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="feb"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "hsl(var(--primary))" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Change Table */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jan Avg</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feb Avg</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topItems.map((row) => (
                      <tr key={row.name} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-sm">{row.name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{row.unit}</td>
                        <td className="py-3 px-4 text-sm text-right font-mono text-muted-foreground">
                          RM {row.jan.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-primary">
                          RM {row.feb.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-sm text-right font-mono font-semibold ${
                          row.change > 0 ? "text-chart-down" : row.change < 0 ? "text-chart-up" : "text-muted-foreground"
                        }`}>
                          {row.change > 0 ? "+" : ""}{row.change}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {chartData.length > showCount && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowCount((c) => c + 20)}
                  className="text-sm text-primary hover:underline"
                >
                  Show more ({chartData.length - showCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
