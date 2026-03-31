import { useQuery } from "@tanstack/react-query";
import {
  fetchItems,
  fetchPricesAgg,
  fetchPricesByState,
  type ItemLookup,
  type PriceAgg,
  type PriceByState,
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

export function usePricesByState() {
  return useQuery<PriceByState>({
    queryKey: ["prices-by-state"],
    queryFn: fetchPricesByState,
    staleTime: Infinity,
  });
}
