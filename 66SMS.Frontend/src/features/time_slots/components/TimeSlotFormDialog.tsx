import { AdminInput } from '@/shared/components/forms/AdminInput';
import { useForm, type Resolver } from "react-hook-form";
import {
  useCreateTimeSlot,
  useUpdateTimeSlot,
} from "../hooks/useTimeSlots";
import type { TimeSlotDTO } from "../types/time_slot.types";
import {
  createTimeSlotSchema,
  updateTimeSlotSchema,
  type CreateTimeSlotPayload,
  type TimeSlotFormValues,
  type UpdateTimeSlotPayload,
} from "../schemas/timeSlot.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { Clock } from "lucide-react";
import { FormField } from "@/shared/components/forms/FormField";

interface TimeSlotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeSlot?: TimeSlotDTO | null;
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

  const form = useForm<TimeSlotFormValues>({
    resolver: zodResolver(
      isEdit ? updateTimeSlotSchema : createTimeSlotSchema,
    ) as Resolver<TimeSlotFormValues>,
    defaultValues: getDefaultValues(timeSlot),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(timeSlot));
    }
  }, [open, timeSlot, reset]);

  const onSubmit = (data: TimeSlotFormValues) => {
    const formatTimeSpan = (t: string) => {
      if (t && t.split(":").length === 2) {
        return `${t}:00`;
      }
      return t;
    };

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
    } else {
      createMutation.mutate(payload as CreateTimeSlotPayload, {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa khung giờ" : "Thêm khung giờ mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật thông tin khung giờ"
              : "Điền thông tin để tạo khung giờ mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormSection icon={Clock} title="Thông tin khung giờ">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField
                label="Giờ bắt đầu"
                tooltip="Chọn thời gian bắt đầu khung giờ"
                error={errors.startTime?.message}
              >
                <AdminInput
                  {...register("startTime")}
                  type="time"
                />
              </FormField>

              <FormField
                label="Giờ kết thúc"
                tooltip="Chọn thời gian kết thúc khung giờ"
                error={errors.endTime?.message}
              >
                <AdminInput
                  {...register("endTime")}
                  type="time"
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
              {isEdit ? "Cập nhật" : "Tạo khung giờ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValues(
  timeSlot?: TimeSlotDTO | null,
): TimeSlotFormValues {
  const sliceTime = (t?: string) => {
    if (!t) return "";
    const parts = t.split(":");
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return t;
  };

  if (timeSlot) {
    return {
      startTime: sliceTime(timeSlot.startTime),
      endTime: sliceTime(timeSlot.endTime),
    };
  }
  return {
    startTime: "",
    endTime: "",
  };
}
