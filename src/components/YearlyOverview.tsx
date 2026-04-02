import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingDown, TrendingUp, Minus, BarChart3 } from "lucide-react";

interface MonthlyData {
  month: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  records: number;
}

function fetchYearlyOverview() {
  return fetch("/data/yearly_overview.json").then((r) => r.json()) as Promise<MonthlyData[]>;
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

function shortMonth(m: string) {
  const [year, mon] = m.split("-");
  return `${MONTH_LABELS[mon]} '${year.slice(2)}`;
}

export function YearlyOverview() {
  const { data, isLoading } = useQuery<MonthlyData[]>({
    queryKey: ["yearly-overview"],
    queryFn: fetchYearlyOverview,
    staleTime: Infinity,
  });

  const stats = useMemo(() => {
    if (!data || data.length < 2) return null;
    const first = data[0];
    const last = data[data.length - 1];
    const overallAvg = data.reduce((s, d) => s + d.avg_price, 0) / data.length;
    const changePct = ((last.avg_price - first.avg_price) / first.avg_price) * 100;
    const totalRecords = data.reduce((s, d) => s + d.records, 0);
    const highMonth = data.reduce((a, b) => (b.avg_price > a.avg_price ? b : a));
    const lowMonth = data.reduce((a, b) => (b.avg_price < a.avg_price ? b : a));
    return { overallAvg, changePct, totalRecords, highMonth, lowMonth, first, last };
  }, [data]);

  if (isLoading || !data || !stats) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-gray-100 rounded mb-4" />
        <div className="h-64 bg-gray-50 rounded-xl" />
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: shortMonth(d.month),
  }));

  const isDown = stats.changePct < 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-900">1-Year Price Overview</h2>
          </div>
          <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded px-2 py-0.5">
            Mar '25 – Mar '26
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Average grocery price across all {stats.totalRecords.toLocaleString()} records
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 pb-4">
        <MiniStat label="Overall Avg" value={`RM ${stats.overallAvg.toFixed(2)}`} />
        <MiniStat
          label="YoY Change"
          value={`${isDown ? "" : "+"}${stats.changePct.toFixed(1)}%`}
          color={isDown ? "text-emerald-600" : "text-red-500"}
          icon={isDown ? <TrendingDown className="h-3.5 w-3.5" /> : stats.changePct === 0 ? <Minus className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
        />
        <MiniStat
          label="Peak Month"
          value={`RM ${stats.highMonth.avg_price.toFixed(2)}`}
          sub={shortMonth(stats.highMonth.month)}
        />
        <MiniStat
          label="Lowest Month"
          value={`RM ${stats.lowMonth.avg_price.toFixed(2)}`}
          sub={shortMonth(stats.lowMonth.month)}
          color="text-emerald-600"
        />
      </div>

      {/* Area Chart */}
      <div className="px-4 pb-2">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `RM ${v.toFixed(1)}`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "13px",
              }}
              formatter={(value: number) => [`RM ${value.toFixed(2)}`, "Avg Price"]}
            />
            <Area
              type="monotone"
              dataKey="avg_price"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fill="url(#avgGradient)"
              dot={{ r: 4, fill: "hsl(var(--primary))", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Records bar chart */}
      <div className="px-6 pt-2 pb-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Monthly Data Volume
        </p>
      </div>
      <div className="px-4 pb-6">
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "13px",
              }}
              formatter={(value: number) => [value.toLocaleString(), "Records"]}
            />
            <Bar dataKey="records" fill="hsl(var(--primary))" opacity={0.15} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-1 mt-1">
        {icon && <span className={color}>{icon}</span>}
        <p className={`text-lg font-bold ${color ?? "text-gray-900"}`}>{value}</p>
      </div>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
