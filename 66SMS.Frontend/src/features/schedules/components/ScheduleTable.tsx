import { useState } from "react";
import { Plus, Check } from "lucide-react";
import type {
  ShiftDTO,
  ShiftPeriodDTO,
} from "@/features/shifts/types/shift.types";
import type { WorkScheduleDTO } from "../types/schedule.types";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import { AddStaffDialog } from "./AddStaffDialog";
import { useUpdateWorkSchedule } from "../hooks/useSchedules";
import { toast } from "sonner";
import { formatDate, DateUtil } from "@/shared/utils/date.utils";
import { useAuthStore } from "@/features/auth/stores/authStore";

interface ScheduleTableProps {
  shifts: ShiftDTO[];
  staffList: StaffDto[];
  workSchedules: WorkScheduleDTO[];
  weekStart: DateUtil;
  viewMode: "shift" | "staff" | "single";
  selectedStaffId: number | null;
  canEdit?: boolean;
}

export function ScheduleTable({
  shifts,
  staffList,
  workSchedules,
  weekStart,
  viewMode,
  selectedStaffId,
  canEdit = true,
}: ScheduleTableProps) {
  const salonId = useAuthStore((s) => s.getEffectiveSalonId());

  const [addingShift, setAddingShift] = useState<{
    shift: ShiftDTO;
    shiftPeriod: ShiftPeriodDTO;
    date: string;
    defaultStaffId?: number | null;
    existingStaffIds: number[];
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

  // Maps
  const fullMap = new Map<string, WorkScheduleDTO>(); // Key = {shiftPeriodId}_{staffId}_{date}
  const shiftDayMap = new Map<string, WorkScheduleDTO[]>(); // Key = {shiftPeriodId}_{date}
  const staffDayMap = new Map<string, WorkScheduleDTO[]>(); // Key = {staffId}_{date}

  workSchedules.forEach((ws) => {
    const dateStr = formatDate(ws.workDate).format("YYYY-MM-DD");
    
    if (ws.shiftPeriodId && ws.staffId) {
      const keyFull = `${ws.shiftPeriodId}_${ws.staffId}_${dateStr}`;
      fullMap.set(keyFull, ws);

      const keyShift = `${ws.shiftPeriodId}_${dateStr}`;
      const existingShifts = shiftDayMap.get(keyShift) || [];
      shiftDayMap.set(keyShift, [...existingShifts, ws]);

      const keyStaff = `${ws.staffId}_${dateStr}`;
      const existingStaff = staffDayMap.get(keyStaff) || [];
      staffDayMap.set(keyStaff, [...existingStaff, ws]);
    }
  });

  const activeShiftPeriods: { shift: ShiftDTO; period: ShiftPeriodDTO }[] = [];
  const weekStartStr = weekStart.format("YYYY-MM-DD");
  const weekEndStr = weekStart.add(6, "day").format("YYYY-MM-DD");

  shifts.forEach((shift) => {
    if (shift.shiftPeriodDTOs) {
      shift.shiftPeriodDTOs.forEach((period) => {
        const from = period.effectiveFrom;
        const to = period.effectiveTo;

        if (from && from <= weekEndStr) {
          if (!to || to >= weekStartStr) {
            activeShiftPeriods.push({ shift, period });
          }
        }
      });
    }
  });

  // Handlers for Drag and Drop (Only used in Shift View)
  const handleDragStart = (e: React.DragEvent, ws: WorkScheduleDTO) => {
    e.dataTransfer.setData("workScheduleId", ws.id?.toString() || "");
    e.dataTransfer.setData("staffId", ws.staffId?.toString() || "");
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
    const staffIdStr = e.dataTransfer.getData("staffId");
    if (!wsIdStr || !staffIdStr) return;

    const wsId = parseInt(wsIdStr, 10);
    const staffId = parseInt(staffIdStr, 10);

    const key = `${targetPeriodId}_${targetDateStr}`;
    const cellSchedules = shiftDayMap.get(key) || [];
    if (cellSchedules.some((ws) => ws.staffId === staffId)) {
      toast.error("Nhân viên này đã được xếp vào ca này trong cùng ngày.");
      return;
    }

    updateWorkSchedule(
      {
        id: wsId,
        payload: {
          shiftPeriodId: targetPeriodId,
          staffId: staffId,
          workDate: targetDateStr,
          salonId: salonId || undefined,
        },
      },
      {
        onSuccess: (res) => {
          if (res.isSuccess) {
            toast.success("Cập nhật lịch thành công");
          }
        },
      }
    );
  };

  // --- RENDERS ---

  const renderByShift = () => {
    return (
      <tbody className="divide-y divide-stone-200/50">
        {activeShiftPeriods.length === 0 ? (
          <tr>
            <td colSpan={8} className="py-12 text-center text-lotus-stone font-medium">
              Không có ca làm việc nào trong tuần này.
            </td>
          </tr>
        ) : (
          activeShiftPeriods.map(({ shift, period }, index) => (
            <tr key={`${shift.id}_${period.id}_${index}`}>
              <td className="py-3 px-4 border-r border-stone-200/50 align-top bg-stone-50/30">
                <div className="font-bold text-lotus-deep">{shift.name}</div>
                <div className="text-[12px] text-lotus-stone mt-1 flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-lotus-cream rounded font-medium text-lotus-deep">
                    {period.shiftStart?.substring(0, 5)}
                  </span>
                  <span>-</span>
                  <span className="px-1.5 py-0.5 bg-lotus-cream rounded font-medium text-lotus-deep">
                    {period.shiftEnd?.substring(0, 5)}
                  </span>
                </div>
              </td>
              {days.map((day, i) => {
                const dateStr = day.format("YYYY-MM-DD");

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
                            <span className="truncate">{ws.staffName}</span>
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
                                existingStaffIds: cellSchedules.map(ws => ws.staffId).filter((id): id is number => id != null),
                              })
                            }
                            className="flex items-center gap-1 text-[12px] font-semibold text-lotus-leaf hover:text-lotus-deep bg-lotus-cream hover:bg-lotus-cream/80 px-3 py-1.5 rounded-full transition-colors w-full justify-center border border-lotus-leaf/20"
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
    );
  };

  const renderByStaff = () => {
    return (
      <tbody className="divide-y divide-stone-200/50">
        {staffList.length === 0 ? (
          <tr>
            <td colSpan={8} className="py-12 text-center text-lotus-stone font-medium">
              Không có nhân viên nào.
            </td>
          </tr>
        ) : (
          staffList.map((staff) => (
            <tr key={staff.id}>
              <td className="py-3 px-4 border-r border-stone-200/50 align-top bg-stone-50/30">
                <div className="font-bold text-lotus-deep">{staff.fullName}</div>
                <div className="text-[12px] text-lotus-stone mt-1">
                  {staff.code || "Nhân viên"}
                </div>
              </td>
              {days.map((day, i) => {
                const dateStr = day.format("YYYY-MM-DD");
                const key = `${staff.id}_${dateStr}`;
                const cellSchedules = staffDayMap.get(key) || [];

                return (
                  <td
                    key={i}
                    className="py-2 px-2 border-r border-stone-200/50 last:border-0 align-top relative group min-h-[120px] h-[140px] hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="flex flex-col gap-1.5 h-full">
                      <div className="flex-1 overflow-y-auto space-y-1.5 p-1">
                        {cellSchedules.map((ws) => (
                          <div
                            key={ws.id}
                            className="px-2.5 py-1.5 bg-lotus-leaf/10 text-lotus-leaf rounded-md text-[12px] font-medium border border-lotus-leaf/20 shadow-sm truncate"
                            title={ws.shift?.name}
                          >
                            {ws.shift?.name || "Ca làm việc"}
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))
        )}
      </tbody>
    );
  };

  const renderSingleStaff = () => {
    if (!selectedStaffId) {
      return (
        <tbody>
          <tr>
            <td colSpan={8} className="py-12 text-center text-lotus-stone font-medium">
              Vui lòng chọn nhân viên để xem lịch cá nhân.
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="divide-y divide-stone-200/50">
        {activeShiftPeriods.map(({ shift, period }, index) => (
          <tr key={`${shift.id}_${period.id}_${index}`}>
            <td className="py-3 px-4 border-r border-stone-200/50 align-top bg-stone-50/30">
              <div className="font-bold text-lotus-deep">{shift.name}</div>
              <div className="text-[12px] text-lotus-stone mt-1 flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-lotus-cream rounded font-medium text-lotus-deep">
                  {period.shiftStart?.substring(0, 5)}
                </span>
                <span>-</span>
                <span className="px-1.5 py-0.5 bg-lotus-cream rounded font-medium text-lotus-deep">
                  {period.shiftEnd?.substring(0, 5)}
                </span>
              </div>
            </td>
            {days.map((day, i) => {
              const dateStr = day.format("YYYY-MM-DD");
              
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

              const keyFull = `${period.id}_${selectedStaffId}_${dateStr}`;
              const isWorking = fullMap.has(keyFull);

              return (
                <td
                  key={i}
                  className={`py-2 px-2 border-r border-stone-200/50 last:border-0 align-middle text-center min-h-[100px] h-[100px] transition-colors relative group ${
                    isWorking ? "bg-lotus-cream/20" : "hover:bg-stone-50/50"
                  }`}
                >
                  {isWorking ? (
                    <div className="inline-flex flex-col items-center gap-1 text-lotus-leaf animate-in fade-in zoom-in duration-300">
                      <div className="p-1.5 bg-lotus-leaf/10 rounded-full text-lotus-leaf">
                        <Check size={18} className="stroke-[3px]" />
                      </div>
                      <span className="text-[11px] font-semibold">Ca làm việc</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 h-full justify-center">
                      <span className="text-xs text-stone-300 font-medium">Nghỉ</span>
                      
                      {canEdit && !day.isBefore(today) && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center bg-white/90">
                          <button
                            onClick={() =>
                              setAddingShift({
                                shift,
                                shiftPeriod: period,
                                date: dateStr,
                                defaultStaffId: selectedStaffId,
                                existingStaffIds: [], // Not strictly needed for single view
                              })
                            }
                            className="flex items-center gap-1 text-xs font-semibold text-lotus-leaf hover:text-lotus-deep bg-lotus-cream hover:bg-lotus-cream/80 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <Plus size={12} /> Đăng ký ca
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    );
  };

  const rowHeaderTitle = viewMode === "staff" ? "Nhân viên" : "Ca làm việc";

  return (
    <>
      <div className="overflow-x-auto border border-stone-200/50 rounded-sm bg-white/70 shadow-sm ">
        <table className="w-full text-[13px] text-left table-fixed">
          <thead className="bg-lotus-cream/50 border-b border-stone-200/50">
            <tr>
              <th className="w-48 py-4 px-4 font-semibold text-lotus-deep border-r border-stone-200/50">
                {rowHeaderTitle}
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

          {viewMode === "shift" && renderByShift()}
          {viewMode === "staff" && renderByStaff()}
          {viewMode === "single" && renderSingleStaff()}
        </table>
      </div>

      {addingShift && (
        <AddStaffDialog
          shift={addingShift.shift}
          shiftPeriod={addingShift.shiftPeriod}
          date={addingShift.date}
          defaultStaffId={addingShift.defaultStaffId}
          existingStaffIds={addingShift.existingStaffIds}
          onClose={() => setAddingShift(null)}
        />
      )}
    </>
  );
}
