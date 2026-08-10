import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Info } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useActiveSalons } from "@/features/salons/hooks/useActiveSalons";
import { useAdminSalons } from "@/features/salons/hooks/useSalons";
import type { SalonDTO } from "@/features/salons/types/salon.types";

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

function getDefaultValues(
  shift?: ShiftDTO | null,
  effectiveSalonId?: number | null,
): CreateShiftFormValues {
  if (shift) {
    return {
      salonId: shift.salonId ?? 0,
      name: shift.name ?? "",
      description: shift.description ?? "",
      shiftStart: shift.shiftStart?.substring(0, 5) ?? "08:00",
      shiftEnd: shift.shiftEnd?.substring(0, 5) ?? "17:00",
    };
  }
  return {
    salonId: effectiveSalonId ?? 0,
    name: "",
    description: "",
    shiftStart: "08:00",
    shiftEnd: "17:00",
  };
}

export function ShiftFormDialog({
  open,
  onOpenChange,
  shift,
}: ShiftFormDialogProps) {
  const isEdit = !!shift;
  const isAdmin = useAuthStore((state) => state.hasRole("Admin"));
  const selectedSalonId = useAuthStore((state) => state.selectedSalonId);
  const getEffectiveSalonId = useAuthStore((state) => state.getEffectiveSalonId);
  const mySalon = useAuthStore((state) => state.mySalon);

  const lockedSalonId = getEffectiveSalonId();
  const defaultSalonId = isAdmin ? (selectedSalonId ?? lockedSalonId) : lockedSalonId;

  const createMutation = useCreateShift();
  const updateMutation = useUpdateShift();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const canPickSalon = isAdmin && !isEdit;
  const { data: salonsResult } = useAdminSalons(
    { pageIndex: 1, pageSize: 100 },
    open && canPickSalon,
  );
  const salons = salonsResult?.data?.items ?? [];
  const { data: activeSalons = [] } = useActiveSalons();

  const salonOptions = salons.map((salon: SalonDTO) => ({
    value: String(salon.id),
    label: salon.name ?? "",
  }));

  let salonPlaceholder = "Chọn chi nhánh...";
  if (salonsResult === undefined) {
    salonPlaceholder = "Đang tải chi nhánh...";
  } else if (salons.length === 0) {
    salonPlaceholder = "Không có chi nhánh";
  }

  let lockedSalonName = shift?.salonName ?? mySalon?.salonName ?? "";
  if (!lockedSalonName && lockedSalonId) {
    for (let index = 0; index < activeSalons.length; index++) {
      if (activeSalons[index].id === lockedSalonId) {
        lockedSalonName = activeSalons[index].name ?? "";
        break;
      }
    }
  }
  if (!lockedSalonName && lockedSalonId) {
    lockedSalonName = `Chi nhánh #${lockedSalonId}`;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateShiftFormValues | UpdateShiftFormValues>({
    resolver: zodResolver(
      isEdit ? updateShiftSchema : createShiftSchema,
    ) as Resolver<CreateShiftFormValues | UpdateShiftFormValues>,
    defaultValues: getDefaultValues(shift, defaultSalonId),
  });

  const salonIdValue = watch("salonId");

  useEffect(() => {
    if (open) reset(getDefaultValues(shift, defaultSalonId));
  }, [open, shift, defaultSalonId, reset]);

  const onSubmit = (data: CreateShiftFormValues | UpdateShiftFormValues) => {
    const shiftStartStr =
      data.shiftStart.length === 5 ? `${data.shiftStart}:00` : data.shiftStart;
    const shiftEndStr =
      data.shiftEnd.length === 5 ? `${data.shiftEnd}:00` : data.shiftEnd;
      
    const salonId = isAdmin ? data.salonId : (lockedSalonId ?? data.salonId);

    if (isEdit && shift?.id) {
      updateMutation.mutate(
        {
          id: shift.id,
          payload: {
            id: shift.id,
            salonId: shift.salonId ?? salonId,
            name: data.name,
            description: data.description,
            shiftStart: shiftStartStr,
            shiftEnd: shiftEndStr,
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
        salonId,
        name: data.name,
        description: data.description,
        shiftStart: shiftStartStr,
        shiftEnd: shiftEndStr,
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
          {canPickSalon ? (
            <FormField
              label="Chi nhánh *"
              tooltip="Ca làm việc thuộc chi nhánh này"
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
            <FormField
              label="Chi nhánh *"
              tooltip="Quản lý chỉ được tạo ca cho chi nhánh của mình"
            >
              <Input value={lockedSalonName || "Chi nhánh của bạn"} disabled />
            </FormField>
          )}

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
