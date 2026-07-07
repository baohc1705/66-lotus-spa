import { memo } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { formatCurrency } from "@/shared/utils/currency";
import { formatDate } from "@/shared/utils/date.utils";
import type { CashFlowTrendPointDto } from "../types/revenue.types";

interface CashFlowTrendChartProps {
  data?: CashFlowTrendPointDto[];
  isLoading: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // Format label date to DD/MM/YYYY
    let displayDate = label ?? "";
    try {
      const parts = displayDate.split("-");
      if (parts.length === 3) {
        displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch {
      // fallback
    }

    return (
      <div className="bg-white border border-stone-100 p-3 rounded-admin shadow-sm text-lotus-admin-md font-sans">
        <p className="font-semibold text-stone-700 mb-2">{displayDate}</p>
        {payload.map((p, idx) => (
          <div key={idx} className="flex items-center gap-4 justify-between mt-1">
            <span className="flex items-center gap-1.5 text-stone-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}:
            </span>
            <span className="font-bold text-stone-800">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const formatDateXAxis = (dateStr: string) => {
  return formatDate(dateStr).format("DD/MM");
};

export const CashFlowTrendChart = memo(function CashFlowTrendChart({ data = [], isLoading }: CashFlowTrendChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-stone-100 rounded-admin p-5 h-[300px] flex flex-col justify-between">
        <div className="h-5 w-32 bg-stone-100 rounded animate-pulse" />
        <div className="flex-1 mt-4 bg-stone-50 rounded-admin flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-lotus-leaf border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-100 rounded-admin p-5 flex flex-col h-[300px]">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="text-lotus-admin-lg font-bold text-stone-800">Dòng tiền</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-lotus-admin-xs">
            <span className="flex items-center gap-1 text-stone-500"><span className="w-2.5 h-0.5 bg-lotus-leaf rounded inline-block" />Dòng tiền vào</span>
            <span className="flex items-center gap-1 text-stone-500"><span className="w-2.5 h-0.5 bg-lotus-rose rounded inline-block" />Dòng tiền ra</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 text-lotus-admin-xs">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-lotus-stone">
            Chưa có dữ liệu trong khoảng thời gian này
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" debounce={1}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCashIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3e7a3e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3e7a3e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCashOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDateXAxis}
                tickLine={false} 
                axisLine={false} 
                stroke="#888888"
              />
              <YAxis 
                tickFormatter={(v) => v >= 1000000 ? `${v / 1000000}M` : v}
                tickLine={false} 
                axisLine={false} 
                stroke="#888888"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                name="Dòng tiền vào"
                type="monotone"
                dataKey="cashIn"
                stroke="#3e7a3e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCashIn)"
              />
              <Area
                name="Dòng tiền ra"
                type="monotone"
                dataKey="cashOut"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCashOut)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});

