import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useItemLookup, usePricesAgg, usePricesAggJan } from "@/hooks/usePriceCatcher";

export function PriceTicker() {
  const { data: items } = useItemLookup();
  const { data: pricesAgg } = usePricesAgg();
  const { data: pricesAggJan } = usePricesAggJan();

  const tickerItems = useMemo(() => {
    if (!items || !pricesAgg || !pricesAggJan) return [];
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
      .slice(0, 15);
  }, [items, pricesAgg, pricesAggJan]);

  if (tickerItems.length === 0) return null;

  const tickerContent = tickerItems.map((item, i) => (
    <span key={i} className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="text-muted-foreground">{item.name}</span>
      <span className="font-mono font-semibold text-foreground">RM{item.price.toFixed(2)}</span>
      <span className={`inline-flex items-center gap-0.5 font-mono font-semibold ${item.change > 0 ? "text-chart-down" : "text-chart-up"}`}>
        {item.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {item.change > 0 ? "+" : ""}{item.change}%
      </span>
      <span className="text-border mx-3">▸</span>
    </span>
  ));

  return (
    <div className="w-full bg-[hsl(222_60%_7%)] border-b border-border/30 h-9 flex items-center overflow-hidden relative z-50">
      <div className="flex items-center gap-3 px-4 shrink-0">
        <span className="pulse-dot" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-destructive">Live</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="ticker-scroll text-xs">
          {tickerContent}
          {tickerContent}
        </div>
      </div>
    </div>
  );
}
