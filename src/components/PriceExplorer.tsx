import { useState, useMemo } from "react";
import { Search, Filter, ArrowUpDown, ChevronDown, BarChart3 } from "lucide-react";
import { SkeletonTable } from "@/components/SkeletonCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useItemLookup, usePricesAgg, usePricesByState } from "@/hooks/usePriceCatcher";
import { STATES, ITEM_GROUPS, type ItemLookup } from "@/lib/pricecatcher";

export function PriceExplorer() {
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [showCount, setShowCount] = useState(100);

  const { data: items, isLoading: loadingItems } = useItemLookup();
  const { data: pricesAgg, isLoading: loadingPrices } = usePricesAgg();
  const { data: pricesByState, isLoading: loadingByState } = usePricesByState();

  const isLoading = loadingItems || loadingPrices || loadingByState;

  const itemMap = useMemo(() => {
    const map = new Map<number, ItemLookup>();
    items?.forEach((i) => map.set(i.c, i));
    return map;
  }, [items]);

  const aggregated = useMemo(() => {
    if (!pricesAgg || !items) return [];
    return pricesAgg
      .map((p) => {
        const item = itemMap.get(p.c);
        if (!item) return null;
        if (selectedGroup !== "all" && item.g !== selectedGroup) return null;
        let stats = { avg: p.avg, min: p.min, max: p.max, n: p.n };
        if (selectedState !== "all" && pricesByState) {
          const stateData = pricesByState[String(p.c)]?.[selectedState];
          if (!stateData) return null;
          stats = stateData;
        }
        return { item_code: p.c, item: item.n, unit: item.u, category: item.k, group: item.g, ...stats };
      })
      .filter((r): r is NonNullable<typeof r> => {
        if (!r) return false;
        if (!search) return true;
        return r.item.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => b.n - a.n);
  }, [pricesAgg, pricesByState, items, selectedState, selectedGroup, search, itemMap]);

  return (
    <div>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Price Explorer</h2>
          </div>
          <p className="text-muted-foreground mt-1">Browse and compare prices across all items</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 w-full">
            <label htmlFor="price-explorer-search" className="sr-only">Search items in price explorer</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="price-explorer-search"
              placeholder="Search items... e.g. ayam, beras, minyak"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={120}
              aria-label="Search items in price explorer"
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border" aria-label="Filter by state">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {STATES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-full sm:w-[200px] bg-secondary border-border" aria-label="Filter by category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {ITEM_GROUPS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Data period: <span className="text-foreground font-medium font-mono">Mar 2026</span>
          {!isLoading && <span className="ml-4 font-mono">{aggregated.length} items found</span>}
        </div>

        {isLoading ? (
          <SkeletonTable rows={8} />
        ) : (
          <>
            <div className="md:hidden space-y-2">
              {aggregated.slice(0, showCount).map((row) => (
                <div key={row.item_code} className="glass-card rounded-xl p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{row.item}</p>
                      <p className="text-xs text-muted-foreground truncate">{row.category} • {row.unit}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-mono font-semibold text-primary">RM {row.avg.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{row.n.toLocaleString()} records</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-mono">
                    <span className="text-chart-up">Min RM {row.min.toFixed(2)}</span>
                    <span className="text-chart-down">Max RM {row.max.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
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
                    {aggregated.slice(0, showCount).map((row) => (
                      <tr key={row.item_code} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-sm">{row.item}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{row.category}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{row.unit}</td>
                        <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-primary">RM {row.avg.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-right font-mono text-chart-up">RM {row.min.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-right font-mono text-chart-down">RM {row.max.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-right font-mono text-muted-foreground">{row.n.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {aggregated.length > showCount && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setShowCount((c) => c + 50)} className="gap-2 min-h-11">
                  <ChevronDown className="w-4 h-4" />
                  Show More ({aggregated.length - showCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
