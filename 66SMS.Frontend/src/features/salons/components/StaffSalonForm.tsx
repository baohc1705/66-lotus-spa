import { zodResolver } from "@hookform/resolvers/zod";
import { Users } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { parseToDateInput } from "@/shared/utils/date.utils";

import {
  useCreateStaffSalon,
  useUpdateStaffSalon,
} from "@/features/salons/hooks/useStaffSalons";
import type { StaffSalonDTO } from "@/features/salons/types/staffSalon.types";
import { useStaffs } from "@/features/staffs/hooks/useStaffs";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";

const STATUS_OPTIONS = [
  { value: "0", label: "Không hoạt động" },
  { value: "1", label: "Đang làm việc" },
];

const staffSalonCreateSchema = z.object({
  staffId: z.coerce.number().min(1, "Vui lòng chọn nhân viên"),
  salonId: z.coerce.number().min(1, "Vui lòng chọn chi nhánh"),
  startDate: z.string().nonempty("Ngày bắt đầu không được để trống"),
  endDate: z.string().optional().or(z.literal("")),
  status: z.coerce.number().optional(),
});

const staffSalonUpdateSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional().or(z.literal("")),
  status: z.coerce.number().optional(),
});

type StaffSalonFormData = {
  staffId?: number;
  salonId?: number;
  startDate?: string;
  endDate?: string;
  status?: number;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: number;
  staffSalon?: StaffSalonDTO | null;
}

function getDefaultValues(
  salonId: number,
  staffSalon?: StaffSalonDTO | null,
): StaffSalonFormData {
  if (!staffSalon) {
    return {
      staffId: undefined,
      salonId,
      startDate: "",
      endDate: "",
      status: 1,
    };
  }

  return {
    staffId: staffSalon.staffId,
    salonId: staffSalon.salonId ?? salonId,
    startDate: staffSalon.startDate
      ? parseToDateInput(staffSalon.startDate)
      : "",
    endDate: staffSalon.endDate ? parseToDateInput(staffSalon.endDate) : "",
    status: staffSalon.status,
  };
}

export function StaffSalonForm({
  open,
  onOpenChange,
  salonId,
  staffSalon,
}: Props) {
  const isEdit = !!staffSalon?.id;
  const createMutation = useCreateStaffSalon();
  const updateMutation = useUpdateStaffSalon();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: staffsData } = useStaffs({ pageIndex: 1, pageSize: 200 });
  const staffList = staffsData?.data?.items ?? [];
  const staffOptions = staffList.map((staff: StaffDto) => ({
    value: String(staff.id),
    label: `${staff.fullName}`,
  }));

  const form = useForm<StaffSalonFormData>({
    resolver: zodResolver(
      isEdit ? staffSalonUpdateSchema : staffSalonCreateSchema,
    ) as Resolver<StaffSalonFormData>,
    defaultValues: getDefaultValues(salonId, null),
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = form;

  const staffIdValue = useWatch({
    control,
    name: "staffId",
  });

  const statusValue = useWatch({
    control,
    name: "status",
  });

  useEffect(() => {
    if (!open) return;
    reset(getDefaultValues(salonId, staffSalon));
  }, [open, salonId, staffSalon, reset]);

  async function onSubmit(values: StaffSalonFormData) {
    if (isEdit && staffSalon?.id) {
      const payload = {
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        status: values.status,
      };

      updateMutation.mutate(
        { id: staffSalon.id, payload },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
      return;
    }

    const payload = {
      staffId: values.staffId as number,
      salonId: values.salonId as number,
      startDate: values.startDate as string,
      endDate: values.endDate || undefined,
      status: values.status,
    };

    createMutation.mutate(payload, {
      onSuccess: (result) => {
        if (result.isSuccess) onOpenChange(false);
      },
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={
        isEdit ? "Cập nhật nhân viên chi nhánh" : "Gán nhân viên vào chi nhánh"
      }
      size="md"
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
            form="staff-salon-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Cập nhật" : "Gán nhân viên"}
          </Button>
        </>
      }
    >
      <form
        id="staff-salon-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormSection icon={Users} title="Thông tin phân công">
          {!isEdit ? (
            <FormField label="Nhân viên *" error={errors.staffId?.message}>
              <SearchableSelect
                value={String(staffIdValue ?? "")}
                onChange={(value) =>
                  setValue("staffId", Number(value), {
                    shouldValidate: true,
                  })
                }
                options={staffOptions}
                placeholder="Chọn nhân viên"
                searchPlaceholder="Tìm nhân viên"
              />
            </FormField>
          ) : null}

          <FormRow>
            <FormField label="Ngày bắt đầu" error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} />
            </FormField>
            <FormField label="Ngày kết thúc" error={errors.endDate?.message}>
              <Input type="date" {...register("endDate")} />
            </FormField>
          </FormRow>

          <FormField label="Trạng thái" error={errors.status?.message}>
            <Select
              value={String(statusValue ?? "")}
              onChange={(event) =>
                setValue("status", Number(event.target.value), {
                  shouldValidate: true,
                })
              }
              options={STATUS_OPTIONS}
              placeholder="Chọn trạng thái"
            />
          </FormField>
        </FormSection>
      </form>
    </Modal>
  );
}
