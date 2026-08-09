import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { parseToDateInput } from "@/shared/utils/date.utils";

import { useStaffs } from "@/features/staffs/hooks/useStaffs";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import {
  useCreateStaffSalon,
  useUpdateStaffSalon,
} from "../hooks/useStaffSalons";
import {
  createStaffSalonSchema,
  updateStaffSalonSchema,
  type CreateStaffSalonFormValues,
  type UpdateStaffSalonFormValues,
} from "../schemas/staff-salon.schema";
import type { StaffSalonDTO } from "../types/staff-salon.types";

interface StaffSalonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: number;
  staffSalon?: StaffSalonDTO | null;
}

const STATUS_OPTIONS = [
  { value: "0", label: "Không hoạt động" },
  { value: "1", label: "Đang làm việc" },
];

export function StaffSalonFormDialog({
  open,
  onOpenChange,
  salonId,
  staffSalon,
}: StaffSalonFormDialogProps) {
  const isEdit = !!staffSalon;
  const createMutation = useCreateStaffSalon();
  const updateMutation = useUpdateStaffSalon();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: staffsData } = useStaffs({ pageIndex: 1, pageSize: 200 });
  const staffList = staffsData?.data?.items ?? [];

  const staffOptions = staffList.map((staff: StaffDto) => ({
    value: String(staff.id ?? ""),
    label: `${staff.fullName ?? "—"} (${staff.code ?? "—"})`,
  }));

  const createForm = useForm<CreateStaffSalonFormValues>({
    resolver: zodResolver(
      createStaffSalonSchema,
    ) as Resolver<CreateStaffSalonFormValues>,
    defaultValues: { salonId, isManager: false, startDate: "" },
  });

  const updateForm = useForm<UpdateStaffSalonFormValues>({
    resolver: zodResolver(
      updateStaffSalonSchema,
    ) as Resolver<UpdateStaffSalonFormValues>,
  });

  useEffect(() => {
    if (!open) return;
    if (staffSalon && isEdit) {
      updateForm.reset({
        isManager: staffSalon.isManager ?? false,
        startDate: parseToDateInput(staffSalon.startDate),
        endDate: parseToDateInput(staffSalon.endDate),
        status: staffSalon.status,
      });
    } else {
      createForm.reset({ salonId, isManager: false, startDate: "" });
    }
  }, [open, staffSalon, isEdit, salonId, createForm, updateForm]);

  function handleClose() {
    onOpenChange(false);
  }

  function onCreateSubmit(values: CreateStaffSalonFormValues) {
    createMutation.mutate(
      {
        staffId: values.staffId,
        salonId: values.salonId,
        isManager: values.isManager,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        status: values.status,
      },
      {
        onSuccess: (result) => {
          if (result.isSuccess) handleClose();
        },
      },
    );
  }

  function onUpdateSubmit(values: UpdateStaffSalonFormValues) {
    if (!staffSalon?.id) return;
    updateMutation.mutate(
      { id: staffSalon.id, payload: values },
      {
        onSuccess: (result) => {
          if (result.isSuccess) handleClose();
        },
      },
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        isEdit
          ? "Cập nhật nhân viên chi nhánh"
          : "Gán nhân viên vào chi nhánh"
      }
      size="md"
      scrollable
    >
      {isEdit ? (
        <form
          onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
          className="space-y-4"
        >
          <FormSection icon={Users} title="Thông tin phân công">
            <FormRow>
              <FormField
                label="Ngày bắt đầu"
                error={updateForm.formState.errors.startDate?.message}
              >
                <Input type="date" {...updateForm.register("startDate")} />
              </FormField>
              <FormField
                label="Ngày kết thúc"
                error={updateForm.formState.errors.endDate?.message}
              >
                <Input type="date" {...updateForm.register("endDate")} />
              </FormField>
            </FormRow>
            <FormField
              label="Trạng thái"
              error={updateForm.formState.errors.status?.message}
            >
              <Select
                value={String(updateForm.watch("status") ?? "")}
                onChange={(event) =>
                  updateForm.setValue("status", Number(event.target.value))
                }
                options={STATUS_OPTIONS}
                placeholder="Chọn trạng thái"
              />
            </FormField>
          </FormSection>

          <div className="flex justify-end gap-2 border-t border-kit pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mb-0"
              onClick={handleClose}
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
              Cập nhật
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={createForm.handleSubmit(onCreateSubmit)}
          className="space-y-4"
        >
          <FormSection icon={Users} title="Thông tin phân công">
            <FormField
              label="Nhân viên *"
              error={createForm.formState.errors.staffId?.message}
            >
              <Select
                value={String(createForm.watch("staffId") ?? "")}
                onChange={(event) =>
                  createForm.setValue("staffId", Number(event.target.value))
                }
                options={staffOptions}
                placeholder="Chọn nhân viên"
              />
            </FormField>
            <FormRow>
              <FormField
                label="Ngày bắt đầu *"
                error={createForm.formState.errors.startDate?.message}
              >
                <Input type="date" {...createForm.register("startDate")} />
              </FormField>
              <FormField
                label="Ngày kết thúc"
                error={createForm.formState.errors.endDate?.message}
              >
                <Input type="date" {...createForm.register("endDate")} />
              </FormField>
            </FormRow>
          </FormSection>

          <div className="flex justify-end gap-2 border-t border-kit pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mb-0"
              onClick={handleClose}
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
              Gán nhân viên
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
