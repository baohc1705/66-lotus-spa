import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { formatCurrency } from "@/shared/utils/currency";

import { useUpdatePayroll } from "../hooks/usePayrolls";
import {
  editPayrollSchema,
  type EditPayrollFormData,
} from "../schemas/payroll.schema";
import type { PayrollDto } from "../types/payroll.types";

type EditPayrollDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: PayrollDto | null;
};

const STATUS_OPTIONS = [
  { value: "1", label: "Nháp" },
  { value: "2", label: "Đã chốt (Khóa)" },
];

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

  useEffect(() => {
    if (!open || !payroll) return;
    reset({
      baseAmount: payroll.baseAmount ?? 0,
      commissionAmount: payroll.commissionAmount ?? 0,
      note: payroll.note ?? "",
      status: payroll.status ?? 1,
    });
  }, [open, payroll, reset]);

  function onSubmit(data: EditPayrollFormData) {
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
          if (result.isSuccess) onOpenChange(false);
        },
      },
    );
  }

  const baseVal = watch("baseAmount") ?? 0;
  const commissionVal = watch("commissionAmount") ?? 0;
  const totalVal = Number(baseVal) + Number(commissionVal);

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Chỉnh sửa bảng lương"
      size="md"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <p className="mb-3 text-sm text-kit-muted">
          Nhân viên {payroll?.staffName ?? "—"} · kỳ {payroll?.periodMonth}/
          {payroll?.periodYear}
        </p>

        <FormSection icon={Wallet} title="Chi tiết lương">
          <FormField
            label="Lương cơ bản (VND)"
            error={errors.baseAmount?.message}
          >
            <Input
              type="number"
              placeholder="Nhập lương cơ bản..."
              invalid={!!errors.baseAmount}
              {...register("baseAmount", { valueAsNumber: true })}
            />
          </FormField>

          <FormField
            label="Hoa hồng dịch vụ (VND)"
            error={errors.commissionAmount?.message}
          >
            <Input
              type="number"
              placeholder="Nhập hoa hồng..."
              invalid={!!errors.commissionAmount}
              {...register("commissionAmount", { valueAsNumber: true })}
            />
          </FormField>

          <div className="mb-2 rounded border border-kit bg-kit-page p-3">
            <span className="text-xs font-semibold text-kit-muted">
              Tổng thực nhận (dự kiến)
            </span>
            <div className="text-lg font-bold text-kit-heading">
              {formatCurrency(totalVal)}
            </div>
          </div>

          <FormField label="Ghi chú" error={errors.note?.message}>
            <Textarea
              rows={3}
              placeholder="Nhập ghi chú..."
              invalid={!!errors.note}
              {...register("note")}
            />
          </FormField>

          <FormField label="Trạng thái" error={errors.status?.message}>
            <Select
              value={watch("status") ? String(watch("status")) : "1"}
              options={STATUS_OPTIONS}
              invalid={!!errors.status}
              onChange={(event) => setValue("status", Number(event.target.value))}
            />
          </FormField>
        </FormSection>

        <div className="flex justify-end gap-2 border-t border-kit pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="mb-0"
            loading={updateMutation.isPending}
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
