import { useForm, type Resolver } from "react-hook-form";
import {
  useCreateServiceCategory,
  useUpdateServiceCategory,
} from "../hooks/useServiceCategories";
import type { ServiceCategoryDto } from "../types/serviceCategory.types";
import {
  createServiceCategorySchema,
  type CreateServiceCategoryPayload,
  type ServiceCategoryFormValues,
  type UpdateServiceCategoryPayload,
} from "../schemas/serviceCategory.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Box } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { StatusActive } from "@/shared/constants/status.enum";

interface ServiceCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceCategory?: ServiceCategoryDto | null;
  onSuccess?: (category: ServiceCategoryDto) => void;
}

export function ServiceCategoryFormDialog({
  open,
  onOpenChange,
  serviceCategory,
  onSuccess,
}: ServiceCategoryFormDialogProps) {
  const isEdit = !!serviceCategory;
  const createMutation = useCreateServiceCategory();
  const updateMutation = useUpdateServiceCategory();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [pendingIconFile, setPendingIconFile] = useState<File | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ServiceCategoryFormValues>({
    resolver: zodResolver(
      createServiceCategorySchema,
    ) as Resolver<ServiceCategoryFormValues>,
    defaultValues: getDefaultValues(serviceCategory),
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
      setPendingIconFile(null);
      setPendingImageFile(null);
      reset(getDefaultValues(serviceCategory));
    }
  }, [open, serviceCategory, reset]);

  const onSubmit = async (data: ServiceCategoryFormValues) => {
    setIsUploading(true);
    try {
      const payload: CreateServiceCategoryPayload = {
        name: data.name,
        description: data.description || undefined,
        sortOrder: data.sortOrder,
        status: data.status,
      };

      if (pendingIconFile) {
        payload.icon = await fileToBase64(pendingIconFile);
      }
      if (pendingImageFile) {
        payload.imageUrl = await fileToBase64(pendingImageFile);
      }

      if (isEdit && serviceCategory?.id) {
        updateMutation.mutate(
          {
            id: serviceCategory.id,
            payload: payload as UpdateServiceCategoryPayload,
          },
          {
            onSuccess: (result) => {
              if (result.isSuccess) {
                onOpenChange(false);
                onSuccess?.({ ...serviceCategory, ...payload });
              }
            },
          },
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: (result) => {
            if (result.isSuccess) {
              onOpenChange(false);
              onSuccess?.(payload as ServiceCategoryDto);
            }
          },
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa nhóm dịch vụ" : "Thêm nhóm dịch vụ mới"}
      size="xl"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection icon={Box} title="Thông tin nhóm dịch vụ">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField label="Icon" tooltip="Ảnh icon nhỏ cho nhóm dịch vụ">
              <ImageUpload
                key={`icon-${open}-${serviceCategory?.id ?? "new"}`}
                value={watch("icon") || serviceCategory?.icon}
                onFileChange={setPendingIconFile}
                shape="square"
                label="Chọn icon"
              />
            </FormField>

            <FormField
              label="Ảnh đại diện"
              tooltip="Ảnh lớn hiển thị nhóm dịch vụ"
            >
              <ImageUpload
                key={`image-${open}-${serviceCategory?.id ?? "new"}`}
                value={watch("imageUrl") || serviceCategory?.imageUrl}
                onFileChange={setPendingImageFile}
                shape="square"
                label="Chọn ảnh"
              />
            </FormField>

            <FormField
              label="Tên nhóm dịch vụ"
              tooltip="Vui lòng nhập vào tên nhóm dịch vụ"
              error={errors.name?.message}
            >
              <Input
                {...register("name")}
                placeholder="Chăm sóc da cơ bản"
                invalid={!!errors.name}
              />
            </FormField>

            <FormField
              label="Thứ tự hiển thị"
              tooltip="Số nhỏ sẽ được ưu tiên hiển thị trước"
              error={errors.sortOrder?.message}
            >
              <Input
                {...register("sortOrder", { valueAsNumber: true })}
                type="number"
                placeholder="0"
                invalid={!!errors.sortOrder}
              />
            </FormField>

            <FormField
              label="Trạng thái"
              tooltip="Bật để kích hoạt nhóm dịch vụ"
              error={errors.status?.message}
            >
              <div className="flex h-9 items-center">
                <Switch
                  checked={watch("status") === StatusActive.Active}
                  onChange={(checked: boolean) =>
                    setValue(
                      "status",
                      checked ? StatusActive.Active : StatusActive.Inactive,
                    )
                  }
                />
              </div>
            </FormField>

            <FormField
              label="Mô tả"
              tooltip="Không dài quá 500 ký tự"
              error={errors.description?.message}
              className="sm:col-span-2"
            >
              <Textarea
                {...register("description")}
                placeholder="Mô tả nhóm dịch vụ ở đây"
                rows={3}
                invalid={!!errors.description}
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
            disabled={isPending || isUploading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending || isUploading}
          >
            {isEdit ? "Cập nhật" : "Tạo nhóm dịch vụ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function getDefaultValues(
  serviceCategory?: ServiceCategoryDto | null,
): ServiceCategoryFormValues {
  if (serviceCategory) {
    return {
      name: serviceCategory.name ?? "",
      description: serviceCategory.description ?? "",
      sortOrder: serviceCategory.sortOrder ?? 0,
      status: serviceCategory.status ?? StatusActive.Active,
      icon: serviceCategory.icon ?? "",
      imageUrl: serviceCategory.imageUrl ?? "",
    };
  }
  return {
    name: "",
    description: "",
    sortOrder: 0,
    status: StatusActive.Active,
    icon: "",
    imageUrl: "",
  };
}
