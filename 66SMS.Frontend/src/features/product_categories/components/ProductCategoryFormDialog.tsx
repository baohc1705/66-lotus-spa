import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Box } from "lucide-react";

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
import { FormField } from "@/shared/components/forms/FormField";
import { AdminInput } from "@/shared/components/forms/AdminInput";
import { AdminTextarea } from "@/shared/components/forms/AdminTextarea";
import { Switch } from "@/shared/components/ui/switch";
import { StatusActive } from "@/shared/constants/status.enum";
import { COMMON_MSG } from "@/shared/constants/common.messages";

import {
  useCreateProductCategory,
  useUpdateProductCategory,
} from "../hooks/useProductCategories";
import type { ProductCategoryDto } from "../types/productCategory.types";
import {
  createProductCategorySchema,
  type CreateProductCategoryPayload,
  type ProductCategoryFormValues,
  type UpdateProductCategoryPayload,
} from "../schemas/productCategory.schema";

interface ProductCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCategory?: ProductCategoryDto | null;
}

export function ProductCategoryFormDialog({
  open,
  onOpenChange,
  productCategory,
}: ProductCategoryFormDialogProps) {
  const isEdit = !!productCategory;
  const createMutation = useCreateProductCategory();
  const updateMutation = useUpdateProductCategory();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<ProductCategoryFormValues>({
    resolver: zodResolver(
      createProductCategorySchema,
    ) as Resolver<ProductCategoryFormValues>,
    defaultValues: getDefaultValues(productCategory),
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
      reset(getDefaultValues(productCategory));
    }
  }, [open, productCategory, reset]);

  const onSubmit = (data: ProductCategoryFormValues) => {
    if (isEdit && productCategory?.id) {
      updateMutation.mutate(
        {
          id: productCategory.id,
          payload: data as UpdateProductCategoryPayload,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
    } else {
      createMutation.mutate(data as CreateProductCategoryPayload, {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
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
              ? "Chỉnh sửa danh mục sản phẩm"
              : "Thêm danh mục sản phẩm mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin danh mục sản phẩm ${productCategory?.name ?? ""}`
              : "Điền thông tin để tạo danh mục sản phẩm"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormSection icon={Box} title="Thông tin danh mục sản phẩm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField
                label="Tên danh mục"
                tooltip="Vui lòng nhập vào tên danh mục sản phẩm"
                error={errors.name?.message}
              >
                <AdminInput
                  {...register("name")}
                  placeholder="Chăm sóc da"
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
                tooltip="Bật để kích hoạt danh mục"
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
                  label="Mô tả danh mục"
                  tooltip="Danh mục không dài quá 500 ký tự"
                  error={errors.description?.message}
                >
                  <AdminTextarea
                    {...register("description")}
                    placeholder="Mô tả danh mục ở đây"
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
              {isEdit ? "Cập nhật" : "Tạo danh mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValues(
  productCategory?: ProductCategoryDto | null,
): ProductCategoryFormValues {
  if (productCategory) {
    return {
      name: productCategory.name ?? "",
      description: productCategory.description ?? "",
      sortOrder: productCategory.sortOrder ?? 0,
      status: productCategory.status ?? StatusActive.Inactive,
    };
  }
  return {
    name: "",
    description: "",
    sortOrder: 0,
    status: StatusActive.Inactive,
  };
}
