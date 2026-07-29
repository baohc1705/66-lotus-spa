import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/shared/utils/currency";
import type { TopStaffDto } from "../types/revenue.types";

interface Props {
  data?: TopStaffDto[];
  isLoading: boolean;
}

type StaffTab = "revenue" | "quantity" | "commission";
const TABS: { key: StaffTab; label: string }[] = [
  { key: "revenue", label: "Doanh thu" },
  { key: "quantity", label: "Số lượng" },
  { key: "commission", label: "Hoa hồng" },
];

function StaffAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("");
  return (
    <div className="w-7 h-7 rounded-full bg-adminGreen-100 flex items-center justify-center shrink-0">
      <span className="text-2xs font-bold text-adminGreen-600">{initials}</span>
    </div>
  );
}

export const TopStaffTable = memo(function TopStaffTable({
  data = [],
  isLoading,
}: Props) {
  const [activeTab, setActiveTab] = useState<StaffTab>("revenue");

  const getMetric = (s: TopStaffDto): number => {
    if (activeTab === "quantity") return s.quantity;
    if (activeTab === "commission") return s.commission;
    return s.revenue;
  };

  const formatMetric = (s: TopStaffDto): string => {
    if (activeTab === "quantity") return `${s.quantity} lượt`;
    if (activeTab === "commission") return formatCurrency(s.commission);
    return formatCurrency(s.revenue);
  };

  const sorted = [...data].sort((a, b) => getMetric(b) - getMetric(a));

  if (isLoading) {
    return (
      <div className="bg-white border border-adminGray-100 rounded-admin p-5 h-[340px] flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-40 bg-adminGray-100 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-full bg-adminGray-100 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-adminGray-100 rounded-admin p-5 flex flex-col h-[340px]">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="text-sm font-bold text-adminInk">
          Top nhân viên xuất sắc
        </span>
        <div className="flex items-center gap-2">
          <div className="flex bg-adminGray-100 p-0.5 rounded-[6px]">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-2 py-0.5 text-2xs font-semibold rounded-[4px] transition-all ${
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
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {sorted.length === 0 ? (
          <div className="h-full flex items-center justify-center text-adminGray-400 text-xs">
            Chưa có dữ liệu
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-adminGray-100 text-adminGray-400 text-2xs font-semibold uppercase tracking-wider">
                <th className="py-2 font-semibold w-6">#</th>
                <th className="py-2 font-semibold">Nhân viên</th>
                <th className="py-2 font-semibold text-right">Doanh thu</th>
                <th className="py-2 font-semibold text-right pr-1">
                  Tăng trưởng
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, idx) => (
                <tr
                  key={s.staffId}
                  className="border-b border-adminGray-50 hover:bg-adminGray-50/50 transition-colors"
                >
                  <td className="py-2.5 text-adminGray-400 font-bold">
                    {idx + 1}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <StaffAvatar name={s.staffName} />
                      <span className="font-semibold text-adminInk truncate max-w-[110px]">
                        {s.staffName}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-bold text-adminInk">
                    {formatMetric(s)}
                  </td>
                  <td className="py-2.5 text-right pr-1">
                    <span className="inline-flex items-center gap-0.5 text-adminGreen-600 font-bold text-2xs">
                      <ArrowUpRight className="w-3 h-3" />+{s.growthPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border-t border-adminGray-100 mt-2 pt-2 shrink-0">
        <Link
          to="/admin/staff"
          className="flex items-center justify-center gap-1 text-xs text-adminGray-400 hover:text-adminGreen-600 font-semibold transition-colors"
        >
          Xem tất cả
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
});
