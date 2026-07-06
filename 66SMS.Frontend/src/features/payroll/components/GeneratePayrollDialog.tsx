import { AdminSelectTrigger } from '@/shared/components/forms/AdminSelectTrigger';
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
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { useGeneratePayroll } from "../hooks/usePayrolls";
import {
  generatePayrollSchema,
  type GeneratePayrollFormData,
} from "../schemas/payroll.schema";
import { useAdminStaffs } from "@/features/staffs/hooks/useStaffs";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { StaffDto } from "@/features/staffs/types/staff.types";

interface GeneratePayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const now = new Date();

export function GeneratePayrollDialog({ open, onOpenChange }: GeneratePayrollDialogProps) {
  const generateMutation = useGeneratePayroll();
  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const { data: staffsResult } = useAdminStaffs({ pageIndex: 1, pageSize: 200, salonId });
  const staffs = staffsResult?.data?.items ?? [];

  const form = useForm<GeneratePayrollFormData>({
    resolver: zodResolver(generatePayrollSchema) as Resolver<GeneratePayrollFormData>,
    defaultValues: {
      staffId: 0,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      excludeSaturday: true,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  useEffect(() => {
    if (open) {
      reset({ staffId: 0, month: now.getMonth() + 1, year: now.getFullYear(), excludeSaturday: true });
    }
  }, [open, reset]);

  const onSubmit = (data: GeneratePayrollFormData) => {
    generateMutation.mutate(data, {
      onSuccess: (result) => {
        if (result.isSuccess) onOpenChange(false);
      },
    });
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Tính lương</DialogTitle>
          <DialogDescription>
            Lương cơ bản + hoa hồng làm dịch vụ của nhân viên trong kỳ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nhân viên" error={errors.staffId?.message}>
            <Select
              value={watch("staffId") ? String(watch("staffId")) : ""}
              onValueChange={(v) => setValue("staffId", Number(v))}
            >
              <AdminSelectTrigger>
                <SelectValue placeholder="Chọn nhân viên..." />
              </AdminSelectTrigger>
              <SelectContent>
                {staffs.map((s: StaffDto) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tháng" error={errors.month?.message}>
              <Select
                value={String(watch("month"))}
                onValueChange={(v) => setValue("month", Number(v))}
              >
                <AdminSelectTrigger>
                  <SelectValue />
                </AdminSelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      Tháng {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Năm" error={errors.year?.message}>
              <Select
                value={String(watch("year"))}
                onValueChange={(v) => setValue("year", Number(v))}
              >
                <AdminSelectTrigger>
                  <SelectValue />
                </AdminSelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="excludeSaturday"
              checked={watch("excludeSaturday") ?? true}
              onCheckedChange={(checked) => setValue("excludeSaturday", checked === true)}
            />
            <Label htmlFor="excludeSaturday" className="text-lotus-admin-lg cursor-pointer">
              Trừ cả Thứ 7 khi tính ngày công chuẩn (chỉ giữ T2–T6)
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={generateMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="admin" size="sm" loading={generateMutation.isPending}>
              Tính lương
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
      <Label className="text-lotus-admin-md font-semibold text-lotus-deep/80">{label}</Label>
      {children}
      {error && <p className="text-lotus-admin-base text-red-500 font-medium">{error}</p>}
    </div>
  );
}
