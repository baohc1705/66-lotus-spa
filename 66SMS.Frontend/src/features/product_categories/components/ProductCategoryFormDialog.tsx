import { useForm, type Resolver } from "react-hook-form";
import {
  useCreateProductCategory,
  useUpdateProductCategory,
} from "../hooks/useProductCategories";
import type { ProductCategoryDTO } from "../types/product_category.types";
import {
  createProductCategorySchema,
  updateProductCategorySchema,
  type CreateProductCategoryPayload,
  type ProductCategoryFormValues,
  type UpdateProductCategoryPayload,
} from "../schemas/productCategory.schema";
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

interface ProductCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCategory?: ProductCategoryDTO | null;
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

  // Dynamic schema, form based on create vs edit
  const form = useForm<ProductCategoryFormValues>({
    resolver: zodResolver(
      isEdit ? updateProductCategorySchema : createProductCategorySchema,
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

  // Return ui
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
          {/* Thông tin danh mục sản phẩm */}
          <FormSection icon={Box} title="Thông tin danh mục sản phẩm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField
                label="Tên danh mục"
                tooltip="Vui lòng nhập vào tên danh mục sản phẩm"
                error={errors.name?.message}
              >
                <Input
                  {...register("name")}
                  placeholder="Chăm sóc da"
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
                tooltip="Bật để kích hoạt danh mục"
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
                  label="Mô tả danh mục"
                  tooltip="Danh mục không dài quá 500 ký tự"
                  error={errors.description?.message}
                >
                  <Textarea
                    {...register("description")}
                    placeholder="Mô tả danh mục ở đây"
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
              Hủy
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

// Helper Component

// Default values
function getDefaultValues(
  productCategory?: ProductCategoryDTO | null,
): ProductCategoryFormValues {
  if (productCategory) {
    return {
      name: productCategory.name ?? "",
      description: productCategory.description ?? "",
      sortOrder: productCategory.sortOrder ?? 0,
      status: productCategory.status ?? 0,
    };
  }
  return {
    name: "",
    description: "",
    sortOrder: 0,
    status: 0,
  };
}
