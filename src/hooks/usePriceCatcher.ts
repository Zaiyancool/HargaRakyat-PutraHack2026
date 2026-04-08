import { useQuery } from "@tanstack/react-query";
import {
  fetchItems,
  fetchPremises,
  fetchPricesAgg,
  fetchPricesAggJan,
  fetchPricesByState,
  fetchPricesByStore,
  fetchPriceHistory,
  fetchCheapestStores,
  fetchPriceForecast,
  fetchLiveNews,
  type ItemLookup,
  type PremiseLookup,
  type PriceAgg,
  type PriceByState,
  type PricesByStore,
  type PriceHistory,
  type CheapestStores,
  type PriceForecastData,
  type NewsItem,
} from "@/lib/pricecatcher";
import { supabase } from "@/integrations/supabase/client";

export function useItemLookup() {
  return useQuery<ItemLookup[]>({
    queryKey: ["items"],
    queryFn: fetchItems,
    staleTime: Infinity,
  });
}

export function usePricesAgg() {
  return useQuery<PriceAgg[]>({
    queryKey: ["prices-agg"],
    queryFn: fetchPricesAgg,
    staleTime: Infinity,
  });
}

export function usePricesAggJan() {
  return useQuery<PriceAgg[]>({
    queryKey: ["prices-agg-jan"],
    queryFn: fetchPricesAggJan,
    staleTime: Infinity,
  });
}

export function usePricesByState() {
  return useQuery<PriceByState>({
    queryKey: ["prices-by-state"],
    queryFn: fetchPricesByState,
    staleTime: Infinity,
  });
}

export function usePricesByStore() {
  return useQuery<PricesByStore>({
    queryKey: ["prices-by-store"],
    queryFn: fetchPricesByStore,
    staleTime: Infinity,
  });
}

export function usePriceHistory() {
  return useQuery<PriceHistory>({
    queryKey: ["prices-history"],
    queryFn: fetchPriceHistory,
    staleTime: Infinity,
  });
}

export function usePremises() {
  return useQuery<PremiseLookup[]>({
    queryKey: ["premises"],
    queryFn: fetchPremises,
    staleTime: Infinity,
  });
}

export function useCheapestStores() {
  return useQuery<CheapestStores>({
    queryKey: ["cheapest-stores"],
    queryFn: fetchCheapestStores,
    staleTime: Infinity,
  });
}

export function usePriceForecast() {
  return useQuery<PriceForecastData>({
    queryKey: ["price-forecast"],
    queryFn: fetchPriceForecast,
    staleTime: Infinity,
  });
}

export function useNewsContext() {
  return useQuery<NewsItem[]>({
    queryKey: ["news-context"],
    queryFn: fetchLiveNews,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

export function useAIMarketBrief(headlines: Array<{ headline: string; impact: string; category: string; date: string }> | undefined) {
  return useQuery<{ brief: string; generated_at: string }>({
    queryKey: ["ai-market-brief", headlines?.length],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("news-ai", {
        body: { headlines },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!headlines && headlines.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}
