import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CalendarDays, Clock } from "lucide-react";
import { z } from "zod";

import { useAuthStore } from "@/features/auth/stores/authStore";
import type { WorkScheduleDTO } from "@/features/schedules/types/schedule.types";
import { Alert } from "@/shared/components/Alert";
import { Modal } from "@/shared/components/Modal";
import { Tabs } from "@/shared/components/Tabs";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
import { FormField } from "@/shared/forms/FormField";
import { Input } from "@/shared/forms/Input";
import { Radio } from "@/shared/forms/Radio";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { toast } from "@/shared/utils/kitToast";
import {
  formatDate,
  formatDisplayDate,
  localDateTimeToUtc,
  toLocalDateOnly,
  toLocalTimeOnly,
} from "@/shared/utils/date.utils";

import {
  useCheckIn,
  useCheckOut,
  useCreateManualAttendance,
  useUpdateAttendance,
} from "../hooks/useAttendances";
import type { AttendanceDto } from "../types/attendance.types";

// Zod schema validate form chấm công
const attendanceFormSchema = z.object({
  mode: z.enum(["working", "paid_leave", "unpaid_leave"]),
  subStatus: z.string(),
  checkInEnabled: z.boolean(),
  checkInTime: z.string(),
  checkOutEnabled: z.boolean(),
  checkOutTime: z.string(),
  note: z.string().max(500, "Tối đa 500 ký tự").optional().or(z.literal("")),
});

// Type của dữ liệu form chấm công
type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

// Interface của props của component AttendanceForm
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: WorkScheduleDTO | null;
  attendance?: AttendanceDto | null;
  onSuccess?: () => void;
}

// Function này dùng để lấy ngày hiện tại
function getTodayDateText(): string {
  return formatDate().format("YYYY-MM-DD");
}

// Function này dùng để lấy thời gian mặc định của ca làm việc
function getDefaultShiftTime(
  schedule: WorkScheduleDTO,
  field: "shiftStart" | "shiftEnd",
  fallback: string,
): string {
  const rawTime = schedule[field] ?? schedule.shift?.[field];
  if (!rawTime) {
    return fallback;
  }
  return rawTime.substring(0, 5);
}

// Function này dùng để lấy mode từ status
function getModeFromStatus(status: number | null): {
  mode: AttendanceFormData["mode"];
  subStatus: string;
} {
  if (status === 4 || status === 5) {
    return { mode: "paid_leave", subStatus: String(status) };
  }
  if (status === 3 || status === 6) {
    return { mode: "unpaid_leave", subStatus: String(status) };
  }
  return { mode: "working", subStatus: "4" };
}

// Function này dùng để lấy target status
function getTargetStatus(values: AttendanceFormData): number {
  if (values.mode === "paid_leave" || values.mode === "unpaid_leave") {
    return Number(values.subStatus);
  }
  if (values.checkInEnabled && values.checkOutEnabled) {
    return 2;
  }
  return 1;
}

// Function này dùng để lấy giá trị mặc định của form chấm công
function getDefaultValues(
  schedule: WorkScheduleDTO | null,
  attendance: AttendanceDto | null,
): AttendanceFormData {
  if (!schedule) {
    return {
      mode: "working",
      subStatus: "4",
      checkInEnabled: true,
      checkInTime: "09:00",
      checkOutEnabled: false,
      checkOutTime: "15:00",
      note: "",
    };
  }

  const defaultStart = getDefaultShiftTime(schedule, "shiftStart", "09:00");
  const defaultEnd = getDefaultShiftTime(schedule, "shiftEnd", "15:00");

  if (!attendance) {
    return {
      mode: "working",
      subStatus: "4",
      checkInEnabled: true,
      checkInTime: defaultStart,
      checkOutEnabled: false,
      checkOutTime: defaultEnd,
      note: "",
    };
  }

  const modeInfo = getModeFromStatus(attendance.status);
  const hasCheckIn = attendance.checkInAt != null;
  const hasCheckOut = attendance.checkOutAt != null;

  return {
    mode: modeInfo.mode,
    subStatus: modeInfo.subStatus,
    checkInEnabled: hasCheckIn,
    checkInTime: hasCheckIn
      ? toLocalTimeOnly(attendance.checkInAt)
      : defaultStart,
    checkOutEnabled: hasCheckOut,
    checkOutTime: hasCheckOut
      ? toLocalTimeOnly(attendance.checkOutAt)
      : defaultEnd,
    note: attendance.note ?? "",
  };
}

// Function này dùng để lấy label của button submit
function getSubmitButtonLabel(
  isAdminOrManager: boolean,
  attendance: AttendanceDto | null,
): string {
  if (isAdminOrManager) return "Lưu";
  if (!attendance) return "Check-in";
  return "Check-out";
}

// Component AttendanceForm
export function AttendanceForm({
  open,
  onOpenChange,
  schedule,
  attendance,
  onSuccess,
}: Props) {
  const { hasRole } = useAuthStore();
  const isAdminOrManager = hasRole("Admin") || hasRole("Manager");

  // Lấy mutation check-in
  const checkInMutation = useCheckIn();
  // Lấy mutation check-out
  const checkOutMutation = useCheckOut();
  // Lấy mutation update
  const updateMutation = useUpdateAttendance();
  // Lấy mutation create manual
  const createManualMutation = useCreateManualAttendance();
  const isPending =
    checkInMutation.isPending ||
    checkOutMutation.isPending ||
    updateMutation.isPending ||
    createManualMutation.isPending;

  // Lấy active tab
  const [activeTab, setActiveTab] = useState("attendance");

  // Lấy schedule an safe
  const safeSchedule = schedule ?? null;
  // Lấy attendance an safe
  const safeAttendance = attendance ?? null;

  // Lấy text ngày của schedule
  let scheduleDateText = "";
  // Kiểm tra xem schedule có phải là string không
  if (typeof safeSchedule?.workDate === "string") {
    scheduleDateText = toLocalDateOnly(safeSchedule.workDate);
  }
  // Kiểm tra xem ngày hiện tại có phải là ngày của schedule không
  const isToday = scheduleDateText === getTodayDateText();

  // Lấy control, handleSubmit, reset, register, setValue của form
  const { control, handleSubmit, reset, register, setValue } =
    useForm<AttendanceFormData>({
      resolver: zodResolver(attendanceFormSchema),
      defaultValues: getDefaultValues(null, null),
    });

  const mode = useWatch({ control, name: "mode" });
  const subStatus = useWatch({ control, name: "subStatus" });
  const checkInEnabled = useWatch({ control, name: "checkInEnabled" });
  const checkOutEnabled = useWatch({ control, name: "checkOutEnabled" });
  const note = useWatch({ control, name: "note" });

  // Reset form khi mở modal (derive state during render, không dùng useEffect)
  const formKey = !open
    ? "closed"
    : safeAttendance?.id
      ? `edit-${safeAttendance.id}`
      : `new-${safeSchedule?.id ?? "none"}`;
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);
  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      setActiveTab("attendance");
      reset(getDefaultValues(safeSchedule, safeAttendance));
    }
  }

  function combineDateAndTime(timeText: string): string {
    if (!scheduleDateText) return "";
    return localDateTimeToUtc(scheduleDateText, timeText);
  }

  function closeAndRefresh() {
    onOpenChange(false);
    if (onSuccess) onSuccess();
  }

  function submitStaffForm(values: AttendanceFormData) {
    if (!isToday) {
      const todayText = getTodayDateText();
      if (scheduleDateText && scheduleDateText < todayText) {
        toast.error("Bạn không thể chấm công ngày đã qua.");
      } else {
        toast.error("Bạn không thể chấm công ngày trong tương lai.");
      }
      return;
    }

    if (!safeSchedule?.staffId || !safeSchedule?.id) return;

    if (!safeAttendance) {
      checkInMutation.mutate(
        {
          staffId: safeSchedule.staffId,
          workScheduleId: safeSchedule.id,
          note: values.note || undefined,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) closeAndRefresh();
          },
        },
      );
      return;
    }

    if (!safeAttendance.checkOutAt) {
      checkOutMutation.mutate(
        {
          staffId: safeSchedule.staffId,
          workScheduleId: safeSchedule.id,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) closeAndRefresh();
          },
        },
      );
    }
  }

  function submitAdminForm(values: AttendanceFormData) {
    if (!safeSchedule?.staffId) return;

    const targetStatus = getTargetStatus(values);
    const checkInAt = values.checkInEnabled
      ? combineDateAndTime(values.checkInTime)
      : undefined;
    const checkOutAt = values.checkOutEnabled
      ? combineDateAndTime(values.checkOutTime)
      : undefined;

    // Cập nhật bản ghi đã tồn tại
    if (safeAttendance?.id) {
      updateMutation.mutate(
        {
          id: safeAttendance.id,
          payload: {
            checkInAt: checkInAt,
            checkOutAt: checkOutAt,
            status: targetStatus,
            note: values.note || undefined,
          },
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) closeAndRefresh();
          },
        },
      );
      return;
    }

    // Tạo mới loại nghỉ
    if (values.mode !== "working") {
      createManualMutation.mutate(
        {
          staffId: safeSchedule.staffId,
          workScheduleId: safeSchedule.id ?? undefined,
          workDate: scheduleDateText,
          status: targetStatus,
          note: values.note || undefined,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) closeAndRefresh();
          },
        },
      );
      return;
    }

    // Tạo mới loại đi làm (chỉ hỗ trợ ngày hôm nay)
    if (!isToday) {
      toast.error("Hệ thống chỉ hỗ trợ ghi nhận đi làm cho ngày hôm nay.");
      return;
    }

    if (!safeSchedule.id) return;

    checkInMutation.mutate(
      {
        staffId: safeSchedule.staffId,
        workScheduleId: safeSchedule.id,
        note: values.note || undefined,
      },
      {
        onSuccess: (result) => {
          if (!result.isSuccess || !result.data) return;

          const newAttendanceId = result.data;
          const needExtraUpdate =
            (values.checkInEnabled && values.checkInTime !== "09:00") ||
            values.checkOutEnabled;

          if (!needExtraUpdate) {
            closeAndRefresh();
            return;
          }

          updateMutation.mutate(
            {
              id: newAttendanceId,
              payload: {
                checkInAt: checkInAt,
                checkOutAt: checkOutAt,
                status: targetStatus,
                note: values.note || undefined,
              },
            },
            {
              onSuccess: (updateResult) => {
                if (updateResult.isSuccess) closeAndRefresh();
              },
            },
          );
        },
      },
    );
  }

  function onSubmit(values: AttendanceFormData) {
    if (!isAdminOrManager) {
      submitStaffForm(values);
      return;
    }
    submitAdminForm(values);
  }

  let canShowSubmit = false;
  if (activeTab === "attendance") {
    if (isAdminOrManager) {
      canShowSubmit = true;
    } else if (isToday && (!safeAttendance || !safeAttendance.checkOutAt)) {
      canShowSubmit = true;
    }
  }

  const shiftName = safeSchedule?.shift?.name ?? "Ca";
  const shiftStart =
    (safeSchedule?.shiftStart ?? safeSchedule?.shift?.shiftStart)?.substring(
      0,
      5,
    ) ?? "--:--";
  const shiftEnd =
    (safeSchedule?.shiftEnd ?? safeSchedule?.shift?.shiftEnd)?.substring(
      0,
      5,
    ) ?? "--:--";
  const shiftLabel = shiftName + " (" + shiftStart + " - " + shiftEnd + ")";

  const timeFieldsDisabled = !isToday && !safeAttendance;

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Chấm công"
      size="md"
      scrollable
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            className="mb-0"
            onClick={() => onOpenChange(false)}
          >
            Bỏ qua
          </Button>
          {canShowSubmit ? (
            <Button
              type="submit"
              form="attendance-form"
              variant="primary"
              size="sm"
              className="mb-0"
              loading={isPending}
            >
              {getSubmitButtonLabel(isAdminOrManager, safeAttendance)}
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-kit-heading">
          {safeSchedule?.staffName}
        </span>
        <span className="text-xs text-kit-muted">
          NV{String(safeSchedule?.staffId ?? "").padStart(5, "0")}
        </span>
        {safeAttendance ? (
          <Badge variant="success" soft>
            Đã chấm công
          </Badge>
        ) : (
          <Badge variant="warning" soft>
            Chưa chấm công
          </Badge>
        )}
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 rounded border border-kit bg-kit-page p-3 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 text-kit-body">
          <CalendarDays className="size-4 shrink-0 text-kit-muted" />
          <span className="text-kit-muted">Thời gian:</span>
          <span className="font-medium text-kit-heading">
            {formatDisplayDate(scheduleDateText)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-kit-body">
          <Clock className="size-4 shrink-0 text-kit-muted" />
          <span className="text-kit-muted">Ca:</span>
          <span className="rounded border border-kit bg-kit-white px-2 py-0.5 text-xs font-medium text-kit-heading">
            {shiftLabel}
          </span>
        </div>
      </div>

      <form
        id="attendance-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        <Tabs
          variant="body"
          activeId={activeTab}
          onChange={setActiveTab}
          tabs={[
            {
              id: "attendance",
              label: "Chấm công",
              content: !isAdminOrManager ? (
                <div className="space-y-3">
                  {!isToday ? (
                    <Alert variant="warning">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <span>
                          Lịch làm việc này thuộc ngày khác. Bạn không thể tự
                          chấm công hoặc thay đổi thời gian.
                        </span>
                      </div>
                    </Alert>
                  ) : !safeAttendance ? (
                    <Alert variant="warning">
                      <p className="font-semibold">Bạn chưa chấm công.</p>
                    </Alert>
                  ) : !safeAttendance.checkOutAt ? (
                    <Alert variant="success">
                      <p className="font-semibold">
                        Bạn đã chấm công thành công!
                      </p>
                      <p className="mt-1 text-xs opacity-80">
                        Thời gian vào:{" "}
                        <span className="font-bold">
                          {toLocalTimeOnly(safeAttendance.checkInAt)}
                        </span>
                      </p>
                    </Alert>
                  ) : (
                    <Alert variant="secondary">
                      <p className="font-semibold text-kit-heading">
                        Bạn đã hoàn thành chấm công ngày hôm nay!
                      </p>
                      <p className="mt-1 text-xs">
                        Giờ vào:{" "}
                        <span className="font-semibold">
                          {toLocalTimeOnly(safeAttendance.checkInAt)}
                        </span>
                      </p>
                      <p className="text-xs">
                        Giờ ra:{" "}
                        <span className="font-semibold">
                          {toLocalTimeOnly(safeAttendance.checkOutAt)}
                        </span>
                      </p>
                    </Alert>
                  )}
                  {isToday &&
                  (!safeAttendance || !safeAttendance.checkOutAt) ? (
                    <FormField label="Ghi chú (không bắt buộc)">
                      <Textarea
                        placeholder="Nhập ghi chú chấm công (nếu có)..."
                        rows={3}
                        {...register("note")}
                      />
                    </FormField>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3">
                  {!isToday && !safeAttendance ? (
                    <Alert variant="warning">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <span>
                          Hệ thống chỉ cho phép ghi nhận{" "}
                          <strong>Đi làm (Check-in)</strong> vào ngày hiện tại.
                          Đối với ngày trong quá khứ/tương lai, vui lòng chọn
                          hình thức Nghỉ.
                        </span>
                      </div>
                    </Alert>
                  ) : null}

                  <FormField label="Loại chấm công">
                    <div className="flex flex-wrap gap-2">
                      <Radio
                        name="mode"
                        value="working"
                        label="Đi làm"
                        tone="success"
                        inline
                        checked={mode === "working"}
                        onChange={(value: string) =>
                          setValue(
                            "mode",
                            value as AttendanceFormData["mode"],
                          )
                        }
                      />
                      <Radio
                        name="mode"
                        value="paid_leave"
                        label="Nghỉ có phép"
                        tone="info"
                        inline
                        checked={mode === "paid_leave"}
                        onChange={(value: string) =>
                          setValue(
                            "mode",
                            value as AttendanceFormData["mode"],
                          )
                        }
                      />
                      <Radio
                        name="mode"
                        value="unpaid_leave"
                        label="Nghỉ không phép"
                        tone="danger"
                        inline
                        checked={mode === "unpaid_leave"}
                        onChange={(value: string) =>
                          setValue(
                            "mode",
                            value as AttendanceFormData["mode"],
                          )
                        }
                      />
                    </div>
                  </FormField>

                  {mode === "paid_leave" ? (
                    <FormField label="Chi tiết phép">
                      <Select
                        value={subStatus}
                        onChange={(event) =>
                          setValue("subStatus", event.target.value)
                        }
                        options={[
                          {
                            value: "4",
                            label: "Nghỉ phép hưởng lương (1 công)",
                          },
                          { value: "5", label: "Nghỉ lễ (1 công)" },
                        ]}
                      />
                    </FormField>
                  ) : null}

                  {mode === "unpaid_leave" ? (
                    <FormField label="Chi tiết nghỉ">
                      <Select
                        value={subStatus}
                        onChange={(event) =>
                          setValue("subStatus", event.target.value)
                        }
                        options={[
                          {
                            value: "3",
                            label: "Vắng / nghỉ không lương (0 công)",
                          },
                          {
                            value: "6",
                            label: "Nghỉ không lương (0 công)",
                          },
                        ]}
                      />
                    </FormField>
                  ) : null}

                  {mode === "working" ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-2 rounded border border-kit bg-kit-page/50 p-3">
                        <Checkbox
                          id="check-in-enabled"
                          label="Giờ vào"
                          checked={checkInEnabled}
                          disabled={timeFieldsDisabled}
                          onChange={(checked: boolean) =>
                            setValue("checkInEnabled", checked)
                          }
                        />
                        <Input
                          type="time"
                          {...register("checkInTime")}
                          disabled={!checkInEnabled || timeFieldsDisabled}
                        />
                      </div>
                      <div className="space-y-2 rounded border border-kit bg-kit-page/50 p-3">
                        <Checkbox
                          id="check-out-enabled"
                          label="Giờ ra"
                          checked={checkOutEnabled}
                          disabled={timeFieldsDisabled}
                          onChange={(checked: boolean) =>
                            setValue("checkOutEnabled", checked)
                          }
                        />
                        <Input
                          type="time"
                          {...register("checkOutTime")}
                          disabled={!checkOutEnabled || timeFieldsDisabled}
                        />
                      </div>
                    </div>
                  ) : null}

                  <FormField label="Ghi chú">
                    <Textarea
                      placeholder="Nhập ghi chú chấm công..."
                      rows={3}
                      value={note}
                      onChange={(event) => setValue("note", event.target.value)}
                    />
                  </FormField>
                </div>
              ),
            },
            {
              id: "history",
              label: "Lịch sử chấm công",
              content: !safeAttendance ? (
                <p className="py-8 text-center text-sm text-kit-muted">
                  Chưa có lịch sử chấm công cho ngày này.
                </p>
              ) : (
                <div className="space-y-2 rounded border border-kit bg-kit-page/50 p-4 text-sm">
                  <div className="flex items-center justify-between border-b border-kit pb-2">
                    <span className="text-kit-muted">Người chấm công:</span>
                    <span className="font-semibold text-kit-heading">
                      {safeAttendance.staffName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-kit pb-2">
                    <span className="text-kit-muted">Giờ Check-in:</span>
                    <span className="font-semibold text-kit-heading">
                      {safeAttendance.checkInAt
                        ? toLocalTimeOnly(safeAttendance.checkInAt)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-kit pb-2">
                    <span className="text-kit-muted">Giờ Check-out:</span>
                    <span className="font-semibold text-kit-heading">
                      {safeAttendance.checkOutAt
                        ? toLocalTimeOnly(safeAttendance.checkOutAt)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-kit pb-2">
                    <span className="text-kit-muted">Số giờ làm:</span>
                    <span className="font-semibold text-kit-success">
                      {safeAttendance.workedHours ?? 0} giờ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-kit-muted">Ghi chú:</span>
                    <span className="italic text-kit-heading">
                      {safeAttendance.note || "Không có ghi chú"}
                    </span>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </form>
    </Modal>
  );
}
