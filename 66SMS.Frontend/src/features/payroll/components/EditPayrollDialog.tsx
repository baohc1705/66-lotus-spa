import { AdminTextarea } from '@/shared/components/forms/AdminTextarea';
import { AdminInput } from '@/shared/components/forms/AdminInput';
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { useUpdatePayroll } from "../hooks/usePayrolls";
import {
  editPayrollSchema,
  type EditPayrollFormData,
} from "../schemas/payroll.schema";
import type { PayrollDto } from "../types/payroll.types";

interface EditPayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: PayrollDto | null;
}

export function EditPayrollDialog({
  open,
  onOpenChange,
  payroll,
}: EditPayrollDialogProps) {
  const updateMutation = useUpdatePayroll();

  const form = useForm<EditPayrollFormData>({
    resolver: zodResolver(editPayrollSchema) as Resolver<EditPayrollFormData>,
    defaultValues: {
      baseAmount: 0,
      commissionAmount: 0,
      note: "",
      status: 1,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  // Load current values
  useEffect(() => {
    if (open && payroll) {
      reset({
        baseAmount: payroll.baseAmount ?? 0,
        commissionAmount: payroll.commissionAmount ?? 0,
        note: payroll.note ?? "",
        status: payroll.status ?? 1,
      });
    }
  }, [open, payroll, reset]);

  const onSubmit = (data: EditPayrollFormData) => {
    if (!payroll?.id) return;
    updateMutation.mutate(
      {
        id: payroll.id,
        payload: {
          baseAmount: data.baseAmount,
          commissionAmount: data.commissionAmount,
          note: data.note,
          status: data.status,
        },
      },
      {
        onSuccess: (result) => {
          if (result.isSuccess) {
            onOpenChange(false);
          }
        },
      }
    );
  };

  // Live calculation of total
  const baseVal = watch("baseAmount") ?? 0;
  const commVal = watch("commissionAmount") ?? 0;
  const totalVal = Number(baseVal) + Number(commVal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bảng lương</DialogTitle>
          <DialogDescription>
            Cập nhật chi tiết lương của nhân viên{" "}
            <span className="font-semibold text-adminInk">
              {payroll?.staffName}
            </span>{" "}
            trong kỳ {payroll?.periodMonth}/{payroll?.periodYear}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Lương cơ bản (VND)" error={errors.baseAmount?.message}>
            <AdminInput
              type="number"
              placeholder="Nhập lương cơ bản..."
              {...register("baseAmount", { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Hoa hồng dịch vụ (VND)" error={errors.commissionAmount?.message}>
            <AdminInput
              type="number"
              placeholder="Nhập hoa hồng..."
              {...register("commissionAmount", { valueAsNumber: true })}
            />
          </FormField>

          <div className="bg-adminGray-50/40 border border-adminGray-100/50 rounded-lg p-3 space-y-1">
            <span className="text-xs font-semibold text-adminInk/70">
              Tổng thực nhận (Dự kiến):
            </span>
            <div className="text-lg font-bold text-adminInk">
              {new Intl.NumberFormat("vi-VN").format(totalVal)}đ
            </div>
          </div>

          <FormField label="Ghi chú" error={errors.note?.message}>
            <AdminTextarea
              className="text-sm resize-none"
              rows={3}
              placeholder="Nhập ghi chú..."
              {...register("note")}
            />
          </FormField>

          <FormField label="Trạng thái" error={errors.status?.message}>
            <Select
              value={watch("status") ? String(watch("status")) : "1"}
              onValueChange={(v) => setValue("status", Number(v))}
            >
              <AdminSelectTrigger>
                <SelectValue placeholder="Chọn trạng thái..." />
              </AdminSelectTrigger>
              <SelectContent>
                <SelectItem value="1">Nháp</SelectItem>
                <SelectItem value="2">Đã chốt (Khóa)</SelectItem>
              </SelectContent>
            </Select>
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
              Lưu thay đổi
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
      <Label className="text-xs font-semibold text-adminInk/80">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-state-danger-text font-medium">{error}</p>}
    </div>
  );
}
