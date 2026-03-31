import { useState, useMemo, useCallback } from "react";
import { Search, MapPin, Store, BadgeDollarSign, Navigation, Check, Loader2 } from "lucide-react";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useItemLookup, usePremises, useCheapestStores } from "@/hooks/usePriceCatcher";
import { STATES, ITEM_GROUPS } from "@/lib/pricecatcher";
import { getDistance } from "@/lib/geo";

export function StoreFinder() {
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const { data: items, isLoading: loadingItems } = useItemLookup();
  const { data: premises, isLoading: loadingPremises } = usePremises();
  const { data: cheapest, isLoading: loadingCheapest } = useCheapestStores();

  const isLoading = loadingItems || loadingPremises || loadingCheapest;

  const premiseMap = useMemo(() => {
    const map = new Map<number, NonNullable<typeof premises>[number]>();
    premises?.forEach((p) => map.set(p.c, p));
    return map;
  }, [premises]);

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

  const storeResults = useMemo(() => {
    if (!cheapest || !selectedItem || !premises) return [];

    const stores = cheapest[selectedItem] || [];
    let results = stores
      .map((s) => {
        const premise = premiseMap.get(s.p);
        if (!premise) return null;
        if (selectedState !== "all" && premise.s !== selectedState) return null;
        let distance: number | null = null;
        if (userLocation && premise.lat && premise.lng) {
          distance = getDistance(userLocation[0], userLocation[1], premise.lat, premise.lng);
        }
        return {
          ...s,
          name: premise.n,
          address: premise.a,
          type: premise.t,
          state: premise.s,
          district: premise.d,
          distance,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    // Sort by distance if location available, otherwise by price
    if (userLocation) {
      results.sort((a, b) => {
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        return a.avg - b.avg;
      });
    }

    return results;
  }, [cheapest, selectedItem, premises, selectedState, premiseMap, userLocation]);

  const bestPrice = storeResults.length > 0 ? storeResults[0].avg : null;

  return (
    <div>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Cheapest Store Finder</h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Find nearest stores with the lowest prices for any item (Feb 2026 data)
          </p>
        </div>

        {/* Location + Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <Button variant="outline" onClick={getLocation} disabled={locating} className="gap-2">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> :
              userLocation ? <Check className="w-4 h-4 text-primary" /> : <Navigation className="w-4 h-4" />}
            {userLocation ? "Location Set" : "Use My Location"}
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search items to filter..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary border-border" />
          </div>
          <Select value={selectedGroup} onValueChange={(v) => { setSelectedGroup(v); setSelectedItem(""); }}>
            <SelectTrigger className="w-[220px] bg-secondary border-border"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {ITEM_GROUPS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger className="flex-1 bg-secondary border-border"><SelectValue placeholder="Select an item to find cheapest stores..." /></SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {filteredItems.map((i) => (<SelectItem key={i.c} value={String(i.c)}>{i.n} ({i.u})</SelectItem>))}
            </SelectContent>
          </Select>
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

        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : !selectedItem ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <BadgeDollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-muted-foreground">Select an item above to find the cheapest stores</p>
          </div>
        ) : storeResults.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No stores found for this item{selectedState !== "all" ? ` in ${selectedState}` : ""}</p>
          </div>
        ) : (
          <>
            {selectedItemData && (
              <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{selectedItemData.n}</h3>
                  <p className="text-sm text-muted-foreground">{selectedItemData.k} · {selectedItemData.u}</p>
                </div>
                {bestPrice && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Best Price</p>
                    <p className="text-2xl font-bold font-mono text-chart-up">RM {bestPrice.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-3">
              {storeResults.slice(0, 20).map((store, idx) => (
                <div
                  key={store.p}
                  className={`glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
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
                        {store.distance !== null && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent flex items-center gap-1">
                            <Navigation className="w-3 h-3" />~{store.distance < 1 ? `${Math.round(store.distance * 1000)}m` : `${store.distance.toFixed(1)}km`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 md:ml-4">
                    <p className={`text-lg font-bold font-mono ${idx === 0 ? "text-chart-up" : "text-primary"}`}>
                      RM {store.avg.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{store.n} records</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
