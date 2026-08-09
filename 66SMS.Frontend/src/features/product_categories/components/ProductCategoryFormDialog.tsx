import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Box } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
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
  onSuccess?: (category: ProductCategoryDto) => void;
}

export function ProductCategoryFormDialog({
  open,
  onOpenChange,
  productCategory,
  onSuccess,
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
    const payload: CreateProductCategoryPayload = {
      name: data.name,
      description: data.description || undefined,
      sortOrder: data.sortOrder,
      status: data.status,
    };

    if (isEdit && productCategory?.id) {
      updateMutation.mutate(
        {
          id: productCategory.id,
          payload: payload as UpdateProductCategoryPayload,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) {
              onOpenChange(false);
              onSuccess?.({ ...productCategory, ...payload });
            }
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (result) => {
          if (result.isSuccess) {
            onOpenChange(false);
            onSuccess?.(payload as ProductCategoryDto);
          }
        },
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={
        isEdit ? "Chỉnh sửa danh mục sản phẩm" : "Thêm danh mục sản phẩm mới"
      }
      size="xl"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection icon={Box} title="Thông tin danh mục sản phẩm">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField
              label="Tên danh mục"
              tooltip="Vui lòng nhập vào tên danh mục sản phẩm"
              error={errors.name?.message}
            >
              <Input
                {...register("name")}
                placeholder="Chăm sóc da"
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
              tooltip="Bật để kích hoạt danh mục"
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
              label="Mô tả danh mục"
              tooltip="Danh mục không dài quá 500 ký tự"
              error={errors.description?.message}
              className="sm:col-span-2"
            >
              <Textarea
                {...register("description")}
                placeholder="Mô tả danh mục ở đây"
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
            disabled={isPending}
          >
            {COMMON_MSG.cancel}
          </Button>
          <Button
            type="submit"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Cập nhật" : "Tạo danh mục"}
          </Button>
        </div>
      </form>
    </Modal>
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
      status: productCategory.status ?? StatusActive.Active,
    };
  }
  return {
    name: "",
    description: "",
    sortOrder: 0,
    status: StatusActive.Active,
  };
}
