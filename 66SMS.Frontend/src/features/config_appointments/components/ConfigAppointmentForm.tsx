import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Resolver } from "react-hook-form";

import { useSalonsAdmin } from "@/features/salons/hooks/useSalons";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import type { SalonDto } from "@/features/salons/types/salon.types";

import type {
  ConfigAppointmentDTO,
  CreateConfigAppointmentRequest,
  UpdateConfigAppointmentRequest,
} from "../types/configAppointment.types";
import {
  useCreateConfigAppointment,
  useUpdateConfigAppointment,
} from "../hooks/useConfigAppointments";
import { formatTimeSpan } from "@/shared/utils/date.utils";

const emptyToUndefined = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

const configAppointmentSchema = z
  .object({
    salonId: z.coerce.number().min(1, "Vui lòng chọn chi nhánh"),
    depositPercent: z.coerce
      .number({ error: "Phần trăm cọc không được để trống" })
      .min(0, "Phần trăm cọc phải từ 0 đến 100")
      .max(100, "Phần trăm cọc phải từ 0 đến 100"),
    startTime: z.preprocess(emptyToUndefined, z.string().optional()),
    endTime: z.preprocess(emptyToUndefined, z.string().optional()),
    slotMinutes: z.preprocess(
      emptyToUndefined,
      z.coerce.number().min(1, "Số phút mỗi khung giờ phải lớn hơn 0").optional(),
    ),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      const [startH, startM] = data.startTime.split(":").map(Number);
      const [endH, endM] = data.endTime.split(":").map(Number);
      return endH * 60 + endM > startH * 60 + startM;
    },
    {
      message: "Thời gian kết thúc phải lớn hơn thời gian bắt đầu",
      path: ["endTime"],
    },
  );

type ConfigAppointmentFormData = z.infer<typeof configAppointmentSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configAppointment?: ConfigAppointmentDTO | null;
}

function getDefaultValues(
  configAppointment?: ConfigAppointmentDTO | null,
): ConfigAppointmentFormData {
  if (!configAppointment) {
    return {
      salonId: 0,
      depositPercent: 0,
      startTime: undefined,
      endTime: undefined,
      slotMinutes: undefined,
    };
  }

  return {
    salonId: configAppointment.salonId ?? 0,
    depositPercent: configAppointment.depositPercent ?? 0,
    startTime: configAppointment.startTime ?? undefined,
    endTime: configAppointment.endTime ?? undefined,
    slotMinutes: configAppointment.slotMinutes ?? undefined,
  };
}

export function ConfigAppointmentForm({
  open,
  onOpenChange,
  configAppointment,
}: Props) {
  const isEdit = !!configAppointment?.id;
  const createMutation = useCreateConfigAppointment();
  const updateMutation = useUpdateConfigAppointment();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const formKey = !open
    ? "closed"
    : isEdit
      ? `edit-${configAppointment?.id ?? "loading"}`
      : "new";
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);

  const { data: salonsResult } = useSalonsAdmin(
    { pageIndex: 1, pageSize: 100 },
    open && !isEdit,
  );
  const salons = salonsResult?.data?.items ?? [];

  const salonOptions: { value: string; label: string }[] = [];
  for (let index = 0; index < salons.length; index++) {
    const salon: SalonDto = salons[index];
    if (!salon.id) continue;
    salonOptions.push({
      value: String(salon.id),
      label: salon.name ?? "",
    });
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ConfigAppointmentFormData>({
    resolver: zodResolver(configAppointmentSchema) as Resolver<ConfigAppointmentFormData>,
    defaultValues: getDefaultValues(null),
  });

  const salonIdValue = useWatch({ control, name: "salonId" });

  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      reset(getDefaultValues(isEdit ? configAppointment : null));
    }
  }

  function onSubmit(values: ConfigAppointmentFormData) {
    if (isEdit && configAppointment?.id) {
      const payload: UpdateConfigAppointmentRequest = {
        salonId: values.salonId,
        depositPercent: values.depositPercent,
        startTime: formatTimeSpan(values.startTime),
        endTime: formatTimeSpan(values.endTime),
        slotMinutes: values.slotMinutes ?? undefined,
      };

      updateMutation.mutate(
        { id: configAppointment.id, payload },
        {
          onSuccess: (result) => {
            if (result.isSuccess !== true) return;
            onOpenChange(false);
          },
        },
      );
      return;
    }

    const payload: CreateConfigAppointmentRequest = {
      salonId: values.salonId,
      depositPercent: values.depositPercent,
      startTime: formatTimeSpan(values.startTime),
      endTime: formatTimeSpan(values.endTime),
      slotMinutes: values.slotMinutes ?? undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: (result) => {
        if (result.isSuccess !== true) return;
        onOpenChange(false);
      },
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa cấu hình lịch hẹn" : "Thêm cấu hình lịch hẹn mới"}
      size="xl"
      scrollable
      footer={
        <>
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
            form="config-appointment-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Cập nhật" : "Tạo cấu hình lịch hẹn"}
          </Button>
        </>
      }
    >
      <form id="config-appointment-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormRow>
            <FormField
              label="Chi nhánh"
              error={errors.salonId?.message}
              required={!isEdit}
            >
              {isEdit ? (
                <>
                  <input type="hidden" {...register("salonId")} />
                  <Input value={configAppointment?.salonName ?? ""} disabled />
                </>
              ) : (
                <Select
                  value={
                    salonIdValue && salonIdValue > 0
                      ? String(salonIdValue)
                      : ""
                  }
                  onChange={(event) =>
                    setValue("salonId", Number(event.target.value), {
                      shouldValidate: true,
                    })
                  }
                  options={salonOptions}
                  placeholder="Chọn chi nhánh..."
                  invalid={!!errors.salonId}
                  disabled={isEdit}
                />
              )}
            </FormField>

            <FormField
              label="Phần trăm đặt cọc (%)"
              error={errors.depositPercent?.message}
              required
            >
              <Input
                type="number"
                min={0}
                max={100}
                {...register("depositPercent")}
                placeholder="0 - 100"
              />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField label="Giờ bắt đầu" error={errors.startTime?.message}>
              <Input type="time" {...register("startTime")} />
            </FormField>

            <FormField label="Giờ kết thúc" error={errors.endTime?.message}>
              <Input type="time" {...register("endTime")} />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField
              label="Số phút mỗi khung giờ"
              error={errors.slotMinutes?.message}
            >
              <Input
                type="number"
                min={1}
                {...register("slotMinutes")}
                placeholder="Ví dụ: 30"
              />
            </FormField>
          </FormRow>
        </div>
      </form>
    </Modal>
  );
}
