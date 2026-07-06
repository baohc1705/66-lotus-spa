import { AdminInput } from '@/shared/components/forms/AdminInput';
import { AdminSelectTrigger } from '@/shared/components/forms/AdminSelectTrigger';
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateAttendance } from "../hooks/useAttendances";
import {
  attendanceEditSchema,
  type AttendanceEditFormData,
} from "../schemas/attendance.schema";
import type { AttendanceDto } from "../types/attendance.types";

interface AttendanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance: AttendanceDto | null;
}

const STATUS_OPTIONS = [
  { value: "1", label: "Đang làm" },
  { value: "2", label: "Đã ra ca" },
  { value: "4", label: "Nghỉ phép hưởng lương" },
  { value: "5", label: "Nghỉ lễ" },
  { value: "3", label: "Vắng / nghỉ không lương" },
  { value: "6", label: "Nghỉ không lương" },
];

function toDateTimeLocal(val?: string | null): string {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AttendanceFormDialog({
  open,
  onOpenChange,
  attendance,
}: AttendanceFormDialogProps) {
  const updateMutation = useUpdateAttendance();

  const form = useForm<AttendanceEditFormData>({
    resolver: zodResolver(attendanceEditSchema),
    defaultValues: { checkInAt: "", checkOutAt: "", status: "", note: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const selectedStatus = watch("status");
  const isManualStatus =
    selectedStatus === "3" ||
    selectedStatus === "4" ||
    selectedStatus === "5" ||
    selectedStatus === "6";
  // showKpiOverride removed

  useEffect(() => {
    if (open) {
      reset({
        checkInAt: toDateTimeLocal(attendance?.checkInAt),
        checkOutAt: toDateTimeLocal(attendance?.checkOutAt),
        status: attendance?.status ? String(attendance.status) : "",
        note: attendance?.note ?? "",
      });
    }
  }, [open, attendance, reset]);

  const onSubmit = (data: AttendanceEditFormData) => {
    if (!attendance?.id) return;
    updateMutation.mutate(
      {
        id: attendance.id,
        payload: {
          checkInAt: data.checkInAt || undefined,
          checkOutAt: data.checkOutAt || undefined,
          status: data.status ? Number(data.status) : undefined,
          note: data.note || undefined,
        },
      },
      {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Sửa chấm công</DialogTitle>
          <DialogDescription>
            {attendance?.staffName ?? ""} — {attendance?.workDate ?? ""}
            {attendance?.shiftName && (
              <span className="block">Ca: {attendance.shiftName}</span>
            )}
            {attendance?.workCredits != null && (
              <span className="block mt-1 text-lotus-deep/70">
                Công tính được: <strong>{attendance.workCredits}</strong>
              </span>
            )}
            {/* KPI count removed */}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Trạng thái" error={errors.status?.message}>
            <Select
              value={selectedStatus}
              onValueChange={(v) => setValue("status", v)}
            >
              <AdminSelectTrigger>
                <SelectValue placeholder="Chọn trạng thái..." />
              </AdminSelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {!isManualStatus && (
            <>
              <FormField label="Giờ vào" error={errors.checkInAt?.message}>
                <AdminInput
                  {...register("checkInAt")}
                  type="datetime-local"
                />
              </FormField>
              <FormField label="Giờ ra" error={errors.checkOutAt?.message}>
                <AdminInput
                  {...register("checkOutAt")}
                  type="datetime-local"
                />
              </FormField>
            </>
          )}

          {/* KPI override Checkbox removed */}

          <FormField label="Ghi chú" error={errors.note?.message}>
            <AdminInput
              {...register("note")}
              placeholder="Ghi chú (nếu có)"
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="admin"
              size="sm"
              loading={updateMutation.isPending}
            >
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label className="text-lotus-admin-md font-semibold text-lotus-deep/80">
        {label}
      </Label>
      {children}
      {error && <p className="text-lotus-admin-base text-red-500 font-medium">{error}</p>}
    </div>
  );
}
