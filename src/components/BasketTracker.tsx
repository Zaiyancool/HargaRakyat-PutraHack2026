import { useState, useMemo, useEffect } from "react";
import { ShoppingBasket, Plus, Trash2, TrendingUp, TrendingDown, Minus, Search } from "lucide-react";
import { useItemLookup, usePricesAgg, usePricesAggJan, usePriceForecast } from "@/hooks/usePriceCatcher";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BasketItem {
  code: number;
  qty: number;
}

const STORAGE_KEY = "hargarakyat-basket";

function loadBasket(): BasketItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function BasketTracker() {
  const [basket, setBasket] = useState<BasketItem[]>(loadBasket);
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const { data: items } = useItemLookup();
  const { data: pricesAgg } = usePricesAgg();
  const { data: pricesAggJan } = usePricesAggJan();
  const { data: forecast } = usePriceForecast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
  }, [basket]);

  const priceMap = useMemo(() => {
    if (!pricesAgg) return new Map<number, number>();
    return new Map(pricesAgg.map((p) => [p.c, p.avg]));
  }, [pricesAgg]);

  const janMap = useMemo(() => {
    if (!pricesAggJan) return new Map<number, number>();
    return new Map(pricesAggJan.map((p) => [p.c, p.avg]));
  }, [pricesAggJan]);

  const itemMap = useMemo(() => {
    if (!items) return new Map<number, string>();
    return new Map(items.map((i) => [i.c, i.n]));
  }, [items]);

  const searchResults = useMemo(() => {
    if (!items || !search.trim()) return [];
    const q = search.toLowerCase();
    const basketCodes = new Set(basket.map((b) => b.code));
    return items
      .filter((i) => !basketCodes.has(i.c) && i.n.toLowerCase().includes(q) && priceMap.has(i.c))
      .slice(0, 6);
  }, [items, search, basket, priceMap]);

  const addItem = (code: number) => {
    setBasket((prev) => [...prev, { code, qty: 1 }]);
    setSearch("");
  };

  const removeItem = (code: number) => {
    setBasket((prev) => prev.filter((b) => b.code !== code));
  };

  const updateQty = (code: number, qty: number) => {
    if (qty < 1) return;
    setBasket((prev) => prev.map((b) => (b.code === code ? { ...b, qty } : b)));
  };

  const costs = useMemo(() => {
    if (!pricesAgg || !pricesAggJan || !forecast) return null;
    let current = 0, jan = 0, fc = 0;
    for (const b of basket) {
      const curPrice = priceMap.get(b.code) || 0;
      const janPrice = janMap.get(b.code) || curPrice;
      const fcData = forecast[String(b.code)];
      const fcPrice = fcData?.forecast?.[fcData.forecast.length - 1]?.price || curPrice;
      current += curPrice * b.qty;
      jan += janPrice * b.qty;
      fc += fcPrice * b.qty;
    }
    return { current, jan, fc };
  }, [basket, priceMap, janMap, forecast]);

  const momChange = costs && costs.jan > 0 ? ((costs.current - costs.jan) / costs.jan) * 100 : 0;
  const fcChange = costs && costs.current > 0 ? ((costs.fc - costs.current) / costs.current) * 100 : 0;

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <ShoppingBasket className="w-4 h-4 text-primary" /> My Grocery Basket
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-border"
          onClick={() => setShowPicker(!showPicker)}
        >
          <Plus className="w-3 h-3 mr-1" /> Add Item
        </Button>
      </div>

      {showPicker && (
        <div className="mb-4 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-secondary border-border text-sm"
              autoFocus
            />
          </div>
          {searchResults.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              {searchResults.map((item) => (
                <button
                  key={item.c}
                  onClick={() => addItem(item.c)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 border-b border-border/20 last:border-0 transition-colors flex justify-between items-center"
                >
                  <span className="truncate">{item.n}</span>
                  <span className="text-xs text-muted-foreground font-mono ml-2">
                    RM {priceMap.get(item.c)?.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {basket.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Add essential items to track your weekly grocery cost
        </p>
      ) : (
        <>
          <div className="space-y-1.5 mb-4 max-h-[200px] overflow-y-auto">
            {basket.map((b) => (
              <div key={b.code} className="flex items-center gap-2 py-1.5 border-b border-border/20 last:border-0">
                <span className="text-sm truncate flex-1">{itemMap.get(b.code) || b.code}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateQty(b.code, b.qty - 1)}
                    className="w-6 h-6 rounded bg-secondary text-xs font-bold hover:bg-primary/20 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-mono">{b.qty}</span>
                  <button
                    onClick={() => updateQty(b.code, b.qty + 1)}
                    className="w-6 h-6 rounded bg-secondary text-xs font-bold hover:bg-primary/20 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm font-mono font-semibold w-16 text-right">
                  RM {((priceMap.get(b.code) || 0) * b.qty).toFixed(2)}
                </span>
                <button onClick={() => removeItem(b.code)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {costs && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Month</p>
                <p className="text-lg font-bold font-mono mt-1">RM {costs.jan.toFixed(2)}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Today</p>
                <p className="text-lg font-bold font-mono mt-1">RM {costs.current.toFixed(2)}</p>
                <p className={`text-[10px] font-mono font-bold mt-0.5 flex items-center justify-center gap-0.5 ${momChange > 0 ? "text-chart-down" : "text-chart-up"}`}>
                  {momChange > 0 ? <TrendingUp className="w-3 h-3" /> : momChange < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {momChange > 0 ? "+" : ""}{momChange.toFixed(1)}%
                </p>
              </div>
              <div className="bg-accent/10 rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">14-Day FC</p>
                <p className="text-lg font-bold font-mono mt-1">RM {costs.fc.toFixed(2)}</p>
                <p className={`text-[10px] font-mono font-bold mt-0.5 flex items-center justify-center gap-0.5 ${fcChange > 0 ? "text-chart-down" : "text-chart-up"}`}>
                  {fcChange > 0 ? <TrendingUp className="w-3 h-3" /> : fcChange < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {fcChange > 0 ? "+" : ""}{fcChange.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
