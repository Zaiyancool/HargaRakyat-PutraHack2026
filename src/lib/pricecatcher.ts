export interface ItemLookup {
  c: number;
  n: string;
  u: string;
  g: string;
  k: string;
}

export interface PremiseLookup {
  c: number;
  n: string;
  a: string;
  t: string;
  s: string;
  d: string;
  lat: number;
  lng: number;
}

export interface PriceAgg {
  c: number;
  avg: number;
  min: number;
  max: number;
  n: number;
}

export interface StateStats {
  avg: number;
  min: number;
  max: number;
  n: number;
}

export type PriceByState = Record<string, Record<string, StateStats>>;
export type PriceHistory = Record<string, Record<string, StateStats>>;
export type PricesByStore = Record<string, Record<string, StateStats>>;

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

export interface NewsItem {
  id: number;
  date: string;
  headline: string;
  source: string;
  url: string;
  impact: "up" | "down" | "neutral";
  category: string;
  summary: string;
  items_affected: string[];
  sentiment_score: number;
}

/**
 * Shifts all forecast dates so the first forecast point aligns with today.
 * Also shifts history dates by the same offset.
 * Prices remain unchanged — only date labels are re-mapped.
 * This ensures the forecast always shows "from today" regardless of when the
 * ML script was originally run.
 */
export function shiftForecastToToday(data: PriceForecastData): PriceForecastData {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result: PriceForecastData = {};

  for (const [itemCode, itemForecast] of Object.entries(data)) {
    if (!itemForecast.forecast.length) {
      result[itemCode] = itemForecast;
      continue;
    }

    // Find the original anchor date (first forecast point)
    const originalAnchor = new Date(itemForecast.forecast[0].date);
    originalAnchor.setHours(0, 0, 0, 0);
    const offsetMs = today.getTime() - originalAnchor.getTime();
    const offsetDays = Math.round(offsetMs / (1000 * 60 * 60 * 24));

    if (offsetDays === 0) {
      // Already aligned, no shift needed
      result[itemCode] = itemForecast;
      continue;
    }

    const shiftDate = (dateStr: string): string => {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split("T")[0];
    };

    result[itemCode] = {
      ...itemForecast,
      history: itemForecast.history.map((p) => ({
        ...p,
        date: shiftDate(p.date),
      })),
      forecast: itemForecast.forecast.map((p) => ({
        ...p,
        date: shiftDate(p.date),
      })),
    };
  }

  return result;
}

export interface CheapestStore {
  p: number;
  avg: number;
  n: number;
}

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
export const fetchPricesByStore = () => fetchJSON<PricesByStore>("/data/prices_by_store.json");
export const fetchPriceHistory = () => fetchJSON<PriceHistory>("/data/prices_history.json");
export const fetchCheapestStores = () => fetchJSON<CheapestStores>("/data/cheapest_stores.json");
export const fetchPriceForecast = () =>
  fetchJSON<PriceForecastData>("/data/price_forecast.json").then(shiftForecastToToday);
// --- Live RSS news fetch ---

interface Rss2JsonResponse {
  status: string;
  items: Array<{
    title: string;
    link: string;
    pubDate: string;
    description: string;
    source?: string;
    author?: string;
  }>;
}

const RELEVANCE_RE = /harga|price|food|makanan|grocery|inflation|subsid|ayam|telur|beras|sayur|minyak|gula|chicken|egg|rice|vegetable|cooking oil|sugar|tepung|flour|ikan|fish|daging|beef|cost of living|kos sara hidup/i;

/**
 * Detects impact and category from news headline/description using keyword matching.
 */
function classifyNewsItem(title: string, desc: string): Pick<NewsItem, "impact" | "category" | "items_affected" | "sentiment_score"> {
  const text = (title + " " + desc).toLowerCase();

  const upWords = ["naik", "meningkat", "tinggi", "mahal", "kenaikan", "surge", "rise", "jump", "spike", "increase", "expensive", "costly", "oil", "inflation"];
  const downWords = ["turun", "menurun", "rendah", "murah", "penurunan", "fall", "drop", "decrease", "cheaper", "subsidi", "subsidy", "control", "ceiling"];

  const upScore = upWords.filter(w => text.includes(w)).length;
  const downScore = downWords.filter(w => text.includes(w)).length;

  const impact: NewsItem["impact"] = upScore > downScore ? "up" : downScore > upScore ? "down" : "neutral";
  const sentiment_score = impact === "up" ? 0.6 : impact === "down" ? -0.5 : 0;

  let category = "Market";
  if (/(iran|us|usa|war|conflict|sanction|geopolit|opec|crude|brent)/i.test(text)) category = "Geopolitical";
  else if (/(ringgit|myr|exchange|dollar|currency|forex)/i.test(text)) category = "Currency";
  else if (/(rain|flood|weather|drought|climate|harvest|pertanian|ladang)/i.test(text)) category = "Climate";
  else if (/(subsid|kawalan|control|dasar|policy|kpdn|pkns|bera|paddy|padi)/i.test(text)) category = "Policy";
  else if (/(bekalan|supply|shortage|pengeluaran|output|stok|stock)/i.test(text)) category = "Supply";
  else if (/(sawit|palm|minyak|oil|komoditi|commodity)/i.test(text)) category = "Commodity";

  const items_affected: string[] = [];
  if (/(ayam|poultry|chicken)/i.test(text)) items_affected.push("Chicken");
  if (/(telur|egg)/i.test(text)) items_affected.push("Eggs");
  if (/(beras|rice|padi)/i.test(text)) items_affected.push("Rice");
  if (/(sayur|vegetable|tomato|cabbage|kubis)/i.test(text)) items_affected.push("Vegetables");
  if (/(minyak masak|cooking oil|sawit|palm)/i.test(text)) items_affected.push("Cooking Oil");
  if (/(gula|sugar)/i.test(text)) items_affected.push("Sugar");
  if (/(tepung|flour|wheat)/i.test(text)) items_affected.push("Wheat Products");
  if (/(ikan|fish|seafood)/i.test(text)) items_affected.push("Fish");
  if (/(daging|beef|mutton|kambing)/i.test(text)) items_affected.push("Meat");
  if (items_affected.length === 0) items_affected.push("General Food");

  return { impact, category, items_affected, sentiment_score };
}

async function fetchRssFeed(rssUrl: string): Promise<Rss2JsonResponse | null> {
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(6000) });
    if (!resp.ok) return null;
    const data: Rss2JsonResponse = await resp.json();
    if (data.status !== "ok" || !data.items?.length) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Fetches live Malaysian food price news from multiple RSS sources.
 * Uses Google News search + direct Malaysian news feeds via rss2json.com proxy.
 * Filters for relevance using keyword matching.
 */
export async function fetchLiveNews(): Promise<NewsItem[]> {
  // All RSS sources — Google News searches + direct feeds
  const rssSources = [
    // Google News searches
    `https://news.google.com/rss/search?q=${encodeURIComponent("harga makanan malaysia 2026")}&hl=en-MY&gl=MY&ceid=MY:en`,
    `https://news.google.com/rss/search?q=${encodeURIComponent("food price malaysia inflation")}&hl=en-MY&gl=MY&ceid=MY:en`,
    // Direct Malaysian news RSS feeds
    "https://www.bernama.com/en/rss/general.xml",
    "https://www.thestar.com.my/rss/News/Business",
    "https://www.freemalaysiatoday.com/rss/",
    "https://www.malaymail.com/feed/rss/malaysia",
  ];

  // Fetch all feeds in parallel
  const feedResults = await Promise.all(rssSources.map(fetchRssFeed));

  const allItems: NewsItem[] = [];
  const seenTitles = new Set<string>();
  let id = 1000;

  for (const data of feedResults) {
    if (!data) continue;
    for (const item of data.items) {
      if (!item.title || item.title.length < 15) continue;

      // Deduplicate by normalized title
      const normTitle = item.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
      if (seenTitles.has(normTitle)) continue;
      seenTitles.add(normTitle);

      const fullText = (item.title + " " + (item.description ?? "")).toLowerCase();

      // Keyword relevance filter — only keep food/price-related articles
      if (!RELEVANCE_RE.test(fullText)) continue;

      const classification = classifyNewsItem(item.title, item.description ?? "");
      const pubDate = item.pubDate
        ? new Date(item.pubDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      // Extract clean source name from "Title - Source Name" Google News format
      const titleParts = item.title.split(" - ");
      const cleanTitle = titleParts.length > 1 ? titleParts.slice(0, -1).join(" - ") : item.title;
      const sourceName = titleParts.length > 1 ? titleParts[titleParts.length - 1] : "News";

      allItems.push({
        id: id++,
        date: pubDate,
        headline: cleanTitle,
        source: sourceName,
        url: item.link,
        summary: (item.description ?? "").replace(/<[^>]*>/g, "").slice(0, 300),
        ...classification,
      });
    }
  }

  // Sort by date descending
  allItems.sort((a, b) => b.date.localeCompare(a.date));

  return allItems.slice(0, 15);
}

export const STATES = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
  "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah",
  "Sarawak", "Selangor", "Terengganu",
  "W.P. Kuala Lumpur", "W.P. Labuan", "W.P. Putrajaya",
];

export const PREMISE_TYPES = [
  "HYPERMARKET",
  "PASAR RAYA / SUPERMARKET",
  "PASAR BASAH",
  "PASAR MINI",
  "KEDAI RUNCIT",
];

export const ITEM_GROUPS = [
  "BARANGAN SEGAR", "BARANGAN KERING", "BARANGAN BERBUNGKUS",
  "BARANGAN KEDAI SERBANEKA", "MAKANAN SIAP MASAK",
  "MINUMAN", "PRODUK KEBERSIHAN", "SUSU DAN BARANGAN BAYI",
];
