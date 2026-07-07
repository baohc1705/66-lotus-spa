import { memo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, CalendarCheck } from "lucide-react";
import type { TodaySummaryDto } from "../types/revenue.types";

interface Props {
  data?: TodaySummaryDto["appointments"];
  isLoading: boolean;
}

export const TodayAppointmentsCard = memo(function TodayAppointmentsCard({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="bg-white border border-stone-100 rounded-admin p-5 animate-pulse h-[160px]">
        <div className="h-4 w-32 bg-stone-100 rounded mb-3" />
        <div className="h-8 w-16 bg-stone-100 rounded mb-2" />
        <div className="h-3 w-24 bg-stone-100 rounded" />
      </div>
    );
  }

  const remaining = 100 - data.completionRate;
  const donutData = [
    { value: data.completionRate },
    { value: remaining > 0 ? remaining : 0 },
  ];
  const isPositive = data.changeVsYesterday >= 0;

  return (
    <div className="bg-white border border-stone-100 rounded-admin p-5 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-lotus-admin-md text-stone-400 font-semibold">
        <CalendarCheck className="w-3.5 h-3.5" />
        Lịch hẹn hôm nay
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-4xl font-bold text-stone-800 leading-none">{data.total}</div>
          <div className={`flex items-center gap-1 mt-2 text-lotus-admin-md font-semibold ${isPositive ? "text-lotus-leaf" : "text-lotus-rose"}`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{Math.abs(data.changeVsYesterday)}%</span>
            <span className="text-stone-400 font-normal ml-1">So với hôm qua</span>
          </div>
        </div>

        <div className="relative w-[72px] h-[72px] shrink-0">
          <ResponsiveContainer width="100%" height="100%" debounce={1}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={24}
                outerRadius={34}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill="var(--lotus-leaf)" />
                <Cell fill="#f1f5f9" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lotus-admin-xs font-bold text-stone-700 leading-none">{data.completionRate}%</span>
            <span className="text-lotus-admin-xs text-stone-400 leading-none mt-0.5">HT</span>
          </div>
        </div>
      </div>
    </div>
  );
});

