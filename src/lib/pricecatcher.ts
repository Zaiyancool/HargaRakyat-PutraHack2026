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
export const fetchPriceHistory = () => fetchJSON<PriceHistory>("/data/prices_history.json");
export const fetchCheapestStores = () => fetchJSON<CheapestStores>("/data/cheapest_stores.json");
export const fetchPriceForecast = () =>
  fetchJSON<PriceForecastData>("/data/price_forecast.json").then(shiftForecastToToday);
export const fetchNewsContext = () => fetchJSON<NewsItem[]>("/data/news_context.json");

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

/**
 * Detects impact and category from news headline/description using keyword matching.
 */
function classifyNewsItem(title: string, desc: string): Pick<NewsItem, "impact" | "category" | "items_affected" | "sentiment_score"> {
  const text = (title + " " + desc).toLowerCase();

  // Impact detection
  const upWords = ["naik", "meningkat", "tinggi", "mahal", "kenaikan", "surge", "rise", "jump", "spike", "increase", "expensive", "costly", "oil", "inflation"];
  const downWords = ["turun", "menurun", "rendah", "murah", "penurunan", "fall", "drop", "decrease", "cheaper", "subsidi", "subsidy", "control", "ceiling"];

  let upScore = upWords.filter(w => text.includes(w)).length;
  let downScore = downWords.filter(w => text.includes(w)).length;

  const impact: NewsItem["impact"] = upScore > downScore ? "up" : downScore > upScore ? "down" : "neutral";
  const sentiment_score = impact === "up" ? 0.6 : impact === "down" ? -0.5 : 0;

  // Category detection
  let category = "Market";
  if (/(iran|us|usa|war|conflict|sanction|geopolit|opec|crude|brent)/i.test(text)) category = "Geopolitical";
  else if (/(ringgit|myr|exchange|dollar|currency|forex)/i.test(text)) category = "Currency";
  else if (/(rain|flood|weather|drought|climate|harvest|pertanian|ladang)/i.test(text)) category = "Climate";
  else if (/(subsid|kawalan|control|dasar|policy|kpdn|pkns|bera|paddy|padi)/i.test(text)) category = "Policy";
  else if (/(bekalan|supply|shortage|shortage|pengeluaran|output|stok|stock)/i.test(text)) category = "Supply";
  else if (/(sawit|palm|minyak|oil|komoditi|commodity)/i.test(text)) category = "Commodity";

  // Items affected
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

/**
 * Fetches real Malaysian food price news from Google News RSS (via rss2json.com proxy).
 * Returns NewsItem[] merged with static curated news, deduped by headline keywords.
 * Falls back to static-only on any network/parse error.
 */
export async function fetchLiveNews(): Promise<NewsItem[]> {
  // Always load static news first (our curated, high-quality baseline)
  const staticNews = await fetchJSON<NewsItem[]>("/data/news_context.json").catch(() => [] as NewsItem[]);

  // Try fetching live Google News RSS via rss2json.com (free, no key, CORS-friendly)
  const queries = [
    "harga makanan malaysia 2026",
    "food price malaysia inflation",
  ];

  const liveItems: NewsItem[] = [];

  for (const q of queries) {
    try {
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-MY&gl=MY&ceid=MY:en`;
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;`;

      const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(6000) });
      if (!resp.ok) continue;

      const data: Rss2JsonResponse = await resp.json();
      if (data.status !== "ok" || !data.items?.length) continue;

      let id = 1000 + liveItems.length;
      for (const item of data.items) {
        if (!item.title || item.title.length < 15) continue;

        const classification = classifyNewsItem(item.title, item.description ?? "");
        const pubDate = item.pubDate
          ? new Date(item.pubDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        // Extract clean source name from "Title - Source Name" Google News format
        const titleParts = item.title.split(" - ");
        const cleanTitle = titleParts.slice(0, -1).join(" - ") || item.title;
        const sourceName = titleParts[titleParts.length - 1] || "News";

        liveItems.push({
          id: id++,
          date: pubDate,
          headline: cleanTitle,
          source: sourceName,
          url: item.link,
          summary: (item.description ?? "").replace(/<[^>]*>/g, "").slice(0, 300),
          ...classification,
        });
      }
    } catch {
      // RSS fetch failed — that's fine, we still have static news
    }
  }

  // Deduplicate live vs static by checking title similarity
  const filteredLive = liveItems.filter(live => {
    const liveWords = new Set(live.headline.toLowerCase().split(/\s+/).filter(w => w.length > 4));
    return !staticNews.some(s => {
      const staticWords = s.headline.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const overlap = staticWords.filter(w => liveWords.has(w)).length;
      return overlap >= 3; // too similar
    });
  });

  // Live news on top (more current), static below
  const merged = [...filteredLive.slice(0, 5), ...staticNews];
  return merged.slice(0, 12); // cap at 12 total
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
