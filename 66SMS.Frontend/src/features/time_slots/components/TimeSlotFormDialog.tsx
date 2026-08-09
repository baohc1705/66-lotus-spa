import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { toLocalTimeOnly } from "@/shared/utils/date.utils";

import { useCreateTimeSlot, useUpdateTimeSlot } from "../hooks/useTimeSlots";
import type { TimeSlotDTO } from "../types/time_slot.types";
import {
  createTimeSlotSchema,
  updateTimeSlotSchema,
  type CreateTimeSlotPayload,
  type TimeSlotFormValues,
  type UpdateTimeSlotPayload,
} from "../schemas/timeSlot.schema";

interface TimeSlotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeSlot?: TimeSlotDTO | null;
}

function getDefaultValues(timeSlot?: TimeSlotDTO | null): TimeSlotFormValues {
  if (timeSlot) {
    return {
      startTime: toLocalTimeOnly(timeSlot.startTime) || "",
      endTime: toLocalTimeOnly(timeSlot.endTime) || "",
    };
  }
  return {
    startTime: "",
    endTime: "",
  };
}

export function TimeSlotFormDialog({
  open,
  onOpenChange,
  timeSlot,
}: TimeSlotFormDialogProps) {
  const isEdit = !!timeSlot;
  const createMutation = useCreateTimeSlot();
  const updateMutation = useUpdateTimeSlot();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TimeSlotFormValues>({
    resolver: zodResolver(
      isEdit ? updateTimeSlotSchema : createTimeSlotSchema,
    ) as Resolver<TimeSlotFormValues>,
    defaultValues: getDefaultValues(timeSlot),
  });

  useEffect(() => {
    if (open) reset(getDefaultValues(timeSlot));
  }, [open, timeSlot, reset]);

  const onSubmit = (data: TimeSlotFormValues) => {
    function formatTimeSpan(value: string) {
      if (value && value.split(":").length === 2) return `${value}:00`;
      return value;
    }

    const payload = {
      startTime: formatTimeSpan(data.startTime),
      endTime: formatTimeSpan(data.endTime),
    };

    if (isEdit && timeSlot?.id) {
      updateMutation.mutate(
        {
          id: timeSlot.id,
          payload: payload as UpdateTimeSlotPayload,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
      return;
    }

    createMutation.mutate(payload as CreateTimeSlotPayload, {
      onSuccess: (result) => {
        if (result.isSuccess) onOpenChange(false);
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa khung giờ" : "Thêm khung giờ mới"}
      size="md"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <FormSection icon={Clock} title="Thông tin khung giờ">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField
              label="Giờ bắt đầu *"
              tooltip="Chọn thời gian bắt đầu khung giờ"
              error={errors.startTime?.message}
            >
              <Input
                {...register("startTime")}
                type="time"
                invalid={!!errors.startTime}
              />
            </FormField>

            <FormField
              label="Giờ kết thúc *"
              tooltip="Chọn thời gian kết thúc khung giờ"
              error={errors.endTime?.message}
            >
              <Input
                {...register("endTime")}
                type="time"
                invalid={!!errors.endTime}
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
            {COMMON_MSG.cancel}
          </Button>
          <Button
            type="submit"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Cập nhật" : "Tạo khung giờ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
