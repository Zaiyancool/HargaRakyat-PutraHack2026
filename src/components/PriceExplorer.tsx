import { useState, useMemo } from "react";
import { Search, Filter, Loader2, ArrowUpDown, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useItemLookup, usePremiseLookup, usePriceData } from "@/hooks/usePriceCatcher";
import { STATES, ITEM_GROUPS } from "@/lib/pricecatcher";

function getCurrentYearMonth() {
  const now = new Date();
  // Use previous month since current month might not be available yet
  now.setMonth(now.getMonth() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function PriceExplorer() {
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [yearMonth] = useState(getCurrentYearMonth);
  const [showCount, setShowCount] = useState(50);

  const { data: items, isLoading: loadingItems } = useItemLookup();
  const { data: premises, isLoading: loadingPremises } = usePremiseLookup();
  const { data: prices, isLoading: loadingPrices } = usePriceData(yearMonth);

  const isLoading = loadingItems || loadingPremises || loadingPrices;

  // Build lookup maps
  const itemMap = useMemo(() => {
    const map = new Map<number, (typeof items)[0]>();
    items?.forEach((i) => map.set(i.item_code, i));
    return map;
  }, [items]);

  const premiseMap = useMemo(() => {
    const map = new Map<number, (typeof premises)[0]>();
    premises?.forEach((p) => map.set(p.premise_code, p));
    return map;
  }, [premises]);

  // Aggregate: avg price per item, optionally filtered by state
  const aggregated = useMemo(() => {
    if (!prices || !items) return [];

    // Filter premises by state
    const validPremises = new Set<number>();
    if (selectedState !== "all" && premises) {
      premises.forEach((p) => {
        if (p.state === selectedState) validPremises.add(p.premise_code);
      });
    }

    const acc: Record<number, { sum: number; count: number; min: number; max: number }> = {};

    for (const p of prices) {
      if (selectedState !== "all" && !validPremises.has(p.premise_code)) continue;

      const item = itemMap.get(p.item_code);
      if (!item) continue;
      if (selectedGroup !== "all" && item.item_group !== selectedGroup) continue;

      if (!acc[p.item_code]) {
        acc[p.item_code] = { sum: 0, count: 0, min: Infinity, max: -Infinity };
      }
      acc[p.item_code].sum += p.price;
      acc[p.item_code].count++;
      acc[p.item_code].min = Math.min(acc[p.item_code].min, p.price);
      acc[p.item_code].max = Math.max(acc[p.item_code].max, p.price);
    }

    return Object.entries(acc)
      .map(([code, stats]) => {
        const item = itemMap.get(Number(code));
        return {
          item_code: Number(code),
          item: item?.item ?? "Unknown",
          unit: item?.unit ?? "",
          category: item?.item_category ?? "",
          group: item?.item_group ?? "",
          avg: stats.sum / stats.count,
          min: stats.min,
          max: stats.max,
          count: stats.count,
        };
      })
      .filter((r) => {
        if (!search) return true;
        return r.item.toLowerCase().includes(search.toLowerCase()) ||
          r.category.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => a.item.localeCompare(b.item));
  }, [prices, items, premises, selectedState, selectedGroup, search, itemMap]);

  return (
    <section className="container py-12">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items... e.g. ayam, beras, minyak"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-[180px] bg-secondary border-border">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-[200px] bg-secondary border-border">
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
        </div>

        <div className="text-sm text-muted-foreground">
          Data period: <span className="text-foreground font-medium">{yearMonth}</span>
          {!isLoading && (
            <span className="ml-4">{aggregated.length} items found</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Loading price data from data.gov.my...</p>
            <p className="text-muted-foreground text-xs">This may take a moment (large dataset)</p>
          </div>
        ) : (
          <>
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span className="inline-flex items-center gap-1">Avg Price <ArrowUpDown className="w-3 h-3" /></span>
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Records</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregated.slice(0, showCount).map((row) => {
                      const spread = row.max - row.min;
                      const spreadPct = row.avg > 0 ? (spread / row.avg) * 100 : 0;
                      return (
                        <tr key={row.item_code} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-sm">{row.item}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{row.category}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{row.unit}</td>
                          <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-primary">
                            RM {row.avg.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-mono text-chart-up">
                            RM {row.min.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-mono text-chart-down">
                            RM {row.max.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                            {row.count.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {aggregated.length > showCount && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowCount((c) => c + 50)}
                  className="gap-2"
                >
                  <ChevronDown className="w-4 h-4" />
                  Show More ({aggregated.length - showCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
