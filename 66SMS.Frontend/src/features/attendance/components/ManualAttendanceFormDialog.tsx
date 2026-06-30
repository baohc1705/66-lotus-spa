import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useCreateManualAttendance } from "../hooks/useAttendances";
import {
  manualAttendanceSchema,
  type ManualAttendanceFormData,
} from "../schemas/attendance.schema";
import { useAdminStaffs } from "@/features/staffs/hooks/useStaffs";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { StaffDto } from "@/features/staffs/types/staff.types";

interface ManualAttendanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MANUAL_STATUS_OPTIONS = [
  { value: "4", label: "Nghỉ phép hưởng lương (1 công)" },
  { value: "5", label: "Nghỉ lễ (1 công)" },
  { value: "3", label: "Vắng / nghỉ không lương (0 công)" },
  { value: "6", label: "Nghỉ không lương (0 công)" },
];

export function ManualAttendanceFormDialog({
  open,
  onOpenChange,
}: ManualAttendanceFormDialogProps) {
  const createMutation = useCreateManualAttendance();
  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const { data: staffsResult } = useAdminStaffs({ pageIndex: 1, pageSize: 200, salonId });
  const staffs = staffsResult?.data?.items ?? [];

  const form = useForm<ManualAttendanceFormData>({
    resolver: zodResolver(manualAttendanceSchema) as Resolver<ManualAttendanceFormData>,
    defaultValues: { staffId: 0, workDate: "", status: 4, note: "" },
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    register,
  } = form;

  useEffect(() => {
    if (open) {
      reset({ staffId: 0, workDate: "", status: 4, note: "" });
    }
  }, [open, reset]);

  const onSubmit = (data: ManualAttendanceFormData) => {
    createMutation.mutate(
      {
        staffId: data.staffId,
        workDate: data.workDate,
        status: data.status,
        note: data.note || undefined,
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
          <DialogTitle>Ghi nhận nghỉ phép / lễ / vắng</DialogTitle>
          <DialogDescription>
            Tạo bản ghi chấm công thủ công cho các ngày không check-in/out.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nhân viên" error={errors.staffId?.message}>
            <Select
              value={watch("staffId") ? String(watch("staffId")) : ""}
              onValueChange={(v) => setValue("staffId", Number(v))}
            >
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue placeholder="Chọn nhân viên..." />
              </SelectTrigger>
              <SelectContent>
                {staffs.map((s: StaffDto) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Ngày" error={errors.workDate?.message}>
            <Input {...register("workDate")} type="date" className="h-9 text-[13px]" />
          </FormField>

          <FormField label="Loại" error={errors.status?.message}>
            <Select
              value={String(watch("status") || "")}
              onValueChange={(v) => setValue("status", Number(v))}
            >
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue placeholder="Chọn loại..." />
              </SelectTrigger>
              <SelectContent>
                {MANUAL_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Ghi chú" error={errors.note?.message}>
            <Input
              {...register("note")}
              placeholder="Ghi chú (nếu có)"
              className="h-9 text-[13px]"
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="admin" size="sm" loading={createMutation.isPending}>
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
      <Label className="text-[12px] font-semibold text-lotus-deep/80">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
