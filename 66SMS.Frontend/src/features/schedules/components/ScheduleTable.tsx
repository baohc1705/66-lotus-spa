import { useState, type ReactNode } from "react";
import { Plus, Check, Trash2, Clock } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { toast } from "@/shared/components/kitToast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableResponsive,
  TableRow,
} from "@/shared/tables/Table";
import { TableEmptyState } from "@/shared/tables/TableEmptyState";
import { formatDate, DateUtil } from "@/shared/utils/date.utils";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type {
  ShiftDTO,
  ShiftPeriodDTO,
} from "@/features/shifts/types/shift.types";
import type { StaffDto } from "@/features/staffs/types/staff.types";

import { AddStaffDialog } from "./AddStaffDialog";
import {
  useUpdateWorkSchedule,
  useDeleteWorkSchedule,
} from "../hooks/useSchedules";
import type { WorkScheduleDTO } from "../types/schedule.types";

interface ScheduleTableProps {
  shifts: ShiftDTO[];
  staffList: StaffDto[];
  workSchedules: WorkScheduleDTO[];
  weekStart: DateUtil;
  viewMode: "shift" | "staff" | "single";
  selectedStaffId: number | null;
  canEdit?: boolean;
}

const DAY_NAMES = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];

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

  const [deleteScheduleId, setDeleteScheduleId] = useState<number | null>(null);

  const { mutate: updateWorkSchedule } = useUpdateWorkSchedule();
  const { mutate: deleteWorkSchedule, isPending: isDeleting } =
    useDeleteWorkSchedule();

  function handleDelete(id: number) {
    setDeleteScheduleId(id);
  }

  const days = Array.from({ length: 7 }).map((_, index: number) =>
    weekStart.add(index, "day"),
  );
  const today = formatDate().startOf("day");

  const fullMap = new Map<string, WorkScheduleDTO>();
  const shiftDayMap = new Map<string, WorkScheduleDTO[]>();
  const staffDayMap = new Map<string, WorkScheduleDTO[]>();

  workSchedules.forEach((schedule: WorkScheduleDTO) => {
    const dateStr = formatDate(schedule.workDate).format("YYYY-MM-DD");

    if (schedule.shiftPeriodId && schedule.staffId) {
      const keyFull = `${schedule.shiftPeriodId}_${schedule.staffId}_${dateStr}`;
      fullMap.set(keyFull, schedule);

      const keyShift = `${schedule.shiftPeriodId}_${dateStr}`;
      const existingShifts = shiftDayMap.get(keyShift) || [];
      shiftDayMap.set(keyShift, [...existingShifts, schedule]);

      const keyStaff = `${schedule.staffId}_${dateStr}`;
      const existingStaff = staffDayMap.get(keyStaff) || [];
      staffDayMap.set(keyStaff, [...existingStaff, schedule]);
    }
  });

  const activeShiftPeriods: { shift: ShiftDTO; period: ShiftPeriodDTO }[] = [];
  const weekStartStr = weekStart.format("YYYY-MM-DD");
  const weekEndStr = weekStart.add(6, "day").format("YYYY-MM-DD");

  shifts.forEach((shift: ShiftDTO) => {
    if (!shift.shiftPeriodDTOs) return;
    shift.shiftPeriodDTOs.forEach((period: ShiftPeriodDTO) => {
      const from = period.effectiveFrom;
      const to = period.effectiveTo;
      if (from && from <= weekEndStr) {
        if (!to || to >= weekStartStr) {
          activeShiftPeriods.push({ shift, period });
        }
      }
    });
  });

  function handleDragStart(
    event: { dataTransfer: DataTransfer },
    schedule: WorkScheduleDTO,
  ) {
    event.dataTransfer.setData(
      "workScheduleId",
      schedule.id?.toString() || "",
    );
    event.dataTransfer.setData("staffId", schedule.staffId?.toString() || "");
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(event: {
    preventDefault(): void;
    dataTransfer: DataTransfer;
  }) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(
    event: { preventDefault(): void; dataTransfer: DataTransfer },
    targetPeriodId: number,
    targetDateStr: string,
  ) {
    event.preventDefault();
    const scheduleIdText = event.dataTransfer.getData("workScheduleId");
    const staffIdText = event.dataTransfer.getData("staffId");
    if (!scheduleIdText || !staffIdText) return;

    const scheduleId = parseInt(scheduleIdText, 10);
    const staffId = parseInt(staffIdText, 10);

    const key = `${targetPeriodId}_${targetDateStr}`;
    const cellSchedules = shiftDayMap.get(key) || [];
    if (
      cellSchedules.some(
        (schedule: WorkScheduleDTO) => schedule.staffId === staffId,
      )
    ) {
      toast.error("Nhân viên này đã được xếp vào ca này trong cùng ngày.");
      return;
    }

    const originalSchedule = workSchedules.find(
      (schedule: WorkScheduleDTO) => schedule.id === scheduleId,
    );
    const staff = staffList.find((item: StaffDto) => item.id === staffId);

    updateWorkSchedule(
      {
        id: scheduleId,
        payload: {
          shiftPeriodId: targetPeriodId,
          staffId,
          workDate: targetDateStr,
          salonId:
            salonId ||
            originalSchedule?.salonId ||
            staff?.salonId ||
            undefined,
        },
      },
      {
        onSuccess: (result) => {
          if (result.isSuccess) toast.success("Cập nhật lịch thành công");
        },
      },
    );
  }

  function renderShiftNameCell(shift: ShiftDTO, period: ShiftPeriodDTO) {
    return (
      <TableCell className="bg-kit-page/40">
        <div className="font-semibold text-kit-heading">{shift.name}</div>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-kit-muted">
          <Clock className="size-3 text-kit-muted" />
          <span className="rounded bg-kit-page px-1.5 py-0.5 font-semibold text-kit-heading">
            {period.shiftStart?.substring(0, 5)}
          </span>
          <span>-</span>
          <span className="rounded bg-kit-page px-1.5 py-0.5 font-semibold text-kit-heading">
            {period.shiftEnd?.substring(0, 5)}
          </span>
        </div>
      </TableCell>
    );
  }

  function renderByShift(): ReactNode {
    if (activeShiftPeriods.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8}>
            <TableEmptyState
              icon={Clock}
              title="Không có ca làm việc"
              hint="Không có ca làm việc nào trong tuần này."
            />
          </TableCell>
        </TableRow>
      );
    }

    return activeShiftPeriods.map(({ shift, period }, index: number) => (
      <TableRow key={`${shift.id}_${period.id}_${index}`}>
        {renderShiftNameCell(shift, period)}
        {days.map((day: DateUtil, dayIndex: number) => {
          const dateStr = day.format("YYYY-MM-DD");
          const isPeriodActiveThisDay =
            period.effectiveFrom &&
            period.effectiveFrom <= dateStr &&
            (!period.effectiveTo || period.effectiveTo >= dateStr);

          if (!isPeriodActiveThisDay) {
            return (
              <TableCell
                key={dayIndex}
                className="bg-kit-page/30 text-center text-xs italic text-kit-muted"
              >
                Không áp dụng
              </TableCell>
            );
          }

          const key = `${period.id}_${dateStr}`;
          const cellSchedules = shiftDayMap.get(key) || [];

          return (
            <TableCell key={dayIndex} className="relative min-h-35 align-top">
              <div
                className="flex min-h-27.5 flex-col gap-1.5"
                onDragOver={handleDragOver}
                onDrop={(event) => handleDrop(event, period.id!, dateStr)}
              >
                <div className="flex-1 space-y-1.5 overflow-y-auto p-0.5">
                  {cellSchedules.map((schedule: WorkScheduleDTO) => (
                    <div
                      key={schedule.id}
                      draggable={canEdit}
                      onDragStart={(event) => {
                        if (!canEdit) {
                          event.preventDefault();
                          return;
                        }
                        handleDragStart(event, schedule);
                      }}
                      className={
                        "group/item flex items-center justify-between truncate rounded border border-kit bg-kit-white px-2.5 py-1.5 text-xs font-medium text-kit-heading shadow-xs transition-colors " +
                        (canEdit
                          ? "cursor-grab hover:border-kit-primary active:cursor-grabbing"
                          : "")
                      }
                    >
                      <span className="truncate">{schedule.staffName}</span>
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(schedule.id!);
                          }}
                          className="flex shrink-0 items-center justify-center rounded p-0.5 text-kit-muted opacity-0 transition-opacity group-hover/item:opacity-100 hover:text-kit-danger"
                          title="Xóa lịch làm việc"
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>

                {canEdit && !day.isBefore(today) ? (
                  <button
                    type="button"
                    onClick={() =>
                      setAddingShift({
                        shift,
                        shiftPeriod: period,
                        date: dateStr,
                        existingStaffIds: cellSchedules
                          .map((schedule: WorkScheduleDTO) => schedule.staffId)
                          .filter((id): id is number => id != null),
                      })
                    }
                    className="flex w-full items-center justify-center gap-1 rounded border border-kit-primary/20 bg-kit-page px-2 py-1.5 text-xs font-semibold text-kit-primary transition-colors hover:text-kit-heading"
                  >
                    <Plus size={12} /> Thêm nhân viên
                  </button>
                ) : null}
              </div>
            </TableCell>
          );
        })}
      </TableRow>
    ));
  }

  function renderByStaff(): ReactNode {
    if (staffList.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8}>
            <TableEmptyState
              icon={Clock}
              title="Không có nhân viên"
              hint="Không có nhân viên nào để hiển thị lịch."
            />
          </TableCell>
        </TableRow>
      );
    }

    return staffList.map((staff: StaffDto) => (
      <TableRow key={staff.id}>
        <TableCell className="bg-kit-page/40">
          <div className="font-semibold text-kit-heading">{staff.fullName}</div>
          <div className="mt-1 text-xs text-kit-muted">
            {staff.code || "Nhân viên"}
          </div>
        </TableCell>
        {days.map((day: DateUtil, dayIndex: number) => {
          const dateStr = day.format("YYYY-MM-DD");
          const key = `${staff.id}_${dateStr}`;
          const cellSchedules = staffDayMap.get(key) || [];

          return (
            <TableCell key={dayIndex} className="relative min-h-35 align-top">
              <div className="flex min-h-27.5 flex-col gap-1.5 p-0.5">
                {cellSchedules.map((schedule: WorkScheduleDTO) => (
                  <div
                    key={schedule.id}
                    className="truncate rounded border border-kit-primary/20 bg-kit-page px-2.5 py-1.5 text-xs font-medium text-kit-primary shadow-xs"
                    title={schedule.shift?.name}
                  >
                    {schedule.shift?.name || "Ca làm việc"}
                  </div>
                ))}
              </div>
            </TableCell>
          );
        })}
      </TableRow>
    ));
  }

  function renderSingleStaff(): ReactNode {
    if (!selectedStaffId) {
      return (
        <TableRow>
          <TableCell colSpan={8}>
            <TableEmptyState
              icon={Clock}
              title="Chưa chọn nhân viên"
              hint="Vui lòng chọn nhân viên để xem lịch cá nhân."
            />
          </TableCell>
        </TableRow>
      );
    }

    return activeShiftPeriods.map(({ shift, period }, index: number) => (
      <TableRow key={`${shift.id}_${period.id}_${index}`}>
        {renderShiftNameCell(shift, period)}
        {days.map((day: DateUtil, dayIndex: number) => {
          const dateStr = day.format("YYYY-MM-DD");
          const isPeriodActiveThisDay =
            period.effectiveFrom &&
            period.effectiveFrom <= dateStr &&
            (!period.effectiveTo || period.effectiveTo >= dateStr);

          if (!isPeriodActiveThisDay) {
            return (
              <TableCell
                key={dayIndex}
                className="bg-kit-page/30 text-center text-xs italic text-kit-muted"
              >
                Không áp dụng
              </TableCell>
            );
          }

          const keyFull = `${period.id}_${selectedStaffId}_${dateStr}`;
          const isWorking = fullMap.has(keyFull);

          return (
            <TableCell
              key={dayIndex}
              className={
                "relative min-h-25 text-center align-middle " +
                (isWorking ? "bg-kit-page/40" : "")
              }
            >
              {isWorking ? (
                <div className="group relative flex h-full min-h-22 flex-col items-center justify-center">
                  <div className="inline-flex flex-col items-center gap-1 text-kit-primary">
                    <div className="rounded-full bg-kit-page p-1.5 text-kit-primary">
                      <Check size={18} className="stroke-[3px]" />
                    </div>
                    <span className="text-xs font-semibold">Ca làm việc</span>
                  </div>

                  {canEdit && !day.isBefore(today) ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-kit-white/90 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          const schedule = fullMap.get(keyFull);
                          if (schedule?.id) handleDelete(schedule.id);
                        }}
                        className="flex items-center gap-1 rounded-full border border-kit-danger/40 bg-kit-page px-3 py-1.5 text-xs font-semibold text-kit-danger"
                      >
                        <Trash2 size={12} /> Hủy ca
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="group relative flex h-full min-h-22 flex-col items-center justify-center gap-1.5">
                  <span className="text-xs font-medium text-kit-muted">
                    Nghỉ
                  </span>

                  {canEdit && !day.isBefore(today) ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-kit-white/90 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() =>
                          setAddingShift({
                            shift,
                            shiftPeriod: period,
                            date: dateStr,
                            defaultStaffId: selectedStaffId,
                            existingStaffIds: [],
                          })
                        }
                        className="flex items-center gap-1 rounded-full bg-kit-page px-3 py-1.5 text-xs font-semibold text-kit-primary hover:text-kit-heading"
                      >
                        <Plus size={12} /> Đăng ký ca
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    ));
  }

  const rowHeaderTitle = viewMode === "staff" ? "Nhân viên" : "Ca làm việc";

  return (
    <>
      <TableResponsive>
        <Table
          bordered
          hover
          className="min-w-250 table-fixed [&_th]:align-top [&_td]:align-top"
        >
          <TableHead className="bg-kit-page">
            <TableRow>
              <TableHeaderCell className="w-48 text-xs uppercase tracking-wide text-kit-heading">
                {rowHeaderTitle}
              </TableHeaderCell>
              {days.map((day: DateUtil, dayIndex: number) => {
                const isWeekend = day.day() === 0 || day.day() === 6;
                const dayColor = isWeekend
                  ? "text-kit-danger"
                  : "text-kit-heading";

                return (
                  <TableHeaderCell key={dayIndex} className="text-center">
                    <div
                      className={
                        "flex flex-col items-center gap-0.5 " + dayColor
                      }
                    >
                      <span className="text-xs font-medium uppercase opacity-80">
                        {DAY_NAMES[day.day()]}
                      </span>
                      <span className="text-sm font-bold">
                        {day.format("DD/MM")}
                      </span>
                    </div>
                  </TableHeaderCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {viewMode === "shift" ? renderByShift() : null}
            {viewMode === "staff" ? renderByStaff() : null}
            {viewMode === "single" ? renderSingleStaff() : null}
          </TableBody>
        </Table>
      </TableResponsive>

      {addingShift ? (
        <AddStaffDialog
          shift={addingShift.shift}
          shiftPeriod={addingShift.shiftPeriod}
          date={addingShift.date}
          defaultStaffId={addingShift.defaultStaffId}
          existingStaffIds={addingShift.existingStaffIds}
          onClose={() => setAddingShift(null)}
        />
      ) : null}

      <ConfirmDialog
        open={deleteScheduleId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteScheduleId(null);
        }}
        onConfirm={() => {
          if (deleteScheduleId === null) return;
          deleteWorkSchedule(deleteScheduleId, {
            onSuccess: (result) => {
              if (result.isSuccess) setDeleteScheduleId(null);
            },
          });
        }}
        title="Xóa lịch làm việc"
        description="Bạn có chắc chắn muốn xóa lịch làm việc này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        loading={isDeleting}
        variant="danger"
      />
    </>
  );
}
