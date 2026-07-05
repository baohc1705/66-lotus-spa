import { useForm, type Resolver } from "react-hook-form";
import {
  useCreateServiceCategory,
  useUpdateServiceCategory,
} from "../hooks/useServiceCategories";
import type { ServiceCategoryDTO } from "../types/service_category.types";
import {
  createServiceCategorySchema,
  updateServiceCategorySchema,
  type CreateServiceCategoryPayload,
  type ServiceCategoryFormValues,
  type UpdateServiceCategoryPayload,
} from "../schemas/serviceCategory.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

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
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { COMMON_MSG } from "@/shared/constants/common.messages";


interface ServiceCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceCategory?: ServiceCategoryDTO | null;
  onSuccess?: (category: ServiceCategoryDTO) => void;
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

  const form = useForm<ServiceCategoryFormValues>({
    resolver: zodResolver(
      isEdit ? updateServiceCategorySchema : createServiceCategorySchema,
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
      reset(getDefaultValues(serviceCategory));
    }
  }, [open, serviceCategory, reset]);

  const onSubmit = (data: ServiceCategoryFormValues) => {
    if (isEdit && serviceCategory?.id) {
      updateMutation.mutate(
        {
          id: serviceCategory.id,
          payload: data as UpdateServiceCategoryPayload,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) {
              onOpenChange(false);
              onSuccess?.({ ...serviceCategory, ...data } as ServiceCategoryDTO);
            }
          },
        },
      );
    } else {
      createMutation.mutate(data as CreateServiceCategoryPayload, {
        onSuccess: (result) => {
          if (result.isSuccess) {
            onOpenChange(false);
            // Ideally backend should return the created object including ID, 
            // but we'll trigger onSuccess anyway for UI responsiveness
            onSuccess?.({ ...data } as ServiceCategoryDTO);
          }
        },
      });
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField
                label="Tên nhóm dịch vụ"
                tooltip="Vui lòng nhập vào tên nhóm dịch vụ"
                error={errors.name?.message}
              >
                <Input
                  {...register("name")}
                  placeholder="Chăm sóc da cơ bản"
                  className="h-9 text-[13px]"
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
                  className="h-9 text-[13px]"
                />
              </FormField>

              <FormField
                label="Trạng thái"
                tooltip="Bật để kích hoạt nhóm dịch vụ"
                error={errors.status?.message}
              >
                <div className="flex items-center h-9">
                  <Switch
                    checked={watch("status") === 1}
                    onCheckedChange={(checked) => setValue("status", checked ? 1 : 0)}
                  />
                </div>
              </FormField>

              <div className="sm:col-span-2">
                <FormField
                  label="Mô tả"
                  tooltip="Không dài quá 500 ký tự"
                  error={errors.description?.message}
                >
                  <Textarea
                    {...register("description")}
                    placeholder="Mô tả nhóm dịch vụ ở đây"
                    className=""
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
              disabled={isPending}
            >
              {COMMON_MSG.cancel}
            </Button>
            <Button type="submit" variant="admin" size="sm" loading={isPending}>
              {isEdit ? "Cập nhật" : "Tạo nhóm dịch vụ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValues(
  serviceCategory?: ServiceCategoryDTO | null,
): ServiceCategoryFormValues {
  if (serviceCategory) {
    return {
      name: serviceCategory.name ?? "",
      description: serviceCategory.description ?? "",
      sortOrder: serviceCategory.sortOrder ?? 0,
      status: serviceCategory.status ?? 0,
    };
  }
  return {
    name: "",
    description: "",
    sortOrder: 0,
    status: 0,
  };
}
