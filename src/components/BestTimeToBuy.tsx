import { useMemo } from "react";
import { Calendar, CheckCircle } from "lucide-react";
import type { ItemForecast } from "@/lib/pricecatcher";

interface Props {
  forecast: ItemForecast;
  itemName: string;
}

export function BestTimeToBuy({ forecast, itemName }: Props) {
  const days = useMemo(() => {
    const fc = forecast.forecast.slice(0, 7);
    const base = forecast.last_price;
    if (!base || fc.length === 0) return [];

    return fc.map((p) => {
      const pctDiff = ((p.price - base) / base) * 100;
      const d = new Date(p.date);
      const dayName = d.toLocaleDateString("en-MY", { weekday: "short" });
      const dayNum = d.getDate();
      let color: "green" | "amber" | "red" = "amber";
      if (pctDiff < -1) color = "green";
      else if (pctDiff > 1) color = "red";
      return { date: p.date, dayName, dayNum, price: p.price, pctDiff, color };
    });
  }, [forecast]);

  const bestDay = useMemo(() => {
    if (days.length === 0) return null;
    return days.reduce((best, d) => (d.price < best.price ? d : best), days[0]);
  }, [days]);

  if (days.length === 0) return null;

  const colorMap = {
    green: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
    amber: "bg-amber-500/20 border-amber-500/40 text-amber-400",
    red: "bg-red-500/20 border-red-500/40 text-red-400",
  };

  return (
    <div className="glass-card rounded-xl p-5 mt-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-accent" /> Best Time to Buy
      </h3>

      <div className="grid grid-cols-7 gap-2 mb-3">
        {days.map((d, i) => (
          <div
            key={i}
            className={`rounded-lg border p-2 text-center transition-all ${colorMap[d.color]} ${
              bestDay?.date === d.date ? "ring-2 ring-emerald-400/50 scale-105" : ""
            }`}
          >
            <p className="text-[10px] font-semibold uppercase">{d.dayName}</p>
            <p className="text-xs font-mono font-bold mt-0.5">{d.dayNum}</p>
            <p className="text-[10px] font-mono mt-1">RM{d.price.toFixed(2)}</p>
            {bestDay?.date === d.date && (
              <CheckCircle className="w-3 h-3 mx-auto mt-1 text-emerald-400" />
            )}
          </div>
        ))}
      </div>

      {bestDay && (
        <p className="text-sm text-muted-foreground">
          <span className="text-emerald-400 font-semibold">Best day</span> to buy{" "}
          <span className="font-semibold text-foreground">{itemName}</span>:{" "}
          <span className="font-mono font-bold text-foreground">
            {new Date(bestDay.date).toLocaleDateString("en-MY", { weekday: "long" })}
          </span>{" "}
          (forecast <span className="font-mono text-emerald-400">RM {bestDay.price.toFixed(2)}</span>)
        </p>
      )}
    </div>
  );
}
