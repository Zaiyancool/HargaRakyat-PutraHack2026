import { useMemo, useState } from "react";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useItemLookup, usePricesAgg, usePricesAggJan } from "@/hooks/usePriceCatcher";

const categories = [
  { label: "Popular", filter: null },
  { label: "Food", filter: "Barangan Makanan" },
  { label: "Vegetables", filter: "Sayur-sayuran" },
  { label: "Fruits", filter: "Buah-buahan" },
  { label: "Seafood", filter: "Barangan Ikan / Seafood" },
];

const TOP_N = 100;
const VISIBLE_ROWS = 3;
const COLS = 7;

export function ItemGrid() {
  const { data: items } = useItemLookup();
  const { data: pricesAgg } = usePricesAgg();
  const { data: pricesJan } = usePricesAggJan();
  const [activeCat, setActiveCat] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const priceMap = useMemo(() => {
    const m = new Map<number, { avg: number; n: number }>();
    pricesAgg?.forEach((p) => m.set(p.c, { avg: p.avg, n: p.n }));
    return m;
  }, [pricesAgg]);

  const janMap = useMemo(() => {
    const m = new Map<number, number>();
    pricesJan?.forEach((p) => m.set(p.c, p.avg));
    return m;
  }, [pricesJan]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const cat = categories[activeCat];
    let list = cat.filter ? items.filter((i) => i.k === cat.filter) : items;

    // Sort by record count desc → top 100
    list = [...list].sort((a, b) => {
      const na = priceMap.get(a.c)?.n ?? 0;
      const nb = priceMap.get(b.c)?.n ?? 0;
      return nb - na;
    });

    return list.slice(0, TOP_N);
  }, [items, activeCat, priceMap]);

  const visibleCount = showAll ? filtered.length : VISIBLE_ROWS * COLS;
  const visible = filtered.slice(0, visibleCount);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="text-center text-3xl font-black tracking-tight text-foreground md:text-4xl">
          Which item do you want to purchase today?
        </h2>

        {/* Category tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => { setActiveCat(i); setShowAll(false); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                i === activeCat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {visible.map((item) => {
            const price = priceMap.get(item.c);
            const jan = janMap.get(item.c);
            const pct =
              price && jan && jan > 0
                ? ((price.avg - jan) / jan) * 100
                : null;

            return (
              <div
                key={item.c}
                className="group flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-primary/30 hover:shadow-md"
              >
                {/* Icon placeholder */}
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-muted-foreground">
                  {item.u || "kg"}
                </div>
                <p className="line-clamp-2 text-xs font-semibold leading-tight text-foreground">
                  {item.n}
                </p>
                {price && (
                  <p className="mt-1 font-mono text-sm font-bold text-foreground">
                    RM {price.avg.toFixed(2)}
                  </p>
                )}
                {pct !== null && (
                  <span
                    className={`mt-1 inline-flex items-center gap-0.5 text-[10px] font-bold ${
                      pct > 1 ? "text-chart-up" : pct < -1 ? "text-chart-down" : "text-chart-neutral"
                    }`}
                  >
                    {pct > 1 ? <TrendingUp className="h-3 w-3" /> : pct < -1 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    {pct > 0 ? "+" : ""}
                    {pct.toFixed(1)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Show more */}
        {!showAll && filtered.length > visibleCount && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
              className="rounded-xl"
            >
              Show all {filtered.length} items <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
