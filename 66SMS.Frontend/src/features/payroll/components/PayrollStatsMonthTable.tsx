import { formatCurrency } from "@/shared/utils/currency";
import { TableEmptyState } from "@/shared/components/DataTable/TableEmptyState";
import { CalendarHeart } from "lucide-react";
import type {
  PayrollCommissionAppointmentDto,
  PayrollCommissionSummaryDto,
} from "../types/payroll.types";
import {
  appointmentKey,
  formatSlotTime,
  resolveServiceEndTime,
} from "../utils/payrollStats.utils";

interface PayrollStatsMonthTableProps {
  appointments: PayrollCommissionAppointmentDto[];
  summary: PayrollCommissionSummaryDto | undefined;
  onAppointmentClick: (item: PayrollCommissionAppointmentDto) => void;
}

export function PayrollStatsMonthTable({
  appointments,
  summary,
  onAppointmentClick,
}: PayrollStatsMonthTableProps) {
  if (appointments.length === 0) {
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
            <th className="px-4 py-2.5 font-semibold">Mã LH</th>
            <th className="px-4 py-2.5 font-semibold">Khách</th>
            <th className="px-4 py-2.5 font-semibold">Dịch vụ</th>
            <th className="px-4 py-2.5 font-semibold">Giờ</th>
            <th className="px-4 py-2.5 font-semibold">HĐ</th>
            <th className="px-4 py-2.5 font-semibold text-right">Hoa hồng</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((item: PayrollCommissionAppointmentDto) => {
            const date = item.issuedLocalDate ?? item.appointmentDate ?? "—";
            const start = formatSlotTime(item.slotStartTime);
            const end = resolveServiceEndTime(
              item.slotStartTime,
              item.slotEndTime,
              item.durationMins,
            );
            const timeLabel = start === "--:--" ? "—" : `${start}–${end}`;

            return (
              <tr
                key={appointmentKey(item.appointmentId, item.invoiceId)}
                className="border-b border-adminGray-100 hover:bg-adminGray-50/70 cursor-pointer transition-colors"
                onClick={() => onAppointmentClick(item)}
              >
                <td className="px-4 py-2.5 whitespace-nowrap text-adminGray-600">
                  {date}
                </td>
                <td className="px-4 py-2.5 font-medium text-adminInk">
                  {item.appointmentCode ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-adminInk">
                  {item.customerName ?? "—"}
                </td>
                <td className="px-4 py-2.5 max-w-[220px] truncate text-adminGray-600">
                  {item.serviceName ?? "—"}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-adminGray-600">
                  {timeLabel}
                </td>
                <td className="px-4 py-2.5 text-adminInk">
                  {item.invoiceCode ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-primary">
                  {formatCurrency(item.totalCommission)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-adminGray-50 border-t border-adminGray-100">
          <tr className="text-xs font-semibold text-adminInk">
            <td className="px-4 py-2.5" colSpan={3}>
              Tổng: {summary?.totalAppointments ?? 0} LH /{" "}
              {summary?.totalServices ?? 0} DV
            </td>
            <td className="px-4 py-2.5" colSpan={2}>
              Lương CB tháng: {formatCurrency(summary?.basicSalary ?? 0)}
            </td>
            <td className="px-4 py-2.5 text-right" colSpan={2}>
              HH: {formatCurrency(summary?.totalCommission ?? 0)} · Ước tính:{" "}
              {formatCurrency(summary?.estimatedTotal ?? 0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
