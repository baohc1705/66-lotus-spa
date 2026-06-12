import { useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import {
  useCreateProduct,
  useUpdateProduct,
  useProductCategories,
} from "../hooks/useProducts";
import {
  createProductSchema,
  updateProductSchema,
  type ProductFormValues,
} from "../schemas/product.schema";

import type { CreateProductPayload, ProductDto } from "../types/product.types";
import {
  Package,
  Tag,
  Box,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Trash2,
} from "lucide-react";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDto | null;
}

const STATUS_OPTIONS = [
  { value: "1", label: "Đang bán" },
  { value: "0", label: "Ngừng bán" },
];

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  const isEdit = !!product;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Fetch categories for dropdown
  const { data: categoriesResult } = useProductCategories();
  const categories = categoriesResult?.data?.items || [];

  // Dynamic schema & form based on create vs edit
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(
      isEdit ? updateProductSchema : createProductSchema,
    ) as Resolver<ProductFormValues>,
    defaultValues: getDefaultValues(product),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = form;

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "images",
  });

  // Reset form when dialog opens/closes or product changes
  useEffect(() => {
    if (open) {
      reset(getDefaultValues(product));
    }
  }, [open, product, reset]);

  const onSubmit = (data: ProductFormValues) => {
    const imagesPayload =
      data.images?.map((img) => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isPrimary,
      })) || [];

    if (isEdit && product?.id) {
      const payload = {
        ...data,
        images: imagesPayload,
      };
      updateMutation.mutate(
        { id: product.id, payload },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
    } else {
      const payload = {
        ...data,
        images: imagesPayload,
      };
      createMutation.mutate(payload as CreateProductPayload, {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin sản phẩm ${product?.name ?? ""}`
              : "Điền thông tin để tạo sản phẩm mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* === Section: Thông tin cơ bản === */}
          <FormSection icon={Package} title="Thông tin cơ bản">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField
                label="Mã sản phẩm *"
                tooltip="Mã định danh duy nhất (SKU)"
                error={errors.code?.message}
              >
                <Input
                  {...register("code")}
                  placeholder="SP001"
                  className="h-9 text-[13px]"
                />
              </FormField>
              <FormField label="Tên sản phẩm *" error={errors.name?.message}>
                <Input
                  {...register("name")}
                  placeholder="Tên sản phẩm..."
                  className="h-9 text-[13px]"
                />
              </FormField>
              <FormField label="Danh mục *" error={errors.categoryId?.message}>
                <Select
                  value={getValues("categoryId")?.toString() ?? ""}
                  onValueChange={(v) => setValue("categoryId", Number(v))}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Đơn vị tính *" error={errors.unit?.message}>
                <Input
                  {...register("unit")}
                  placeholder="Cái, Hộp, Chai..."
                  className="h-9 text-[13px]"
                />
              </FormField>
            </div>
          </FormSection>

          {/* === Section: Giá & Kho === */}
          <FormSection icon={Tag} title="Giá bán & Tồn kho">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField label="Giá vốn *" error={errors.costPrice?.message}>
                <Input
                  {...register("costPrice")}
                  type="number"
                  placeholder="0"
                  className="h-9 text-[13px]"
                />
              </FormField>
              <FormField label="Giá bán" error={errors.sellingPrice?.message}>
                <Input
                  {...register("sellingPrice")}
                  type="number"
                  placeholder="0"
                  className="h-9 text-[13px]"
                />
              </FormField>
              <FormField
                label="Tồn kho *"
                error={errors.stockQuantity?.message}
              >
                <Input
                  {...register("stockQuantity")}
                  type="number"
                  placeholder="0"
                  className="h-9 text-[13px]"
                />
              </FormField>
              <FormField
                label="Tồn kho tối thiểu *"
                tooltip="Cảnh báo khi số lượng dưới mức này"
                error={errors.minStock?.message}
              >
                <Input
                  {...register("minStock")}
                  type="number"
                  placeholder="0"
                  className="h-9 text-[13px]"
                />
              </FormField>
            </div>
          </FormSection>

          {/* === Section: Hình ảnh sản phẩm === */}
          <FormSection icon={ImageIcon} title="Hình ảnh sản phẩm">
            <div className="space-y-4">
              {imageFields.map((field, index) => {
                const isPrimary = getValues(`images.${index}.isPrimary`);
                const errorObj = errors.images?.[index];
                return (
                  <div
                    key={field.id}
                    className="flex gap-3 items-start border p-3 rounded-lg bg-stone-50/50"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <LinkIcon className="w-4 h-4 text-stone-400 shrink-0" />
                        <div className="flex-1">
                          <Input
                            {...register(`images.${index}.url`)}
                            placeholder="https://example.com/image.jpg"
                            className="h-9 w-full"
                          />
                          {errorObj?.url && (
                            <p className="text-[11px] text-red-500 mt-1">
                              {errorObj.url.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pl-7">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Switch
                            checked={isPrimary}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                // If turning this on, turn off others
                                const currentImages = getValues("images") || [];
                                currentImages.forEach((_, idx) => {
                                  if (idx !== index) {
                                    setValue(`images.${idx}.isPrimary`, false);
                                  }
                                });
                              }
                              setValue(`images.${index}.isPrimary`, checked);
                            }}
                          />
                          <span className="text-[12px] font-medium text-lotus-deep">
                            Hình ảnh chính
                          </span>
                        </label>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImage(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-dashed"
                onClick={() =>
                  appendImage({
                    url: "",
                    isPrimary: imageFields.length === 0,
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm hình ảnh
              </Button>
            </div>
          </FormSection>

          {/* === Section: Trạng thái & Chi tiết === */}
          <FormSection icon={Box} title="Trạng thái & Chi tiết">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField label="Trạng thái">
                <Select
                  value={getValues("status")?.toString() ?? "1"}
                  onValueChange={(v) => setValue("status", Number(v))}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField
                label="Mô tả ngắn"
                error={errors.description?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  {...register("description")}
                  placeholder="Mô tả ngắn gọn về sản phẩm..."
                  className="text-[13px] min-h-[60px] resize-none"
                />
              </FormField>
              <FormField
                label="Nội dung chi tiết"
                error={errors.content?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  {...register("content")}
                  placeholder="Bài viết chi tiết sản phẩm..."
                  className="text-[13px] min-h-[100px]"
                />
              </FormField>
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
              {isEdit ? "Cập nhật" : "Tạo sản phẩm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Helper Components ----

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
        <Icon className="w-4 h-4 text-lotus-leaf" />
        <h3 className="text-[13px] font-semibold text-lotus-deep">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FormField({
  label,
  error,
  tooltip,
  className,
  children,
}: {
  label: string;
  error?: string;
  tooltip?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const isRequired = label.includes("*");
  const cleanLabel = label.replace("*", "").trim();

  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label className="flex items-center gap-1 text-[12px] font-semibold text-lotus-deep/80">
        {cleanLabel}
        {isRequired &&
          (tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-red-500 cursor-help hover:text-red-600 focus:outline-none select-none">
                  *
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-red-500">*</span>
          ))}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ---- Default Values ----

function getDefaultValues(product?: ProductDto | null): ProductFormValues {
  if (product) {
    return {
      categoryId: product.categoryId ?? 0,
      code: product.code ?? "",
      name: product.name ?? "",
      description: product.description ?? "",
      content: product.content ?? "",
      unit: product.unit ?? "",
      costPrice: product.costPrice ?? 0,
      sellingPrice: product.sellingPrice ?? 0,
      stockQuantity: product.stockQuantity ?? 0,
      minStock: product.minStock ?? 0,
      status: product.status !== null ? Number(product.status) : 1,
      images:
        product.images?.map((img) => ({
          id: img.id,
          url: img.url,
          isPrimary: img.isPrimary,
        })) || [],
    };
  }
  return {
    categoryId: 0, // Should force user to select
    code: "",
    name: "",
    description: "",
    content: "",
    unit: "",
    costPrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    minStock: 0,
    status: 1,
    images: [],
  };
}
