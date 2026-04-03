import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Line,
} from "recharts";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { usePriceHistory } from "@/hooks/usePriceCatcher";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";

// All months in the data window (full year Mar 2025 – Mar 2026)
const ALL_MONTHS = [
  "2025-03", "2025-04", "2025-05", "2025-06",
  "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
  "2026-01", "2026-02", "2026-03",
];

const MONTH_LABELS: Record<string, string> = {
  "2025-03": "Mar '25", "2025-04": "Apr '25", "2025-05": "May '25", "2025-06": "Jun '25",
  "2025-07": "Jul '25", "2025-08": "Aug '25", "2025-09": "Sep '25",
  "2025-10": "Oct '25", "2025-11": "Nov '25", "2025-12": "Dec '25",
  "2026-01": "Jan '26", "2026-02": "Feb '26", "2026-03": "Mar '26",
};

interface ItemInfo {
  code: number;
  name: string;
  unit: string;
  category: string;
  price: number;
  min: number;
  max: number;
  changePct: number | null;
}

export function ItemPriceModal({ item, onClose }: { item: ItemInfo; onClose: () => void }) {
  const { data: history, isLoading } = usePriceHistory();

  const chartData = useMemo(() => {
    if (!history) return [];
    const itemHistory = history[String(item.code)];
    if (!itemHistory) return [];
    return ALL_MONTHS
      .filter((m) => itemHistory[m] && itemHistory[m].n > 0)
      .map((m) => ({
        month: MONTH_LABELS[m],
        avg: itemHistory[m].avg,
        min: itemHistory[m].min,
        max: itemHistory[m].max,
        records: itemHistory[m].n,
      }));
  }, [history, item.code]);

  const priceChange = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].avg;
    const last = chartData[chartData.length - 1].avg;
    const change = ((last - first) / first) * 100;
    return { change: Math.round(change * 100) / 100, first, last };
  }, [chartData]);

  const up = (item.changePct ?? 0) > 0;
  const down = (item.changePct ?? 0) < 0;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-white px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-[11px] font-black text-primary shrink-0">
                {item.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
              </div>
              <h2 className="text-lg font-black tracking-tight text-gray-900">{item.name}</h2>
            </div>
            <p className="text-sm text-gray-400">{item.category} · {item.unit}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black font-mono text-gray-900">{formatCurrency(item.price)}</p>
            {item.changePct !== null && (
              <p className={`text-sm font-bold flex items-center justify-end gap-0.5 ${up ? "text-red-500" : down ? "text-emerald-600" : "text-gray-400"}`}>
                {up ? <TrendingUp className="h-3.5 w-3.5" /> : down ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                {formatPercent(item.changePct)} vs last month
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-xl p-3 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close item details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Mini KPI row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-gray-50 p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Current Avg</p>
              <p className="text-lg font-black font-mono text-gray-900">{formatCurrency(item.price)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Lowest recorded</p>
              <p className="text-lg font-black font-mono text-emerald-600">{formatCurrency(item.min)}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Highest recorded</p>
              <p className="text-lg font-black font-mono text-red-500">{formatCurrency(item.max)}</p>
            </div>
          </div>

          {/* Chart */}
          {isLoading ? (
            <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
          ) : chartData.length === 0 ? (
            <div className="h-32 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">
              No historical price data for this item
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">Price History</p>
                {priceChange && (
                  <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${
                    priceChange.change > 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {priceChange.change > 0 ? "+" : ""}{priceChange.change}% overall
                  </span>
                )}
              </div>
              <div className="h-48 md:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="modalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1558E0" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#1558E0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `RM${Math.round(v)}`} domain={["auto", "auto"]} width={50} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "12px" }}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = { avg: "Average", min: "Min", max: "Max" };
                        return [formatCurrency(value), labels[name] ?? name];
                      }}
                    />
                    <Legend formatter={(value) => ({ avg: "Average", min: "Min", max: "Max" }[value] ?? value)} />
                    <Area type="monotone" dataKey="avg" stroke="#1558E0" strokeWidth={2.5} fill="url(#modalGradient)" dot={{ r: 4, fill: "#1558E0" }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="min" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Monthly table */}
          {chartData.length > 0 && (
            <div className="rounded-2xl border border-gray-100 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Month", "Avg Price", "Min", "Max", "Records", "MoM"].map((h) => (
                      <th key={h} className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right first:text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {chartData.map((row, idx) => {
                    const prev = idx > 0 ? chartData[idx - 1].avg : null;
                    const change = prev ? ((row.avg - prev) / prev) * 100 : null;
                    return (
                      <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-semibold text-gray-700">{row.month}</td>
                        <td className="py-3 px-4 text-sm font-mono font-bold text-primary text-right">{formatCurrency(row.avg)}</td>
                        <td className="py-3 px-4 text-sm font-mono text-emerald-600 text-right">{formatCurrency(row.min)}</td>
                        <td className="py-3 px-4 text-sm font-mono text-red-500 text-right">{formatCurrency(row.max)}</td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-400 text-right">{formatNumber(row.records)}</td>
                        <td className={`py-3 px-4 text-sm font-mono font-bold text-right ${
                          change === null ? "text-gray-300"
                          : change > 0 ? "text-red-500" : change < 0 ? "text-emerald-600" : "text-gray-400"
                        }`}>
                          {change === null ? "—" : formatPercent(change)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
