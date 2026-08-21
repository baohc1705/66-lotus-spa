import {
    useCreateProductCategory,
    useUpdateProductCategory,
} from "@/features/product-categories/hooks/useProductCategories";
import type {
    CreateProductCategoryRequest,
    ProductCategoryDto,
    UpdateProductCategoryRequest,
} from "@/features/product-categories/types/productCategory.types";
import { Modal } from "@/shared/components/Modal";
import { StatusActive } from "@/shared/constants/status.enum";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

// Giải thích:
// Validate giữ liệu client side
const productCategorySchema = z.object({
  name: z
    .string()
    .nonempty("Tên không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  description: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  sortOrder: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  status: z.coerce.number().optional(),
});

// Giải thích:
type ProductCategoryFormData = z.infer<typeof productCategorySchema>;

// Giải thích
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productCategory?: ProductCategoryDto | null;
  onSuccess?: (category: ProductCategoryDto) => void;
}

// Giải thích
function getDefaultValues(
  productCategory?: ProductCategoryDto | null,
): ProductCategoryFormData {
  return {
    name: productCategory?.name ?? "",
    description: productCategory?.description ?? "",
    sortOrder: productCategory?.sortOrder ?? 0,
    status: productCategory?.status ?? StatusActive.Active,
  };
}

export function ProductCategoryForm({
  open,
  onOpenChange,
  productCategory,
  onSuccess,
}: Props) {
  // Kiểm tra xem có phải là chỉnh sửa không
  const isEdit = !!productCategory;
  const createMutation = useCreateProductCategory();
  const updateMutation = useUpdateProductCategory();
  // Kiểm tra xem có phải là đang xử lý không
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Sử dụng hook useForm để quản lý form
  // Sử dụng zodResolver để validate dữ liệu client side
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductCategoryFormData>({
    resolver: zodResolver(
      productCategorySchema,
    ) as Resolver<ProductCategoryFormData>,
    defaultValues: getDefaultValues(productCategory),
  });

  // Giải thích:
  // Sử dụng hook useWatch để theo dõi trạng thái của switch
  const status = useWatch({ control, name: "status" });

  // Giải thích:
  // Sử dụng hook useEffect để reset form khi modal đóng
  useEffect(() => {
    if (!open) return;
    reset(getDefaultValues(productCategory));
  }, [open, productCategory, reset]);

  // Giải thích:
  // Hàm onSubmit để xử lý dữ liệu form khi submit
  function onSubmit(values: ProductCategoryFormData) {
    // Nếu là chỉnh sửa thì dùng type update và gọi update mutation
    if (isEdit && productCategory?.id) {
      const data: UpdateProductCategoryRequest = {
        name: values.name,
        description: values.description || undefined,
        sortOrder: values.sortOrder,
        status: values.status,
      };

      updateMutation.mutate(
        { id: productCategory.id, data },
        {
          onSuccess: (result) => {
            if (result.isSuccess !== true) return;
            onOpenChange(false);
            onSuccess?.({ ...productCategory, ...data });
          },
        },
      );
      return;
    }

    // Mặc định tạo mới với type create request và gọi create mutation
    const payload: CreateProductCategoryRequest = {
      name: values.name,
      description: values.description || undefined,
      sortOrder: values.sortOrder,
      status: values.status,
    };

    createMutation.mutate(payload, {
      onSuccess: (result) => {
        if (result.isSuccess !== true) return;
        onOpenChange(false);
        onSuccess?.(payload);
      },
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa danh mục sản phẩm" : "Thêm danh mục sản phẩm"}
      size="xl"
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
            form="product-category-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            {isEdit ? "Chỉnh sửa" : "Thêm danh mục"}
          </Button>
        </>
      }
    >
      <form
        id="product-category-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormSection title="Thông tin danh mục sản phẩm">
          <FormRow>
            <FormField
              label="Tên danh mục"
              required
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
                  checked={status === StatusActive.Active}
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
          </FormRow>
        </FormSection>
      </form>
    </Modal>
  );
}
