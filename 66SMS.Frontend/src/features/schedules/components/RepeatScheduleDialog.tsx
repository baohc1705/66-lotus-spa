import { useState, useMemo } from "react";
import { CalendarDays, Copy, AlertCircle } from "lucide-react";
import { toast } from "@/shared/components/kitToast";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Switch } from "@/shared/forms/Switch";
import { formatDate, DateUtil } from "@/shared/utils/date.utils";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useBulkCreateWorkSchedule } from "../hooks/useSchedules";
import type { WorkScheduleDTO } from "../types/schedule.types";

const HARDCODED_HOLIDAYS = ["01/01", "30/04", "01/05", "02/09"];

function isHoliday(date: DateUtil) {
  return HARDCODED_HOLIDAYS.includes(date.format("DD/MM"));
}

interface RepeatScheduleDialogProps {
  currentWeekStart: DateUtil;
  currentWeekSchedules: WorkScheduleDTO[];
  onClose: () => void;
}

export function RepeatScheduleDialog({
  currentWeekStart,
  currentWeekSchedules,
  onClose,
}: RepeatScheduleDialogProps) {
  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const currentWeekEnd = currentWeekStart.endOf("isoWeek");

  const [endDate, setEndDate] = useState("");
  const [skipHolidays, setSkipHolidays] = useState(true);

  const { mutate: bulkCreate, isPending } = useBulkCreateWorkSchedule();

  const endWeekStart = useMemo(() => {
    if (!endDate) return null;
    return formatDate(endDate).startOf("isoWeek");
  }, [endDate]);

  const endWeekEnd = endWeekStart?.endOf("isoWeek");

  const preview = useMemo(() => {
    if (!endWeekStart) return null;

    const weeks: DateUtil[] = [];
    let weekCursor = currentWeekStart.add(1, "week");
    while (weekCursor.toDate() <= endWeekStart.toDate()) {
      weeks.push(weekCursor);
      weekCursor = weekCursor.add(1, "week");
    }

    if (weeks.length === 0) return { weeks: 0, schedules: 0 };

    let scheduleCount = 0;
    for (const week of weeks) {
      for (const schedule of currentWeekSchedules) {
        if (!schedule.workDate || !schedule.staffId || !schedule.shiftPeriodId) {
          continue;
        }
        const original = formatDate(schedule.workDate);
        const dayOfWeek = original.day();
        const weekMon = week.startOf("isoWeek");
        const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;
        const newDate = weekMon.add(isoDay - 1, "day");
        if (skipHolidays && isHoliday(newDate)) continue;
        scheduleCount += 1;
      }
    }

    return { weeks: weeks.length, schedules: scheduleCount };
  }, [endWeekStart, currentWeekStart, currentWeekSchedules, skipHolidays]);

  const minDate = currentWeekEnd.add(1, "day").format("YYYY-MM-DD");

  function onSubmit() {
    if (!endWeekStart) {
      toast.warning("Vui lòng chọn tuần kết thúc.");
      return;
    }

    if (preview?.weeks === 0) {
      toast.warning("Tuần kết thúc phải sau tuần hiện tại.");
      return;
    }

    const schedules: {
      staffId: number;
      shiftPeriodId: number;
      workDate: string;
      salonId?: number;
    }[] = [];

    let weekCursor = currentWeekStart.add(1, "week");
    while (weekCursor.toDate() <= endWeekStart.toDate()) {
      for (const schedule of currentWeekSchedules) {
        if (!schedule.workDate || !schedule.staffId || !schedule.shiftPeriodId) {
          continue;
        }
        const original = formatDate(schedule.workDate);
        const dayOfWeek = original.day();
        const weekMon = weekCursor.startOf("isoWeek");
        const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;
        const newDate = weekMon.add(isoDay - 1, "day");
        if (skipHolidays && isHoliday(newDate)) continue;
        schedules.push({
          staffId: schedule.staffId,
          shiftPeriodId: schedule.shiftPeriodId,
          workDate: newDate.format("YYYY-MM-DD"),
          salonId: salonId || schedule.salonId || undefined,
        });
      }
      weekCursor = weekCursor.add(1, "week");
    }

    if (schedules.length === 0) {
      toast.warning("Không có lịch nào được tạo. Hãy kiểm tra lại tùy chọn.");
      return;
    }

    bulkCreate(
      { schedules },
      {
        onSuccess: (result) => {
          if (result.isSuccess) {
            toast.success(
              `Đã lặp lịch thành công! Tạo ${schedules.length} lịch cho ${preview?.weeks} tuần.`,
            );
            onClose();
          }
        },
      },
    );
  }

  const weekLabel = `Tuần ${currentWeekStart.isoWeek()} (${currentWeekStart.format("DD/MM")} – ${currentWeekEnd.format("DD/MM/YYYY")})`;
  const endWeekLabel = endWeekStart
    ? `Tuần ${endWeekStart.isoWeek()} (${endWeekStart.format("DD/MM")} – ${endWeekEnd?.format("DD/MM/YYYY")})`
    : null;

  return (
    <Modal open onClose={onClose} title="Lặp lịch làm việc" size="md" scrollable>
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded border border-kit-primary/20 bg-kit-page px-4 py-3">
          <CalendarDays
            size={16}
            className="mt-0.5 shrink-0 text-kit-primary"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-kit-heading">{weekLabel}</p>
            <p className="mt-0.5 text-xs text-kit-muted">
              {currentWeekSchedules.length} ca làm việc sẽ được sao chép
            </p>
          </div>
        </div>

        <FormSection icon={CalendarDays} title="Phạm vi lặp lại">
          <FormField
            label="Lặp đến ngày"
            tooltip="Chọn bất kỳ ngày nào trong tuần muốn lặp đến. Hệ thống sẽ tự tính cả tuần đó."
          >
            <Input
              type="date"
              value={endDate}
              min={minDate}
              onChange={(e: { target: { value: string } }) =>
                setEndDate(e.target.value)
              }
            />
          </FormField>

          {endWeekLabel ? (
            <div className="rounded border border-kit bg-kit-page px-3 py-2 text-xs text-kit-muted">
              Tuần kết thúc:{" "}
              <span className="font-semibold text-kit-heading">
                {endWeekLabel}
              </span>
            </div>
          ) : null}

          <FormField
            label="Bỏ qua ngày lễ"
            tooltip="Bật để tự động bỏ qua các ngày lễ: 1/1, 30/4, 1/5, 2/9"
          >
            <div className="flex h-9 items-center gap-3">
              <Switch
                checked={skipHolidays}
                onChange={setSkipHolidays}
              />
              <span className="text-xs text-kit-muted">
                Không tạo lịch vào ngày 1/1, 30/4, 1/5, 2/9
              </span>
            </div>
          </FormField>
        </FormSection>

        {preview !== null ? (
          preview.weeks === 0 ? (
            <div className="flex items-start gap-2 rounded border border-kit-warning/40 bg-kit-page px-4 py-3">
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0 text-kit-warning"
              />
              <p className="text-sm text-kit-warning">
                Tuần kết thúc phải sau tuần hiện tại.
              </p>
            </div>
          ) : (
            <div className="space-y-1 rounded border border-kit bg-kit-page px-4 py-3">
              <p className="text-sm font-semibold text-kit-heading">Tổng quan</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className="rounded border border-kit bg-kit-white p-2 text-center">
                  <p className="text-2xl font-bold text-kit-primary">
                    {preview.weeks}
                  </p>
                  <p className="mt-0.5 text-xs text-kit-muted">tuần sẽ lặp</p>
                </div>
                <div className="rounded border border-kit bg-kit-white p-2 text-center">
                  <p className="text-2xl font-bold text-kit-heading">
                    {preview.schedules}
                  </p>
                  <p className="mt-0.5 text-xs text-kit-muted">
                    ca làm việc tạo mới
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-kit-muted">
                * Lịch trùng lặp đã có sẽ tự động bỏ qua.
              </p>
            </div>
          )
        ) : null}

        <div className="flex justify-end gap-2 border-t border-kit pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0"
            onClick={onClose}
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
            disabled={
              !endDate || preview?.weeks === 0 || preview?.schedules === 0
            }
            onClick={onSubmit}
          >
            <Copy size={14} />
            Lặp lịch
          </Button>
        </div>
      </div>
    </Modal>
  );
}
