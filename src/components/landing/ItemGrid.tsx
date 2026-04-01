import { useMemo, useState } from "react";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useItemLookup, usePricesAgg, usePricesAggJan } from "@/hooks/usePriceCatcher";
import { Marquee } from "@/components/ui/marquee";

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
  const thirdLength = Math.ceil(visible.length / 3);
  const firstRow = visible.slice(0, thirdLength);
  const secondRow = visible.slice(thirdLength, thirdLength * 2);
  const thirdRow = visible.slice(thirdLength * 2);

  return (
    <section className="overflow-hidden bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section label */}
        <div className="flex justify-center">
          <span className="rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary">
            Item Price Tracker
          </span>
        </div>
        <h2 className="mt-5 text-center text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
          Which item do you want to
          <br className="hidden sm:block" /> purchase today?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-lg text-gray-500">
          Pause on any card to explore. Data from KPDN PriceCatcher.
        </p>

        {/* Category tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => { setActiveCat(i); setShowAll(false); }}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all duration-150 ${
                i === activeCat
                  ? "bg-primary text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-500 hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Marquee Grids */}
        {visible.length > 0 && (
          <div className="relative mt-10 flex w-full flex-col items-center justify-center overflow-hidden">
            <Marquee pauseOnHover className="[--duration:40s]">
              {firstRow.map((item) => (
                <ItemCard key={item.c} item={item} price={priceMap.get(item.c)} jan={janMap.get(item.c)} />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:45s]">
              {secondRow.map((item) => (
                <ItemCard key={item.c} item={item} price={priceMap.get(item.c)} jan={janMap.get(item.c)} />
              ))}
            </Marquee>
            <Marquee pauseOnHover className="[--duration:35s]">
              {thirdRow.map((item) => (
                <ItemCard key={item.c} item={item} price={priceMap.get(item.c)} jan={janMap.get(item.c)} />
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-white"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/5 bg-gradient-to-l from-white"></div>
          </div>
        )}


        {/* CTA below marquee */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-base text-gray-500">Sign up to track price changes and get alerts.</p>
          <Button className="h-13 rounded-xl px-8 text-[16px] font-bold shadow-sm">
            Sign up — it's free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function ItemCard({ item, price, jan }: { item: any; price: any; jan: any }) {
  const pct = price && jan && jan > 0 ? ((price.avg - jan) / jan) * 100 : null;

  return (
    <div className="group flex w-48 shrink-0 flex-col items-center rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
      <p className="line-clamp-2 text-xs font-semibold leading-tight text-gray-900 mt-2">
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
}
