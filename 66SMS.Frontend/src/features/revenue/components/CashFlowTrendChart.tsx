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
      <div className="bg-white border border-adminGray-100 p-3 rounded-admin shadow-sm text-xs font-sans">
        <p className="font-semibold text-adminInk mb-2">{displayDate}</p>
        {payload.map((p, idx) => (
          <div key={idx} className="flex items-center gap-4 justify-between mt-1">
            <span className="flex items-center gap-1.5 text-adminGray-600">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}:
            </span>
            <span className="font-bold text-adminInk">{formatCurrency(p.value)}</span>
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
      <div className="bg-white border border-adminGray-100 rounded-admin p-5 h-[300px] flex flex-col justify-between">
        <div className="h-5 w-32 bg-adminGray-100 rounded animate-pulse" />
        <div className="flex-1 mt-4 bg-adminGray-50 rounded-admin flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-adminGreen-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-adminGray-100 rounded-admin p-5 flex flex-col h-[300px]">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="text-sm font-bold text-adminInk">Dòng tiền</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-2xs">
            <span className="flex items-center gap-1 text-adminGray-600"><span className="w-2.5 h-0.5 bg-adminGreen-600 rounded inline-block" />Dòng tiền vào</span>
            <span className="flex items-center gap-1 text-adminGray-600"><span className="w-2.5 h-0.5 bg-state-danger-solid rounded inline-block" />Dòng tiền ra</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 text-2xs">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-adminGray-600">
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
                  <stop offset="5%" stopColor="var(--admin-green-600)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--admin-green-600)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCashOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--state-danger-solid)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--state-danger-solid)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-gray-100)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDateXAxis}
                tickLine={false} 
                axisLine={false} 
                stroke="var(--admin-gray-400)"
              />
              <YAxis 
                tickFormatter={(v) => v >= 1000000 ? `${v / 1000000}M` : v}
                tickLine={false} 
                axisLine={false} 
                stroke="var(--admin-gray-400)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                name="Dòng tiền vào"
                type="monotone"
                dataKey="cashIn"
                stroke="var(--admin-green-600)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCashIn)"
              />
              <Area
                name="Dòng tiền ra"
                type="monotone"
                dataKey="cashOut"
                stroke="var(--state-danger-solid)"
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

