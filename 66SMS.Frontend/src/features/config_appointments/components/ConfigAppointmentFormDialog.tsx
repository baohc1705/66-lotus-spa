import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { toLocalTimeOnly } from "@/shared/utils/date.utils";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { useSalonsAdmin } from "@/features/salons/hooks/useSalons";
import type { SalonDto } from "@/features/salons/types/salon.types";
import {
  useCreateConfigAppointment,
  useUpdateConfigAppointment,
} from "../hooks/useConfigAppointments";
import {
  createConfigAppointmentSchema,
  updateConfigAppointmentSchema,
  type CreateConfigAppointmentPayload,
  type ConfigAppointmentFormValues,
  type UpdateConfigAppointmentPayload,
} from "../schemas/configAppointment.schema";
import type { ConfigAppointmentDTO } from "../types/config_appointment.types";

interface ConfigAppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configAppointment?: ConfigAppointmentDTO | null;
}

function getDefaultValues(
  configAppointment?: ConfigAppointmentDTO | null,
  effectiveSalonId?: number | null,
): ConfigAppointmentFormValues {
  if (configAppointment) {
    return {
      salonId: configAppointment.salonId ?? 0,
      depositPercent: configAppointment.depositPercent ?? 20,
      startTime: toLocalTimeOnly(configAppointment.startTime),
      endTime: toLocalTimeOnly(configAppointment.endTime),
      slotMinutes: configAppointment.slotMinutes ?? undefined,
    };
  }

  return {
    salonId: effectiveSalonId ?? 0,
    depositPercent: 20,
    startTime: "08:00",
    endTime: "21:00",
    slotMinutes: 30,
  };
}

function formatTimeSpan(time?: string) {
  if (!time) return undefined;
  if (time.split(":").length === 2) return `${time}:00`;
  return time;
}

export function ConfigAppointmentFormDialog({
  open,
  onOpenChange,
  configAppointment,
}: ConfigAppointmentFormDialogProps) {
  const isEdit = !!configAppointment;
  const createMutation = useCreateConfigAppointment();
  const updateMutation = useUpdateConfigAppointment();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const effectiveSalonId = useAuthStore((state) => state.getEffectiveSalonId());
  const { data: salonsResult } = useSalonsAdmin(
    { pageIndex: 1, pageSize: 100 },
    open && !isEdit,
  );
  const salons = salonsResult?.data?.items ?? [];

  const salonOptions = salons.map((salon: SalonDto) => ({
    value: String(salon.id),
    label: salon.name ?? "",
  }));

  let salonPlaceholder = "Chọn chi nhánh...";
  if (salonsResult === undefined) {
    salonPlaceholder = "Đang tải chi nhánh...";
  } else if (salons.length === 0) {
    salonPlaceholder = "Không có chi nhánh";
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ConfigAppointmentFormValues>({
    resolver: zodResolver(
      isEdit ? updateConfigAppointmentSchema : createConfigAppointmentSchema,
    ) as Resolver<ConfigAppointmentFormValues>,
    defaultValues: getDefaultValues(configAppointment, effectiveSalonId),
  });

  const salonIdValue = watch("salonId");

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(configAppointment, effectiveSalonId));
    }
  }, [open, configAppointment, effectiveSalonId, reset]);

  function onSubmit(data: ConfigAppointmentFormValues) {
    const payload = {
      salonId: data.salonId,
      depositPercent: data.depositPercent,
      startTime: formatTimeSpan(data.startTime) || undefined,
      endTime: formatTimeSpan(data.endTime) || undefined,
      slotMinutes: data.slotMinutes || undefined,
    };

    if (isEdit && configAppointment?.id) {
      updateMutation.mutate(
        {
          id: configAppointment.id,
          payload: payload as UpdateConfigAppointmentPayload,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
      return;
    }

    createMutation.mutate(payload as CreateConfigAppointmentPayload, {
      onSuccess: (result) => {
        if (result.isSuccess) onOpenChange(false);
      },
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa cấu hình lịch hẹn" : "Thêm cấu hình lịch hẹn"}
      size="lg"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection icon={Settings} title="Thông tin cấu hình">
          {!isEdit ? (
            <FormField
              label="Chi nhánh *"
              tooltip="Mỗi chi nhánh chỉ có một cấu hình"
              error={errors.salonId?.message}
            >
              <Select
                value={salonIdValue ? String(salonIdValue) : ""}
                onChange={(event) =>
                  setValue("salonId", Number(event.target.value), {
                    shouldValidate: true,
                  })
                }
                options={salonOptions}
                placeholder={salonPlaceholder}
                invalid={!!errors.salonId}
              />
            </FormField>
          ) : (
            <FormField label="Chi nhánh">
              <Input value={configAppointment?.salonName ?? ""} disabled />
            </FormField>
          )}

          <FormRow>
            <FormField
              label="Phần trăm cọc (%) *"
              tooltip="Tỉ lệ cọc khi khách đặt lịch online"
              error={errors.depositPercent?.message}
            >
              <Input
                type="number"
                min={0}
                max={100}
                {...register("depositPercent")}
                invalid={!!errors.depositPercent}
              />
            </FormField>

            <FormField
              label="Phút mỗi khung"
              tooltip="Độ dài mỗi khung giờ (phút)"
              error={errors.slotMinutes?.message}
            >
              <Input
                type="number"
                min={1}
                {...register("slotMinutes")}
                invalid={!!errors.slotMinutes}
              />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField
              label="Giờ mở cửa"
              tooltip="Giờ bắt đầu nhận lịch trong ngày"
              error={errors.startTime?.message}
            >
              <Input
                type="time"
                {...register("startTime")}
                invalid={!!errors.startTime}
              />
            </FormField>

            <FormField
              label="Giờ đóng cửa"
              tooltip="Giờ kết thúc nhận lịch trong ngày"
              error={errors.endTime?.message}
            >
              <Input
                type="time"
                {...register("endTime")}
                invalid={!!errors.endTime}
              />
            </FormField>
          </FormRow>
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
            {isEdit ? "Cập nhật" : "Tạo cấu hình"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
