import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar as CalendarIcon, User, Repeat } from "lucide-react";
import { toast } from "sonner";
import { formatDate, DateUtil } from "@/shared/utils/date.utils";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import {
  useCreateWorkSchedule,
  useBulkCreateWorkSchedule,
} from "../hooks/useSchedules";
import type {
  ShiftDTO,
  ShiftPeriodDTO,
} from "@/features/shifts/types/shift.types";
import type { CreateWorkSchedulePayload } from "../types/schedule.types";

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

const schema = z.object({
  employeeId: z
    .number({ error: "Vui lòng chọn nhân viên" })
    .min(1, "Vui lòng chọn nhân viên"),
});

type FormValues = z.infer<typeof schema>;

interface AddEmployeeDialogProps {
  shift?: ShiftDTO | null;
  shiftPeriod?: ShiftPeriodDTO | null;
  date: string | null;
  defaultEmployeeId?: number | null;
  existingEmployeeIds?: number[];
  onClose: () => void;
}

const HARDCODED_HOLIDAYS = ["01/01", "30/04", "01/05", "02/09"];

const isHoliday = (date: DateUtil) => {
  const dateStr = date.format("DD/MM");
  return HARDCODED_HOLIDAYS.includes(dateStr);
};

const WEEKDAYS = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
];

export function AddEmployeeDialog({
  shift,
  shiftPeriod,
  date,
  defaultEmployeeId,
  existingEmployeeIds = [],
  onClose,
}: AddEmployeeDialogProps) {
  const initialRecurringDays = date ? [formatDate(date).day()] : [];
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] =
    useState<number[]>(initialRecurringDays);
  const [endDate, setEndDate] = useState<string>("");
  const [workOnHolidays, setWorkOnHolidays] = useState(false);

  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
    pageIndex: 1,
    pageSize: 1000,
  });

  const { mutate: createWorkSchedule, isPending: isCreating } =
    useCreateWorkSchedule();
  const { mutate: bulkCreateWorkSchedule, isPending: isBulkCreating } =
    useBulkCreateWorkSchedule();

  const isPending = isCreating || isBulkCreating;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeId: defaultEmployeeId || 0,
    },
  });

  if (!date || !shift || !shiftPeriod) return null;

  const toggleDay = (day: number) => {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleAllDays = () => {
    if (recurringDays.length === 7) {
      setRecurringDays([]);
    } else {
      setRecurringDays([0, 1, 2, 3, 4, 5, 6]);
    }
  };

  const generateSchedules = (
    employeeId: number,
  ): CreateWorkSchedulePayload[] => {
    if (!isRecurring) {
      return [
        {
          workDate: date,
          employeeId,
          shiftPeriodId: shiftPeriod.id,
        },
      ];
    }

    const schedules: CreateWorkSchedulePayload[] = [];
    const start = formatDate(date).startOf("day");
    const end = endDate
      ? formatDate(endDate).startOf("day")
      : start.add(180, "day");

    for (
      let d = start;
      d.toDate().getTime() <= end.toDate().getTime();
      d = d.add(1, "day")
    ) {
      if (recurringDays.includes(d.day())) {
        if (!workOnHolidays && isHoliday(d)) {
          continue; // Skip holiday
        }
        schedules.push({
          workDate: d.format("YYYY-MM-DD"),
          employeeId,
          shiftPeriodId: shiftPeriod.id,
        });
      }
    }

    return schedules;
  };

  const onSubmit = (values: FormValues) => {
    const schedules = generateSchedules(values.employeeId);

    if (schedules.length === 0) {
      toast.warning("Không có ngày nào hợp lệ để tạo lịch.");
      return;
    }

    if (schedules.length === 1 && !isRecurring) {
      // Create single
      createWorkSchedule(schedules[0], {
        onSuccess: (res) => {
          if (res.isSuccess) {
            toast.success("Phân lịch làm việc thành công!");
            onClose();
          }
        },
      });
    } else {
      // Bulk create
      bulkCreateWorkSchedule(
        { schedules },
        {
          onSuccess: (res) => {
            if (res.isSuccess) {
              onClose();
            }
          },
        },
      );
    }
  };

  const utilDate = formatDate(date);
  const dayName = WEEKDAYS.find((w) => w.value === utilDate.day())?.label || "";
  const subTitle = `Ca: ${shift.name} (${shiftPeriod.shiftStart?.substring(0, 5)} - ${shiftPeriod.shiftEnd?.substring(0, 5)}) | ${dayName}, ${utilDate.format("DD/MM/YYYY")}`;

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Thêm lịch làm việc</DialogTitle>
          <DialogDescription>{subTitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormSection icon={User} title="Thông tin phân ca">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div className="sm:col-span-2">
                <FormField
                  label="Nhân viên"
                  tooltip="Vui lòng chọn nhân viên để xếp lịch"
                  error={form.formState.errors.employeeId?.message}
                >
                  <select
                    {...form.register("employeeId", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-leaf disabled:bg-stone-50 text-[13px] h-9 bg-white"
                    disabled={isLoadingEmployees}
                  >
                    <option value={0} disabled>
                      -- Tìm kiếm nhân viên --
                    </option>
                    {employeesData?.data?.items
                      ?.filter((s) => !existingEmployeeIds.includes(s.id))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} {s.code ? `(${s.code})` : ""}
                        </option>
                      ))}
                  </select>
                </FormField>
              </div>
            </div>
          </FormSection>

          <FormSection icon={Repeat} title="Tùy chọn lặp lại">
            <div className="grid grid-cols-1 gap-y-5">
              <FormField
                label="Lặp lại hàng tuần"
                tooltip="Bật để lịch tự động lặp lại theo tuần"
              >
                <div className="flex items-center h-9">
                  <Switch
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                  <span className="ml-3 text-[13px] text-stone-500">
                    Lịch làm việc sẽ tự động sao chép sang các tuần tiếp theo
                  </span>
                </div>
              </FormField>

              {isRecurring && (
                <>
                  <FormField
                    label="Các ngày trong tuần"
                    tooltip="Chọn ngày để lặp lại"
                  >
                    <div className="flex flex-wrap gap-2 items-center">
                      {WEEKDAYS.map((w) => (
                        <button
                          key={w.value}
                          type="button"
                          onClick={() => toggleDay(w.value)}
                          className={`px-3 py-1.5 rounded-md border text-[13px] transition-colors ${
                            recurringDays.includes(w.value)
                              ? "bg-lotus-leaf text-white border-lotus-leaf font-medium"
                              : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={toggleAllDays}
                        className="text-[13px] text-lotus-leaf font-medium hover:underline ml-2"
                      >
                        {recurringDays.length === 7
                          ? "Bỏ chọn tất cả"
                          : "Chọn tất cả"}
                      </button>
                    </div>
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <FormField
                      label="Ngày kết thúc"
                      tooltip="Nếu bỏ trống, hệ thống sẽ tự sinh lịch trong 6 tháng"
                    >
                      <div className="relative">
                        <Input
                          type="date"
                          value={endDate}
                          min={date}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="h-9 text-[13px]"
                        />
                        {!endDate && (
                          <div className="absolute inset-0 pl-3 flex items-center pointer-events-none bg-white rounded-md border border-stone-200 text-stone-400 text-[13px]">
                            Chưa xác định (Lặp lại 6 tháng)
                          </div>
                        )}
                        <CalendarIcon
                          size={14}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none z-10"
                        />
                      </div>
                    </FormField>

                    <FormField
                      label="Làm việc cả ngày lễ tết"
                      tooltip="Bật lên nếu bạn vẫn muốn tạo lịch vào các ngày nghỉ lễ"
                    >
                      <div className="flex items-center h-9">
                        <Switch
                          checked={workOnHolidays}
                          onCheckedChange={setWorkOnHolidays}
                        />
                      </div>
                    </FormField>
                  </div>
                </>
              )}
            </div>
          </FormSection>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Bỏ qua
            </Button>
            <Button type="submit" variant="admin" size="sm" loading={isPending}>
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
