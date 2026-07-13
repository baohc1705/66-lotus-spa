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
import { Box } from "lucide-react";
import { FormField } from "@/shared/components/forms/FormField";
import { AdminInput } from "@/shared/components/forms/AdminInput";
import { AdminTextarea } from "@/shared/components/forms/AdminTextarea";
import { Switch } from "@/shared/components/ui/switch";
import { ImageUpload } from "@/shared/components/ImageUpload";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { StatusActive } from "@/shared/constants/status.enum";
import { COMMON_MSG } from "@/shared/constants/common.messages";

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
  const [pendingFile, setPendingFile] = useState<File | null>(null);
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
      setPendingFile(null);
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

      if (pendingFile) {
        payload.icon = await fileToBase64(pendingFile);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Chỉnh sửa nhóm dịch vụ"
              : "Thêm nhóm dịch vụ mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin nhóm dịch vụ ${serviceCategory?.name ?? ""}`
              : "Điền thông tin để tạo nhóm dịch vụ"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormSection icon={Box} title="Thông tin nhóm dịch vụ">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="sm:col-span-2">
                <ImageUpload
                  key={`${open}-${serviceCategory?.id ?? "new"}`}
                  value={watch("icon") || serviceCategory?.icon}
                  onFileChange={setPendingFile}
                  shape="square"
                  label="Chọn icon"
                />
              </div>

              <FormField
                label="Tên nhóm dịch vụ"
                tooltip="Vui lòng nhập vào tên nhóm dịch vụ"
                error={errors.name?.message}
              >
                <AdminInput
                  {...register("name")}
                  placeholder="Chăm sóc da cơ bản"
                />
              </FormField>

              <FormField
                label="Thứ tự hiển thị"
                tooltip="Số nhỏ sẽ được ưu tiên hiển thị trước"
                error={errors.sortOrder?.message}
              >
                <AdminInput
                  {...register("sortOrder", { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                />
              </FormField>

              <FormField
                label="Trạng thái"
                tooltip="Bật để kích hoạt nhóm dịch vụ"
                error={errors.status?.message}
              >
                <div className="flex items-center h-9">
                  <Switch
                    checked={watch("status") === StatusActive.Active}
                    onCheckedChange={(checked) =>
                      setValue(
                        "status",
                        checked ? StatusActive.Active : StatusActive.Inactive,
                      )
                    }
                  />
                </div>
              </FormField>

              <div className="sm:col-span-2">
                <FormField
                  label="Mô tả"
                  tooltip="Không dài quá 500 ký tự"
                  error={errors.description?.message}
                >
                  <AdminTextarea
                    {...register("description")}
                    placeholder="Mô tả nhóm dịch vụ ở đây"
                  />
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
              disabled={isPending || isUploading}
            >
              {COMMON_MSG.cancel}
            </Button>
            <Button
              type="submit"
              variant="admin"
              size="sm"
              loading={isPending || isUploading}
            >
              {isEdit ? "Cập nhật" : "Tạo nhóm dịch vụ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    };
  }
  return {
    name: "",
    description: "",
    sortOrder: 0,
    status: StatusActive.Active,
    icon: "",
  };
}
