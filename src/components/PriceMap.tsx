import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Map as MapIcon, Loader2, Navigation, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useItemLookup, usePremises, useCheapestStores } from "@/hooks/usePriceCatcher";
import { STATES, ITEM_GROUPS } from "@/lib/pricecatcher";
import { STATE_COORDS, jitterCoords } from "@/lib/geo";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
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
    if (coords) { map.flyTo(coords, 9, { duration: 1 }); }
    else { map.flyTo([4.2, 108.5], 6, { duration: 1 }); }
  }, [state, map]);
  return null;
}

export function PriceMap() {
  const [selectedItem, setSelectedItem] = useState("");
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedState, setSelectedState] = useState("all");

  const { data: items, isLoading: li } = useItemLookup();
  const { data: premises, isLoading: lp } = usePremises();
  const { data: cheapest, isLoading: lc } = useCheapestStores();

  const isLoading = li || lp || lc;

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

  const markers = useMemo(() => {
    if (!cheapest || !selectedItem || !premises) return [];
    const stores = cheapest[selectedItem] || [];
    const filtered = stores
      .map((s) => {
        const premise = premiseMap.get(s.p);
        if (!premise) return null;
        if (selectedState !== "all" && premise.s !== selectedState) return null;
        // Use premise lat/lng if available, otherwise jitter from state
        let coords: [number, number];
        if (premise.lat && premise.lng) {
          coords = [premise.lat, premise.lng];
        } else {
          const baseCoords = STATE_COORDS[premise.s];
          if (!baseCoords) return null;
          coords = jitterCoords(baseCoords, s.p);
        }
        return { ...s, premise, coords };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (filtered.length === 0) return [];
    const minPrice = Math.min(...filtered.map((s) => s.avg));
    const maxPrice = Math.max(...filtered.map((s) => s.avg));
    const range = maxPrice - minPrice || 1;

    return filtered.map((s) => {
      const ratio = (s.avg - minPrice) / range;
      const icon = ratio < 0.33 ? cheapIcon : ratio < 0.66 ? midIcon : expensiveIcon;
      return { ...s, icon };
    });
  }, [cheapest, selectedItem, premises, selectedState, premiseMap]);

  return (
    <section className="container py-12">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapIcon className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Price Map</h2>
          </div>
          <p className="text-muted-foreground mt-1">Visualize where the cheapest prices are across Malaysia</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary border-border" />
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
            <SelectTrigger className="flex-1 bg-secondary border-border"><SelectValue placeholder="Select an item to map..." /></SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {filteredItems.map((i) => (<SelectItem key={i.c} value={String(i.c)}>{i.n} ({i.u})</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-[200px] bg-secondary border-border"><SelectValue placeholder="Zoom to state" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Malaysia</SelectItem>
              {STATES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="h-[500px]">
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
        )}
      </div>
    </section>
  );
}
