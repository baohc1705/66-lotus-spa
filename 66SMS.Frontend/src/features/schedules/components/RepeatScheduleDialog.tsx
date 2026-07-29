import { useState, useMemo } from "react";
import { CalendarDays, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDate, DateUtil } from "@/shared/utils/date.utils";
import { useBulkCreateWorkSchedule } from "../hooks/useSchedules";
import type { WorkScheduleDTO } from "../types/schedule.types";
import { useAuthStore } from "@/features/auth/stores/authStore";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { FormSection } from "@/shared/components/forms/FormSection";
import { FormField } from "@/shared/components/forms/FormField";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";

const HARDCODED_HOLIDAYS = ["01/01", "30/04", "01/05", "02/09"];

const isHoliday = (date: DateUtil) =>
  HARDCODED_HOLIDAYS.includes(date.format("DD/MM"));

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
    let w = currentWeekStart.add(1, "week");
    while (w.toDate() <= endWeekStart.toDate()) {
      weeks.push(w);
      w = w.add(1, "week");
    }

    if (weeks.length === 0) return { weeks: 0, schedules: 0 };

    let scheduleCount = 0;
    for (const week of weeks) {
      for (const ws of currentWeekSchedules) {
        if (!ws.workDate || !ws.staffId || !ws.shiftPeriodId) continue;
        const original = formatDate(ws.workDate);
        const dayOfWeek = original.day();
        const weekMon = week.startOf("isoWeek");
        const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;
        const newDate = weekMon.add(isoDay - 1, "day");
        if (skipHolidays && isHoliday(newDate)) continue;
        scheduleCount++;
      }
    }

    return { weeks: weeks.length, schedules: scheduleCount };
  }, [endWeekStart, currentWeekStart, currentWeekSchedules, skipHolidays]);

  const minDate = currentWeekEnd.add(1, "day").format("YYYY-MM-DD");

  const onSubmit = () => {
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

    let w = currentWeekStart.add(1, "week");
    while (w.toDate() <= endWeekStart.toDate()) {
      for (const ws of currentWeekSchedules) {
        if (!ws.workDate || !ws.staffId || !ws.shiftPeriodId) continue;
        const original = formatDate(ws.workDate);
        const dayOfWeek = original.day();
        const weekMon = w.startOf("isoWeek");
        const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;
        const newDate = weekMon.add(isoDay - 1, "day");
        if (skipHolidays && isHoliday(newDate)) continue;
        schedules.push({
          staffId: ws.staffId,
          shiftPeriodId: ws.shiftPeriodId,
          workDate: newDate.format("YYYY-MM-DD"),
          salonId: salonId || ws.salonId || undefined,
        });
      }
      w = w.add(1, "week");
    }

    if (schedules.length === 0) {
      toast.warning("Không có lịch nào được tạo. Hãy kiểm tra lại tùy chọn.");
      return;
    }

    bulkCreate(
      { schedules },
      {
        onSuccess: (res) => {
          if (res.isSuccess) {
            toast.success(
              `Đã lặp lịch thành công! Tạo ${schedules.length} lịch cho ${preview?.weeks} tuần.`,
            );
            onClose();
          }
        },
      },
    );
  };

  const weekLabel = `Tuần ${currentWeekStart.isoWeek()} (${currentWeekStart.format("DD/MM")} – ${currentWeekEnd.format("DD/MM/YYYY")})`;
  const endWeekLabel = endWeekStart
    ? `Tuần ${endWeekStart.isoWeek()} (${endWeekStart.format("DD/MM")} – ${endWeekEnd?.format("DD/MM/YYYY")})`
    : null;

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy size={16} className="text-adminGreen-600" />
            Lặp lịch làm việc
          </DialogTitle>
          <DialogDescription>
            Sao chép lịch tuần hiện tại sang các tuần tiếp theo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="bg-adminGray-50/40 border border-adminGreen-600/20 rounded-lg px-4 py-3 flex items-start gap-3">
            <CalendarDays
              size={16}
              className="text-adminGreen-600 mt-0.5 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-adminInk">{weekLabel}</p>
              <p className="text-xs text-adminGray-600 mt-0.5">
                {currentWeekSchedules.length} ca làm việc sẽ được sao chép
              </p>
            </div>
          </div>

          <FormSection icon={CalendarDays} title="Phạm vi lặp lại">
            <div className="space-y-4">
              <FormField
                label="Lặp đến ngày"
                tooltip="Chọn bất kỳ ngày nào trong tuần muốn lặp đến. Hệ thống sẽ tự tính cả tuần đó."
              >
                <div className="relative">
                  <Input
                    type="date"
                    value={endDate}
                    min={minDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </FormField>

              {endWeekLabel && (
                <div className="text-xs text-adminGray-600 bg-adminGray-50 border border-adminGray-100 rounded-md px-3 py-2">
                  Tuần kết thúc:{" "}
                  <span className="font-semibold text-adminInk">
                    {endWeekLabel}
                  </span>
                </div>
              )}

              <FormField
                label="Bỏ qua ngày lễ"
                tooltip="Bật để tự động bỏ qua các ngày lễ: 1/1, 30/4, 1/5, 2/9"
              >
                <div className="flex items-center h-9 gap-3">
                  <Switch
                    checked={skipHolidays}
                    onCheckedChange={setSkipHolidays}
                  />
                  <span className="text-xs text-adminGray-600">
                    Không tạo lịch vào ngày 1/1, 30/4, 1/5, 2/9
                  </span>
                </div>
              </FormField>
            </div>
          </FormSection>

          {preview !== null &&
            (preview.weeks === 0 ? (
              <div className="flex items-start gap-2 bg-state-warning-bg border border-state-warning-border rounded-lg px-4 py-3">
                <AlertCircle
                  size={15}
                  className="text-adminGold-600 flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-state-warning-text">
                  Tuần kết thúc phải sau tuần hiện tại.
                </p>
              </div>
            ) : (
              <div className="bg-adminGray-50 border border-adminGray-100 rounded-lg px-4 py-3 space-y-1">
                <p className="text-sm font-semibold text-adminInk">Tổng quan</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="text-center p-2 bg-white rounded-md border border-adminGray-100">
                    <p className="text-2xl font-bold text-adminGreen-600">
                      {preview.weeks}
                    </p>
                    <p className="text-xs text-adminGray-600 mt-0.5">
                      tuần sẽ lặp
                    </p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-md border border-adminGray-100">
                    <p className="text-2xl font-bold text-adminInk">
                      {preview.schedules}
                    </p>
                    <p className="text-xs text-adminGray-600 mt-0.5">
                      ca làm việc tạo mới
                    </p>
                  </div>
                </div>
                <p className="text-xs text-adminGray-400 mt-2">
                  * Lịch trùng lặp đã có sẽ tự động bỏ qua.
                </p>
              </div>
            ))}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            variant="admin"
            size="sm"
            loading={isPending}
            disabled={
              !endDate || preview?.weeks === 0 || preview?.schedules === 0
            }
            onClick={onSubmit}
          >
            Lặp lịch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
