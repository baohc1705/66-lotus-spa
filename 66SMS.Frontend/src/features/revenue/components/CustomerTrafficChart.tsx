import { memo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCustomerTraffic } from "../hooks/useRevenueDashboard";

type Tab = "hour" | "day" | "date";
const TABS: { key: Tab; label: string }[] = [
  { key: "hour", label: "Theo giờ" },
  { key: "day", label: "Theo ngày" },
  { key: "date", label: "Theo thứ" },
];

interface Props {
  salonId: number | null;
  from: string;
  to: string;
}

export const CustomerTrafficChart = memo(function CustomerTrafficChart({
  salonId,
  from,
  to,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("hour");
  const { data, isLoading } = useCustomerTraffic(salonId, activeTab, from, to);
  const chartData = data?.data ?? [];

  return (
    <div className="bg-white border border-stone-100 rounded-admin p-5 flex flex-col h-[280px]">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="text-lotus-admin-lg font-bold text-stone-800">
          Lượng khách hàng
        </span>
        <div className="flex bg-stone-100 p-0.5 rounded-[6px]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-2.5 py-1 text-lotus-admin-xs font-semibold rounded-[4px] transition-all ${
                activeTab === t.key
                  ? "bg-white text-stone-800 shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-lotus-leaf border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" debounce={1}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3e7a3e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3e7a3e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                formatter={(v: unknown) => [Number(v), "Lượt khách"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3e7a3e"
                strokeWidth={1.5}
                fill="url(#trafficGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});
