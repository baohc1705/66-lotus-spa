import { AdminTextarea } from "@/shared/components/forms/AdminTextarea";
import { AdminInput } from "@/shared/components/forms/AdminInput";
import { AdminSelectTrigger } from "@/shared/components/forms/AdminSelectTrigger";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { FormSection } from "@/shared/components/forms/FormSection";
import { FormField } from "@/shared/components/forms/FormField";
import {
  useCreateCertificateType,
  useUpdateCertificateType,
} from "../hooks/useCertificateTypes";
import {
  createCertificateTypeSchema,
  type CertificateTypeFormValues,
} from "../schemas/certificateType.schema";
import type { CertificateTypeDTO } from "../types/certificate.types";
import { COMMON_MSG } from "@/shared/constants/common.messages";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: CertificateTypeDTO | null;
}

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
    } else {
      createMutation.mutate(payload, {
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
            {isEdit ? "Chỉnh sửa loại chứng chỉ" : "Thêm loại chứng chỉ"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin loại chứng chỉ "${item?.name ?? ""}"`
              : "Điền thông tin để tạo loại chứng chỉ mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormSection icon={Award} title="Thông tin loại chứng chỉ">
            <div className="space-y-4">
              <FormField label="Mã loại *" error={errors.code?.message}>
                <AdminInput {...register("code")} placeholder="MASSAGE" />
              </FormField>
              <FormField
                label="Tên loại chứng chỉ *"
                error={errors.name?.message}
              >
                <AdminInput
                  {...register("name")}
                  placeholder="Chứng chỉ Massage Trị liệu"
                />
              </FormField>
              <FormField label="Mô tả" error={errors.description?.message}>
                <AdminTextarea
                  {...register("description")}
                  placeholder="Mô tả loại chứng chỉ..."
                  className="text-sm min-h-[72px]"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Thứ tự hiển thị"
                  error={errors.sortOrder?.message}
                >
                  <AdminInput
                    {...register("sortOrder")}
                    type="number"
                    placeholder="0"
                  />
                </FormField>
                <FormField label="Trạng thái" error={errors.status?.message}>
                  <Select
                    value={watch("status")?.toString()}
                    onValueChange={(v) => setValue("status", Number(v))}
                  >
                    <AdminSelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </AdminSelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Hoạt động</SelectItem>
                      <SelectItem value="0">Tạm đóng</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
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
              {isEdit ? "Cập nhật" : "Tạo loại chứng chỉ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
