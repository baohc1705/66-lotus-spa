import { useState, memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNetRevenue } from "../hooks/useRevenueDashboard";
import { formatCurrency } from "@/shared/utils/currency";

type Tab = "hour" | "day" | "date";
const TABS: { key: Tab; label: string }[] = [
  { key: "hour", label: "Theo giờ" },
  { key: "day", label: "Theo thứ" },
  { key: "date", label: "Theo ngày" },
];

interface Props {
  salonId: number | null;
  from: string;
  to: string;
}

export const NetRevenueBarChart = memo(function NetRevenueBarChart({
  salonId,
  from,
  to,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("date");
  const { data, isLoading } = useNetRevenue(salonId, activeTab, from, to);
  const chartData = data?.data ?? [];

  return (
    <div className="bg-white border border-adminGray-100 rounded-admin p-5 flex flex-col h-[280px]">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="text-sm font-bold text-adminInk">Doanh thu thuần</span>
        <div className="flex bg-adminGray-100 p-0.5 rounded-[6px]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-2.5 py-1 text-2xs font-semibold rounded-[4px] transition-all ${
                activeTab === t.key
                  ? "bg-white text-adminInk shadow-sm"
                  : "text-adminGray-400 hover:text-adminGray-600"
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
            <div className="h-5 w-5 border-2 border-adminGreen-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" debounce={1}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
              barSize={activeTab === "hour" ? 10 : 18}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--admin-gray-50)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--admin-gray-400)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--admin-gray-400)" }}
                tickFormatter={(v: unknown) => {
                  const val = Number(v);
                  return val >= 1000000
                    ? `${(val / 1000000).toFixed(0)}M`
                    : `${val}`;
                }}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                formatter={(v: unknown) => [
                  formatCurrency(Number(v)),
                  "Doanh thu thuần",
                ]}
              />
              <Bar
                dataKey="value"
                fill="var(--admin-green-600)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});
