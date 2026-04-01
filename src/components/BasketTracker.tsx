import { useState, useMemo, useEffect } from "react";
import { ShoppingBasket, Plus, Trash2, TrendingUp, TrendingDown, Minus, Search, ShoppingCart } from "lucide-react";
import { useItemLookup, usePricesAgg, usePricesAggJan, usePriceForecast } from "@/hooks/usePriceCatcher";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getProductImage } from "@/lib/image-mapper";

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
    if (!items) return new Map<number, { n: string, g: string }>();
    return new Map(items.map((i) => [i.c, { n: i.n, g: i.g }]));
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
    <div className="bg-white border border-border shadow-sm rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <ShoppingBasket className="w-5 h-5 text-primary" /> My Grocery Cart
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
        <div className="text-center text-muted-foreground py-10 flex flex-col items-center bg-secondary/30 rounded-xl border border-dashed border-border/50">
          <ShoppingCart className="w-10 h-10 mb-3 text-border stroke-[1.5]" />
          <p className="text-sm font-medium text-foreground">Your cart is empty</p>
          <p className="text-xs mt-1">Search above to add items</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {basket.map((b) => {
              const itemInfo = itemMap.get(b.code) || { n: String(b.code), g: "" };
              return (
                <div key={b.code} className="flex gap-3 py-3 border-b border-border/40 last:border-0 group">
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <span className="text-sm font-semibold truncate leading-tight group-hover:text-primary transition-colors">{itemInfo.n}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      RM {priceMap.has(b.code) ? (priceMap.get(b.code)!).toFixed(2) : "0.00"} / unit
                    </span>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <span className="text-sm font-bold text-primary">
                      RM {((priceMap.get(b.code) || 0) * b.qty).toFixed(2)}
                    </span>
                    
                    <div className="flex items-center gap-2 mt-auto">
                      <div className="flex items-center bg-secondary rounded-md border border-border/50 h-7 overflow-hidden">
                        <button
                          onClick={() => updateQty(b.code, b.qty - 1)}
                          className="w-7 h-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{b.qty}</span>
                        <button
                          onClick={() => updateQty(b.code, b.qty + 1)}
                          className="w-7 h-full flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(b.code)} 
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {costs && (
            <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
              <div className="bg-white rounded-lg p-3 text-center border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold pb-1">Previous Month</p>
                <p className="text-lg font-bold">RM {costs.jan.toFixed(2)}</p>
              </div>
              <div className="bg-primary/5 rounded-lg p-3 text-center border border-primary/20 relative shadow-sm">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  CURRENT Cart
                </span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold pb-1 invisible">Today</p>
                <p className="text-xl font-black text-primary">RM {costs.current.toFixed(2)}</p>
                <p className={`text-[11px] font-bold mt-1 flex items-center justify-center gap-1 ${momChange > 0 ? "text-red-500" : "text-emerald-500"}`}>
                  {momChange > 0 ? <TrendingUp className="w-3 h-3" /> : momChange < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                  {momChange > 0 ? "+" : ""}{momChange.toFixed(1)}% vs Last Month
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-border shadow-sm">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold pb-1 text-emerald-600">14-Day AI Forecast</p>
                <p className="text-lg font-bold">RM {costs.fc.toFixed(2)}</p>
                <p className={`text-[11px] font-bold mt-1 flex items-center justify-center gap-1 ${fcChange > 0 ? "text-red-500" : "text-emerald-500"}`}>
                  {fcChange > 0 ? <TrendingUp className="w-3 h-3" /> : fcChange < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                  {fcChange > 0 ? "+" : ""}{fcChange.toFixed(1)}% Est.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
