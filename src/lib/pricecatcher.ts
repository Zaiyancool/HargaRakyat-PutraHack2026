export interface ItemLookup {
  c: number; // item_code
  n: string; // name
  u: string; // unit
  g: string; // item_group
  k: string; // item_category
}

export interface PremiseLookup {
  c: number; // premise_code
  n: string; // name
  a: string; // address
  t: string; // premise_type
  s: string; // state
  d: string; // district
}

export interface PriceAgg {
  c: number; // item_code
  avg: number;
  min: number;
  max: number;
  n: number; // record count
}

export interface StateStats {
  avg: number;
  min: number;
  max: number;
  n: number;
}

// state-level: { [item_code]: { [state]: StateStats } }
export type PriceByState = Record<string, Record<string, StateStats>>;

// historical: { [item_code]: { [YYYY-MM]: StateStats } }
export type PriceHistory = Record<string, Record<string, StateStats>>;

export interface ForecastPoint {
  date: string;
  price: number;
}

export interface ItemForecast {
  history: ForecastPoint[];
  forecast: ForecastPoint[];
  trend: "up" | "down" | "stable";
  slope: number;
  last_price: number;
}

export type PriceForecastData = Record<string, ItemForecast>;

export interface CheapestStore {
  p: number; // premise_code
  avg: number;
  n: number; // records
}

// { [item_code]: CheapestStore[] }
export type CheapestStores = Record<string, CheapestStore[]>;

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(path);
  return res.json();
}

export const fetchItems = () => fetchJSON<ItemLookup[]>("/data/items.json");
export const fetchPremises = () => fetchJSON<PremiseLookup[]>("/data/premises.json");
export const fetchPricesAgg = () => fetchJSON<PriceAgg[]>("/data/prices_agg.json");
export const fetchPricesAggJan = () => fetchJSON<PriceAgg[]>("/data/prices_agg_jan.json");
export const fetchPricesByState = () => fetchJSON<PriceByState>("/data/prices_by_state.json");
export const fetchPriceHistory = () => fetchJSON<PriceHistory>("/data/prices_history.json");
export const fetchCheapestStores = () => fetchJSON<CheapestStores>("/data/cheapest_stores.json");
export const fetchPriceForecast = () => fetchJSON<PriceForecastData>("/data/price_forecast.json");

export const STATES = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
  "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah",
  "Sarawak", "Selangor", "Terengganu",
  "W.P. Kuala Lumpur", "W.P. Labuan", "W.P. Putrajaya",
];

export const ITEM_GROUPS = [
  "BARANGAN SEGAR", "BARANGAN KERING", "BARANGAN BERBUNGKUS",
  "BARANGAN KEDAI SERBANEKA", "MAKANAN SIAP MASAK",
  "MINUMAN", "PRODUK KEBERSIHAN", "SUSU DAN BARANGAN BAYI",
];
