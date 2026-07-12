import { memo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";
import type { TodaySummaryDto } from "../types/revenue.types";

interface Props {
  data?: TodaySummaryDto["customers"];
  isLoading: boolean;
}

const DONUT_COLORS = ["var(--admin-green-600)", "var(--admin-gold-600)", "var(--admin-green-200)"];

export const TodayCustomersCard = memo(function TodayCustomersCard({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="bg-white border border-adminGray-100 rounded-admin p-5 animate-pulse h-[160px]">
        <div className="h-4 w-32 bg-adminGray-100 rounded mb-3" />
        <div className="h-8 w-12 bg-adminGray-100 rounded mb-2" />
        <div className="h-3 w-20 bg-adminGray-100 rounded" />
      </div>
    );
  }

  const donutData = [
    { value: data.newCustomers, label: "Khách mới" },
    { value: data.returning, label: "Khách quen quay lại" },
    { value: data.lapsed, label: "Khách lâu" },
  ].filter((d) => d.value > 0);

  const rows: { label: string; value: number; color: string }[] = [
    { label: "Khách mới", value: data.newCustomers, color: DONUT_COLORS[0] },
    { label: "Khách quen quay lại", value: data.returning, color: DONUT_COLORS[1] },
    { label: "Khách lâu", value: data.lapsed, color: DONUT_COLORS[2] },
  ];

  return (
    <div className="bg-white border border-adminGray-100 rounded-admin p-5 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs text-adminGray-400 font-semibold">
        <Users className="w-3.5 h-3.5" />
        Khách hàng hôm nay
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-4xl font-bold text-adminInk leading-none">{data.total}</div>
          <div className="mt-2 space-y-1">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center gap-1.5 text-2xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                <span className="text-adminGray-600">{r.label}</span>
                <span className="font-bold text-adminInk ml-auto">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-[72px] h-[72px] shrink-0">
          <ResponsiveContainer width="100%" height="100%" debounce={1}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={24}
                outerRadius={34}
                dataKey="value"
                strokeWidth={0}
              >
                {donutData.map((_, idx) => (
                  <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

