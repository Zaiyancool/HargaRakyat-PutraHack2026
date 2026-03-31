import { useQuery } from "@tanstack/react-query";
import {
  fetchItems,
  fetchPricesAgg,
  fetchPricesAggJan,
  fetchPricesByState,
  fetchPriceHistory,
  type ItemLookup,
  type PriceAgg,
  type PriceByState,
  type PriceHistory,
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
