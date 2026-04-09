import { useState, useEffect, useMemo } from "react";
import { TopNav } from "@/components/landing/TopNav";
import { supabase } from "@/integrations/supabase/client";
import { useItemLookup, usePremises, useCheapestStores } from "@/hooks/usePriceCatcher";
import {
  Search, ChefHat, Clock, Users, Loader2, MapPin, ArrowLeft,
  ShoppingCart, Star, AlertCircle, Navigation
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ItemLookup, PremiseLookup, CheapestStores } from "@/lib/pricecatcher";

interface RecipeSuggestion {
  name: string;
  name_ms: string;
  description: string;
  cuisine: string;
  difficulty: string;
  time_minutes: number;
  servings: number;
  image_emoji: string;
}

interface RecipeIngredient {
  name: string;
  quantity: string;
  item_code: number | null;
  matched: boolean;
}

interface RecipeDetails {
  name: string;
  name_ms: string;
  description: string;
  servings: number;
  time_minutes: number;
  difficulty: string;
  steps: string[];
  ingredients: RecipeIngredient[];
}

interface StoreRecommendation {
  premise: PremiseLookup;
  ingredients: {
    ingredient: RecipeIngredient;
    item: ItemLookup | null;
    price: number;
  }[];
  totalCost: number;
  matchedCount: number;
  distance?: number;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function RecipePage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");

  const { data: items } = useItemLookup();
  const { data: premises } = usePremises();
  const { data: cheapestStores } = useCheapestStores();

  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocationError("Location access denied. Showing results without distance sorting.")
      );
    }
  }, []);

  // Load default recipes on mount
  useEffect(() => {
    searchRecipes("");
  }, []);

  async function searchRecipes(q: string) {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase.functions.invoke("recipe-ai", {
        body: { action: "search", query: q },
      });
      if (err) throw err;
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load recipes. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function selectRecipe(recipe: RecipeSuggestion) {
    setDetailLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase.functions.invoke("recipe-ai", {
        body: {
          action: "details",
          recipe: recipe.name,
          items: items?.slice(0, 200) || [],
          servings: recipe.servings,
        },
      });
      if (err) throw err;
      setSelectedRecipe(data);
    } catch (e) {
      setError("Failed to load recipe details. Please try again.");
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  }

  // Compute store recommendations
  const storeRecommendations = useMemo<StoreRecommendation[]>(() => {
    if (!selectedRecipe || !cheapestStores || !premises || !items) return [];

    const matchedIngredients = selectedRecipe.ingredients.filter(
      (ing) => ing.matched && ing.item_code != null
    );
    if (matchedIngredients.length === 0) return [];

    // Build premise map
    const premiseMap = new Map<number, PremiseLookup>();
    premises.forEach((p) => premiseMap.set(p.c, p));

    const itemMap = new Map<number, ItemLookup>();
    items.forEach((i) => itemMap.set(i.c, i));

    // Find all stores that carry at least some ingredients
    const storeScores = new Map<number, StoreRecommendation>();

    for (const ing of matchedIngredients) {
      const code = String(ing.item_code);
      const stores = cheapestStores[code];
      if (!stores) continue;

      for (const store of stores) {
        const premise = premiseMap.get(store.p);
        if (!premise) continue;

        if (!storeScores.has(store.p)) {
          const dist = userLocation
            ? haversineKm(userLocation.lat, userLocation.lng, premise.lat, premise.lng)
            : undefined;
          storeScores.set(store.p, {
            premise,
            ingredients: [],
            totalCost: 0,
            matchedCount: 0,
            distance: dist,
          });
        }

        const rec = storeScores.get(store.p)!;
        rec.ingredients.push({
          ingredient: ing,
          item: itemMap.get(ing.item_code!) || null,
          price: store.avg,
        });
        rec.totalCost += store.avg;
        rec.matchedCount += 1;
      }
    }

    // Sort: more ingredients matched → lower total cost → closer distance
    return Array.from(storeScores.values())
      .filter((s) => s.matchedCount >= Math.max(1, Math.floor(matchedIngredients.length * 0.3)))
      .sort((a, b) => {
        if (b.matchedCount !== a.matchedCount) return b.matchedCount - a.matchedCount;
        if (a.totalCost !== b.totalCost) return a.totalCost - b.totalCost;
        if (a.distance != null && b.distance != null) return a.distance - b.distance;
        return 0;
      })
      .slice(0, 10);
  }, [selectedRecipe, cheapestStores, premises, items, userLocation]);

  const totalMatchedIngredients = selectedRecipe
    ? selectedRecipe.ingredients.filter((i) => i.matched && i.item_code != null).length
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 flex flex-col font-sans antialiased transition-colors duration-200">
      <TopNav />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {selectedRecipe && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedRecipe(null)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ChefHat className="h-7 w-7 text-primary" />
              {selectedRecipe ? selectedRecipe.name : "Recipe Finder"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {selectedRecipe
                ? selectedRecipe.description
                : "Find recipes and discover the cheapest stores for ingredients near you"}
            </p>
          </div>
        </div>

        {!selectedRecipe ? (
          <>
            {/* Search */}
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search recipes... e.g. Nasi Lemak, Rendang, Laksa"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchRecipes(query)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => searchRecipes(query)} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>

            {locationError && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm mb-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {locationError}
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Recipe Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-gray-500">Generating recipes...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((recipe, i) => (
                  <Card
                    key={i}
                    className="p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    onClick={() => selectRecipe(recipe)}
                  >
                    <div className="text-4xl mb-3">{recipe.image_emoji}</div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {recipe.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {recipe.name_ms}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {recipe.cuisine}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" /> {recipe.time_minutes}m
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-3 w-3" /> {recipe.servings}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          recipe.difficulty === "Easy"
                            ? "text-green-600 border-green-300"
                            : recipe.difficulty === "Medium"
                            ? "text-amber-600 border-amber-300"
                            : "text-red-600 border-red-300"
                        }`}
                      >
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Recipe Detail View */}
            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-gray-500">Loading recipe details...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Recipe Info */}
                <div className="space-y-6">
                  {/* Meta */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary">{selectedRecipe.difficulty}</Badge>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" /> {selectedRecipe.time_minutes} min
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="h-4 w-4" /> {selectedRecipe.servings} servings
                    </span>
                  </div>

                  {/* Ingredients */}
                  <Card className="p-5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      Ingredients ({selectedRecipe.ingredients.length})
                    </h2>
                    <div className="space-y-2">
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                ing.matched ? "bg-green-500" : "bg-gray-300"
                              }`}
                            />
                            <span className="text-sm text-gray-800 dark:text-gray-200">
                              {ing.name}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 font-mono">
                            {ing.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      {totalMatchedIngredients} of {selectedRecipe.ingredients.length} tracked
                      in PriceCatcher
                    </div>
                  </Card>

                  {/* Steps */}
                  <Card className="p-5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                      Steps
                    </h2>
                    <ol className="space-y-3">
                      {selectedRecipe.steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </Card>
                </div>

                {/* Right: Store Recommendations */}
                <div className="space-y-4">
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Best Stores for This Recipe
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ranked by ingredient availability, price, and distance
                  </p>

                  {storeRecommendations.length === 0 ? (
                    <Card className="p-6 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Computing store recommendations...</p>
                    </Card>
                  ) : (
                    storeRecommendations.map((store, i) => (
                      <Card
                        key={store.premise.c}
                        className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {i === 0 && (
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                {store.premise.n}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {store.premise.a}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {store.premise.t}
                              </Badge>
                              <span className="text-xs text-gray-500">{store.premise.s}</span>
                              {store.distance != null && (
                                <span className="flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400">
                                  <Navigation className="h-3 w-3" />
                                  {store.distance < 1
                                    ? `${Math.round(store.distance * 1000)}m`
                                    : `${store.distance.toFixed(1)}km`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <div className="text-lg font-bold text-primary font-mono">
                              RM {store.totalCost.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {store.matchedCount}/{totalMatchedIngredients} items
                            </div>
                          </div>
                        </div>

                        {/* Ingredient breakdown */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1.5">
                          {store.ingredients.map((ing, j) => (
                            <div
                              key={j}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                                {ing.ingredient.name}
                                {ing.item && (
                                  <span className="text-gray-400 ml-1">
                                    ({ing.item.u})
                                  </span>
                                )}
                              </span>
                              <span className="font-mono text-gray-800 dark:text-gray-200 ml-2">
                                RM {ing.price.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
