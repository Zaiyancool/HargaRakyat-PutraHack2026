import { useState, useMemo, useCallback } from "react";
import { ShoppingCart, Plus, X, MapPin, Navigation, Store, Sparkles, Check, Loader2 } from "lucide-react";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useItemLookup, usePremises, useCheapestStores } from "@/hooks/usePriceCatcher";
import { STATES } from "@/lib/pricecatcher";
import { getDistance } from "@/lib/geo";

interface BasketItem {
  code: string;
  name: string;
  unit: string;
  qty: number;
}

export function GroceryOptimizer() {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const { data: items, isLoading: loadingItems } = useItemLookup();
  const { data: premises } = usePremises();
  const { data: cheapest } = useCheapestStores();

  const isLoading = loadingItems;

  const premiseMap = useMemo(() => {
    const map = new Map<number, NonNullable<typeof premises>[number]>();
    premises?.forEach((p) => map.set(p.c, p));
    return map;
  }, [premises]);

  const searchResults = useMemo(() => {
    if (!items || !searchTerm || searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    return items
      .filter((i) => i.n.toLowerCase().includes(term))
      .filter((i) => !basket.some((b) => b.code === String(i.c)))
      .slice(0, 8);
  }, [items, searchTerm, basket]);

  const addToBasket = useCallback((item: NonNullable<typeof items>[number]) => {
    setBasket((prev) => [...prev, { code: String(item.c), name: item.n, unit: item.u, qty: 1 }]);
    setSearchTerm("");
  }, []);

  const removeFromBasket = useCallback((code: string) => {
    setBasket((prev) => prev.filter((b) => b.code !== code));
  }, []);

  const getLocation = useCallback(() => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  }, []);

  const optimizedResults = useMemo(() => {
    if (!cheapest || !premises || basket.length === 0) return [];
    const premiseCosts = new Map<number, { total: number; items: number; prices: Record<string, number> }>();

    for (const basketItem of basket) {
      const stores = cheapest[basketItem.code] || [];
      for (const store of stores) {
        const premise = premiseMap.get(store.p);
        if (!premise) continue;
        if (selectedState !== "all" && premise.s !== selectedState) continue;
        const existing = premiseCosts.get(store.p) || { total: 0, items: 0, prices: {} };
        existing.total += store.avg * basketItem.qty;
        existing.items += 1;
        existing.prices[basketItem.code] = store.avg;
        premiseCosts.set(store.p, existing);
      }
    }

    let results = Array.from(premiseCosts.entries())
      .filter(([, data]) => data.items === basket.length)
      .map(([premiseCode, data]) => {
        const premise = premiseMap.get(premiseCode)!;
        let distance: number | null = null;
        if (userLocation && premise.lat && premise.lng) {
          distance = getDistance(userLocation[0], userLocation[1], premise.lat, premise.lng);
        }
        return {
          premiseCode, name: premise.n, address: premise.a, type: premise.t,
          state: premise.s, district: premise.d, total: data.total,
          items: data.items, prices: data.prices, distance,
        };
      });

    if (userLocation) {
      results.sort((a, b) => {
        if (a.distance !== null && b.distance !== null) {
          const scoreA = a.total + a.distance * 0.5;
          const scoreB = b.total + b.distance * 0.5;
          return scoreA - scoreB;
        }
        return a.total - b.total;
      });
    } else {
      results.sort((a, b) => a.total - b.total);
    }

    return results.slice(0, 15);
  }, [cheapest, premises, basket, selectedState, userLocation, premiseMap]);

  const partialResults = useMemo(() => {
    if (!cheapest || !premises || basket.length === 0 || optimizedResults.length > 0) return [];
    const premiseCosts = new Map<number, { total: number; items: number; prices: Record<string, number> }>();

    for (const basketItem of basket) {
      const stores = cheapest[basketItem.code] || [];
      for (const store of stores) {
        const premise = premiseMap.get(store.p);
        if (!premise) continue;
        if (selectedState !== "all" && premise.s !== selectedState) continue;
        const existing = premiseCosts.get(store.p) || { total: 0, items: 0, prices: {} };
        existing.total += store.avg * basketItem.qty;
        existing.items += 1;
        existing.prices[basketItem.code] = store.avg;
        premiseCosts.set(store.p, existing);
      }
    }

    return Array.from(premiseCosts.entries())
      .filter(([, data]) => data.items >= Math.ceil(basket.length / 2))
      .map(([premiseCode, data]) => {
        const premise = premiseMap.get(premiseCode)!;
        return {
          premiseCode, name: premise.n, address: premise.a, state: premise.s,
          district: premise.d, type: premise.t, total: data.total,
          items: data.items, prices: data.prices, distance: null as number | null,
        };
      })
      .sort((a, b) => b.items - a.items || a.total - b.total)
      .slice(0, 10);
  }, [cheapest, premises, basket, selectedState, optimizedResults, premiseMap]);

  const displayResults = optimizedResults.length > 0 ? optimizedResults : partialResults;

  return (
    <section className="container py-12">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold tracking-tight">Smart Grocery Optimizer</h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Build your grocery list — we'll find the cheapest store that has everything
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Button variant="outline" onClick={getLocation} disabled={locating} className="gap-2">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> :
              userLocation ? <Check className="w-4 h-4 text-primary" /> : <Navigation className="w-4 h-4" />}
            {userLocation ? "Location Set" : "Use My Location"}
          </Button>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-[200px] bg-secondary border-border">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {STATES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search items to add to your basket..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-secondary border-border" />
          {searchResults.length > 0 && (
            <div className="absolute z-20 w-full mt-1 rounded-lg border border-border bg-popover shadow-xl max-h-[250px] overflow-auto">
              {searchResults.map((item) => (
                <button key={item.c} onClick={() => addToBasket(item)} className="w-full text-left px-4 py-2.5 hover:bg-secondary flex items-center justify-between text-sm">
                  <span>{item.n} <span className="text-muted-foreground">({item.u})</span></span>
                  <Plus className="w-4 h-4 text-primary" />
                </button>
              ))}
            </div>
          )}
        </div>

        {basket.length > 0 && (
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              Your Basket ({basket.length} items)
            </h3>
            <div className="flex flex-wrap gap-2">
              {basket.map((item) => (
                <div key={item.code} className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5 text-sm">
                  <span>{item.name}</span>
                  <span className="text-xs text-muted-foreground">({item.unit})</span>
                  <button onClick={() => removeFromBasket(item.code)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : basket.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-muted-foreground">Add items to your basket to find the cheapest stores</p>
          </div>
        ) : displayResults.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">
              No single store has {basket.length > 1 ? "enough of" : ""} your items
              {selectedState !== "all" ? ` in ${selectedState}` : ""}. Try fewer items or a different state.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {optimizedResults.length === 0 && partialResults.length > 0 && (
              <p className="text-sm text-accent">
                No single store carries all items. Showing stores with the most matches:
              </p>
            )}
            <div className="grid gap-3">
              {displayResults.map((store, idx) => (
                <div
                  key={store.premiseCode}
                  className={`glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    idx === 0 ? "ring-1 ring-primary/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm font-bold ${
                      idx === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{store.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{store.address}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{store.type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{store.district}, {store.state}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {store.items}/{basket.length} items
                        </span>
                        {store.distance !== null && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent flex items-center gap-1">
                            <Navigation className="w-3 h-3" />~{store.distance < 1 ? `${Math.round(store.distance * 1000)}m` : `${store.distance.toFixed(1)}km`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xl font-bold font-mono ${idx === 0 ? "text-chart-up" : "text-primary"}`}>
                      RM {store.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">estimated total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
