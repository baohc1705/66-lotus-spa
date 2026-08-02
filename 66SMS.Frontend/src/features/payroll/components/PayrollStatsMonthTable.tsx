import { formatCurrency } from "@/shared/utils/currency";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { CalendarHeart } from "lucide-react";
import type {
  PayrollCommissionDailyDto,
  PayrollCommissionDailySummaryDto,
} from "../types/payroll.types";

interface PayrollStatsMonthTableProps {
  dailyStats: PayrollCommissionDailyDto[];
  summary: PayrollCommissionDailySummaryDto | undefined;
  onDayClick?: (workDate: string) => void;
}

function formatHours(hours: number): string {
  if (!hours || hours <= 0) return "0 giờ";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

export function PayrollStatsMonthTable({
  dailyStats,
  summary,
  onDayClick,
}: PayrollStatsMonthTableProps) {
  if (dailyStats.length === 0) {
    return (
      <TableEmptyState
        icon={CalendarHeart}
        title="Chưa có lịch hẹn đã thanh toán"
        hint="Không có hóa đơn paid trong tháng này."
      />
    );
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-adminGray-50 sticky top-0 z-10 border-b border-adminGray-100">
          <tr className="text-left text-xs text-adminGray-600">
            <th className="px-4 py-2.5 font-semibold">Ngày</th>
            <th className="px-4 py-2.5 font-semibold text-right">
              Tổng đơn hàng
            </th>
            <th className="px-4 py-2.5 font-semibold text-right">
              Tổng giờ phục vụ
            </th>
            <th className="px-4 py-2.5 font-semibold text-right">
              Tổng hoa hồng
            </th>
          </tr>
        </thead>
        <tbody>
          {dailyStats.map((day: PayrollCommissionDailyDto) => (
            <tr
              key={day.workDate}
              className={`border-b border-adminGray-100 transition-colors ${
                onDayClick
                  ? "hover:bg-adminGray-50/70 cursor-pointer"
                  : "hover:bg-adminGray-50/40"
              }`}
              onClick={() => onDayClick?.(day.workDate)}
            >
              <td className="px-4 py-2.5 whitespace-nowrap font-medium text-adminInk">
                {day.workDate}
              </td>
              <td className="px-4 py-2.5 text-right text-adminGray-600">
                {day.orderCount}
              </td>
              <td className="px-4 py-2.5 text-right text-adminGray-600">
                {formatHours(day.serviceHours)}
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-primary">
                {formatCurrency(day.totalCommission)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-adminGray-50 border-t border-adminGray-100">
          <tr className="text-xs font-semibold text-adminInk">
            <td className="px-4 py-2.5">{dailyStats.length} ngày</td>
            <td className="px-4 py-2.5 text-right">
              {summary?.totalOrders ?? 0} đơn
            </td>
            <td className="px-4 py-2.5 text-right">
              {formatHours(summary?.totalServiceHours ?? 0)}
            </td>
            <td className="px-4 py-2.5 text-right text-primary">
              {formatCurrency(summary?.totalCommission ?? 0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
