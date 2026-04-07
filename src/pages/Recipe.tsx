import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, ChefHat, Clock, Users, MapPin, Store, Navigation, Loader2, ArrowLeft, Sparkles, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TopNav } from "@/components/landing/TopNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useItemLookup, usePremises, useCheapestStores } from "@/hooks/usePriceCatcher";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/formatters";
import { getDistance } from "@/lib/geo";
import { toast } from "sonner";

interface RecipeIngredient {
  name: string;
  quantity: string;
  item_code?: number | null;
}

interface Recipe {
  name: string;
  description: string;
  servings: number;
  prep_time: string;
  cook_time: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  tips?: string;
}

interface IngredientAvailability {
  name: string;
  itemCode: number;
  price: number | null; // null = not available at this store
  available: boolean;
}

interface StoreRecommendation {
  premiseCode: number;
  name: string;
  address: string;
  state: string;
  district: string;
  type: string;
  distance?: number;
  ingredients: IngredientAvailability[];
  totalCost: number;
  availableCount: number;
  totalTracked: number;
}

const POPULAR_RECIPES = [
  "Nasi Lemak", "Rendang Ayam", "Mee Goreng Mamak", "Laksa Penang",
  "Ayam Masak Merah", "Sup Tulang", "Kari Ikan", "Nasi Goreng Kampung",
  "Tom Yam", "Sambal Udang", "Roti Canai", "Char Kuey Teow",
];

export default function RecipePage() {
  const [query, setQuery] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedState, setSelectedState] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState(false);

  const { data: items } = useItemLookup();
  const { data: premises } = usePremises();
  const { data: cheapestStores } = useCheapestStores();

  // Try GPS on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationLoading(false);
        },
        () => setLocationLoading(false),
        { timeout: 5000 }
      );
    }
  }, []);

  const generateRecipe = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      setLoading(true);
      setRecipe(null);

      try {
        const { data, error } = await supabase.functions.invoke("recipe-ai", {
          body: {
            query: searchQuery.trim(),
            items: items?.map((i) => ({ c: i.c, n: i.n, u: i.u })) || [],
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        if (!data?.recipe) throw new Error("No recipe returned");

        setRecipe(data.recipe);
      } catch (e: any) {
        console.error("Recipe error:", e);
        toast.error(e.message || "Failed to generate recipe. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [items]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    generateRecipe(query);
  };

  // Build store recommendations from matched ingredients
  const storeRecommendations = useMemo((): StoreRecommendation[] => {
    if (!recipe || !cheapestStores || !premises) return [];

    const matchedCodes = recipe.ingredients
      .filter((i) => i.item_code != null)
      .map((i) => i.item_code!);

    if (matchedCodes.length === 0) return [];

    // Build premise lookup
    const premiseMap = new Map(premises.map((p) => [p.c, p]));

    // Find all premises that carry at least one matched item, with prices
    const premiseScores = new Map<number, { items: { name: string; price: number; itemCode: number }[] }>();

    for (const code of matchedCodes) {
      const stores = cheapestStores[String(code)];
      if (!stores) continue;
      const ingredientName = recipe.ingredients.find((i) => i.item_code === code)?.name || "";

      for (const store of stores.slice(0, 30)) {
        if (!premiseScores.has(store.p)) {
          premiseScores.set(store.p, { items: [] });
        }
        premiseScores.get(store.p)!.items.push({
          name: ingredientName,
          price: store.avg,
          itemCode: code,
        });
      }
    }

    // Convert to array with premise info
    let results: StoreRecommendation[] = [];
    for (const [pCode, data] of premiseScores) {
      const premise = premiseMap.get(pCode);
      if (!premise) continue;

      // Filter by state if selected
      if (selectedState && premise.s !== selectedState) continue;

      const distance =
        userLocation && premise.lat && premise.lng
          ? getDistance(userLocation.lat, userLocation.lng, premise.lat, premise.lng)
          : undefined;

      results.push({
        premiseCode: pCode,
        name: premise.n,
        address: premise.a,
        state: premise.s,
        district: premise.d,
        type: premise.t,
        distance,
        matchedItems: data.items,
        totalCost: data.items.reduce((sum, i) => sum + i.price, 0),
        itemCount: data.items.length,
      });
    }

    // Sort: most items matched first, then cheapest, then closest
    results.sort((a, b) => {
      if (b.itemCount !== a.itemCount) return b.itemCount - a.itemCount;
      if (a.totalCost !== b.totalCost) return a.totalCost - b.totalCost;
      if (a.distance != null && b.distance != null) return a.distance - b.distance;
      return 0;
    });

    return results.slice(0, 10);
  }, [recipe, cheapestStores, premises, userLocation, selectedState]);

  const STATES = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
    "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah",
    "Sarawak", "Selangor", "Terengganu",
    "W.P. Kuala Lumpur", "W.P. Labuan", "W.P. Putrajaya",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Recipe Generator
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
            Cook Smart, <span className="text-primary">Save More</span>
          </h1>
          <p className="mt-2 text-gray-500 max-w-lg mx-auto">
            Search any Malaysian dish — we'll generate the recipe and show you the cheapest stores nearby to buy the ingredients.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mx-auto mb-6 max-w-2xl flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a dish... e.g. Nasi Lemak, Rendang, Laksa"
              className="pl-10 h-12 rounded-xl border-gray-200 bg-white text-base"
            />
          </div>
          <Button type="submit" disabled={loading || !query.trim()} className="h-12 rounded-xl px-6 font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
          </Button>
        </form>

        {/* Popular suggestions */}
        {!recipe && !loading && (
          <div className="mx-auto max-w-2xl mb-10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Popular Dishes</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_RECIPES.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setQuery(r);
                    generateRecipe(r);
                  }}
                  className="rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <ChefHat className="h-12 w-12 text-primary animate-bounce" />
            </div>
            <p className="text-gray-500 font-medium animate-pulse">Generating your recipe...</p>
          </div>
        )}

        {/* Recipe result */}
        {recipe && !loading && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setRecipe(null)}
              className="text-gray-500 hover:text-gray-900 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to search
            </Button>

            <div className="grid gap-6 lg:grid-cols-5">
              {/* Recipe card */}
              <div className="lg:col-span-3 space-y-5">
                {/* Header */}
                <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">{recipe.name}</h2>
                  <p className="text-gray-500 mb-4">{recipe.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" />{recipe.servings} servings</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" />Prep: {recipe.prep_time}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" />Cook: {recipe.cook_time}</span>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Ingredients
                  </h3>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${ing.item_code ? "bg-emerald-400" : "bg-gray-300"}`} />
                          <span className="text-gray-800 font-medium">{ing.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">{ing.quantity}</span>
                          {ing.item_code && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5 font-semibold">
                              Price tracked
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-gray-400">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 mr-1" /> = matched to PriceCatcher database for real-time pricing
                  </p>
                </div>

                {/* Steps */}
                <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Steps</h3>
                  <ol className="space-y-4">
                    {recipe.steps.map((step, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                          {i + 1}
                        </span>
                        <p className="text-gray-700 leading-relaxed pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                  {recipe.tips && (
                    <div className="mt-5 rounded-xl bg-amber-50 border border-amber-100 p-4">
                      <p className="text-sm text-amber-800"><strong>💡 Tips:</strong> {recipe.tips}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Store recommendations */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm sticky top-20">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    Where to Buy
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">Cheapest stores for your ingredients</p>

                  {/* Location controls */}
                  <div className="mb-4 space-y-2">
                    {userLocation ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                        <Navigation className="h-3 w-3" />
                        Using your GPS location
                      </div>
                    ) : locationLoading ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400 px-3 py-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Detecting location...
                      </div>
                    ) : null}

                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-700"
                    >
                      <option value="">All states</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {storeRecommendations.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">
                      {recipe.ingredients.some((i) => i.item_code)
                        ? "No stores found. Try changing the state filter."
                        : "No ingredient matches in the price database."}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {storeRecommendations.map((store, i) => (
                        <div
                          key={store.premiseCode}
                          className={`rounded-xl border p-4 transition-all ${
                            i === 0
                              ? "border-primary/30 bg-primary/5"
                              : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-sm font-bold text-gray-900 leading-tight">{store.name}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{store.district}, {store.state}</p>
                            </div>
                            {i === 0 && (
                              <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                                Best Match
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <ShoppingCart className="h-3 w-3" />
                              {store.itemCount}/{recipe.ingredients.filter((i) => i.item_code).length} items
                            </span>
                            {store.distance != null && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {store.distance < 1 ? `${Math.round(store.distance * 1000)}m` : `${store.distance.toFixed(1)}km`}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            {store.matchedItems.map((item, j) => (
                              <div key={j} className="flex justify-between text-xs">
                                <span className="text-gray-600 truncate mr-2">{item.name}</span>
                                <span className="font-mono font-semibold text-gray-900 shrink-0">{formatCurrency(item.price)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
                            <span className="text-xs font-semibold text-gray-500">Est. Total</span>
                            <span className="text-sm font-black font-mono text-primary">{formatCurrency(store.totalCost)}</span>
                          </div>

                          <p className="text-[10px] text-gray-300 mt-1 capitalize">{store.type.toLowerCase()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
