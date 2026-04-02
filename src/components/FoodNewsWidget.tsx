import { useState, useMemo, useEffect } from "react";
import {
  Newspaper, TrendingUp, TrendingDown, Minus, ExternalLink,
  Globe, Thermometer, DollarSign, Leaf, BarChart2, AlertCircle,
  ChevronDown, ChevronUp, Wifi, RefreshCw, Radio, Sparkles, Loader2,
} from "lucide-react";
import { useNewsContext, useAIMarketBrief } from "@/hooks/usePriceCatcher";
import type { NewsItem } from "@/lib/pricecatcher";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Geopolitical: <Globe className="w-3.5 h-3.5" />,
  Policy: <BarChart2 className="w-3.5 h-3.5" />,
  Supply: <Leaf className="w-3.5 h-3.5" />,
  Currency: <DollarSign className="w-3.5 h-3.5" />,
  Climate: <Thermometer className="w-3.5 h-3.5" />,
  Commodity: <BarChart2 className="w-3.5 h-3.5" />,
  Market: <Radio className="w-3.5 h-3.5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Geopolitical: "cat-geopolitical",
  Policy:       "cat-policy",
  Supply:       "cat-supply",
  Currency:     "cat-currency",
  Climate:      "cat-climate",
  Commodity:    "cat-commodity",
  Market:       "cat-policy",
};

function ImpactBadge({ impact }: { impact: NewsItem["impact"] }) {
  if (impact === "up") {
    return (
      <span className="badge-up">
        <TrendingUp className="w-3 h-3" /> Price ↑
      </span>
    );
  }
  if (impact === "down") {
    return (
      <span className="badge-down">
        <TrendingDown className="w-3 h-3" /> Price ↓
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
      <Minus className="w-3 h-3" /> Neutral
    </span>
  );
}

function AIMarketBrief({ headlines }: { headlines: Array<{ headline: string; impact: string; category: string; date: string }> }) {
  const { data, isLoading, error } = useAIMarketBrief(headlines);

  if (error && !data) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 p-4 mb-4">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-bold text-foreground">AI Market Brief</h4>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold border border-primary/30">
            Powered by AI
          </span>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 py-3">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Analyzing market signals...</span>
          </div>
        ) : data?.brief ? (
          <>
            <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
              {data.brief}
            </p>
            {data.generated_at && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Generated {new Date(data.generated_at).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const [expanded, setExpanded] = useState(false);
  const catColor = CATEGORY_COLORS[item.category] ?? "bg-secondary text-muted-foreground border-border";
  const catIcon = CATEGORY_ICONS[item.category] ?? <Newspaper className="w-3.5 h-3.5" />;

  const date = new Date(item.date).toLocaleDateString("en-MY", {
    day: "numeric", month: "short", year: "numeric",
  });

  const linkUrl = item.url || "#";

  return (
    <div
      className={`glass-card rounded-xl p-4 transition-all duration-200 ${
        item.impact === "up"
          ? "border-l-4 border-l-red-400"
          : item.impact === "down"
          ? "border-l-4 border-l-emerald-500"
          : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${catColor}`}>
          {catIcon} {item.category}
        </span>
        <ImpactBadge impact={item.impact} />
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40">
          <Wifi className="w-2.5 h-2.5 animate-pulse" /> LIVE
        </span>
        <span className="text-[10px] text-muted-foreground ml-auto">{date}</span>
      </div>

      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
        onClick={(e) => { if (linkUrl === "#") e.preventDefault(); }}
      >
        <p className="text-sm font-semibold leading-snug text-foreground mb-2 group-hover:text-primary transition-colors cursor-pointer">
          {item.headline}
          <ExternalLink className="inline-block w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-60 transition-opacity -translate-y-0.5" />
        </p>
      </a>

      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1 hover:text-primary transition-colors w-fit"
      >
        <span className="font-medium text-primary/70 hover:text-primary">{item.source}</span>
        <ExternalLink className="w-2.5 h-2.5" />
      </a>

      <div className="flex flex-wrap gap-1 mb-2">
        {item.items_affected.slice(0, 4).map((tag) => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/80 text-muted-foreground border border-border/50">
            {tag}
          </span>
        ))}
      </div>

      {item.summary && item.summary.length > 20 && (
        <>
          {expanded && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-2 pt-2 border-t border-border/40 animate-fade-in">
              {item.summary}
            </p>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-[11px] text-primary/70 hover:text-primary flex items-center gap-1 transition-colors"
          >
            {expanded ? (
              <><ChevronUp className="w-3 h-3" /> Less</>
            ) : (
              <><ChevronDown className="w-3 h-3" /> Read more</>
            )}
          </button>
        </>
      )}
    </div>
  );
}

function SentimentBar({ items }: { items: NewsItem[] }) {
  const { bullish, bearish, neutral } = useMemo(() => {
    let up = 0, down = 0, zero = 0;
    for (const i of items) {
      if (i.impact === "up") up++;
      else if (i.impact === "down") down++;
      else zero++;
    }
    const total = items.length || 1;
    return { bullish: (up / total) * 100, bearish: (down / total) * 100, neutral: (zero / total) * 100 };
  }, [items]);

  const overallSentiment = bullish > bearish + 10
    ? { label: "Bearish for Consumers", color: "text-red-600 font-bold" }
    : bearish > bullish + 10
    ? { label: "Bullish for Consumers", color: "text-emerald-600 font-bold" }
    : { label: "Mixed Signals", color: "text-amber-600 font-bold" };

  return (
    <div className="bg-secondary/60 border border-border rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
          Market Sentiment
        </h4>
        <span className={`text-xs ${overallSentiment.color}`}>
          {overallSentiment.label}
        </span>
      </div>
      <div className="flex rounded-full overflow-hidden h-2.5 gap-px">
        {bullish > 0 && (
          <div
            className="bg-red-500 transition-all duration-700"
            style={{ width: `${bullish}%` }}
            title={`${Math.round(bullish)}% price-up signals`}
          />
        )}
        {neutral > 0 && (
          <div
            className="bg-muted-foreground/40 transition-all duration-700"
            style={{ width: `${neutral}%` }}
          />
        )}
        {bearish > 0 && (
          <div
            className="bg-emerald-500 transition-all duration-700"
            style={{ width: `${bearish}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
        <span className="text-red-600 font-semibold">{Math.round(bullish)}% price-up</span>
        <span>{Math.round(neutral)}% neutral</span>
        <span className="text-emerald-600 font-semibold">{Math.round(bearish)}% price-down</span>
      </div>
    </div>
  );
}

function HeadlineTicker({ items }: { items: NewsItem[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;
  const current = items[idx];

  return (
    <a
      href={current.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 mb-4 overflow-hidden hover:bg-primary/15 hover:border-primary/30 transition-colors group"
      onClick={(e) => { if (!current.url) e.preventDefault(); }}
    >
      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest">
        <Wifi className="w-3 h-3 animate-pulse" /> Live
      </span>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs text-foreground/90 font-medium truncate group-hover:text-primary transition-colors">
          {current.impact === "up" ? "🔴" : current.impact === "down" ? "🟢" : "🟡"}{" "}
          {current.headline}
        </p>
      </div>
      <span className="shrink-0 flex items-center gap-1 text-[10px] text-muted-foreground group-hover:text-primary transition-colors font-medium">
        {current.source} <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
      </span>
    </a>
  );
}

export function FoodNewsWidget() {
  const { data: news, isLoading, isFetching, dataUpdatedAt, refetch } = useNewsContext();

  const aiHeadlines = useMemo(() =>
    (news ?? []).map(n => ({
      headline: n.headline,
      impact: n.impact,
      category: n.category,
      date: n.date,
    })),
    [news]
  );

  const updatedTime = useMemo(() => {
    if (!dataUpdatedAt) return "";
    return new Date(dataUpdatedAt).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
  }, [dataUpdatedAt]);

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-secondary rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-secondary/60 rounded-xl border border-border" />
          ))}
        </div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5 text-center">
        <Newspaper className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No live news available right now.</p>
        <button onClick={() => refetch()} className="mt-2 text-xs text-primary hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Newspaper className="w-5 h-5 text-accent" />
            <h3 className="text-base font-bold tracking-tight">Malaysian Food Price News</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40">
              <Wifi className="w-2.5 h-2.5 animate-pulse" /> {news.length} Live
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Live feeds from Google News, Bernama, The Star, FMT &amp; Malay Mail
            {updatedTime && <span className="ml-1">· Updated {updatedTime}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground border border-border rounded-full px-2.5 py-1">
            <AlertCircle className="w-3 h-3" />
            {news.length} signals
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-40"
            title="Refresh news"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* AI Market Brief */}
      {aiHeadlines.length > 0 && <AIMarketBrief headlines={aiHeadlines} />}

      {/* Live ticker */}
      <HeadlineTicker items={news} />

      {/* Sentiment bar */}
      <SentimentBar items={news} />

      {/* News cards */}
      <div className="space-y-3">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center mt-4 pt-3 border-t border-border/40">
        All {news.length} articles sourced live from Google News, Bernama, The Star, FMT &amp; Malay Mail
        {" "}· Click any headline to read the full article
      </p>
    </div>
  );
}
