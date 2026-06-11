import { useState } from "react";
import { Plus } from "lucide-react";
import type {
  ShiftDTO,
  ShiftPeriodDTO,
} from "@/features/shifts/types/shift.types";
import type { WorkScheduleDTO } from "../types/schedule.types";
import { AddEmployeeDialog } from "./AddStaffDialog";
import { useUpdateWorkSchedule } from "../hooks/useSchedules";
import { toast } from "sonner";
import { formatDate, DateUtil } from "@/shared/utils/date.utils";

interface ScheduleTableProps {
  shifts: ShiftDTO[];
  workSchedules: WorkScheduleDTO[];
  weekStart: DateUtil;
  canEdit?: boolean;
}

export function ScheduleTable({
  shifts,
  workSchedules,
  weekStart,
  canEdit = true,
}: ScheduleTableProps) {
  const [addingShift, setAddingShift] = useState<{
    shift: ShiftDTO;
    shiftPeriod: ShiftPeriodDTO;
    date: string;
  } | null>(null);

  const { mutate: updateWorkSchedule } = useUpdateWorkSchedule();

  const days = Array.from({ length: 7 }).map((_, i) => weekStart.add(i, "day"));
  const today = formatDate().startOf("day");

  const getDayName = (day: DateUtil) => {
    const names = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ];
    return names[day.day()];
  };

  // Group work schedules
  // Key = {shiftPeriodId}_{date}
  const shiftDayMap = new Map<string, WorkScheduleDTO[]>();

  workSchedules.forEach((ws) => {
    const dateStr = formatDate(ws.workDate).format("YYYY-MM-DD");
    const key = `${ws.shiftPeriodId}_${dateStr}`;
    const existing = shiftDayMap.get(key) || [];
    shiftDayMap.set(key, [...existing, ws]);
  });

  // Flat list of all active shift periods across all shifts
  // Active shift periods are those that overlap with the current week
  const activeShiftPeriods: { shift: ShiftDTO; period: ShiftPeriodDTO }[] = [];

  const weekStartStr = weekStart.format("YYYY-MM-DD");
  const weekEndStr = weekStart.add(6, "day").format("YYYY-MM-DD");

  shifts.forEach((shift) => {
    if (shift.shiftPeriodDTOs) {
      shift.shiftPeriodDTOs.forEach((period) => {
        // Render if period is within the week range or overlaps it
        const from = period.effectiveFrom;
        const to = period.effectiveTo;

        // A period overlaps the week if (from <= weekEnd) AND (to is null OR to >= weekStart)
        if (from && from <= weekEndStr) {
          if (!to || to >= weekStartStr) {
            activeShiftPeriods.push({ shift, period });
          }
        }
      });
    }
  });

  // Handlers for Drag and Drop
  const handleDragStart = (e: React.DragEvent, ws: WorkScheduleDTO) => {
    e.dataTransfer.setData("workScheduleId", ws.id?.toString() || "");
    e.dataTransfer.setData("employeeId", ws.employeeId?.toString() || "");
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent,
    targetPeriodId: number,
    targetDateStr: string,
  ) => {
    e.preventDefault();
    const wsIdStr = e.dataTransfer.getData("workScheduleId");
    const employeeIdStr = e.dataTransfer.getData("employeeId");
    if (!wsIdStr || !employeeIdStr) return;

    const wsId = parseInt(wsIdStr, 10);
    const employeeId = parseInt(employeeIdStr, 10);

    // Call update API
    updateWorkSchedule(
      {
        id: wsId,
        payload: {
          shiftPeriodId: targetPeriodId,
          employeeId: employeeId,
          workDate: targetDateStr,
        },
      },
      {
        onSuccess: (res) => {
          if (res.isSuccess) {
            toast.success("Cập nhật lịch thành công");
          }
        },
      },
    );
  };

  return (
    <>
      <div className="overflow-x-auto border border-stone-200/50 rounded-xl bg-white/70 shadow-sm">
        <table className="w-full text-[13px] text-left table-fixed">
          <thead className="bg-lotus-cream/50 border-b border-stone-200/50">
            <tr>
              <th className="w-48 py-4 px-4 font-semibold text-lotus-deep border-r border-stone-200/50">
                Ca làm việc
              </th>
              {days.map((day, i) => (
                <th
                  key={i}
                  className="py-4 px-2 font-medium text-center border-r border-stone-200/50 last:border-0"
                >
                  <div
                    className={`flex items-center justify-center gap-1 ${
                      day.day() === 0 || day.day() === 6
                        ? "text-lotus-rose"
                        : "text-lotus-deep"
                    }`}
                  >
                    <span>{getDayName(day)}</span>
                    <span className="font-bold">{day.format("DD/MM")}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-200/50">
            {activeShiftPeriods.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-lotus-stone font-medium"
                >
                  Không có ca làm việc nào trong tuần này.
                </td>
              </tr>
            ) : (
              activeShiftPeriods.map(({ shift, period }, index) => (
                <tr key={`${shift.id}_${period.id}_${index}`}>
                  <td className="py-3 px-4 border-r border-stone-200/50 align-top bg-stone-50/30">
                    <div className="font-bold text-lotus-deep">
                      {shift.name}
                    </div>
                    <div className="text-[12px] text-lotus-stone mt-1 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-lotus-cream rounded font-medium text-lotus-deep">
                        {period.shiftStart?.substring(0, 5)}
                      </span>
                      <span>-</span>
                      <span className="px-1.5 py-0.5 bg-lotus-cream rounded font-medium text-lotus-deep">
                        {period.shiftEnd?.substring(0, 5)}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-2">
                      Hiệu lực:{" "}
                      {formatDate(period.effectiveFrom).format("DD/MM/YYYY")} -{" "}
                      {period.effectiveTo
                        ? formatDate(period.effectiveTo).format("DD/MM/YYYY")
                        : "..."}
                    </div>
                  </td>
                  {days.map((day, i) => {
                    const dateStr = day.format("YYYY-MM-DD");

                    // Check if this period is active on this specific date
                    const isPeriodActiveThisDay =
                      period.effectiveFrom &&
                      period.effectiveFrom <= dateStr &&
                      (!period.effectiveTo || period.effectiveTo >= dateStr);

                    if (!isPeriodActiveThisDay) {
                      return (
                        <td
                          key={i}
                          className="py-2 px-2 border-r border-stone-200/50 last:border-0 align-top bg-stone-100/50"
                        >
                          <div className="flex h-full items-center justify-center text-[11px] text-stone-400">
                            Không áp dụng
                          </div>
                        </td>
                      );
                    }

                    const key = `${period.id}_${dateStr}`;
                    const cellSchedules = shiftDayMap.get(key) || [];

                    return (
                      <td
                        key={i}
                        className="py-2 px-2 border-r border-stone-200/50 last:border-0 align-top relative group min-h-[120px] h-[140px] hover:bg-stone-50/50 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, period.id!, dateStr)}
                      >
                        <div className="flex flex-col gap-1.5 h-full">
                          <div className="flex-1 overflow-y-auto space-y-1.5 p-1">
                            {cellSchedules.map((ws) => (
                              <div
                                key={ws.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, ws)}
                                className="px-2.5 py-1.5 bg-white text-lotus-deep rounded-md text-[12px] font-medium border border-stone-200 shadow-sm truncate cursor-grab active:cursor-grabbing hover:border-lotus-gold transition-colors flex items-center justify-between group/item"
                              >
                                <span className="truncate">
                                  {ws.employeeName}
                                </span>
                              </div>
                            ))}
                          </div>

                          {canEdit && !day.isBefore(today) && (
                            <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                              <button
                                onClick={() =>
                                  setAddingShift({
                                    shift,
                                    shiftPeriod: period,
                                    date: dateStr,
                                  })
                                }
                                className="flex items-center gap-1 text-[12px] font-semibold text-lotus-sage hover:text-lotus-deep bg-lotus-cream hover:bg-lotus-cream/80 px-3 py-1.5 rounded-full transition-colors w-full justify-center border border-lotus-sage/20"
                              >
                                <Plus size={12} /> Thêm nhân viên
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {addingShift && (
        <AddEmployeeDialog
          shift={addingShift.shift}
          shiftPeriod={addingShift.shiftPeriod}
          date={addingShift.date}
          onClose={() => setAddingShift(null)}
        />
      )}
    </>
  );
}
