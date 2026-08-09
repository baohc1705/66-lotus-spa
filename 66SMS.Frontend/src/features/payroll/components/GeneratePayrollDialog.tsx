import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator } from "lucide-react";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { useAdminStaffs } from "@/features/staffs/hooks/useStaffs";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Select } from "@/shared/forms/Select";

import { useGeneratePayroll } from "../hooks/usePayrolls";
import {
  generatePayrollSchema,
  type GeneratePayrollFormData,
} from "../schemas/payroll.schema";

type GeneratePayrollDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const now = new Date();

export function GeneratePayrollDialog({
  open,
  onOpenChange,
}: GeneratePayrollDialogProps) {
  const generateMutation = useGeneratePayroll();
  const salonId = useAuthStore((s) => s.getEffectiveSalonId());
  const { data: staffsResult } = useAdminStaffs({
    pageIndex: 1,
    pageSize: 200,
    salonId,
  });
  const staffs = staffsResult?.data?.items ?? [];

  const form = useForm<GeneratePayrollFormData>({
    resolver: zodResolver(
      generatePayrollSchema,
    ) as Resolver<GeneratePayrollFormData>,
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
    if (!open) return;
    reset({
      staffId: 0,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      excludeSaturday: true,
    });
  }, [open, reset]);

  function onSubmit(data: GeneratePayrollFormData) {
    generateMutation.mutate(data, {
      onSuccess: (result) => {
        if (result.isSuccess) onOpenChange(false);
      },
    });
  }

  const months = Array.from({ length: 12 }, (_: unknown, index: number) => index + 1);
  const years = Array.from(
    { length: 6 },
    (_: unknown, index: number) => now.getFullYear() - index,
  );

  const staffOptions = staffs
    .filter((staff: StaffDto) => staff.id != null)
    .map((staff: StaffDto) => ({
      value: String(staff.id),
      label: staff.fullName ?? `NV #${staff.id}`,
    }));

  const monthOptions = months.map((month: number) => ({
    value: String(month),
    label: `Tháng ${month}`,
  }));

  const yearOptions = years.map((year: number) => ({
    value: String(year),
    label: String(year),
  }));

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Tính lương"
      size="md"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <p className="mb-3 text-sm text-kit-muted">
          Lương cơ bản + hoa hồng làm dịch vụ của nhân viên trong kỳ.
        </p>

        <FormSection icon={Calculator} title="Kỳ lương">
          <FormField label="Nhân viên *" error={errors.staffId?.message}>
            <SearchableSelect
              value={watch("staffId") ? String(watch("staffId")) : ""}
              options={staffOptions}
              placeholder="Chọn nhân viên..."
              searchPlaceholder="Tìm nhân viên..."
              emptyText="Không tìm thấy"
              invalid={!!errors.staffId}
              clearable
              onChange={(value: string) =>
                setValue("staffId", value ? Number(value) : 0, {
                  shouldValidate: true,
                })
              }
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tháng *" error={errors.month?.message}>
              <Select
                value={String(watch("month"))}
                options={monthOptions}
                invalid={!!errors.month}
                onChange={(event) => setValue("month", Number(event.target.value))}
              />
            </FormField>
            <FormField label="Năm *" error={errors.year?.message}>
              <Select
                value={String(watch("year"))}
                options={yearOptions}
                invalid={!!errors.year}
                onChange={(event) => setValue("year", Number(event.target.value))}
              />
            </FormField>
          </div>

          <Checkbox
            className="mb-0"
            checked={watch("excludeSaturday") ?? true}
            onChange={(checked: boolean) => setValue("excludeSaturday", checked)}
            label="Trừ cả Thứ 7 khi tính ngày công chuẩn (chỉ giữ T2–T6)"
          />
        </FormSection>

        <div className="flex justify-end gap-2 border-t border-kit pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0"
            onClick={() => onOpenChange(false)}
            disabled={generateMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="mb-0"
            loading={generateMutation.isPending}
          >
            Tính lương
          </Button>
        </div>
      </form>
    </Modal>
  );
}
