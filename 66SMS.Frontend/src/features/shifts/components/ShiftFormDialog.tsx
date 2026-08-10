import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Info } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Textarea } from "@/shared/forms/Textarea";
import { formatDate } from "@/shared/utils/date.utils";

import { useCreateShift, useUpdateShift } from "../hooks/useShifts";
import type { ShiftDTO } from "../types/shift.types";
import {
  createShiftSchema,
  updateShiftSchema,
  type CreateShiftFormValues,
  type UpdateShiftFormValues,
} from "../schemas/shift.schema";

interface ShiftFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift?: ShiftDTO | null;
}

function getDefaultValues(shift?: ShiftDTO | null): CreateShiftFormValues {
  if (shift) {
    const currentPeriod = shift.shiftPeriodDTOs?.[0];
    return {
      name: shift.name ?? "",
      description: shift.description ?? "",
      shiftStart: currentPeriod?.shiftStart?.substring(0, 5) ?? "08:00",
      shiftEnd: currentPeriod?.shiftEnd?.substring(0, 5) ?? "17:00",
      effectiveFrom:
        currentPeriod?.effectiveFrom ?? formatDate().format("YYYY-MM-DD"),
      effectiveTo: currentPeriod?.effectiveTo ?? "",
    };
  }
  return {
    name: "",
    description: "",
    shiftStart: "08:00",
    shiftEnd: "17:00",
    effectiveFrom: formatDate().format("YYYY-MM-DD"),
    effectiveTo: "",
  };
}

export function ShiftFormDialog({
  open,
  onOpenChange,
  shift,
}: ShiftFormDialogProps) {
  const isEdit = !!shift;
  const createMutation = useCreateShift();
  const updateMutation = useUpdateShift();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateShiftFormValues | UpdateShiftFormValues>({
    resolver: zodResolver(
      isEdit ? updateShiftSchema : createShiftSchema,
    ) as Resolver<CreateShiftFormValues | UpdateShiftFormValues>,
    defaultValues: getDefaultValues(shift),
  });

  useEffect(() => {
    if (open) reset(getDefaultValues(shift));
  }, [open, shift, reset]);

  const onSubmit = (data: CreateShiftFormValues | UpdateShiftFormValues) => {
    const shiftStartStr =
      data.shiftStart.length === 5 ? `${data.shiftStart}:00` : data.shiftStart;
    const shiftEndStr =
      data.shiftEnd.length === 5 ? `${data.shiftEnd}:00` : data.shiftEnd;

    if (isEdit && shift?.id) {
      const currentPeriod = shift.shiftPeriodDTOs?.[0];
      const currentShiftStart = currentPeriod?.shiftStart?.substring(0, 5);
      const currentShiftEnd = currentPeriod?.shiftEnd?.substring(0, 5);
      const currentEffectiveFrom = currentPeriod?.effectiveFrom;
      const currentEffectiveTo = currentPeriod?.effectiveTo || "";
      const formEffectiveTo = data.effectiveTo || "";

      const isTimeChanged =
        data.shiftStart !== currentShiftStart ||
        data.shiftEnd !== currentShiftEnd ||
        data.effectiveFrom !== currentEffectiveFrom ||
        formEffectiveTo !== currentEffectiveTo;

      updateMutation.mutate(
        {
          id: shift.id,
          payload: {
            id: shift.id,
            name: data.name,
            description: data.description,
            shiftPeriod: {
              id: isTimeChanged ? undefined : currentPeriod?.id,
              shiftStart: shiftStartStr,
              shiftEnd: shiftEndStr,
              effectiveFrom: data.effectiveFrom,
              effectiveTo: data.effectiveTo || undefined,
            },
          },
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
      return;
    }

    createMutation.mutate(
      {
        name: data.name,
        description: data.description,
        shiftPeriod: {
          shiftStart: shiftStartStr,
          shiftEnd: shiftEndStr,
          effectiveFrom: data.effectiveFrom,
          effectiveTo: data.effectiveTo || undefined,
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
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa ca làm việc" : "Thêm ca làm việc mới"}
      size="lg"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <FormSection icon={Info} title="Thông tin cơ bản">
          <FormField
            label="Tên ca *"
            tooltip="Vui lòng nhập tên ca (VD: Ca Sáng)"
            error={errors.name?.message}
          >
            <Input
              {...register("name")}
              placeholder="Ca Sáng"
              invalid={!!errors.name}
            />
          </FormField>

          <FormField
            label="Mô tả"
            tooltip="Mô tả chi tiết ca làm việc"
            error={errors.description?.message}
          >
            <Textarea
              {...register("description")}
              placeholder="Mô tả chi tiết"
              rows={3}
              invalid={!!errors.description}
            />
          </FormField>
        </FormSection>

        <FormSection icon={Clock} title="Thời gian làm việc">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField
              label="Giờ bắt đầu *"
              tooltip="Giờ bắt đầu làm việc"
              error={errors.shiftStart?.message}
            >
              <Input
                type="time"
                {...register("shiftStart")}
                invalid={!!errors.shiftStart}
              />
            </FormField>

            <FormField
              label="Giờ kết thúc *"
              tooltip="Giờ kết thúc làm việc"
              error={errors.shiftEnd?.message}
            >
              <Input
                type="time"
                {...register("shiftEnd")}
                invalid={!!errors.shiftEnd}
              />
            </FormField>

            <FormField
              label="Ngày bắt đầu áp dụng *"
              tooltip="Ngày ca làm việc này bắt đầu có hiệu lực"
              error={errors.effectiveFrom?.message}
            >
              <Input
                type="date"
                {...register("effectiveFrom")}
                invalid={!!errors.effectiveFrom}
              />
            </FormField>

            <FormField
              label="Ngày kết thúc áp dụng"
              tooltip="Bỏ trống nếu áp dụng vô thời hạn"
              error={errors.effectiveTo?.message}
            >
              <Input
                type="date"
                {...register("effectiveTo")}
                invalid={!!errors.effectiveTo}
              />
            </FormField>
          </div>
        </FormSection>

        <div className="flex justify-end gap-2 border-t border-kit pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Cập nhật" : "Tạo ca làm việc"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
