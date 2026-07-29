import { memo } from "react";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";
import { Banknote, Info } from "lucide-react";
import { formatCurrency } from "@/shared/utils/currency";
import type { TodaySummaryDto } from "../types/revenue.types";

interface Props {
  data?: TodaySummaryDto["cash"];
  isLoading: boolean;
}

export const TodayCashSummaryCard = memo(function TodayCashSummaryCard({
  data,
  isLoading,
}: Props) {
  if (isLoading || !data) {
    return (
      <div className="bg-white border border-adminGray-100 rounded-admin p-5 animate-pulse h-[160px]">
        <div className="h-4 w-32 bg-adminGray-100 rounded mb-3" />
        <div className="h-8 w-36 bg-adminGray-100 rounded mb-2" />
        <div className="h-3 w-28 bg-adminGray-100 rounded" />
      </div>
    );
  }

  const barData = [
    { label: "Thu", value: data.grossRevenue, fill: "var(--admin-green-600)" },
    { label: "Chi", value: data.cashOut, fill: "var(--state-danger-solid)" },
  ];

  return (
    <div className="bg-white border border-adminGray-100 rounded-admin p-5 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs text-adminGray-400 font-semibold">
        <Banknote className="w-3.5 h-3.5" />
        Thu chi hôm nay
        <Info className="w-3 h-3 ml-auto text-adminGray-300" />
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-xl font-bold text-adminInk leading-tight">
            {formatCurrency(data.grossRevenue)}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-2xs">
              <span className="w-2 h-2 rounded-full shrink-0 bg-adminGreen-600" />
              <span className="text-adminGray-600">Tổng thu</span>
              <span className="font-bold text-adminInk ml-1">
                {formatCurrency(data.grossRevenue)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-2xs">
              <span className="w-2 h-2 rounded-full shrink-0 bg-state-danger-solid" />
              <span className="text-adminGray-600">Tổng chi</span>
              <span className="font-bold text-adminInk ml-1">
                {formatCurrency(data.cashOut)}
              </span>
            </div>
          </div>
        </div>

        <div className="w-[64px] h-[64px] shrink-0">
          <ResponsiveContainer width="100%" height="100%" debounce={1}>
            <BarChart
              data={barData}
              barSize={20}
              margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
            >
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {barData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});
