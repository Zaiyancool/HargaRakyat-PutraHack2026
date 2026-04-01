import { useQuery } from "@tanstack/react-query";
import {
  fetchItems,
  fetchPremises,
  fetchPricesAgg,
  fetchPricesAggJan,
  fetchPricesByState,
  fetchPriceHistory,
  fetchCheapestStores,
  fetchPriceForecast,
  fetchLiveNews,
  type ItemLookup,
  type PremiseLookup,
  type PriceAgg,
  type PriceByState,
  type PriceHistory,
  type CheapestStores,
  type PriceForecastData,
  type NewsItem,
} from "@/lib/pricecatcher";

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
    queryFn: fetchLiveNews,   // tries RSS first, falls back to static
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}
