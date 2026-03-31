import { useQuery } from "@tanstack/react-query";
import {
  fetchItemLookup,
  fetchPremiseLookup,
  fetchPriceData,
  type ItemLookup,
  type PremiseLookup,
  type PriceRecord,
} from "@/lib/pricecatcher";

export function useItemLookup() {
  return useQuery<ItemLookup[]>({
    queryKey: ["item-lookup"],
    queryFn: fetchItemLookup,
    staleTime: Infinity,
  });
}

export function usePremiseLookup() {
  return useQuery<PremiseLookup[]>({
    queryKey: ["premise-lookup"],
    queryFn: fetchPremiseLookup,
    staleTime: Infinity,
  });
}

export function usePriceData(yearMonth: string) {
  return useQuery<PriceRecord[]>({
    queryKey: ["price-data", yearMonth],
    queryFn: () => fetchPriceData(yearMonth),
    staleTime: 1000 * 60 * 30,
    enabled: !!yearMonth,
  });
}
