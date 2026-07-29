import { memo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/shared/utils/currency";
import type { RevenueBreakdownItemDto } from "../types/revenue.types";

interface RevenueByItemTypeChartProps {
  data?: RevenueBreakdownItemDto[];
  isLoading: boolean;
}

const COLORS = [
  "var(--admin-green-600)",
  "var(--admin-gold-600)",
  "var(--admin-green-200)",
];  

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color?: string;
    payload: {
      label: string;
      amount: number;
      percent: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = payload[0].color ?? "var(--admin-green-600)";
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-adminGray-100/50 p-2.5 rounded-admin shadow-lg text-xs font-sans">
        <p className="font-semibold text-adminInk flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          {data.label}
        </p>
        <p className="font-bold text-adminInk mt-1 ml-3.5">
          {formatCurrency(data.amount)} ({data.percent}%)
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueByItemTypeChart = memo(function RevenueByItemTypeChart({
  data = [],
  isLoading,
}: RevenueByItemTypeChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-adminGray-100 rounded-admin p-5 h-[300px] flex flex-col justify-between">
        <div className="h-5 w-40 bg-adminGray-100 rounded animate-pulse" />
        <div className="flex-1 mt-4 bg-adminGray-50 rounded-admin flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-adminGreen-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-adminGray-100 rounded-admin p-5 flex flex-col h-[300px]">
      <div className="mb-3">
        <span className="text-sm font-bold text-adminInk">
          Cơ cấu doanh thu
        </span>
      </div>

      <div className="flex-1 flex items-center min-h-0 text-2xs">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-adminGray-600">
            Chưa có dữ liệu
          </div>
        ) : (
          <>
            <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] shrink-0">
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={55}
                    paddingAngle={3}
                  >
                    {data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 flex flex-col gap-3 pl-6 font-sans">
              {data.map((item, index) => (
                <div key={item.itemType} className="flex flex-col">
                  <div className="flex items-center gap-1.5 justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="font-bold text-adminInk text-xs">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-semibold text-adminGray-400 text-2xs">
                      {item.percent}%
                    </span>
                  </div>
                  <span className="text-xs font-bold text-adminInk pl-3.5 mt-0.5">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
});
