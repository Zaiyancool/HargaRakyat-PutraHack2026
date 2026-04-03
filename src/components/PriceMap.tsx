import { useState, useMemo, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Map as MapIcon, Loader2, Navigation, MapPin, Search, Store, Check, BadgeDollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useItemLookup, usePremises, useCheapestStores } from "@/hooks/usePriceCatcher";
import { STATES, ITEM_GROUPS, PREMISE_TYPES } from "@/lib/pricecatcher";
import { STATE_COORDS, jitterCoords, getDistance } from "@/lib/geo";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as Record<string, Record<string, unknown>>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const cheapIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const midIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const expensiveIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function FlyToState({ state }: { state: string }) {
  const map = useMap();
  useEffect(() => {
    const coords = STATE_COORDS[state];
    if (coords) map.flyTo(coords, 9, { duration: 1 });
    else map.flyTo([4.2, 108.5], 6, { duration: 1 });
  }, [state, map]);
  return null;
}

export function PriceMap() {
  const [selectedItem, setSelectedItem] = useState("");
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const { data: items, isLoading: li } = useItemLookup();
  const { data: premises, isLoading: lp } = usePremises();
  const { data: cheapest, isLoading: lc } = useCheapestStores();

  const isLoading = li || lp || lc;

  const premiseMap = useMemo(() => {
    const map = new Map<number, NonNullable<typeof premises>[number]>();
    premises?.forEach((p) => map.set(p.c, p));
    return map;
  }, [premises]);

  const itemsWithStores = useMemo(() => {
    if (!cheapest) return new Set<string>();
    return new Set(Object.keys(cheapest).filter(k => (cheapest[k] || []).length > 0));
  }, [cheapest]);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items
      .filter((i) => {
        if (!itemsWithStores.has(String(i.c))) return false;
        if (selectedGroup !== "all" && i.g !== selectedGroup) return false;
        if (search && !i.n.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.n.localeCompare(b.n));
  }, [items, search, selectedGroup, itemsWithStores]);

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

  // Unified store results used by both list and map
  const storeResults = useMemo(() => {
    if (!cheapest || !selectedItem || !premises) return [];
    const stores = cheapest[selectedItem] || [];
    const results = stores
      .map((s) => {
        const premise = premiseMap.get(s.p);
        if (!premise) return null;
        if (selectedState !== "all" && premise.s !== selectedState) return null;
        if (selectedType !== "all" && premise.t !== selectedType) return null;

        let coords: [number, number];
        if (premise.lat && premise.lng) {
          coords = [premise.lat, premise.lng];
        } else {
          const baseCoords = STATE_COORDS[premise.s];
          if (!baseCoords) return null;
          coords = jitterCoords(baseCoords, s.p);
        }

        let distance: number | null = null;
        if (userLocation && premise.lat && premise.lng) {
          distance = getDistance(userLocation[0], userLocation[1], premise.lat, premise.lng);
        }

        return { ...s, premise, coords, distance };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    // Sort by distance if location available, otherwise by price
    if (userLocation) {
      results.sort((a, b) => {
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        return a.avg - b.avg;
      });
    } else {
      results.sort((a, b) => a.avg - b.avg);
    }

    return results;
  }, [cheapest, selectedItem, premises, selectedState, selectedType, premiseMap, userLocation]);

  // Color-coded markers for map
  const markers = useMemo(() => {
    if (storeResults.length === 0) return [];
    const minPrice = Math.min(...storeResults.map((s) => s.avg));
    const maxPrice = Math.max(...storeResults.map((s) => s.avg));
    const range = maxPrice - minPrice || 1;
    return storeResults.map((s) => {
      const ratio = (s.avg - minPrice) / range;
      const icon = ratio < 0.33 ? cheapIcon : ratio < 0.66 ? midIcon : expensiveIcon;
      return { ...s, icon };
    });
  }, [storeResults]);

  const bestPrice = storeResults.length > 0 ? storeResults[0].avg : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapIcon className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Price Map & Store Finder</h2>
          </div>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Find cheapest stores and visualize prices across Malaysia
          </p>
        </div>

        {/* Filters Row 1: Location + Search */}
        <div className="flex flex-col md:flex-row gap-3">
          <Button variant="outline" onClick={getLocation} disabled={locating} className="gap-2 shrink-0">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> :
              userLocation ? <Check className="w-4 h-4 text-primary" /> : <Navigation className="w-4 h-4" />}
            {userLocation ? "Location Set" : "Use My Location"}
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary border-border" />
          </div>
        </div>

        {/* Filters Row 2: Category + Store Type + State */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedGroup} onValueChange={(v) => { setSelectedGroup(v); setSelectedItem(""); }}>
            <SelectTrigger className="flex-1 bg-secondary border-border"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent style={{ zIndex: 9999 }}>
              <SelectItem value="all">All Categories</SelectItem>
              {ITEM_GROUPS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="flex-1 bg-secondary border-border">
              <Store className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Store Type" />
            </SelectTrigger>
            <SelectContent style={{ zIndex: 9999 }}>
              <SelectItem value="all">All Store Types</SelectItem>
              {PREMISE_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="flex-1 sm:max-w-[200px] bg-secondary border-border">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent style={{ zIndex: 9999 }}>
              <SelectItem value="all">All States</SelectItem>
              {STATES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {/* Item Selector */}
        <Select value={selectedItem} onValueChange={setSelectedItem}>
          <SelectTrigger className="w-full bg-secondary border-border"><SelectValue placeholder="Select an item to find cheapest stores..." /></SelectTrigger>
          <SelectContent className="max-h-[300px]" style={{ zIndex: 9999 }}>
            {filteredItems.map((i) => (<SelectItem key={i.c} value={String(i.c)}>{i.n} ({i.u})</SelectItem>))}
          </SelectContent>
        </Select>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !selectedItem ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <BadgeDollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-muted-foreground">Select an item above to find cheapest stores and view on map</p>
          </div>
        ) : (
          <>
            {/* Item summary card */}
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

            {storeResults.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <p className="text-muted-foreground">No stores found for this item{selectedState !== "all" ? ` in ${selectedState}` : ""}{selectedType !== "all" ? ` (${selectedType})` : ""}</p>
              </div>
            ) : (
              <>
                {/* STORE LIST */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Store className="w-4 h-4" /> Cheapest Stores ({storeResults.length})
                  </h3>
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
                            <p className="font-medium text-sm truncate">{store.premise.n}</p>
                            <p className="text-xs text-muted-foreground truncate">{store.premise.a}</p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{store.premise.t}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />{store.premise.d}, {store.premise.s}
                              </span>
                              {store.distance !== null && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent flex items-center gap-1">
                                  <Navigation className="w-3 h-3" />~{store.distance < 1 ? `${Math.round(store.distance * 1000)}m` : `${store.distance.toFixed(1)}km`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 md:ml-4">
                          <div className="text-right">
                            <p className={`text-lg font-bold font-mono ${idx === 0 ? "text-chart-up" : "text-primary"}`}>
                              RM {store.avg.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">{store.n} records</p>
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.premise.n}, ${store.premise.a}, ${store.premise.d}, ${store.premise.s}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <Navigation className="w-3 h-3" /> Navigate
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MAP VIEW */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <MapIcon className="w-4 h-4" /> Map View
                  </h3>
                  <div className="glass-card rounded-xl overflow-hidden" style={{ position: 'relative', zIndex: 0 }}>
                    <div className="h-[300px] sm:h-[400px] md:h-[500px]">
                      <MapContainer center={[4.2, 108.5]} zoom={6} style={{ height: "100%", width: "100%" }} className="rounded-xl">
                        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {selectedState !== "all" && <FlyToState state={selectedState} />}
                        {markers.map((m) => (
                          <Marker key={m.p} position={m.coords} icon={m.icon}>
                            <Popup>
                              <div className="text-xs space-y-1.5">
                                <p className="font-bold text-sm">{m.premise.n}</p>
                                <p>{m.premise.a}</p>
                                <p className="font-semibold font-mono" style={{ color: "#059669" }}>RM {m.avg.toFixed(2)}</p>
                                <p className="text-gray-500">{m.premise.t} · {m.premise.d}</p>
                                <div className="flex gap-2 pt-1">
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${m.premise.n}, ${m.premise.a}, ${m.premise.d}, ${m.premise.s}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                  >
                                    <Navigation className="w-3 h-3" /> Google Maps
                                  </a>
                                  <a
                                    href={`https://maps.apple.com/?q=${encodeURIComponent(`${m.premise.n}, ${m.premise.a}, ${m.premise.d}, ${m.premise.s}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                                  >
                                    <MapPin className="w-3 h-3" /> Apple Maps
                                  </a>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                    <div className="flex items-center justify-center gap-6 py-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary" /> Cheapest</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-accent" /> Mid-range</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-destructive" /> Expensive</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
