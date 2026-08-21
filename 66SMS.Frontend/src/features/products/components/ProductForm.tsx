import { ProductCategoryForm } from "@/features/product-categories/components/ProductCategoryForm";
import { useProductCategories } from "@/features/product-categories/hooks/useProductCategories";
import type { ProductCategoryDto } from "@/features/product-categories/types/productCategory.types";
import {
  useCreateProduct,
  useProductDetail,
  useUpdateProduct,
} from "@/features/products/hooks/useProducts";
import type {
  CreateProductRequest,
  ProductDto,
  ProductFullDto,
  ProductImageDto,
  UpdateProductRequest,
} from "@/features/products/types/product.types";
import { Modal } from "@/shared/components/Modal";
import { Tabs } from "@/shared/components/Tabs";
import { StatusActive } from "@/shared/constants/status.enum";
import { Button } from "@/shared/elements/Button";
import { CurrencyInput } from "@/shared/forms/CurrencyInput";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";

const UNIT_OPTIONS = [
  "Cái",
  "Hộp",
  "Chai",
  "Lọ",
  "Tuýp",
  "Gói",
  "Bộ",
  "Thùng",
  "Viên",
  "ml",
  "lít",
  "g",
  "kg",
];

// Giải thích:
// Validate dữ liệu client side
const productSchema = z.object({
  categoryId: z.coerce.number().min(1, "Vui lòng chọn danh mục"),
  name: z
    .string()
    .nonempty("Tên không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  unit: z.string().nonempty("Vui lòng chọn đơn vị tính"),
  description: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  costPrice: z.coerce.number().min(0, "Giá vốn không được âm"),
  sellingPrice: z.coerce.number().min(0, "Giá bán không được âm"),
  stockQuantity: z.coerce.number().min(0, "Tồn kho không được âm"),
  minStock: z.coerce.number().min(0, "Tồn kho tối thiểu không được âm"),
  status: z.coerce.number().optional(),
});

// Giải thích:
type ProductFormData = z.infer<typeof productSchema>;

type ImageSlot = {
  slotId: string;
  id?: number;
  url?: string;
  previewUrl?: string;
  file: File | null;
  isPrimary: boolean;
};

// Giải thích
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDto | null;
}

// Giải thích
function getDefaultValues(product?: ProductFullDto | null): ProductFormData {
  return {
    categoryId: product?.categoryId ?? 0,
    name: product?.name ?? "",
    unit: product?.unit ?? "",
    description: product?.description ?? "",
    content: product?.content ?? "",
    costPrice: product?.costPrice ?? 0,
    sellingPrice: product?.sellingPrice ?? 0,
    stockQuantity: product?.stockQuantity ?? 0,
    minStock: product?.minStock ?? 0,
    status: product?.status ?? StatusActive.Active,
  };
}

function emptyImageSlot(slotId: string, isPrimary: boolean): ImageSlot {
  return { slotId, file: null, isPrimary };
}

function buildImageSlots(product?: ProductFullDto | null): ImageSlot[] {
  const images = product?.images ?? [];
  if (images.length === 0) {
    return [emptyImageSlot("new-0", true)];
  }

  let hasPrimary = false;
  for (let index = 0; index < images.length; index++) {
    if (images[index].isPrimary === true) hasPrimary = true;
  }

  const slots: ImageSlot[] = [];
  for (let index = 0; index < images.length; index++) {
    const image = images[index];
    slots.push({
      slotId: `existing-${image.id ?? index}`,
      id: image.id,
      url: image.url,
      file: null,
      isPrimary: image.isPrimary === true || (index === 0 && hasPrimary !== true),
    });
  }
  return slots;
}

function revokePreview(slot: ImageSlot) {
  if (!slot.previewUrl) return;
  if (!slot.previewUrl.startsWith("blob:")) return;
  URL.revokeObjectURL(slot.previewUrl);
}

export function ProductForm({ open, onOpenChange, product }: Props) {
  // Kiểm tra xem có phải là chỉnh sửa không
  const isEdit = !!product?.id;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  // Kiểm tra xem có phải là đang xử lý không
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([
    emptyImageSlot("new-0", true),
  ]);
  const [isUploading, setIsUploading] = useState(false);

  // Giải thích:
  // Sửa thì load chi tiết để lấy mô tả, nội dung, ảnh
  const detailQuery = useProductDetail(open && isEdit ? product?.id : null);
  const detail = detailQuery.data?.data;

  const formKey = !open
    ? "closed"
    : isEdit
      ? `edit-${detail?.id ?? "loading"}`
      : "new";
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);
  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) setActiveTab("info");
    if (open === true && isEdit !== true) {
      setImageSlots([emptyImageSlot("new-0", true)]);
    }
    if (open === true && isEdit === true && detail) {
      setImageSlots(buildImageSlots(detail));
    }
  }

  const { data: categoriesResult } = useProductCategories({
    pageIndex: 1,
    pageSize: 500,
  });
  const categories = categoriesResult?.data?.items ?? [];

  // Sử dụng hook useForm để quản lý form
  // Sử dụng zodResolver để validate dữ liệu client side
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
    defaultValues: getDefaultValues(null),
  });

  // Giải thích:
  // Sử dụng hook useWatch để theo dõi select, switch, giá tiền
  const status = useWatch({ control, name: "status" });
  const categoryId = useWatch({ control, name: "categoryId" });
  const unit = useWatch({ control, name: "unit" });
  const costPrice = useWatch({ control, name: "costPrice" });
  const sellingPrice = useWatch({ control, name: "sellingPrice" });

  // Giải thích:
  // Reset form khi mở modal; sửa thì đợi API chi tiết xong
  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      if (detail) reset(getDefaultValues(detail));
      return;
    }
    reset(getDefaultValues(null));
  }, [open, isEdit, detail, reset]);

  function handleImageFileChange(index: number, file: File | null) {
    const next: ImageSlot[] = [];
    for (let slotIndex = 0; slotIndex < imageSlots.length; slotIndex++) {
      const slot = imageSlots[slotIndex];
      if (slotIndex !== index) {
        next.push(slot);
        continue;
      }
      revokePreview(slot);
      next.push({
        ...slot,
        file,
        previewUrl: file ? URL.createObjectURL(file) : undefined,
      });
    }
    setImageSlots(next);
  }

  function handleSetPrimary(index: number) {
    const next: ImageSlot[] = [];
    for (let slotIndex = 0; slotIndex < imageSlots.length; slotIndex++) {
      next.push({
        ...imageSlots[slotIndex],
        isPrimary: slotIndex === index,
      });
    }
    setImageSlots(next);
  }

  function handleAddImageSlot() {
    const next: ImageSlot[] = [];
    for (let slotIndex = 0; slotIndex < imageSlots.length; slotIndex++) {
      next.push(imageSlots[slotIndex]);
    }
    next.push(emptyImageSlot(`new-${Date.now()}`, next.length === 0));
    setImageSlots(next);
  }

  function handleRemoveImageSlot(index: number) {
    const next: ImageSlot[] = [];
    for (let slotIndex = 0; slotIndex < imageSlots.length; slotIndex++) {
      if (slotIndex === index) {
        revokePreview(imageSlots[slotIndex]);
        continue;
      }
      next.push(imageSlots[slotIndex]);
    }
    if (next.length === 0) {
      setImageSlots([emptyImageSlot(`new-${Date.now()}`, true)]);
      return;
    }
    let hasPrimary = false;
    for (let slotIndex = 0; slotIndex < next.length; slotIndex++) {
      if (next[slotIndex].isPrimary === true) hasPrimary = true;
    }
    if (hasPrimary !== true) {
      next[0] = { ...next[0], isPrimary: true };
    }
    setImageSlots(next);
  }

  async function buildImagesPayload(): Promise<ProductImageDto[]> {
    const images: ProductImageDto[] = [];
    for (let index = 0; index < imageSlots.length; index++) {
      const slot = imageSlots[index];
      let imageBase64: string | undefined;
      if (slot.file) {
        imageBase64 = await fileToBase64(slot.file);
      }
      if (!slot.id && !imageBase64) continue;
      images.push({
        id: slot.id,
        url: imageBase64 ? undefined : slot.url,
        imageBase64,
        isPrimary: slot.isPrimary,
        sortOrder: images.length,
      });
    }
    if (images.length === 0) return images;
    let hasPrimary = false;
    for (let index = 0; index < images.length; index++) {
      if (images[index].isPrimary === true) hasPrimary = true;
    }
    if (hasPrimary !== true) images[0].isPrimary = true;
    return images;
  }

  // Giải thích:
  // Hàm onSubmit để xử lý dữ liệu form khi submit
  async function onSubmit(values: ProductFormData) {
    setIsUploading(true);
    try {
      const images = await buildImagesPayload();

      // Nếu là chỉnh sửa thì dùng type update và gọi update mutation
      if (isEdit && product?.id) {
        const data: UpdateProductRequest = {
          categoryId: values.categoryId,
          name: values.name,
          unit: values.unit,
          description: values.description || undefined,
          content: values.content || undefined,
          costPrice: values.costPrice,
          sellingPrice: values.sellingPrice,
          stockQuantity: values.stockQuantity,
          minStock: values.minStock,
          status: values.status,
          images,
        };

        updateMutation.mutate(
          { id: product.id, data },
          {
            onSuccess: (result) => {
              if (result.isSuccess !== true) return;
              onOpenChange(false);
            },
          },
        );
        return;
      }

      // Mặc định tạo mới với type create request và gọi create mutation
      const payload: CreateProductRequest = {
        categoryId: values.categoryId,
        name: values.name,
        unit: values.unit,
        description: values.description || undefined,
        content: values.content || undefined,
        costPrice: values.costPrice,
        sellingPrice: values.sellingPrice,
        stockQuantity: values.stockQuantity,
        minStock: values.minStock,
        status: values.status ?? StatusActive.Active,
        images,
      };

      createMutation.mutate(payload, {
        onSuccess: (result) => {
          if (result.isSuccess !== true) return;
          onOpenChange(false);
        },
      });
    } finally {
      setIsUploading(false);
    }
  }

  const unitInList = UNIT_OPTIONS.indexOf(unit ?? "") >= 0;
  const saving = isPending || isUploading;

  function renderImageSlots() {
    const nodes = [];
    for (let index = 0; index < imageSlots.length; index++) {
      const slot = imageSlots[index];
      nodes.push(
        <div key={slot.slotId} className="flex flex-col items-start gap-2">
          <ImageUpload
            value={slot.previewUrl || slot.url}
            onFileChange={(file) => handleImageFileChange(index, file)}
            shape="square"
            size="lg"
            label="Chọn ảnh"
          />
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant={slot.isPrimary === true ? "admin" : "outline"}
              className="mb-0 mr-0 h-7 px-2 text-xs"
              onClick={() => handleSetPrimary(index)}
            >
              <Star className="h-3 w-3" />
              Ảnh chính
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline-danger"
              className="mb-0 mr-0"
              onClick={() => handleRemoveImageSlot(index)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>,
      );
    }
    return nodes;
  }

  return (
    <>
      <Modal
        open={open}
        onClose={() => onOpenChange(false)}
        title={isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
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
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="product-form"
              variant="admin"
              size="sm"
              className="mb-0"
              loading={saving}
            >
              {isEdit ? "Chỉnh sửa" : "Thêm sản phẩm"}
            </Button>
          </>
        }
      >
        {isEdit && detailQuery.isLoading ? (
          <div className="py-16 text-center text-sm text-kit-muted">
            Đang tải...
          </div>
        ) : (
          <form
            id="product-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <Tabs
              variant="body"
              activeId={activeTab}
              onChange={setActiveTab}
              tabs={[
                {
                  id: "info",
                  label: "Thông tin",
                  content: (
                    <div className="space-y-4">
                      <FormSection title="Thông tin sản phẩm">
                        <FormRow>
                          <FormField
                            label="Mã sản phẩm"
                            tooltip="Mã được hệ thống tạo tự động"
                          >
                            <Input
                              value={
                                isEdit
                                  ? (detail?.code ?? product?.code ?? "")
                                  : ""
                              }
                              placeholder="Tự động tạo"
                              disabled
                              readOnly
                            />
                          </FormField>

                          <FormField
                            label="Tên sản phẩm"
                            required
                            error={errors.name?.message}
                          >
                            <Input
                              {...register("name")}
                              placeholder="Tên sản phẩm"
                              invalid={!!errors.name}
                            />
                          </FormField>

                          <FormField
                            label="Danh mục"
                            required
                            error={errors.categoryId?.message}
                          >
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Select
                                  value={categoryId ? String(categoryId) : ""}
                                  onChange={(event) =>
                                    setValue(
                                      "categoryId",
                                      Number(event.target.value),
                                    )
                                  }
                                  invalid={!!errors.categoryId}
                                >
                                  <option value="">Chọn danh mục</option>
                                  {categories.map(
                                    (category: ProductCategoryDto) => (
                                      <option
                                        key={category.id}
                                        value={category.id?.toString() || ""}
                                      >
                                        {category.name}
                                      </option>
                                    ),
                                  )}
                                </Select>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mb-0 mr-0 shrink-0"
                                onClick={() => setCategoryOpen(true)}
                              >
                                <Plus className="h-4 w-4" />
                                Thêm
                              </Button>
                            </div>
                          </FormField>

                          <FormField
                            label="Đơn vị tính"
                            required
                            error={errors.unit?.message}
                          >
                            <Select
                              value={unit ?? ""}
                              onChange={(event) =>
                                setValue("unit", event.target.value)
                              }
                              invalid={!!errors.unit}
                              placeholder="Chọn đơn vị tính"
                            >
                              <option value="">Chọn đơn vị tính</option>
                              {UNIT_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                              {unit && !unitInList ? (
                                <option value={unit}>{unit}</option>
                              ) : null}
                            </Select>
                          </FormField>

                          <FormField label="Trạng thái">
                            <div className="flex h-9 items-center">
                              <Switch
                                checked={status === StatusActive.Active}
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

                          <FormField
                            label="Mô tả"
                            error={errors.description?.message}
                            className="sm:col-span-2"
                          >
                            <Textarea
                              {...register("description")}
                              placeholder="Mô tả ngắn về sản phẩm"
                              rows={2}
                              invalid={!!errors.description}
                            />
                          </FormField>

                          <FormField
                            label="Nội dung chi tiết"
                            className="sm:col-span-2"
                          >
                            <Textarea
                              {...register("content")}
                              placeholder="Nội dung chi tiết sản phẩm"
                              rows={4}
                            />
                          </FormField>
                        </FormRow>
                      </FormSection>

                      <FormSection title="Giá và tồn kho">
                        <FormRow>
                          <FormField
                            label="Giá vốn"
                            required
                            error={errors.costPrice?.message}
                          >
                            <CurrencyInput
                              value={costPrice}
                              onChange={(value) =>
                                setValue("costPrice", value ?? 0)
                              }
                              placeholder="0"
                              invalid={!!errors.costPrice}
                            />
                          </FormField>

                          <FormField
                            label="Giá bán"
                            error={errors.sellingPrice?.message}
                          >
                            <CurrencyInput
                              value={sellingPrice}
                              onChange={(value) =>
                                setValue("sellingPrice", value ?? 0)
                              }
                              placeholder="0"
                              invalid={!!errors.sellingPrice}
                            />
                          </FormField>

                          <FormField
                            label="Tồn kho"
                            required
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
                            label="Tồn kho tối thiểu"
                            tooltip="Cảnh báo khi số lượng dưới mức này"
                            error={errors.minStock?.message}
                          >
                            <Input
                              {...register("minStock", {
                                valueAsNumber: true,
                              })}
                              type="number"
                              placeholder="0"
                              invalid={!!errors.minStock}
                            />
                          </FormField>
                        </FormRow>
                      </FormSection>
                    </div>
                  ),
                },
                {
                  id: "images",
                  label: "Hình ảnh",
                  content: (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-4">
                        {renderImageSlots()}
                        <button
                          type="button"
                          onClick={handleAddImageSlot}
                          className="flex h-32 w-32 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-kit text-kit-muted hover:border-kit-primary hover:text-kit-primary"
                        >
                          <Plus className="h-6 w-6" />
                          <span className="text-xs font-medium">Thêm ảnh</span>
                        </button>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </form>
        )}
      </Modal>

      <ProductCategoryForm
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        onSuccess={(category) => {
          if (category.id) setValue("categoryId", category.id);
        }}
      />
    </>
  );
}
