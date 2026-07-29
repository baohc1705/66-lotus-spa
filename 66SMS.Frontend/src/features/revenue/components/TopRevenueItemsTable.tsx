import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/shared/utils/currency";
import type { TopRevenueItemDto } from "../types/revenue.types";

interface TopRevenueItemsTableProps {
  services?: TopRevenueItemDto[];
  products?: TopRevenueItemDto[];
  isLoading: boolean;
}

type ItemTab = "service" | "product";
const TABS: { key: ItemTab; label: string }[] = [
  { key: "service", label: "Dịch vụ" },
  { key: "product", label: "Sản phẩm" },
];

export const TopRevenueItemsTable = memo(function TopRevenueItemsTable({
  services = [],
  products = [],
  isLoading,
}: TopRevenueItemsTableProps) {
  const [activeTab, setActiveTab] = useState<ItemTab>("service");
  const items = activeTab === "service" ? services : products;

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
          Top 5 hàng hoá bán chạy
        </span>
        <div className="flex bg-adminGray-100 p-0.5 rounded-[6px]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-2.5 py-0.5 text-2xs font-semibold rounded-[4px] transition-all ${
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

      <div className="flex-1 overflow-auto min-h-0">
        {items.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-adminGray-400 text-xs">
            Chưa có dữ liệu trong kỳ
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-adminGray-100 text-adminGray-400 font-semibold uppercase tracking-wider text-2xs">
                <th className="py-2 font-semibold w-6">#</th>
                <th className="py-2 font-semibold">Tên</th>
                <th className="py-2 text-right font-semibold w-12">SL</th>
                <th className="py-2 text-right font-semibold w-28">
                  Doanh thu
                </th>
                <th className="py-2 text-right font-semibold w-10 pr-1">%</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.itemId}
                  className="border-b border-adminGray-50 hover:bg-adminGray-50/50 transition-colors"
                >
                  <td className="py-2.5 text-adminGray-400 font-bold">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 font-semibold text-adminInk max-w-[150px] truncate">
                    {item.itemName}
                  </td>
                  <td className="py-2.5 text-right text-adminGray-600">
                    {item.quantity.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2.5 text-right font-bold text-adminInk">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="py-2.5 text-right text-adminGray-400 pr-1 text-2xs">
                    {item.percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border-t border-adminGray-100 mt-2 pt-2 shrink-0">
        <Link
          to="/admin/services"
          className="flex items-center justify-center gap-1 text-xs text-adminGray-400 hover:text-adminGreen-600 font-semibold transition-colors"
        >
          Xem tất cả
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
});
