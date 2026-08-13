import { useForm, type Resolver } from "react-hook-form";
import {
  useCreateProductCategoryDemo,
  useUpdateProductCategoryDemo,
} from "../hooks/useProductCategoriesDemo";
import {
  type ProductCategoryFormValuesDemo,
  type ProductCategoryDemo,
} from "../types/productCategoryDemo.type";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProductCategorySchemaDemo,
  type CreateProductCategoryPayloadDemo,
  type UpdateProductCategoryPayloadDemo,
} from "../schemas/productCategoryDemo.schema";
import { StatusActive } from "@/shared/constants/status.enum";
import { useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { FormSection } from "@/shared/forms/FormSection";
import { Box } from "lucide-react";
import { FormField } from "@/shared/forms/FormField";
import { Input } from "@/shared/forms/Input";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
import { Button } from "@/shared/elements/Button";

interface ProductCategoryFormDialogDemoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCategory?: ProductCategoryDemo | null;
  onSuccess?: (category: ProductCategoryDemo) => void;
}

export function ProductCategoryFormDialogDemo({
  open,
  onOpenChange,
  productCategory,
  onSuccess,
}: ProductCategoryFormDialogDemoProps) {
  const isEdit = !!productCategory;
  const createMutation = useCreateProductCategoryDemo();
  const updateMutation = useUpdateProductCategoryDemo();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<ProductCategoryFormValuesDemo>({
    resolver: zodResolver(
      createProductCategorySchemaDemo,
    ) as Resolver<ProductCategoryFormValuesDemo>,
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
  }, [open, reset, productCategory]);

  const onSubmit = (data: ProductCategoryFormValuesDemo) => {
    const payload: CreateProductCategoryPayloadDemo = {
      name: data.name,
      description: data.description,
      sortOrder: data.sortOrder,
      status: data.status,
    };

    if (isEdit && productCategory?.id) {
      updateMutation.mutate(
        {
          id: productCategory.id,
          payload: payload as UpdateProductCategoryPayloadDemo,
        },
        {
          onSuccess: (res) => {
            if (res.isSuccess) {
              onOpenChange(false);
              onSuccess?.({ ...productCategory, ...payload });
            }
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (res) => {
          if (res.isSuccess) {
            onOpenChange(false);
            onSuccess?.({ ...res.data });
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
          <div className="grid grid-cols-1 md:grid-cols-2">
            <FormField
              label="Tên danh mục"
              tooltip="Vui lòng nhập tên danh mục"
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
            Hủy
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
  productCategory?: ProductCategoryDemo | null,
): ProductCategoryFormValuesDemo {
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
