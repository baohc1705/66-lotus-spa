import { Clock, CalendarCheck, History } from "lucide-react";
import { Badge } from "@/shared/elements/Badge";
import {
  TableDetailExpanded,
  TableDetailHeader,
} from "@/shared/tables/TableDetailExpanded";
import { formatDisplayDate, toLocalTimeOnly } from "@/shared/utils/date.utils";
import type { ShiftDTO } from "../types/shift.types";

interface ShiftDetailExpandedProps {
  shift: ShiftDTO;
}

export function ShiftDetailExpanded({ shift }: ShiftDetailExpandedProps) {
  const periods = [...(shift.shiftPeriodDTOs || [])].sort((a, b) => {
    const dateA = a.effectiveFrom ? new Date(a.effectiveFrom).getTime() : 0;
    const dateB = b.effectiveFrom ? new Date(b.effectiveFrom).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <TableDetailExpanded>
      <TableDetailHeader
        icon={<Clock className="h-5 w-5 text-kit-primary" />}
        title={shift.name ?? "Ca làm việc"}
        subtitle={shift.description || "Không có mô tả cho ca làm việc này."}
      />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-kit-muted" />
          <h4 className="text-sm font-semibold text-kit-heading">
            Lịch sử thời gian áp dụng
          </h4>
        </div>

        {periods.length === 0 ? (
          <p className="text-sm text-kit-muted">Chưa có dữ liệu thời gian.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {periods.map((period, index) => {
              const isActive = !period.effectiveTo;
              const fromDate = period.effectiveFrom
                ? formatDisplayDate(period.effectiveFrom)
                : "—";
              const toDate = period.effectiveTo
                ? formatDisplayDate(period.effectiveTo)
                : "Vô thời hạn";
              const startTime = toLocalTimeOnly(period.shiftStart) || "—";
              const endTime = toLocalTimeOnly(period.shiftEnd) || "—";

              return (
                <div
                  key={period.id ?? index}
                  className={
                    "relative rounded-lg border p-3 " +
                    (isActive
                      ? "border-kit-primary/40 bg-kit-page"
                      : "border-kit bg-kit-white")
                  }
                >
                  {isActive ? (
                    <div className="absolute -top-2 right-2">
                      <Badge variant="success" soft pill>
                        Đang áp dụng
                      </Badge>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-kit-heading">
                      <Clock className="h-4 w-4 text-kit-muted" />
                      {startTime} - {endTime}
                    </div>

                    <div className="h-px w-full bg-kit" />

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-xs text-kit-muted">
                        <CalendarCheck className="h-3.5 w-3.5 opacity-70" />
                        <span>
                          Áp dụng từ:{" "}
                          <span className="font-medium text-kit-heading">
                            {fromDate}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-kit-muted">
                        <CalendarCheck className="h-3.5 w-3.5 opacity-70" />
                        <span>
                          Kết thúc:{" "}
                          <span className="font-medium text-kit-heading">
                            {toDate}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TableDetailExpanded>
  );
}
