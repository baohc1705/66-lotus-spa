import { CalendarHeart } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { formatCurrency } from "@/shared/utils/currency";

import type {
  PayrollCommissionDailyDto,
  PayrollCommissionDailySummaryDto,
} from "../types/payroll.types";

type PayrollStatsMonthTableProps = {
  dailyStats: PayrollCommissionDailyDto[];
  summary: PayrollCommissionDailySummaryDto | undefined;
  onDayClick?: (workDate: string) => void;
};

function formatHours(hours: number): string {
  if (!hours || hours <= 0) return "0 giờ";
  const hourPart = Math.floor(hours);
  const minutePart = Math.round((hours - hourPart) * 60);
  if (hourPart === 0) return `${minutePart} phút`;
  if (minutePart === 0) return `${hourPart} giờ`;
  return `${hourPart} giờ ${minutePart} phút`;
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
      />
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table hover striped bordered={false}>
        <TableHead className="sticky top-0 z-10 bg-kit-page">
          <TableRow>
            <TableHeaderCell>Ngày</TableHeaderCell>
            <TableHeaderCell className="text-right">
              Tổng đơn hàng
            </TableHeaderCell>
            <TableHeaderCell className="text-right">
              Tổng giờ phục vụ
            </TableHeaderCell>
            <TableHeaderCell className="text-right">
              Tổng hoa hồng
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dailyStats.map((day: PayrollCommissionDailyDto) => (
            <TableRow
              key={day.workDate}
              className={onDayClick ? "cursor-pointer" : undefined}
              onClick={() => onDayClick?.(day.workDate)}
            >
              <TableCell className="whitespace-nowrap font-medium text-kit-heading">
                {day.workDate}
              </TableCell>
              <TableCell className="text-right text-kit-muted">
                {day.orderCount}
              </TableCell>
              <TableCell className="text-right text-kit-muted">
                {formatHours(day.serviceHours)}
              </TableCell>
              <TableCell className="text-right font-semibold text-kit-primary">
                {formatCurrency(day.totalCommission)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-kit-page">
            <TableCell className="text-xs font-semibold text-kit-heading">
              {dailyStats.length} ngày
            </TableCell>
            <TableCell className="text-right text-xs font-semibold text-kit-heading">
              {summary?.totalOrders ?? 0} đơn
            </TableCell>
            <TableCell className="text-right text-xs font-semibold text-kit-heading">
              {formatHours(summary?.totalServiceHours ?? 0)}
            </TableCell>
            <TableCell className="text-right text-xs font-semibold text-kit-primary">
              {formatCurrency(summary?.totalCommission ?? 0)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
