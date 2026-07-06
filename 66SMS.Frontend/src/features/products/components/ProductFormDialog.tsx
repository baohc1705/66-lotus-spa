import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { FormSection } from "@/shared/components/forms/FormSection";
import { FormField } from "@/shared/components/forms/FormField";
import { AdminInput } from "@/shared/components/forms/AdminInput";
import { AdminTextarea } from "@/shared/components/forms/AdminTextarea";
import { AdminSelectTrigger } from "@/shared/components/forms/AdminSelectTrigger";
import { useProductCategories } from "@/features/product_categories/hooks/useProductCategories";
import type { ProductCategoryDto } from "@/features/product_categories/types/productCategory.types";
import {
  useCreateProduct,
  useUpdateProduct,
} from "../hooks/useProducts";
import {
  createProductSchema,
  type CreateProductPayload,
  type ProductFormValues,
} from "../schemas/product.schema";
import type { ProductDto } from "../types/product.types";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  Package,
  Tag,
  Box,
  Image as ImageIcon,
  Plus,
  Camera,
  Star,
  X,
} from "lucide-react";
import { uploadApi } from "@/shared/api/upload.api";
import { StatusActive } from "@/shared/constants/status.enum";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDto | null;
}

const STATUS_OPTIONS = [
  { value: String(StatusActive.Active), label: "Đang bán" },
  { value: String(StatusActive.Inactive), label: "Ngừng bán" },
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
  const [pendingFiles, setPendingFiles] = useState<Record<number, File>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>(
    {},
  );
  const [isUploading, setIsUploading] = useState(false);

  const { data: categoriesResult } = useProductCategories({
    pageIndex: 1,
    pageSize: 500,
  });
  const categories = categoriesResult?.data?.items ?? [];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(
      createProductSchema,
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
    watch,
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

  useEffect(() => {
    if (open) {
      setPendingFiles({});
      setImagePreviews({});
      reset(getDefaultValues(product));
    }
  }, [open, product, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsUploading(true);
    try {
      const images = (
        await Promise.all(
          (data.images || []).map(async (img, index) => {
            const file = pendingFiles[index];
            let url = img.url || "";
            if (file) {
              const result = await uploadApi.uploadImage(file, "product");
              url = result.isSuccess && result.data ? result.data : "";
            }
            return {
              id: img.id,
              url,
              isPrimary: !!img.isPrimary,
            };
          }),
        )
      ).filter((img) => img.url !== "");
      const payload = { ...data, images };

      if (isEdit && product?.id) {
        updateMutation.mutate(
          { id: product.id, payload },
          {
            onSuccess: (result) => {
              if (result.isSuccess) onOpenChange(false);
            },
          },
        );
      } else {
        createMutation.mutate(payload as CreateProductPayload, {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        });
      }
    } finally {
      setIsUploading(false);
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
          <FormSection icon={Package} title="Thông tin cơ bản">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField
                label="Mã sản phẩm *"
                tooltip="Mã định danh duy nhất (SKU)"
                error={errors.code?.message}
              >
                <AdminInput
                  {...register("code")}
                  placeholder="SP001"
                />
              </FormField>
              <FormField label="Tên sản phẩm *" error={errors.name?.message}>
                <AdminInput
                  {...register("name")}
                  placeholder="Tên sản phẩm..."
                />
              </FormField>
              <FormField label="Danh mục *" error={errors.categoryId?.message}>
                <Select
                  value={watch("categoryId")?.toString() ?? ""}
                  onValueChange={(v) => setValue("categoryId", Number(v))}
                >
                  <AdminSelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </AdminSelectTrigger>
                  <SelectContent>
                    {categories.map((cat: ProductCategoryDto) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id!.toString()}
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Đơn vị tính *" error={errors.unit?.message}>
                <AdminInput
                  {...register("unit")}
                  placeholder="Cái, Hộp, Chai..."
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection icon={Tag} title="Giá bán & Tồn kho">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField label="Giá vốn *" error={errors.costPrice?.message}>
                <AdminInput
                  {...register("costPrice")}
                  type="number"
                  placeholder="0"
                />
              </FormField>
              <FormField label="Giá bán" error={errors.sellingPrice?.message}>
                <AdminInput
                  {...register("sellingPrice")}
                  type="number"
                  placeholder="0"
                />
              </FormField>
              <FormField label="Tồn kho *" error={errors.stockQuantity?.message}>
                <AdminInput
                  {...register("stockQuantity")}
                  type="number"
                  placeholder="0"
                />
              </FormField>
              <FormField
                label="Tồn kho tối thiểu *"
                tooltip="Cảnh báo khi số lượng dưới mức này"
                error={errors.minStock?.message}
              >
                <AdminInput
                  {...register("minStock")}
                  type="number"
                  placeholder="0"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection icon={ImageIcon} title="Hình ảnh sản phẩm">
            <div className="flex flex-wrap gap-3">
              {imageFields.map((field, index) => {
                const isPrimary = watch(`images.${index}.isPrimary`);
                const preview =
                  imagePreviews[index] || watch(`images.${index}.url`);
                return (
                  <div
                    key={field.id}
                    className="flex flex-col gap-1.5 w-[110px]"
                  >
                    <div className="relative group/card">
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById(`product-img-${index}`)
                            ?.click()
                        }
                        className={[
                          "h-[88px] w-full rounded-lg overflow-hidden transition-all",
                          preview
                            ? "border border-stone-200 hover:border-lotus-leaf/60"
                            : "border-2 border-dashed border-stone-300 bg-stone-50 hover:border-lotus-leaf hover:bg-lotus-leaf/5",
                        ].join(" ")}
                      >
                        {preview ? (
                          <>
                            <img
                              src={preview}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity rounded-lg">
                              <Camera className="h-5 w-5 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-stone-400 group-hover/card:text-lotus-leaf transition-colors">
                            <ImageIcon className="h-6 w-6" />
                            <span className="text-lotus-admin-xs font-medium">
                              Chọn ảnh
                            </span>
                          </div>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1.5 -right-1.5 z-10 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {isPrimary && (
                        <div className="absolute bottom-1.5 left-1.5 bg-lotus-leaf text-white text-lotus-admin-xs font-bold px-1.5 py-0.5 rounded-full leading-none pointer-events-none">
                          Chính
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      id={`product-img-${index}`}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setPendingFiles((prev) => ({ ...prev, [index]: file }));
                        setImagePreviews((prev) => ({
                          ...prev,
                          [index]: URL.createObjectURL(file),
                        }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const imgs = getValues("images") || [];
                        imgs.forEach((_, i) => {
                          if (i !== index)
                            setValue(`images.${i}.isPrimary`, false);
                        });
                        setValue(`images.${index}.isPrimary`, !isPrimary);
                      }}
                      className={[
                        "flex items-center gap-1 text-lotus-admin-base font-medium transition-colors self-start",
                        isPrimary
                          ? "text-lotus-leaf"
                          : "text-stone-400 hover:text-stone-600",
                      ].join(" ")}
                    >
                      <Star
                        className={`h-3 w-3 ${isPrimary ? "fill-lotus-leaf" : ""}`}
                      />
                      {isPrimary ? "Ảnh chính" : "Đặt chính"}
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  appendImage({ url: "", isPrimary: imageFields.length === 0 })
                }
                className="flex h-[88px] w-[110px] flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-stone-300 text-stone-400 transition-all hover:border-lotus-leaf hover:bg-lotus-leaf/5 hover:text-lotus-leaf self-start"
              >
                <Plus className="h-5 w-5" />
                <span className="text-lotus-admin-xs font-medium">Thêm ảnh</span>
              </button>
            </div>
          </FormSection>

          <FormSection icon={Box} title="Trạng thái & Chi tiết">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField label="Trạng thái">
                <Select
                  value={watch("status")?.toString() ?? "1"}
                  onValueChange={(v) => setValue("status", Number(v))}
                >
                  <AdminSelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </AdminSelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <div className="sm:col-span-2">
                <FormField
                  label="Mô tả ngắn"
                  error={errors.description?.message}
                >
                  <AdminTextarea
                    {...register("description")}
                    placeholder="Mô tả ngắn gọn về sản phẩm..."
                    className="min-h-[60px] resize-none"
                  />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField
                  label="Nội dung chi tiết"
                  error={errors.content?.message}
                >
                  <AdminTextarea
                    {...register("content")}
                    placeholder="Bài viết chi tiết sản phẩm..."
                    className="min-h-[100px]"
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
            <Button
              type="submit"
              variant="admin"
              size="sm"
              loading={isPending || isUploading}
            >
              {isEdit ? "Cập nhật" : "Tạo sản phẩm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
    categoryId: 0,
    code: "",
    name: "",
    description: "",
    content: "",
    unit: "",
    costPrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    minStock: 0,
    status: StatusActive.Active,
    images: [],
  };
}
