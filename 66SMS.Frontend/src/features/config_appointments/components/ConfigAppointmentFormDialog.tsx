import { AdminInput } from "@/shared/components/forms/AdminInput";
import { useForm, type Resolver } from "react-hook-form";
import {
  useCreateConfigAppointment,
  useUpdateConfigAppointment,
} from "../hooks/useConfigAppointments";
import { useAdminSalons } from "@/features/salons/hooks/useSalons";
import { useAuthStore } from "@/features/auth/stores/authStore";
import type { ConfigAppointmentDTO } from "../types/config_appointment.types";
import type { SalonDTO } from "@/features/salons/types/salon.types";
import {
  createConfigAppointmentSchema,
  updateConfigAppointmentSchema,
  type CreateConfigAppointmentPayload,
  type ConfigAppointmentFormValues,
  type UpdateConfigAppointmentPayload,
} from "../schemas/configAppointment.schema";
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
import { Settings } from "lucide-react";
import { FormField } from "@/shared/components/forms/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { AdminSelectTrigger } from "@/shared/components/forms/AdminSelectTrigger";

interface ConfigAppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configAppointment?: ConfigAppointmentDTO | null;
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

  const effectiveSalonId = useAuthStore((s) => s.getEffectiveSalonId());
  const { data: salonsResult } = useAdminSalons(
    { pageIndex: 1, pageSize: 100 },
    open && !isEdit,
  );
  const salons = salonsResult?.data?.items ?? [];

  const form = useForm<ConfigAppointmentFormValues>({
    resolver: zodResolver(
      isEdit ? updateConfigAppointmentSchema : createConfigAppointmentSchema,
    ) as Resolver<ConfigAppointmentFormValues>,
    defaultValues: getDefaultValues(configAppointment, effectiveSalonId),
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
    if (open) {
      reset(getDefaultValues(configAppointment, effectiveSalonId));
    }
  }, [open, configAppointment, effectiveSalonId, reset]);

  const formatTimeSpan = (t?: string) => {
    if (!t) return undefined;
    if (t.split(":").length === 2) return `${t}:00`;
    return t;
  };

  const onSubmit = (data: ConfigAppointmentFormValues) => {
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
    } else {
      createMutation.mutate(payload as CreateConfigAppointmentPayload, {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa cấu hình lịch hẹn" : "Thêm cấu hình lịch hẹn"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật phần trăm cọc và khung giờ theo chi nhánh"
              : "Thiết lập phần trăm cọc và khung giờ cho từng chi nhánh"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormSection icon={Settings} title="Thông tin cấu hình">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {!isEdit && (
                <FormField
                  label="Chi nhánh *"
                  tooltip="Mỗi chi nhánh chỉ có một cấu hình"
                  error={errors.salonId?.message}
                  className="sm:col-span-2"
                >
                  <Select
                    value={watch("salonId")?.toString() ?? ""}
                    onValueChange={(v) =>
                      setValue("salonId", Number(v), { shouldValidate: true })
                    }
                  >
                    <AdminSelectTrigger>
                      <SelectValue
                        placeholder={
                          salonsResult === undefined
                            ? "Đang tải chi nhánh..."
                            : salons.length === 0
                              ? "Không có chi nhánh"
                              : "Chọn chi nhánh..."
                        }
                      />
                    </AdminSelectTrigger>
                    <SelectContent>
                      {salons.map((s: SalonDTO) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}

              {isEdit && (
                <FormField
                  label="Chi nhánh"
                  className="sm:col-span-2"
                >
                  <AdminInput
                    value={configAppointment?.salonName ?? ""}
                    disabled
                  />
                </FormField>
              )}

              <FormField
                label="Phần trăm cọc (%) *"
                tooltip="Tỉ lệ cọc khi khách đặt lịch online"
                error={errors.depositPercent?.message}
              >
                <AdminInput
                  type="number"
                  min={0}
                  max={100}
                  {...register("depositPercent")}
                />
              </FormField>

              <FormField
                label="Phút mỗi khung"
                tooltip="Độ dài mỗi slot (phút)"
                error={errors.slotMinutes?.message}
              >
                <AdminInput
                  type="number"
                  min={1}
                  {...register("slotMinutes")}
                />
              </FormField>

              <FormField
                label="Giờ mở cửa"
                tooltip="Giờ bắt đầu nhận lịch trong ngày"
                error={errors.startTime?.message}
              >
                <AdminInput type="time" {...register("startTime")} />
              </FormField>

              <FormField
                label="Giờ đóng cửa"
                tooltip="Giờ kết thúc nhận lịch trong ngày"
                error={errors.endTime?.message}
              >
                <AdminInput type="time" {...register("endTime")} />
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
              {isEdit ? "Cập nhật" : "Tạo cấu hình"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValues(
  configAppointment?: ConfigAppointmentDTO | null,
  effectiveSalonId?: number | null,
): ConfigAppointmentFormValues {
  const sliceTime = (t?: string | null) => {
    if (!t) return "";
    const parts = t.split(":");
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    return t;
  };

  if (configAppointment) {
    return {
      salonId: configAppointment.salonId ?? 0,
      depositPercent: configAppointment.depositPercent ?? 20,
      startTime: sliceTime(configAppointment.startTime),
      endTime: sliceTime(configAppointment.endTime),
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
