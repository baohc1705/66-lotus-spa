import {
  useCreateCertificateType,
  useUpdateCertificateType,
} from "@/features/certificates/hooks/useCertificateTypes";
import type { CertificateTypeDto } from "@/features/certificates/types/certificateType.types";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

// Validate dữ liệu client side
const certificateTypeSchema = z.object({
  code: z
    .string()
    .min(1, "Mã loại chứng chỉ không được để trống")
    .max(50, "Tối đa 50 ký tự"),
  name: z
    .string()
    .min(1, "Tên loại chứng chỉ không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  description: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce
    .number()
    .min(0, "Thứ tự hiển thị không được âm")
    .optional()
    .default(0),
  status: z.coerce.number().min(0).optional().default(1),
});

type CertificateTypeFormData = z.infer<typeof certificateTypeSchema>;

const STATUS_OPTIONS = [
  { value: "1", label: "Hoạt động" },
  { value: "0", label: "Tạm đóng" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificateType?: CertificateTypeDto | null;
}

function getDefaultValues(
  item?: CertificateTypeDto | null,
): CertificateTypeFormData {
  return {
    code: item?.code ?? "",
    name: item?.name ?? "",
    description: item?.description ?? "",
    sortOrder: item?.sortOrder ?? 0,
    status: item?.status ?? 1,
  };
}

export function CertificateTypeForm({
  open,
  onOpenChange,
  certificateType,
}: Props) {
  const isEdit = !!certificateType;
  const createMutation = useCreateCertificateType();
  const updateMutation = useUpdateCertificateType();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Reset form khi mở modal bằng formKey
  const formKey = !open
    ? "closed"
    : isEdit
      ? `edit-${certificateType?.id ?? "loading"}`
      : "new";
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CertificateTypeFormData>({
    resolver: zodResolver(
      certificateTypeSchema,
    ) as Resolver<CertificateTypeFormData>,
    defaultValues: getDefaultValues(null),
  });

  const status = useWatch({ control, name: "status" });

  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      reset(getDefaultValues(certificateType));
    }
  }

  // Sửa trước, tạo sau
  function onSubmit(data: CertificateTypeFormData) {
    if (isEdit && certificateType?.id) {
      updateMutation.mutate(
        {
          id: certificateType.id,
          data: {
            code: data.code,
            name: data.name,
            description: data.description || undefined,
            sortOrder: data.sortOrder,
            status: data.status,
          },
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess !== true) return;
            onOpenChange(false);
          },
        },
      );
      return;
    }

    createMutation.mutate(
      {
        code: data.code,
        name: data.name,
        description: data.description || undefined,
        sortOrder: data.sortOrder,
        status: data.status,
      },
      {
        onSuccess: (result) => {
          if (result.isSuccess !== true) return;
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa loại chứng chỉ" : "Thêm loại chứng chỉ"}
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
            form="certificate-type-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Cập nhật" : "Tạo loại chứng chỉ"}
          </Button>
        </>
      }
    >
      <form
        id="certificate-type-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        <FormSection icon={Award} title="Thông tin loại chứng chỉ">
          <FormRow>
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

            <FormField
              label="Mô tả"
              error={errors.description?.message}
              className="sm:col-span-2"
            >
              <Textarea
                {...register("description")}
                placeholder="Mô tả loại chứng chỉ..."
                rows={3}
                invalid={!!errors.description}
              />
            </FormField>

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
                value={String(status ?? 1)}
                onChange={(event) =>
                  setValue("status", Number(event.target.value))
                }
                options={STATUS_OPTIONS}
                invalid={!!errors.status}
              />
            </FormField>
          </FormRow>
        </FormSection>
      </form>
    </Modal>
  );
}
