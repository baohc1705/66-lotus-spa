import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CalendarDays, Clock } from "lucide-react";

import { useAuthStore } from "@/features/auth/stores/authStore";
import type { WorkScheduleDTO } from "@/features/schedules/types/schedule.types";
import { Alert } from "@/shared/components/Alert";
import { Modal } from "@/shared/components/Modal";
import { TabNav } from "@/shared/components/Tabs";
import { toast } from "@/shared/components/kitToast";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
import { FormField } from "@/shared/forms/FormField";
import { Input } from "@/shared/forms/Input";
import { Radio } from "@/shared/forms/Radio";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
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

type AttendanceDailyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: WorkScheduleDTO;
  attendance: AttendanceDto | null;
  onSuccess?: () => void;
};

type AttendanceMode = "working" | "paid_leave" | "unpaid_leave";
type DialogTab = "attendance" | "history";

type AttendanceFormValues = {
  mode: AttendanceMode;
  subStatus: string;
  checkInEnabled: boolean;
  checkInTime: string;
  checkOutEnabled: boolean;
  checkOutTime: string;
  note: string;
};

function getTodayDateText(): string {
  return formatDate().format("YYYY-MM-DD");
}

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

function getModeFromStatus(status: number | null): {
  mode: AttendanceMode;
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

function getTargetStatus(values: AttendanceFormValues): number {
  if (values.mode === "paid_leave" || values.mode === "unpaid_leave") {
    return Number(values.subStatus);
  }

  if (values.checkInEnabled && values.checkOutEnabled) {
    return 2;
  }
  if (values.checkInEnabled) {
    return 1;
  }
  return 1;
}

function getSubmitButtonLabel(
  isAdminOrManager: boolean,
  attendance: AttendanceDto | null,
): string {
  if (isAdminOrManager) {
    return "Lưu";
  }
  if (!attendance) {
    return "Check-in";
  }
  return "Check-out";
}

export function AttendanceDailyDialog(props: AttendanceDailyDialogProps) {
  const { open, onOpenChange, schedule, attendance, onSuccess } = props;

  const { hasRole } = useAuthStore();
  const isAdminOrManager = hasRole("Admin") || hasRole("Manager");

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const updateMutation = useUpdateAttendance();
  const createManualMutation = useCreateManualAttendance();

  const [activeTab, setActiveTab] = useState<DialogTab>("attendance");

  const { register, handleSubmit, watch, setValue, reset } =
    useForm<AttendanceFormValues>({
      defaultValues: {
        mode: "working",
        subStatus: "4",
        checkInEnabled: true,
        checkInTime: "09:00",
        checkOutEnabled: false,
        checkOutTime: "15:00",
        note: "",
      },
    });

  const mode = watch("mode");
  const subStatus = watch("subStatus");
  const checkInEnabled = watch("checkInEnabled");
  const checkOutEnabled = watch("checkOutEnabled");
  const note = watch("note");

  let scheduleDateText = "";
  if (typeof schedule.workDate === "string") {
    scheduleDateText = toLocalDateOnly(schedule.workDate);
  }
  const isToday = scheduleDateText === getTodayDateText();

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveTab("attendance");

    const defaultStart = getDefaultShiftTime(schedule, "shiftStart", "09:00");
    const defaultEnd = getDefaultShiftTime(schedule, "shiftEnd", "15:00");

    if (!attendance) {
      reset({
        mode: "working",
        subStatus: "4",
        checkInEnabled: true,
        checkInTime: defaultStart,
        checkOutEnabled: false,
        checkOutTime: defaultEnd,
        note: "",
      });
      return;
    }

    const modeInfo = getModeFromStatus(attendance.status);
    const hasCheckIn = attendance.checkInAt != null;
    const hasCheckOut = attendance.checkOutAt != null;

    reset({
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
    });
  }, [open, attendance, schedule, reset]);

  function combineDateAndTime(timeText: string): string {
    if (!scheduleDateText) {
      return "";
    }
    return localDateTimeToUtc(scheduleDateText, timeText);
  }

  function closeAndRefresh() {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  }

  function submitStaffCheckIn(values: AttendanceFormValues) {
    if (!schedule.staffId || !schedule.id) {
      return;
    }

    checkInMutation.mutate(
      {
        staffId: schedule.staffId,
        workScheduleId: schedule.id,
        note: values.note || undefined,
      },
      {
        onSuccess: (result) => {
          if (result.isSuccess) {
            closeAndRefresh();
          }
        },
      },
    );
  }

  function submitStaffCheckOut() {
    if (!schedule.staffId || !schedule.id) {
      return;
    }

    checkOutMutation.mutate(
      {
        staffId: schedule.staffId,
        workScheduleId: schedule.id,
      },
      {
        onSuccess: (result) => {
          if (result.isSuccess) {
            closeAndRefresh();
          }
        },
      },
    );
  }

  function submitStaffForm(values: AttendanceFormValues) {
    if (!isToday) {
      return;
    }

    if (!attendance) {
      submitStaffCheckIn(values);
      return;
    }

    if (!attendance.checkOutAt) {
      submitStaffCheckOut();
    }
  }

  function submitAdminUpdate(
    values: AttendanceFormValues,
    targetStatus: number,
    checkInAt: string | undefined,
    checkOutAt: string | undefined,
  ) {
    if (!attendance?.id) {
      return;
    }

    updateMutation.mutate(
      {
        id: attendance.id,
        payload: {
          checkInAt: checkInAt,
          checkOutAt: checkOutAt,
          status: targetStatus,
          note: values.note || undefined,
        },
      },
      {
        onSuccess: (result) => {
          if (result.isSuccess) {
            closeAndRefresh();
          }
        },
      },
    );
  }

  function submitAdminCreateWorking(
    values: AttendanceFormValues,
    targetStatus: number,
    checkInAt: string | undefined,
    checkOutAt: string | undefined,
  ) {
    if (!isToday) {
      toast.error(
        "Hệ thống chỉ hỗ trợ ghi nhận đi làm (Check-in) cho ngày hôm nay. Đối với ngày trong quá khứ/tương lai, vui lòng chọn hình thức Nghỉ.",
      );
      return;
    }

    if (!schedule.staffId || !schedule.id) {
      return;
    }

    checkInMutation.mutate(
      {
        staffId: schedule.staffId,
        workScheduleId: schedule.id,
        note: values.note || undefined,
      },
      {
        onSuccess: (result) => {
          if (!result.isSuccess || !result.data) {
            return;
          }

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
                if (updateResult.isSuccess) {
                  closeAndRefresh();
                }
              },
            },
          );
        },
      },
    );
  }

  function submitAdminCreateLeave(
    values: AttendanceFormValues,
    targetStatus: number,
  ) {
    if (!schedule.staffId) {
      return;
    }

    createManualMutation.mutate(
      {
        staffId: schedule.staffId,
        workScheduleId: schedule.id ?? undefined,
        workDate: scheduleDateText,
        status: targetStatus,
        note: values.note || undefined,
      },
      {
        onSuccess: (result) => {
          if (result.isSuccess) {
            closeAndRefresh();
          }
        },
      },
    );
  }

  function submitAdminForm(values: AttendanceFormValues) {
    if (!schedule.staffId) {
      return;
    }

    const targetStatus = getTargetStatus(values);
    const checkInAt = values.checkInEnabled
      ? combineDateAndTime(values.checkInTime)
      : undefined;
    const checkOutAt = values.checkOutEnabled
      ? combineDateAndTime(values.checkOutTime)
      : undefined;

    if (attendance?.id) {
      submitAdminUpdate(values, targetStatus, checkInAt, checkOutAt);
      return;
    }

    if (values.mode === "working") {
      submitAdminCreateWorking(values, targetStatus, checkInAt, checkOutAt);
      return;
    }

    submitAdminCreateLeave(values, targetStatus);
  }

  function handleFormSubmit(values: AttendanceFormValues) {
    if (!isAdminOrManager) {
      submitStaffForm(values);
      return;
    }
    submitAdminForm(values);
  }

  const isSaving =
    checkInMutation.isPending ||
    checkOutMutation.isPending ||
    updateMutation.isPending ||
    createManualMutation.isPending;

  let canShowSubmit = false;
  if (activeTab === "attendance") {
    if (isAdminOrManager) {
      canShowSubmit = true;
    } else if (isToday && (!attendance || !attendance.checkOutAt)) {
      canShowSubmit = true;
    }
  }

  const shiftName = schedule.shift?.name ?? "Ca";
  const shiftStart =
    (schedule.shiftStart ?? schedule.shift?.shiftStart)?.substring(0, 5) ??
    "--:--";
  const shiftEnd =
    (schedule.shiftEnd ?? schedule.shift?.shiftEnd)?.substring(0, 5) ?? "--:--";
  const shiftLabel =
    shiftName + " (" + shiftStart + " - " + shiftEnd + ")";

  const timeFieldsDisabled = !isToday && !attendance;

  function renderStaffForm() {
    if (!isToday) {
      return (
        <Alert variant="warning">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              Lịch làm việc này thuộc ngày khác. Bạn không thể tự chấm công hoặc
              thay đổi giờ của ngày đã qua / ngày sắp tới.
            </span>
          </div>
        </Alert>
      );
    }

    let statusAlert = null;

    if (!attendance) {
      statusAlert = (
        <Alert variant="warning">
          <p className="font-semibold">
            Bạn chưa ghi nhận bắt đầu ca làm việc (Check-in).
          </p>
        </Alert>
      );
    } else if (!attendance.checkOutAt) {
      statusAlert = (
        <Alert variant="success">
          <p className="font-semibold">Bạn đã Check-in thành công!</p>
          <p className="mt-1 text-xs opacity-80">
            Thời gian vào:{" "}
            <span className="font-bold">
              {toLocalTimeOnly(attendance.checkInAt)}
            </span>
          </p>
        </Alert>
      );
    } else {
      statusAlert = (
        <Alert variant="secondary">
          <p className="font-semibold text-kit-heading">
            Bạn đã hoàn thành chấm công ngày hôm nay!
          </p>
          <p className="mt-1 text-xs">
            Giờ vào:{" "}
            <span className="font-semibold">
              {toLocalTimeOnly(attendance.checkInAt)}
            </span>
          </p>
          <p className="text-xs">
            Giờ ra:{" "}
            <span className="font-semibold">
              {toLocalTimeOnly(attendance.checkOutAt)}
            </span>
          </p>
        </Alert>
      );
    }

    const canEditNote = !attendance || !attendance.checkOutAt;

    return (
      <div className="space-y-3">
        {statusAlert}
        {canEditNote ? (
          <FormField label="Ghi chú (không bắt buộc)">
            <Textarea
              placeholder="Nhập ghi chú chấm công (nếu có)..."
              rows={3}
              {...register("note")}
            />
          </FormField>
        ) : null}
      </div>
    );
  }

  function renderAdminForm() {
    return (
      <div className="space-y-3">
        {!isToday && !attendance ? (
          <Alert variant="warning">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>
                Hệ thống chỉ cho phép ghi nhận{" "}
                <strong>Đi làm (Check-in)</strong> vào ngày hiện tại. Đối với
                ngày trong quá khứ/tương lai, vui lòng chọn hình thức Nghỉ.
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
                setValue("mode", value as AttendanceMode)
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
                setValue("mode", value as AttendanceMode)
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
                setValue("mode", value as AttendanceMode)
              }
            />
          </div>
        </FormField>

        {mode === "paid_leave" ? (
          <FormField label="Chi tiết phép">
            <Select
              value={subStatus}
              onChange={(event) => setValue("subStatus", event.target.value)}
              options={[
                { value: "4", label: "Nghỉ phép hưởng lương (1 công)" },
                { value: "5", label: "Nghỉ lễ (1 công)" },
              ]}
            />
          </FormField>
        ) : null}

        {mode === "unpaid_leave" ? (
          <FormField label="Chi tiết nghỉ">
            <Select
              value={subStatus}
              onChange={(event) => setValue("subStatus", event.target.value)}
              options={[
                { value: "3", label: "Vắng / nghỉ không lương (0 công)" },
                { value: "6", label: "Nghỉ không lương (0 công)" },
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
    );
  }

  function renderHistoryTab() {
    if (!attendance) {
      return (
        <p className="py-8 text-center text-sm text-kit-muted">
          Chưa có lịch sử chấm công cho ngày này.
        </p>
      );
    }

    const checkInText = attendance.checkInAt
      ? toLocalTimeOnly(attendance.checkInAt)
      : "—";
    const checkOutText = attendance.checkOutAt
      ? toLocalTimeOnly(attendance.checkOutAt)
      : "—";
    const noteText = attendance.note || "Không có ghi chú";
    const workedHours = attendance.workedHours ?? 0;

    return (
      <div className="space-y-2 rounded border border-kit bg-kit-page/50 p-4 text-sm">
        <div className="flex items-center justify-between border-b border-kit pb-2">
          <span className="text-kit-muted">Người chấm công:</span>
          <span className="font-semibold text-kit-heading">
            {attendance.staffName}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-kit pb-2">
          <span className="text-kit-muted">Giờ Check-in:</span>
          <span className="font-semibold text-kit-heading">{checkInText}</span>
        </div>
        <div className="flex items-center justify-between border-b border-kit pb-2">
          <span className="text-kit-muted">Giờ Check-out:</span>
          <span className="font-semibold text-kit-heading">{checkOutText}</span>
        </div>
        <div className="flex items-center justify-between border-b border-kit pb-2">
          <span className="text-kit-muted">Số giờ làm:</span>
          <span className="font-semibold text-kit-success">
            {workedHours} giờ
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-kit-muted">Ghi chú:</span>
          <span className="italic text-kit-heading">{noteText}</span>
        </div>
      </div>
    );
  }

  function renderMainContent() {
    if (activeTab === "history") {
      return <div className="py-1">{renderHistoryTab()}</div>;
    }

    if (!isAdminOrManager) {
      return renderStaffForm();
    }

    return renderAdminForm();
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Chấm công"
      size="md"
      scrollable
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-kit-heading">
          {schedule.staffName}
        </span>
        <span className="text-xs text-kit-muted">
          NV{String(schedule.staffId).padStart(5, "0")}
        </span>
        {attendance ? (
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

      <TabNav
        variant="body"
        className="mb-3"
        activeId={activeTab}
        onChange={(tabId: string) => setActiveTab(tabId as DialogTab)}
        items={[
          { id: "attendance", label: "Chấm công" },
          { id: "history", label: "Lịch sử chấm công" },
        ]}
      />

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
        {renderMainContent()}

        <div className="flex justify-end gap-2 border-t border-kit pt-3">
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
              variant="primary"
              size="sm"
              className="mb-0"
              loading={isSaving}
            >
              {getSubmitButtonLabel(isAdminOrManager, attendance)}
            </Button>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
