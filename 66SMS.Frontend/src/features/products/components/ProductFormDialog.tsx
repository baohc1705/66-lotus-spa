import { useEffect, useState } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type FieldErrors,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Image as ImageIcon,
  Plus,
  Camera,
  Star,
  X,
  Loader2,
} from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Tabs } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import { CurrencyInput } from "@/shared/forms/CurrencyInput";
import { FormField } from "@/shared/forms/FormField";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
import { StatusActive } from "@/shared/constants/status.enum";
import { fileToBase64 } from "@/shared/lib/fileToBase64";

import { ProductCategoryFormDialog } from "@/features/product_categories/components/ProductCategoryFormDialog";
import { useProductCategories } from "@/features/product_categories/hooks/useProductCategories";
import type { ProductCategoryDto } from "@/features/product_categories/types/productCategory.types";
import {
  useCreateProduct,
  useUpdateProduct,
  useProductDetail,
} from "../hooks/useProducts";
import {
  createProductSchema,
  type CreateProductPayload,
  type ProductFormValues,
} from "../schemas/product.schema";
import type { ProductDto, ProductFullDto } from "../types/product.types";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDto | null;
  onSuccess?: (product: ProductDto) => void;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductFormDialogProps) {
  const isEdit = !!product?.id;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [pendingFiles, setPendingFiles] = useState<Record<number, File>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>(
    {},
  );
  const [isUploading, setIsUploading] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const detailQuery = useProductDetail(open && isEdit ? product!.id! : null);
  const detail = detailQuery.data?.data;
  const formSource = isEdit ? (detail ?? null) : null;

  const { data: categoriesResult } = useProductCategories({
    pageIndex: 1,
    pageSize: 500,
  });
  const categories = categoriesResult?.data?.items ?? [];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema) as Resolver<ProductFormValues>,
    defaultValues: getDefaultValues(null),
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
    if (!open) return;
    setPendingFiles({});
    setImagePreviews({});
    setActiveTab("basic");
    if (isEdit) {
      if (formSource) reset(getDefaultValues(formSource));
    } else {
      reset(getDefaultValues(null));
    }
  }, [open, isEdit, formSource, reset]);

  function goToErrorTab(formErrors: FieldErrors<ProductFormValues>) {
    if (
      formErrors.name ||
      formErrors.categoryId ||
      formErrors.unit ||
      formErrors.status ||
      formErrors.description ||
      formErrors.content
    ) {
      setActiveTab("basic");
      return;
    }
    if (
      formErrors.costPrice ||
      formErrors.sellingPrice ||
      formErrors.stockQuantity ||
      formErrors.minStock
    ) {
      setActiveTab("pricing");
      return;
    }
    if (formErrors.images) {
      setActiveTab("images");
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    setIsUploading(true);
    try {
      const images = (
        await Promise.all(
          (data.images || []).map(async (img, index) => {
            const file = pendingFiles[index];
            if (file) {
              const imageBase64 = await fileToBase64(file);
              return {
                id: img.id,
                url: img.url || "",
                imageBase64,
                isPrimary: !!img.isPrimary,
              };
            }
            return {
              id: img.id,
              url: img.url || "",
              isPrimary: !!img.isPrimary,
            };
          }),
        )
      ).filter(
        (img) =>
          img.url !== "" || !!(img as { imageBase64?: string }).imageBase64,
      );
      const payload = { ...data, images };

      if (isEdit && product?.id) {
        updateMutation.mutate(
          { id: product.id, payload },
          {
            onSuccess: (result) => {
              if (result.isSuccess) {
                onOpenChange(false);
                onSuccess?.({ ...product, ...payload });
              }
            },
          },
        );
      } else {
        createMutation.mutate(payload as CreateProductPayload, {
          onSuccess: (result) => {
            if (result.isSuccess) {
              onOpenChange(false);
              onSuccess?.(payload as ProductDto);
            }
          },
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => onOpenChange(false)}
        title={isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        size="xl"
        scrollable
      >
        {isEdit && detailQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-kit-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Đang tải thông tin sản phẩm...</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit, goToErrorTab)}
            className="space-y-3"
          >
            <Tabs
              variant="body"
              activeId={activeTab}
              onChange={setActiveTab}
              tabs={[
                {
                  id: "basic",
                  label: "Thông tin",
                  content: (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <FormField
                          label="Mã sản phẩm"
                          tooltip={
                            isEdit
                              ? "Mã được hệ thống tạo tự động, không chỉnh sửa."
                              : "Mã sẽ được hệ thống tạo tự động sau khi lưu (PRO000001…)."
                          }
                        >
                          <Input
                            value={
                              isEdit
                                ? (formSource?.code ?? product?.code ?? "")
                                : ""
                            }
                            placeholder={isEdit ? "" : "Tự động tạo"}
                            disabled
                            readOnly
                          />
                        </FormField>

                        <FormField
                          label="Tên sản phẩm *"
                          error={errors.name?.message}
                        >
                          <Input
                            {...register("name")}
                            placeholder="Tên sản phẩm..."
                            invalid={!!errors.name}
                          />
                        </FormField>

                        <FormField
                          label="Danh mục *"
                          error={errors.categoryId?.message}
                        >
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Select
                                value={watch("categoryId")?.toString() || ""}
                                onChange={(e) =>
                                  setValue(
                                    "categoryId",
                                    Number(e.target.value),
                                  )
                                }
                                invalid={!!errors.categoryId}
                              >
                                <option value="">Chọn danh mục</option>
                                {categories.map((cat: ProductCategoryDto) => (
                                  <option
                                    key={cat.id}
                                    value={cat.id?.toString() || ""}
                                  >
                                    {cat.name}
                                  </option>
                                ))}
                              </Select>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mb-0 shrink-0"
                              onClick={() => setCategoryOpen(true)}
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              Thêm
                            </Button>
                          </div>
                        </FormField>

                        <FormField
                          label="Đơn vị tính *"
                          error={errors.unit?.message}
                        >
                          <Input
                            {...register("unit")}
                            placeholder="Cái, Hộp, Chai..."
                            invalid={!!errors.unit}
                          />
                        </FormField>

                        <FormField
                          label="Trạng thái"
                          error={errors.status?.message}
                        >
                          <div className="flex h-9 items-center">
                            <Switch
                              checked={
                                watch("status") === StatusActive.Active
                              }
                              onChange={(checked: boolean) =>
                                setValue(
                                  "status",
                                  checked
                                    ? StatusActive.Active
                                    : StatusActive.Inactive,
                                )
                              }
                            />
                          </div>
                        </FormField>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <FormField
                          label="Mô tả ngắn"
                          error={errors.description?.message}
                        >
                          <Textarea
                            {...register("description")}
                            placeholder="Mô tả ngắn gọn về sản phẩm..."
                            rows={2}
                            invalid={!!errors.description}
                          />
                        </FormField>

                        <FormField
                          label="Nội dung chi tiết"
                          error={errors.content?.message}
                        >
                          <Textarea
                            {...register("content")}
                            placeholder="Bài viết chi tiết sản phẩm..."
                            rows={4}
                            invalid={!!errors.content}
                          />
                        </FormField>
                      </div>
                    </div>
                  ),
                },
                {
                  id: "pricing",
                  label: "Giá & tồn kho",
                  content: (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <FormField
                        label="Giá vốn *"
                        error={errors.costPrice?.message}
                      >
                        <Controller
                          name="costPrice"
                          control={control}
                          render={({ field }) => (
                            <CurrencyInput
                              value={field.value}
                              onChange={(v) => field.onChange(v ?? 0)}
                              onBlur={field.onBlur}
                              placeholder="0"
                              invalid={!!errors.costPrice}
                            />
                          )}
                        />
                      </FormField>

                      <FormField
                        label="Giá bán"
                        error={errors.sellingPrice?.message}
                      >
                        <Controller
                          name="sellingPrice"
                          control={control}
                          render={({ field }) => (
                            <CurrencyInput
                              value={field.value}
                              onChange={(v) => field.onChange(v ?? 0)}
                              onBlur={field.onBlur}
                              placeholder="0"
                              invalid={!!errors.sellingPrice}
                            />
                          )}
                        />
                      </FormField>

                      <FormField
                        label="Tồn kho *"
                        error={errors.stockQuantity?.message}
                      >
                        <Input
                          {...register("stockQuantity", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          placeholder="0"
                          invalid={!!errors.stockQuantity}
                        />
                      </FormField>

                      <FormField
                        label="Tồn kho tối thiểu *"
                        tooltip="Cảnh báo khi số lượng dưới mức này"
                        error={errors.minStock?.message}
                      >
                        <Input
                          {...register("minStock", { valueAsNumber: true })}
                          type="number"
                          placeholder="0"
                          invalid={!!errors.minStock}
                        />
                      </FormField>
                    </div>
                  ),
                },
                {
                  id: "images",
                  label: "Hình ảnh",
                  content: (
                    <div className="flex flex-wrap gap-3">
                      {imageFields.map((field, index) => {
                        const isPrimary = watch(`images.${index}.isPrimary`);
                        const preview =
                          imagePreviews[index] ||
                          watch(`images.${index}.url`);
                        return (
                          <div
                            key={field.id}
                            className="flex w-[110px] flex-col gap-1.5"
                          >
                            <div className="group/card relative">
                              <button
                                type="button"
                                onClick={() =>
                                  document
                                    .getElementById(`product-img-${index}`)
                                    ?.click()
                                }
                                className={[
                                  "h-[88px] w-full overflow-hidden rounded-lg transition-all",
                                  preview
                                    ? "border border-kit hover:border-kit-primary/60"
                                    : "border-2 border-dashed border-kit bg-kit-page hover:border-kit-primary hover:bg-kit-primary/5",
                                ].join(" ")}
                              >
                                {preview ? (
                                  <>
                                    <img
                                      src={preview}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover/card:opacity-100">
                                      <Camera className="h-5 w-5 text-white" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-kit-muted transition-colors group-hover/card:text-kit-primary">
                                    <ImageIcon className="h-6 w-6" />
                                    <span className="text-xs font-medium">
                                      Chọn ảnh
                                    </span>
                                  </div>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-kit-danger text-white opacity-0 shadow-sm transition-opacity group-hover/card:opacity-100 hover:opacity-90"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              {isPrimary && (
                                <div className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-full bg-kit-primary px-1.5 py-0.5 text-[10px] leading-none font-bold text-white">
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
                                setPendingFiles((prev) => ({
                                  ...prev,
                                  [index]: file,
                                }));
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
                                setValue(
                                  `images.${index}.isPrimary`,
                                  !isPrimary,
                                );
                              }}
                              className={[
                                "flex items-center gap-1 self-start text-xs font-medium transition-colors",
                                isPrimary
                                  ? "text-kit-primary"
                                  : "text-kit-muted hover:text-kit-heading",
                              ].join(" ")}
                            >
                              <Star
                                className={`h-3 w-3 ${isPrimary ? "fill-current" : ""}`}
                              />
                              {isPrimary ? "Ảnh chính" : "Đặt chính"}
                            </button>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() =>
                          appendImage({
                            url: "",
                            isPrimary: imageFields.length === 0,
                          })
                        }
                        className="flex h-[88px] w-[110px] flex-col items-center justify-center gap-1.5 self-start rounded-lg border-2 border-dashed border-kit text-kit-muted transition-all hover:border-kit-primary hover:bg-kit-primary/5 hover:text-kit-primary"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-xs font-medium">Thêm ảnh</span>
                      </button>
                    </div>
                  ),
                },
              ]}
            />

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
                {isEdit ? "Cập nhật" : "Tạo sản phẩm"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ProductCategoryFormDialog
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        onSuccess={(cat) => {
          if (cat.id) setValue("categoryId", cat.id);
        }}
      />
    </>
  );
}

function getDefaultValues(product?: ProductFullDto | null): ProductFormValues {
  if (product) {
    return {
      categoryId: product.categoryId ?? 0,
      name: product.name ?? "",
      description: product.description ?? "",
      content: product.content ?? "",
      unit: product.unit ?? "",
      costPrice: product.costPrice ?? 0,
      sellingPrice: product.sellingPrice ?? 0,
      stockQuantity: product.stockQuantity ?? 0,
      minStock: product.minStock ?? 0,
      status:
        product.status != null ? Number(product.status) : StatusActive.Active,
      images:
        product.images?.map((img) => ({
          id: img.id,
          url: img.url ?? "",
          isPrimary: !!img.isPrimary,
        })) || [],
    };
  }
  return {
    categoryId: 0,
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
