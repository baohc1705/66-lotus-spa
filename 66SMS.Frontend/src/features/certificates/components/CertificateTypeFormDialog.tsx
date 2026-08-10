import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";

import {
  useCreateCertificateType,
  useUpdateCertificateType,
} from "../hooks/useCertificateTypes";
import {
  createCertificateTypeSchema,
  type CertificateTypeFormValues,
} from "../schemas/certificateType.schema";
import type { CertificateTypeDTO } from "../types/certificate.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: CertificateTypeDTO | null;
}

const STATUS_OPTIONS = [
  { value: "1", label: "Hoạt động" },
  { value: "0", label: "Tạm đóng" },
];

function getDefaults(
  item?: CertificateTypeDTO | null,
): CertificateTypeFormValues {
  return {
    code: item?.code ?? "",
    name: item?.name ?? "",
    description: item?.description ?? "",
    sortOrder: item?.sortOrder ?? 0,
    status: item?.status ?? 1,
  };
}

export function CertificateTypeFormDialog({ open, onOpenChange, item }: Props) {
  const isEdit = !!item;
  const createMutation = useCreateCertificateType();
  const updateMutation = useUpdateCertificateType();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CertificateTypeFormValues>({
    resolver: zodResolver(
      createCertificateTypeSchema,
    ) as Resolver<CertificateTypeFormValues>,
    defaultValues: getDefaults(item),
  });

  useEffect(() => {
    if (open) reset(getDefaults(item));
  }, [open, item, reset]);

  const onSubmit = (data: CertificateTypeFormValues) => {
    const payload = {
      code: data.code,
      name: data.name,
      description: data.description || undefined,
      sortOrder: data.sortOrder,
      status: data.status,
    };

    if (isEdit && item?.id) {
      updateMutation.mutate(
        { id: item.id, payload },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: (result) => {
        if (result.isSuccess) onOpenChange(false);
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa loại chứng chỉ" : "Thêm loại chứng chỉ"}
      size="md"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <FormSection icon={Award} title="Thông tin loại chứng chỉ">
          <FormField label="Mã loại *" error={errors.code?.message}>
            <Input
              {...register("code")}
              placeholder="MASSAGE"
              invalid={!!errors.code}
            />
          </FormField>

          <FormField
            label="Tên loại chứng chỉ *"
            error={errors.name?.message}
          >
            <Input
              {...register("name")}
              placeholder="Chứng chỉ Massage Trị liệu"
              invalid={!!errors.name}
            />
          </FormField>

          <FormField label="Mô tả" error={errors.description?.message}>
            <Textarea
              {...register("description")}
              placeholder="Mô tả loại chứng chỉ..."
              rows={3}
              invalid={!!errors.description}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField
              label="Thứ tự hiển thị"
              error={errors.sortOrder?.message}
            >
              <Input
                {...register("sortOrder")}
                type="number"
                placeholder="0"
                invalid={!!errors.sortOrder}
              />
            </FormField>

            <FormField label="Trạng thái" error={errors.status?.message}>
              <Select
                value={String(watch("status") ?? 1)}
                onChange={(e) => setValue("status", Number(e.target.value))}
                options={STATUS_OPTIONS}
                invalid={!!errors.status}
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
            {isEdit ? "Cập nhật" : "Tạo loại chứng chỉ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
