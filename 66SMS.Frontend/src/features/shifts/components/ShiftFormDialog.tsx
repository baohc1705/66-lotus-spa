import { useForm, type Resolver } from "react-hook-form";
import { useCreateShift, useUpdateShift } from "../hooks/useShifts";
import type { ShiftDTO } from "../types/shift.types";
import {
  createShiftSchema,
  updateShiftSchema,
  type CreateShiftFormValues,
  type UpdateShiftFormValues,
} from "../schemas/shift.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { formatDate } from "@/shared/utils/date.utils";
import { COMMON_MSG } from "@/shared/constants/common.messages";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { FormSection } from "@/shared/components/forms/FormSection";
import { Clock, Info } from "lucide-react";
import { FormField } from "@/shared/components/forms/FormField";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

interface ShiftFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift?: ShiftDTO | null;
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

  const form = useForm<CreateShiftFormValues | UpdateShiftFormValues>({
    resolver: zodResolver(
      isEdit ? updateShiftSchema : createShiftSchema,
    ) as Resolver<CreateShiftFormValues | UpdateShiftFormValues>,
    defaultValues: getDefaultValues(shift),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(shift));
    }
  }, [open, shift, reset]);

  const onSubmit = (data: CreateShiftFormValues | UpdateShiftFormValues) => {
    // Format time to HH:mm:ss for backend TimeOnly
    const shiftStartStr =
      data.shiftStart.length === 5 ? `${data.shiftStart}:00` : data.shiftStart;
    const shiftEndStr =
      data.shiftEnd.length === 5 ? `${data.shiftEnd}:00` : data.shiftEnd;

    if (isEdit && shift?.id) {
      // Find current period
      const currentPeriod = shift.shiftPeriodDTOs?.[0];

      // Check if time-related fields have changed
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
    } else {
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa ca làm việc" : "Thêm ca làm việc mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Chỉnh sửa thông tin ca. Lịch sử ca cũ sẽ được lưu lại.`
              : "Điền thông tin để tạo ca làm việc mới."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Thông tin chung */}
          <FormSection icon={Info} title="Thông tin cơ bản">
            <div className="grid grid-cols-1 gap-y-5">
              <FormField
                label="Tên ca"
                tooltip="Vui lòng nhập tên ca (VD: Ca Sáng)"
                error={errors.name?.message}
              >
                <Input
                  {...register("name")}
                  placeholder="Ca Sáng"
                  className="h-9 text-[13px]"
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
                />
              </FormField>
            </div>
          </FormSection>

          {/* Thời gian */}
          <FormSection icon={Clock} title="Thời gian làm việc">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField
                label="Giờ bắt đầu"
                tooltip="Giờ bắt đầu làm việc"
                error={errors.shiftStart?.message}
              >
                <Input
                  type="time"
                  {...register("shiftStart")}
                  className="h-9 text-[13px]"
                />
              </FormField>

              <FormField
                label="Giờ kết thúc"
                tooltip="Giờ kết thúc làm việc"
                error={errors.shiftEnd?.message}
              >
                <Input
                  type="time"
                  {...register("shiftEnd")}
                  className="h-9 text-[13px]"
                />
              </FormField>

              <FormField
                label="Ngày bắt đầu áp dụng"
                tooltip="Ngày ca làm việc này bắt đầu có hiệu lực"
                error={errors.effectiveFrom?.message}
              >
                <Input
                  type="date"
                  {...register("effectiveFrom")}
                  className="h-9 text-[13px]"
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
                  className="h-9 text-[13px]"
                />
              </FormField>
            </div>
          </FormSection>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {COMMON_MSG.cancel}
            </Button>
            <Button type="submit" variant="admin" size="sm" loading={isPending}>
              {isEdit ? "Cập nhật" : "Tạo ca làm việc"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper function
function getDefaultValues(shift?: ShiftDTO | null): CreateShiftFormValues {
  if (shift) {
    const currentPeriod = shift.shiftPeriodDTOs?.[0]; // Lấy period mới nhất
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
