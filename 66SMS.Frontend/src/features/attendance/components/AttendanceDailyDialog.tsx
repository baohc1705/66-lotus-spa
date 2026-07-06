import { AdminTextarea } from '@/shared/components/forms/AdminTextarea';
import { AdminInput } from '@/shared/components/forms/AdminInput';
import { AdminSelectTrigger } from '@/shared/components/forms/AdminSelectTrigger';
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

import { Label } from "@/shared/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useCheckIn,
  useCheckOut,
  useUpdateAttendance,
  useCreateManualAttendance,
} from "../hooks/useAttendances";
import type { AttendanceDto } from "../types/attendance.types";
import type { WorkScheduleDTO } from "@/features/schedules/types/schedule.types";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/stores/authStore";

interface AttendanceDailyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: WorkScheduleDTO;
  attendance: AttendanceDto | null;
  onSuccess?: () => void;
}

// Map client type to backend status
// 1 = Đang làm, 2 = Đã ra ca
// 4 = Nghỉ phép (hưởng lương), 5 = Nghỉ lễ
// 3 = Vắng / nghỉ không lương, 6 = Nghỉ không lương
type ModeType = "working" | "paid_leave" | "unpaid_leave";

interface FormFields {
  mode: ModeType;
  subStatus: string;
  checkInEnabled: boolean;
  checkInTime: string;
  checkOutEnabled: boolean;
  checkOutTime: string;
  note: string;
}

function todayIsoDate(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function AttendanceDailyDialog({
  open,
  onOpenChange,
  schedule,
  attendance,
  onSuccess,
}: AttendanceDailyDialogProps) {
  const { hasRole } = useAuthStore();
  const isAdminOrManager = hasRole("Admin") || hasRole("Manager");

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const updateMutation = useUpdateAttendance();
  const createManualMutation = useCreateManualAttendance();

  const [activeTab, setActiveTab] = useState<"attendance" | "history">("attendance");

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormFields>({
    defaultValues: {
      mode: "working",
      subStatus: "4", // Nghỉ phép
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

  const scheduleDateStr = schedule.workDate
    ? typeof schedule.workDate === "string"
      ? schedule.workDate.substring(0, 10)
      : ""
    : "";
  const isToday = scheduleDateStr === todayIsoDate();

  // Load defaults or existing attendance
  useEffect(() => {
    if (open) {
      setActiveTab("attendance");
      
      const defaultStart = schedule.shift?.shiftPeriodDTOs?.[0]?.shiftStart?.substring(0, 5) || "09:00";
      const defaultEnd = schedule.shift?.shiftPeriodDTOs?.[0]?.shiftEnd?.substring(0, 5) || "15:00";

      if (attendance) {
        let currentMode: ModeType;
        let currentSub = "4";
        const statusVal = attendance.status;

        if (statusVal === 4 || statusVal === 5) {
          currentMode = "paid_leave";
          currentSub = String(statusVal);
        } else if (statusVal === 3 || statusVal === 6) {
          currentMode = "unpaid_leave";
          currentSub = String(statusVal);
        } else {
          currentMode = "working";
        }

        const hasIn = !!attendance.checkInAt;
        const hasOut = !!attendance.checkOutAt;

        const parseTime = (isoStr: string | null) => {
          if (!isoStr) return "";
          const d = new Date(isoStr);
          if (isNaN(d.getTime())) return "";
          return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        };

        reset({
          mode: currentMode,
          subStatus: currentSub,
          checkInEnabled: hasIn,
          checkInTime: hasIn ? parseTime(attendance.checkInAt) : defaultStart,
          checkOutEnabled: hasOut,
          checkOutTime: hasOut ? parseTime(attendance.checkOutAt) : defaultEnd,
          note: attendance.note ?? "",
        });
      } else {
        reset({
          mode: "working",
          subStatus: "4",
          checkInEnabled: true,
          checkInTime: defaultStart,
          checkOutEnabled: false,
          checkOutTime: defaultEnd,
          note: "",
        });
      }
    }
  }, [open, attendance, schedule, reset]);

  const combineDateAndTime = (timeStr: string): string => {
    if (!scheduleDateStr) return "";
    return `${scheduleDateStr}T${timeStr}:00`;
  };

  const handleFormSubmit = (data: FormFields) => {
    if (!schedule.staffId) return;

    if (!isAdminOrManager) {
      if (!isToday) return;

      if (!attendance) {
        checkInMutation.mutate(
          {
            staffId: schedule.staffId,
            workScheduleId: schedule.id!,
            note: data.note || undefined,
          },
          {
            onSuccess: (res) => {
              if (res.isSuccess) {
                onOpenChange(false);
                onSuccess?.();
              }
            },
          }
        );
      } else if (!attendance.checkOutAt) {
        checkOutMutation.mutate(
          {
            staffId: schedule.staffId,
            workScheduleId: schedule.id!,
          },
          {
            onSuccess: (res) => {
              if (res.isSuccess) {
                onOpenChange(false);
                onSuccess?.();
              }
            },
          }
        );
      }
      return;
    }

    let targetStatus = 1; // Default CheckIn
    if (data.mode === "working") {
      if (data.checkInEnabled && data.checkOutEnabled) {
        targetStatus = 2; // Checked Out
      } else if (data.checkInEnabled) {
        targetStatus = 1; // Checked In
      }
    } else if (data.mode === "paid_leave") {
      targetStatus = Number(data.subStatus);
    } else {
      targetStatus = Number(data.subStatus);
    }

    const payloadCheckInAt = data.checkInEnabled ? combineDateAndTime(data.checkInTime) : undefined;
    const payloadCheckOutAt = data.checkOutEnabled ? combineDateAndTime(data.checkOutTime) : undefined;

    if (attendance?.id) {
      // 1. UPDATE EXISTING ATTENDANCE RECORD
      updateMutation.mutate(
        {
          id: attendance.id,
          payload: {
            checkInAt: payloadCheckInAt || undefined,
            checkOutAt: payloadCheckOutAt || undefined,
            status: targetStatus,
            note: data.note || undefined,
          },
        },
        {
          onSuccess: (res) => {
            if (res.isSuccess) {
              onOpenChange(false);
              onSuccess?.();
            }
          },
        }
      );
    } else {
      // 2. CREATE NEW ATTENDANCE RECORD
      if (data.mode === "working") {
        if (!isToday) {
          toast.error("Hệ thống chỉ hỗ trợ ghi nhận đi làm (Check-in) cho ngày hôm nay. Đối với ngày trong quá khứ/tương lai, vui lòng chọn hình thức Nghỉ.");
          return;
        }

        // Call check-in first
        checkInMutation.mutate(
          {
            staffId: schedule.staffId,
            workScheduleId: schedule.id!,
            note: data.note || undefined,
          },
          {
            onSuccess: (res) => {
              if (res.isSuccess && res.data) {
                const newId = res.data;
                // If user customized check-in/out times, call update immediately
                const needsUpdate =
                  (data.checkInEnabled && data.checkInTime !== "09:00") ||
                  data.checkOutEnabled;

                if (needsUpdate) {
                  updateMutation.mutate(
                    {
                      id: newId,
                      payload: {
                        checkInAt: payloadCheckInAt || undefined,
                        checkOutAt: payloadCheckOutAt || undefined,
                        status: targetStatus,
                        note: data.note || undefined,
                      },
                    },
                    {
                      onSuccess: (updateRes) => {
                        if (updateRes.isSuccess) {
                          onOpenChange(false);
                          onSuccess?.();
                        }
                      },
                    }
                  );
                } else {
                  onOpenChange(false);
                  onSuccess?.();
                }
              }
            },
          }
        );
      } else {
        // Create manual leave record
        createManualMutation.mutate(
          {
            staffId: schedule.staffId,
            workDate: scheduleDateStr,
            status: targetStatus,
            note: data.note || undefined,
          },
          {
            onSuccess: (res) => {
              if (res.isSuccess) {
                onOpenChange(false);
                onSuccess?.();
              }
            },
          }
        );
      }
    }
  };

  const isPending =
    checkInMutation.isPending ||
    checkOutMutation.isPending ||
    updateMutation.isPending ||
    createManualMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-stone-200/50 rounded-2xl">
        <DialogHeader className="p-5 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-lotus-deep">Chấm công</DialogTitle>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm font-semibold text-stone-800">{schedule.staffName}</span>
                <span className="text-lotus-admin-base text-stone-400 font-mono">NV{String(schedule.staffId).padStart(5, "0")}</span>
                {attendance ? (
                  <span className="px-2 py-0.5 rounded-full text-lotus-admin-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    Đã chấm công
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-lotus-admin-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                    Chưa chấm công
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Info Grid */}
        <div className="p-5 pb-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-lotus-admin-lg border-b border-stone-100 mt-2 bg-stone-50/50">
          <div className="flex items-center gap-2 text-stone-600">
            <Calendar size={15} className="text-lotus-stone" />
            <span className="font-medium text-stone-500">Thời gian:</span>
            <span className="font-semibold text-stone-800">
              {formatDisplayDate(scheduleDateStr)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-stone-600">
            <Clock size={15} className="text-lotus-stone" />
            <span className="font-medium text-stone-500">Ca làm việc:</span>
            <span className="font-semibold text-stone-800 bg-white border border-stone-200/60 px-2 py-0.5 rounded shadow-sm">
              {schedule.shift?.name} ({schedule.shift?.shiftPeriodDTOs?.[0]?.shiftStart?.substring(0, 5)} - {schedule.shift?.shiftPeriodDTOs?.[0]?.shiftEnd?.substring(0, 5)})
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-100 px-5 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("attendance")}
            className={`py-3 text-lotus-admin-lg font-semibold border-b-2 transition-colors ${
              activeTab === "attendance"
                ? "border-lotus-leaf text-lotus-leaf"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            Chấm công
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`py-3 px-6 text-lotus-admin-lg font-semibold border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-lotus-leaf text-lotus-leaf"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            Lịch sử chấm công
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="p-5 space-y-4 max-h-[350px] overflow-y-auto">
            {activeTab === "attendance" ? (
              !isAdminOrManager ? (
                <div className="space-y-4">
                  {!isToday ? (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200/50 text-amber-800 text-lotus-admin-lg leading-relaxed">
                      <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        Lịch làm việc này thuộc ngày khác. Bạn không thể thực hiện tự chấm công hoặc thay đổi giờ của ngày đã qua / ngày sắp tới.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!attendance ? (
                        <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl text-lotus-admin-lg text-amber-800 space-y-2">
                          <p className="font-semibold">Bạn chưa ghi nhận bắt đầu ca làm việc (Check-in).</p>
                          <p className="text-lotus-admin-md opacity-80">Bấm nút "Check-in" ở dưới để bắt đầu ca làm việc của bạn.</p>
                        </div>
                      ) : !attendance.checkOutAt ? (
                        <div className="bg-lotus-leaf/5 border border-lotus-leaf/30 p-4 rounded-2xl text-lotus-admin-lg text-lotus-leaf space-y-2">
                          <p className="font-semibold">Bạn đã Check-in thành công!</p>
                          <p className="text-lotus-admin-md opacity-80">
                            Thời gian vào: <span className="font-mono font-bold">{new Date(attendance.checkInAt!).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                          </p>
                          <p className="text-lotus-admin-md opacity-85">Bấm nút "Check-out" ở dưới để kết thúc ca làm việc của bạn.</p>
                        </div>
                      ) : (
                        <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl text-lotus-admin-lg text-stone-600 space-y-1.5">
                          <p className="font-bold text-stone-800">Bạn đã hoàn thành chấm công ngày hôm nay!</p>
                          <p className="text-lotus-admin-md">Giờ vào: <span className="font-mono font-semibold">{new Date(attendance.checkInAt!).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span></p>
                          <p className="text-lotus-admin-md">Giờ ra: <span className="font-mono font-semibold">{new Date(attendance.checkOutAt!).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span></p>
                        </div>
                      )}

                      {/* Note */}
                      {(!attendance || !attendance.checkOutAt) && (
                        <div className="space-y-1.5">
                          <Label className="text-lotus-admin-md font-bold text-stone-500 uppercase tracking-wider">
                            Ghi chú (Không bắt buộc)
                          </Label>
                          <AdminTextarea
                            placeholder="Nhập ghi chú chấm công (nếu có)..."
                            className="border-stone-200/80 rounded-xl min-h-[80px] text-lotus-admin-lg"
                            {...register("note")}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Warning for past days */}
                  {!isToday && !attendance && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/50 text-amber-800 text-lotus-admin-md leading-relaxed">
                      <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        Hệ thống chỉ cho phép ghi nhận <strong>Đi làm (Check-in)</strong> vào ngày hiện tại. Đối với ngày trong quá khứ/tương lai, vui lòng chọn hình thức Nghỉ.
                      </span>
                    </div>
                  )}

                  {/* Radio selection */}
                  <div className="space-y-2">
                    <Label className="text-lotus-admin-md font-bold text-stone-500 uppercase tracking-wider">
                      Loại chấm công
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <label
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-lotus-admin-lg font-semibold cursor-pointer transition-all ${
                          mode === "working"
                            ? "bg-lotus-leaf/5 border-lotus-leaf text-lotus-leaf shadow-sm"
                            : "border-stone-200/80 bg-white text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <input
                          type="radio"
                          value="working"
                          className="sr-only"
                          {...register("mode")}
                        />
                        Đi làm
                      </label>

                      <label
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-lotus-admin-lg font-semibold cursor-pointer transition-all ${
                          mode === "paid_leave"
                            ? "bg-lotus-leaf/5 border-lotus-leaf text-lotus-leaf shadow-sm"
                            : "border-stone-200/80 bg-white text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <input
                          type="radio"
                          value="paid_leave"
                          className="sr-only"
                          {...register("mode")}
                        />
                        Nghỉ có phép
                      </label>

                      <label
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-lotus-admin-lg font-semibold cursor-pointer transition-all ${
                          mode === "unpaid_leave"
                            ? "bg-lotus-leaf/5 border-lotus-leaf text-lotus-leaf shadow-sm"
                            : "border-stone-200/80 bg-white text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <input
                          type="radio"
                          value="unpaid_leave"
                          className="sr-only"
                          {...register("mode")}
                        />
                        Nghỉ không phép
                      </label>
                    </div>
                  </div>

                  {/* Sub Options for Leave */}
                  {mode === "paid_leave" && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                      <Label className="text-lotus-admin-md font-semibold text-stone-500">Chi tiết phép</Label>
                      <Select
                        value={subStatus}
                        onValueChange={(val) => setValue("subStatus", val)}
                      >
                        <AdminSelectTrigger className="h-10 text-lotus-admin-lg border-stone-200/80 rounded-xl">
                          <SelectValue />
                        </AdminSelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="4">Nghỉ phép hưởng lương (1 công)</SelectItem>
                          <SelectItem value="5">Nghỉ lễ (1 công)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {mode === "unpaid_leave" && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                      <Label className="text-lotus-admin-md font-semibold text-stone-500">Chi tiết nghỉ</Label>
                      <Select
                        value={subStatus}
                        onValueChange={(val) => setValue("subStatus", val)}
                      >
                        <AdminSelectTrigger className="h-10 text-lotus-admin-lg border-stone-200/80 rounded-xl">
                          <SelectValue />
                        </AdminSelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="3">Vắng / nghỉ không lương (0 công)</SelectItem>
                          <SelectItem value="6">Nghỉ không lương (0 công)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Check-in / Check-out Times */}
                  {mode === "working" && (
                    <div className="grid grid-cols-2 gap-4 pt-1 animate-in slide-in-from-top-1 duration-200">
                      <div className="space-y-2 border border-stone-200/70 p-3.5 rounded-2xl bg-white/50">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="rounded text-lotus-leaf focus:ring-lotus-leaf border-stone-300 w-4 h-4"
                            {...register("checkInEnabled")}
                            disabled={!isToday && !attendance}
                          />
                          <span className="text-lotus-admin-lg font-bold text-stone-700">Giờ vào</span>
                        </label>
                        <AdminInput
                          type="time"
                          className="h-10 text-lotus-admin-lg border-stone-200/80 rounded-xl"
                          {...register("checkInTime")}
                          disabled={!checkInEnabled || (!isToday && !attendance)}
                        />
                      </div>

                      <div className="space-y-2 border border-stone-200/70 p-3.5 rounded-2xl bg-white/50">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="rounded text-lotus-leaf focus:ring-lotus-leaf border-stone-300 w-4 h-4"
                            {...register("checkOutEnabled")}
                            disabled={!isToday && !attendance}
                          />
                          <span className="text-lotus-admin-lg font-bold text-stone-700">Giờ ra</span>
                        </label>
                        <AdminInput
                          type="time"
                          className="h-10 text-lotus-admin-lg border-stone-200/80 rounded-xl"
                          {...register("checkOutTime")}
                          disabled={!checkOutEnabled || (!isToday && !attendance)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Note */}
                  <div className="space-y-1.5">
                    <Label className="text-lotus-admin-md font-bold text-stone-500 uppercase tracking-wider">
                      Ghi chú
                    </Label>
                    <AdminTextarea
                      placeholder="Nhập ghi chú chấm công..."
                      className="border-stone-200/80 rounded-xl min-h-[80px] text-lotus-admin-lg"
                      {...register("note")}
                    />
                  </div>
                </>
              )
            ) : (
              /* History Tab */
              <div className="space-y-3 py-2">
                {attendance ? (
                  <div className="border border-stone-200/60 rounded-xl p-4 bg-stone-50/50 space-y-2.5 text-lotus-admin-lg">
                    <div className="flex items-center justify-between border-b border-stone-150 pb-2">
                      <span className="font-semibold text-stone-500">Người chấm công:</span>
                      <span className="font-bold text-stone-800">{attendance.staffName}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-stone-150 pb-2">
                      <span className="font-semibold text-stone-500">Giờ Check-in:</span>
                      <span className="font-mono text-stone-800 font-semibold">
                        {attendance.checkInAt ? new Date(attendance.checkInAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-stone-150 pb-2">
                      <span className="font-semibold text-stone-500">Giờ Check-out:</span>
                      <span className="font-mono text-stone-800 font-semibold">
                        {attendance.checkOutAt ? new Date(attendance.checkOutAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-stone-150 pb-2">
                      <span className="font-semibold text-stone-500">Số giờ làm:</span>
                      <span className="font-bold text-lotus-leaf">{attendance.workedHours ?? 0} giờ</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-500">Ghi chú:</span>
                      <span className="text-stone-700 italic">{attendance.note || "Không có ghi chú"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-stone-400 text-sm font-medium">
                    Chưa có lịch sử chấm công cho ngày này.
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="p-5 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 rounded-xl text-lotus-admin-lg"
              >
                Bỏ qua
              </Button>
            </div>
            
            {activeTab === "attendance" && (
              isAdminOrManager || (isToday && (!attendance || !attendance.checkOutAt)) ? (
                <Button
                  type="submit"
                  variant="admin"
                  size="sm"
                  className="h-9 px-5 rounded-xl text-lotus-admin-lg"
                  loading={isPending}
                >
                  {isAdminOrManager ? "Lưu" : !attendance ? "Check-in" : "Check-out"}
                </Button>
              ) : null
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
