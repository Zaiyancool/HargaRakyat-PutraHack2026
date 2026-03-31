import Papa from "papaparse";

export interface PriceRecord {
  date: string;
  premise_code: number;
  item_code: number;
  price: number;
}

export interface ItemLookup {
  item_code: number;
  item: string;
  unit: string;
  item_group: string;
  item_category: string;
}

export interface PremiseLookup {
  premise_code: number;
  premise: string;
  address: string;
  premise_type: string;
  state: string;
  district: string;
}

const STORAGE_BASE = "https://storage.data.gov.my/pricecatcher";

async function fetchCSV<T>(url: string): Promise<T[]> {
  const res = await fetch(url);
  const text = await res.text();
  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err: Error) => reject(err),
    });
  });
}

export async function fetchItemLookup(): Promise<ItemLookup[]> {
  const data = await fetchCSV<ItemLookup>(`${STORAGE_BASE}/lookup_item.csv`);
  return data.filter((d) => d.item_code > 0 && d.item);
}

export async function fetchPremiseLookup(): Promise<PremiseLookup[]> {
  const data = await fetchCSV<PremiseLookup>(`${STORAGE_BASE}/lookup_premise.csv`);
  return data.filter((d) => d.premise_code > 0 && d.premise);
}

export async function fetchPriceData(yearMonth: string): Promise<PriceRecord[]> {
  const data = await fetchCSV<PriceRecord>(
    `${STORAGE_BASE}/pricecatcher_${yearMonth}.csv`
  );
  return data.filter((d) => d.item_code > 0);
}

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
