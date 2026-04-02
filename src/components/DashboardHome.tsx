import { useMemo, useState } from "react";
import {
  TrendingDown,
  Minus,
  Search,
  Star,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useItemLookup,
  usePricesAgg,
  usePricesAggJan,
} from "@/hooks/usePriceCatcher";
import { SkeletonCard } from "@/components/SkeletonCard";
import { ItemPriceModal } from "@/components/ItemPriceModal";
import { YearlyOverview } from "@/components/YearlyOverview";
import { ITEM_GROUPS, type ItemLookup, type PriceAgg } from "@/lib/pricecatcher";

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS = ["Most popular", "Cheapest", "Expensive"] as const;
type Tab = (typeof TABS)[number];
const PAGE_SIZE = 100;

// Map k field → display label
const CATEGORY_LABELS: Record<string, string> = {
  "BARANGAN SEGAR": "Barangan Segar",
  "BARANGAN KERING": "Barangan Kering",
  "BARANGAN BERBUNGKUS": "Barangan Berbungkus",
  "BARANGAN KEDAI SERBANEKA": "Kedai Serbaneka",
  "MAKANAN SIAP MASAK": "Makanan Siap Masak",
  "MINUMAN": "Minuman",
  "PRODUK KEBERSIHAN": "Kebersihan",
  "SUSU DAN BARANGAN BAYI": "Susu & Bayi",
};

// ─── Types ─────────────────────────────────────────────────────────────────────
interface EnrichedItem {
  code: number;
  name: string;
  unit: string;
  group: string;
  category: string;
  price: number;
  min: number;
  max: number;
  records: number;
  janPrice: number | null;
  changePct: number | null;
}

// ─── Helper ────────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function fmt(n: number) {
  return n.toFixed(2);
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function DashboardHome() {
  const { data: items, isLoading: li } = useItemLookup();
  const { data: pricesAgg, isLoading: lp } = usePricesAgg();
  const { data: pricesJan, isLoading: lj } = usePricesAggJan();

  const [activeTab, setActiveTab] = useState<Tab>("Most popular");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<EnrichedItem | null>(null);
  const [page, setPage] = useState(0);

  // reset page when filters change
  const handleTabChange = (t: Tab) => { setActiveTab(t); setPage(0); };
  const handleCategoryChange = (c: string) => { setActiveCategory(c); setPage(0); };
  const handleSearchChange = (v: string) => { setSearch(v); setPage(0); };

  const isLoading = li || lp || lj;

  // ── Build enriched item list ────────────────────────────────────────────────
  const priceMap = useMemo(() => {
    const m = new Map<number, PriceAgg>();
    pricesAgg?.forEach((p) => m.set(p.c, p));
    return m;
  }, [pricesAgg]);

  const janMap = useMemo(() => {
    const m = new Map<number, number>();
    pricesJan?.forEach((p) => m.set(p.c, p.avg));
    return m;
  }, [pricesJan]);

  const enriched: EnrichedItem[] = useMemo(() => {
    if (!items || !pricesAgg) return [];
    return items
      .map((item: ItemLookup) => {
        const p = priceMap.get(item.c);
        if (!p) return null;
        const janPrice = janMap.get(item.c) ?? null;
        const changePct =
          janPrice && janPrice > 0 ? ((p.avg - janPrice) / janPrice) * 100 : null;
        return {
          code: item.c,
          name: item.n,
          unit: item.u,
          group: item.g,
          category: item.k,
          price: p.avg,
          min: p.min,
          max: p.max,
          records: p.n,
          janPrice,
          changePct,
        } as EnrichedItem;
      })
      .filter(Boolean) as EnrichedItem[];
  }, [items, pricesAgg, priceMap, janMap]);

  // ── Derived stats for top cards ─────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!enriched.length) return null;
    const avgPrice = enriched.reduce((s, i) => s + i.price, 0) / enriched.length;
    const janAvg = enriched.reduce((s, i) => s + (i.janPrice ?? i.price), 0) / enriched.length;
    const overallChangePct = ((avgPrice - janAvg) / janAvg) * 100;
    const upCount = enriched.filter((i) => (i.changePct ?? 0) > 0).length;
    const downCount = enriched.filter((i) => (i.changePct ?? 0) < 0).length;
    const upPct = Math.round((upCount / enriched.length) * 100);
    const downPct = 100 - upPct;

    // Top 3 popular (by records)
    const trending = [...enriched]
      .sort((a, b) => b.records - a.records)
      .slice(0, 3);

    // Top 3 biggest price drops (most negative changePct)
    const cheapest = [...enriched]
      .filter((i) => i.changePct !== null)
      .sort((a, b) => (a.changePct ?? 0) - (b.changePct ?? 0))
      .slice(0, 3);

    return { avgPrice, overallChangePct, upPct, downPct, trending, cheapest };
  }, [enriched]);

  // ── Filtered & sorted table data ────────────────────────────────────────────
  const allFiltered = useMemo(() => {
    let data = [...enriched];
    if (activeCategory !== "All") data = data.filter((i) => i.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (activeTab === "Most popular") data.sort((a, b) => b.records - a.records);
    else if (activeTab === "Cheapest") data.sort((a, b) => (a.changePct ?? 0) - (b.changePct ?? 0));
    else if (activeTab === "Expensive") data.sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0));
    return data;
  }, [enriched, activeTab, activeCategory, search]);

  const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE);
  const tableData = allFiltered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const globalRankOffset = page * PAGE_SIZE;

  // ── Categories from data ─────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const seen = new Set<string>();
    enriched.forEach((i) => seen.add(i.category));
    return ["All", ...ITEM_GROUPS.filter((g) => seen.has(g))];
  }, [enriched]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={4} />)}
        </div>
        <SkeletonCard lines={8} />
      </div>
    );
  }

  const changePositive = (stats?.overallChangePct ?? 0) >= 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Page header ── */}
      <div className="text-center pt-6 pb-2">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
          Today's grocery prices
        </h1>
        <p className="mt-2 text-base text-gray-500">
          The Malaysian grocery market average today is{" "}
          <strong className="text-gray-900">RM {fmt(stats?.avgPrice ?? 0)}</strong>, a{" "}
          <strong className={changePositive ? "text-red-500" : "text-emerald-600"}>
            {changePositive ? "+" : ""}
            {fmt(stats?.overallChangePct ?? 0)}%
          </strong>{" "}
          change from last month.
        </p>
      </div>

      {/* ── Top 3 cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Market cap (stacked 2-in-1) */}
        <div className="flex flex-col gap-4">
          {/* Global avg */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-500">Market average</span>
              <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded px-2 py-0.5">1mo</span>
            </div>
            <p className="text-2xl font-black tracking-tight text-gray-900">
              RM {fmt(stats?.avgPrice ?? 0)}
            </p>
            <p className={`text-sm font-semibold mt-0.5 ${changePositive ? "text-red-500" : "text-emerald-600"}`}>
              {changePositive ? "+" : ""}{fmt(stats?.overallChangePct ?? 0)}%
            </p>
          </div>

          {/* Sentiment bar */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-500">Market sentiment</span>
              <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded px-2 py-0.5">1mo</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-red-400"
                style={{ width: "100%" }}
              >
                <div
                  className="h-full bg-red-400 ml-auto rounded-full"
                  style={{ width: `${stats?.upPct ?? 50}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs font-bold text-emerald-600">
                {stats?.downPct}% Prices Down
              </span>
              <span className="text-xs font-bold text-red-500">
                {stats?.upPct}% Prices Up
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Trending (most popular) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-500">Trending</span>
            <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded px-2 py-0.5">1mo</span>
          </div>
          <div className="space-y-3">
            {stats?.trending.map((item) => (
              <button
                key={item.code}
                onClick={() => setSelectedItem(item)}
                className="flex items-center justify-between w-full hover:bg-gray-50 rounded-xl p-1.5 -mx-1.5 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                    {initials(item.name)}
                  </div>
                  <span className="text-sm font-semibold text-gray-800 line-clamp-1 text-left group-hover:text-primary transition-colors">
                    {item.name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold font-mono text-gray-900">RM {fmt(item.price)}</p>
                  {item.changePct !== null && (
                    <p className={`text-xs font-bold ${item.changePct > 0 ? "text-red-500" : "text-emerald-600"}`}>
                      {item.changePct > 0 ? "+" : ""}{fmt(item.changePct)}%
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Card 3: Cheapest */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-500">Cheapest</span>
            <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded px-2 py-0.5">Overall</span>
          </div>
          <div className="space-y-3">
            {stats?.cheapest.map((item) => (
              <button
                key={item.code}
                onClick={() => setSelectedItem(item)}
                className="flex items-center justify-between w-full hover:bg-gray-50 rounded-xl p-1.5 -mx-1.5 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[10px] font-black text-emerald-600 shrink-0">
                    {initials(item.name)}
                  </div>
                  <span className="text-sm font-semibold text-gray-800 line-clamp-1 text-left group-hover:text-primary transition-colors">
                    {item.name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold font-mono text-emerald-600">RM {fmt(item.price)}</p>
                  {item.changePct !== null && (
                    <p className={`text-xs font-bold ${item.changePct > 0 ? "text-red-500" : "text-emerald-600"}`}>
                      {item.changePct > 0 ? "+" : ""}{fmt(item.changePct)}%
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Table header: tabs + search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                  activeTab === tab
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {search && (
              <button onClick={() => handleSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category pill filters */}
        <div className="flex gap-2 px-5 py-3 overflow-x-auto border-b border-gray-100 scrollbar-hide">
          {categories.map((cat) => {
            const label = cat === "All" ? "All items" : (CATEGORY_LABELS[cat] ?? cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white"
                    : "border border-gray-200 text-gray-500 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Column headers — hide some on mobile */}
        <div className="hidden sm:grid grid-cols-[2rem_1fr_7rem_7rem_6rem_5rem] gap-x-4 px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
          <span>#</span>
          <span>Name</span>
          <span className="text-right">Price</span>
          <span className="text-right">Change (1mo)</span>
          <span className="text-right">1-mo Avg</span>
          <span className="text-right">Action</span>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-gray-50">
          {tableData.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">No items found</div>
          )}
          {tableData.map((item, idx) => (
            <TableRow
              key={item.code}
              rank={globalRankOffset + idx + 1}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>

        {/* Kraken-style pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Showing <strong className="text-gray-700">{globalRankOffset + 1}–{Math.min(globalRankOffset + PAGE_SIZE, allFiltered.length)}</strong> of <strong className="text-gray-700">{allFiltered.length.toLocaleString()}</strong> items
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="flex items-center gap-0.5 rounded-lg px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="First page"
              >
                <ChevronLeft className="h-4 w-4" /><ChevronLeft className="h-4 w-4 -ml-2" />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center rounded-lg px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
                .reduce<(number | "...")[]>((acc, i, idx, arr) => {
                  if (idx > 0 && (i as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(i);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`rounded-lg w-9 h-9 text-sm font-bold transition-all ${
                        page === item ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {(item as number) + 1}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="flex items-center rounded-lg px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page === totalPages - 1}
                className="flex items-center gap-0.5 rounded-lg px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Last page"
              >
                <ChevronRight className="h-4 w-4" /><ChevronRight className="h-4 w-4 -ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Item Price Modal ── */}
      {selectedItem && (
        <ItemPriceModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

// ─── Table Row ─────────────────────────────────────────────────────────────────
function TableRow({
  rank,
  item,
  onClick,
}: {
  rank: number;
  item: EnrichedItem;
  onClick: () => void;
}) {
  const up = (item.changePct ?? 0) > 0;
  const down = (item.changePct ?? 0) < 0;

  return (
    <button
      onClick={onClick}
      className="w-full px-4 sm:px-5 py-3 sm:py-4 text-left hover:bg-gray-50 transition-colors group"
    >
      {/* Mobile layout */}
      <div className="flex sm:hidden items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-gray-400 font-medium w-5 shrink-0 text-right">{rank}</span>
          <div className="h-8 w-8 shrink-0 rounded-xl bg-primary/8 flex items-center justify-center text-[10px] font-black text-primary">
            {initials(item.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">{item.name}</p>
            <p className="text-xs text-gray-400">{CATEGORY_LABELS[item.category] ?? item.category}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold font-mono text-gray-900">RM {fmt(item.price)}</p>
          {item.changePct !== null && (
            <p className={`text-xs font-bold ${up ? "text-red-500" : down ? "text-emerald-600" : "text-gray-400"}`}>
              {up ? "+" : ""}{fmt(item.changePct)}%
            </p>
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:grid grid-cols-[2rem_1fr_7rem_7rem_6rem_5rem] gap-x-4 items-center">
        {/* Rank */}
        <span className="text-sm text-gray-400 font-medium">{rank}</span>

        {/* Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/8 flex items-center justify-center text-[11px] font-black text-primary">
            {initials(item.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">{item.name}</p>
            <p className="text-xs text-gray-400 truncate">{CATEGORY_LABELS[item.category] ?? item.category}</p>
          </div>
        </div>

        {/* Price */}
        <p className="text-sm font-bold font-mono text-gray-900 text-right">RM {fmt(item.price)}</p>

        {/* Change */}
        <div className="text-right">
          {item.changePct !== null ? (
            <span className={`inline-flex items-center justify-end gap-0.5 text-sm font-bold ${up ? "text-red-500" : down ? "text-emerald-600" : "text-gray-400"}`}>
              {up ? <ChevronUp className="h-3.5 w-3.5" /> : down ? <ChevronDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
              {up ? "+" : ""}{fmt(item.changePct)}%
            </span>
          ) : (
            <span className="text-sm text-gray-300">—</span>
          )}
        </div>

        {/* 1-mo avg */}
        <p className="text-sm font-mono text-gray-500 text-right">
          {item.janPrice ? `RM ${fmt(item.janPrice)}` : "—"}
        </p>

        {/* Action */}
        <div className="flex items-center justify-end gap-1.5">
          <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors">View</span>
          <Star className="h-4 w-4 text-gray-300 hover:text-amber-400 transition-colors" />
        </div>
      </div>
    </button>
  );
}
