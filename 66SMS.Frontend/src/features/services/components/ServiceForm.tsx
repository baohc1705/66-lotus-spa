import { useProductsAdmin } from "@/features/products/hooks/useProducts";
import type { ProductDto } from "@/features/products/types/product.types";
import { ServiceCategoryForm } from "@/features/service_categories/components/ServiceCategoryForm";
import { useServiceCategories } from "@/features/service_categories/hooks/useServiceCategories";
import type { ServiceCategoryDto } from "@/features/service_categories/types/serviceCategory.types";
import {
  SERVICE_DURATION_OPTIONS,
  SERVICE_DURATION_VALUES,
} from "@/features/services/constants/service.durations";
import {
  useCreateService,
  useServiceDetail,
  useUpdateService,
} from "@/features/services/hooks/useServices";
import type {
  CreateServiceRequest,
  ServiceDto,
  ServiceFullDto,
  ServiceProductDto,
  UpdateServiceRequest,
} from "@/features/services/types/service.types";
import {
  lamTronVnd,
  layMauLai,
  layNhanLai,
  tinhGiaBan,
  tinhGiaBanToiThieu,
  tinhHoaHong,
  tinhLai,
  tinhPhanTramBienLoiNhuan,
  tinhPhanTramLaiTrenVon,
  type MauLai,
} from "@/features/services/utils/servicePricing";
import { Modal } from "@/shared/components/Modal";
import { Tabs } from "@/shared/components/Tabs";
import { StatusActive } from "@/shared/constants/status.enum";
import { Badge } from "@/shared/elements/Badge";
import { Button } from "@/shared/elements/Button";
import { CurrencyInput } from "@/shared/forms/CurrencyInput";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Input } from "@/shared/forms/Input";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Select } from "@/shared/forms/Select";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { formatCurrency } from "@/shared/utils/currency";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";

// Validate dữ liệu client side
const serviceProductSchema = z.object({
  id: z.number().optional(),
  productId: z.coerce.number().min(1, "Vui lòng chọn sản phẩm"),
  quantityUsed: z.coerce.number().min(1, "Số lượng phải lớn hơn 0"),
  note: z.string().optional(),
  unitCost: z.coerce.number().optional(),
});

const serviceSchema = z.object({
  categoryId: z.coerce.number().min(1, "Vui lòng chọn nhóm dịch vụ"),
  name: z
    .string()
    .nonempty("Tên dịch vụ không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  description: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  durationMins: z.coerce
    .number()
    .refine(
      (value) => SERVICE_DURATION_VALUES.includes(value),
      "Chọn thời gian hợp lệ",
    ),
  costPrice: z.coerce.number().min(0, "Giá cơ bản không được âm"),
  minSellingPrice: z.coerce
    .number()
    .min(0, "Giá bán tối thiểu không được âm")
    .optional(),
  sellingPrice: z.coerce.number().min(0, "Giá bán không được âm"),
  commissionRate: z.coerce
    .number()
    .min(0, "Phải lớn hơn hoặc bằng 0")
    .max(100, "Tỷ lệ hoa hồng từ 0-100")
    .optional(),
  desiredProfitPercent: z.coerce
    .number()
    .min(0, "% lãi mong muốn không được âm"),
  sortOrder: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  status: z.coerce.number().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  serviceProducts: z.array(serviceProductSchema).optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceDto | null;
}

function profitBadgeVariant(
  mauLai: MauLai,
): "success" | "danger" | "secondary" {
  if (mauLai === "lai") return "success";
  if (mauLai === "lo") return "danger";
  return "secondary";
}

function profitTextClass(mauLai: MauLai): string {
  if (mauLai === "lai") return "text-kit-success";
  if (mauLai === "lo") return "text-kit-danger";
  return "text-kit-muted";
}

// Hàm findProductById để tìm sản phẩm theo id
function findProductById(
  products: ProductDto[],
  productId?: number,
): ProductDto | undefined {
  if (!productId) return undefined;
  for (let index = 0; index < products.length; index++) {
    if (products[index].id === productId) return products[index];
  }
  return undefined;
}

// Hàm calcProductCost để tính giá sản phẩm tiêu hao
function calcProductCost(
  rows: ServiceFormData["serviceProducts"],
  products: ProductDto[],
): number {
  if (!rows || rows.length === 0) return 0;
  let productCost = 0;
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const unitFromForm = row.unitCost;
    if (unitFromForm != null && unitFromForm > 0) {
      productCost += unitFromForm * (row.quantityUsed || 0);
      continue;
    }
    const product = findProductById(products, row.productId);
    if (product && product.costPrice) {
      productCost += product.costPrice * (row.quantityUsed || 0);
    }
  }
  return lamTronVnd(productCost);
}

// Hàm buildServiceProductsPayload để build payload cho sản phẩm tiêu hao
// dùng để gọi API create/update service
function buildServiceProductsPayload(
  rows: ServiceFormData["serviceProducts"],
  products: ProductDto[],
): ServiceProductDto[] {
  const result: ServiceProductDto[] = [];
  if (!rows) return result;
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    if (!row.productId || row.productId <= 0) continue;
    const product = findProductById(products, row.productId);
    result.push({
      productId: row.productId,
      quantityUsed: row.quantityUsed,
      unitCost: row.unitCost ?? product?.costPrice ?? undefined,
      note: row.note || undefined,
    });
  }
  return result;
}

// Hàm getDefaultValues để lấy giá trị mặc định cho form
function getDefaultValues(service?: ServiceFullDto | null): ServiceFormData {
  if (!service) {
    return {
      categoryId: 0,
      name: "",
      description: "",
      content: "",
      durationMins: 60,
      costPrice: 0,
      minSellingPrice: 0,
      sellingPrice: 0,
      desiredProfitPercent: 20,
      commissionRate: 0,
      sortOrder: 0,
      status: StatusActive.Active,
      imageUrl: "",
      serviceProducts: [],
    };
  }

  const serviceProducts: ServiceFormData["serviceProducts"] = [];
  const source = service.serviceProducts ?? [];
  for (let index = 0; index < source.length; index++) {
    const row = source[index];
    serviceProducts.push({
      id: row.id,
      productId: row.productId ?? 0,
      quantityUsed: row.quantityUsed ?? 1,
      unitCost: row.unitCost ?? 0,
      note: row.note ?? "",
    });
  }

  return {
    categoryId: service.categoryId ?? 0,
    name: service.name ?? "",
    description: service.description ?? "",
    content: service.content ?? "",
    durationMins: service.durationMins ?? 60,
    costPrice: service.costPrice ?? 0,
    minSellingPrice: service.minSellingPrice ?? 0,
    sellingPrice: service.sellingPrice ?? 0,
    desiredProfitPercent: 20,
    commissionRate: service.commissionRate ?? 0,
    sortOrder: service.sortOrder ?? 0,
    status: service.status ?? StatusActive.Active,
    imageUrl: service.imageUrl ?? "",
    serviceProducts,
  };
}

export function ServiceForm({ open, onOpenChange, service }: Props) {
  // Kiểm tra xem có phải là chỉnh sửa không
  const isEdit = !!service?.id;
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  // Kiểm tra xem có phải là đang xử lý không
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // Sửa thì load chi tiết để lấy mô tả, giá, sản phẩm tiêu hao
  const detailQuery = useServiceDetail(open && isEdit ? service?.id : null);
  const detail = detailQuery.data?.data;

  // Hàm formKey để đặt key cho form để reset form khi mở modal
  const formKey = !open
    ? "closed"
    : isEdit
      ? `edit-${detail?.id ?? "loading"}`
      : "new";
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);
  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      setActiveTab("info");
      setPendingFile(null);
    }
  }

  // Lấy danh sách nhóm dịch vụ để hiển thị trong select
  const { data: categoriesResult } = useServiceCategories({
    pageIndex: 1,
    pageSize: 500,
  });
  const categories = categoriesResult?.data?.items ?? [];

  // Lấy danh sách sản phẩm để hiển thị trong select
  const { data: productsResult } = useProductsAdmin({
    pageIndex: 1,
    pageSize: 1000,
  });
  const products = productsResult?.data?.items ?? [];

  // Tạo options cho select sản phẩm
  const productOptions: { value: string; label: string }[] = [];
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    productOptions.push({
      value: String(product.id),
      label: `${product.name}`,
    });
  }

  // Sử dụng hook useForm để quản lý form
  // Sử dụng zodResolver để validate dữ liệu client side
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema) as Resolver<ServiceFormData>,
    defaultValues: getDefaultValues(null),
  });

  // Sử dụng hook useFieldArray để quản lý sản phẩm tiêu hao
  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: "serviceProducts",
  });

  // Sử dụng hook useWatch để theo dõi select, switch, giá tiền, sản phẩm tiêu hao
  const status = useWatch({ control, name: "status" });
  const categoryId = useWatch({ control, name: "categoryId" });
  const durationMins = useWatch({ control, name: "durationMins" });
  const imageUrl = useWatch({ control, name: "imageUrl" });
  const watchProducts = useWatch({ control, name: "serviceProducts" });
  const costPrice = useWatch({ control, name: "costPrice" }) || 0;
  const commissionRate = useWatch({ control, name: "commissionRate" }) || 0;
  const desiredProfitPercent =
    useWatch({ control, name: "desiredProfitPercent" }) || 0;
  const sellingPrice = useWatch({ control, name: "sellingPrice" }) || 0;
  const minSellingPrice = useWatch({ control, name: "minSellingPrice" });

  // Reset form khi mở modal; sửa thì đợi API chi tiết xong
  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      if (detail) reset(getDefaultValues(detail));
      return;
    }
    reset(getDefaultValues(null));
  }, [open, isEdit, detail, reset]);

  // Hàm goToErrorTab để chuyển tab khi có lỗi validate dữ liệu client side
  function goToErrorTab(formErrors: FieldErrors<ServiceFormData>) {
    if (
      formErrors.name ||
      formErrors.categoryId ||
      formErrors.durationMins ||
      formErrors.sortOrder ||
      formErrors.status ||
      formErrors.description ||
      formErrors.content
    ) {
      setActiveTab("info");
      return;
    }
    if (formErrors.serviceProducts) {
      setActiveTab("products");
      return;
    }
    setActiveTab("pricing");
  }

  // Tính giá sản phẩm tiêu hao và tổng giá cơ bản
  const productCost = calcProductCost(watchProducts, products);
  const totalCost = lamTronVnd(costPrice + productCost);

  // Tính giá bán tối thiểu
  const suggestedMinPrice = tinhGiaBanToiThieu(totalCost, commissionRate);

  // Tính giá bán gợi ý
  const suggestedSellPrice = tinhGiaBan(
    totalCost,
    commissionRate,
    desiredProfitPercent,
  );

  // Tính hoa hồng
  const commissionAmount = tinhHoaHong(sellingPrice, commissionRate);

  // Tính lãi
  const grossProfit = tinhLai(sellingPrice, totalCost, commissionAmount);

  // Tính phần trăm lãi
  const grossMarginPercent = tinhPhanTramBienLoiNhuan(
    sellingPrice,
    grossProfit,
  );

  // Tính phần trăm lãi trên vốn
  const markupOnCostPercent = tinhPhanTramLaiTrenVon(totalCost, grossProfit);

  // Tính màu lãi
  const profitTone = layMauLai(grossProfit);

  // Kiểm tra xem giá bán có nhỏ hơn giá bán tối thiểu không
  const belowMin = sellingPrice > 0 && sellingPrice < suggestedMinPrice;

  // Hàm onSubmit để xử lý dữ liệu form khi submit
  async function onSubmit(values: ServiceFormData) {
    setIsUploading(true);
    try {
      let imageBase64: string | undefined;
      if (pendingFile) {
        imageBase64 = await fileToBase64(pendingFile);
      }

      const serviceProducts = buildServiceProductsPayload(
        values.serviceProducts,
        products,
      );

      // Nếu là chỉnh sửa thì dùng type update và gọi update mutation
      if (isEdit && service?.id) {
        const data: UpdateServiceRequest = {
          categoryId: values.categoryId,
          name: values.name,
          description: values.description || undefined,
          content: values.content || undefined,
          durationMins: values.durationMins,
          costPrice: values.costPrice,
          minSellingPrice: values.minSellingPrice,
          sellingPrice: values.sellingPrice,
          commissionRate: values.commissionRate,
          sortOrder: values.sortOrder,
          status: values.status,
          serviceProducts,
        };
        if (imageBase64) data.imageUrl = imageBase64;

        updateMutation.mutate(
          { id: service.id, data },
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
      const payload: CreateServiceRequest = {
        categoryId: values.categoryId,
        name: values.name,
        description: values.description || undefined,
        content: values.content || undefined,
        durationMins: values.durationMins,
        costPrice: values.costPrice,
        minSellingPrice: values.minSellingPrice,
        sellingPrice: values.sellingPrice,
        commissionRate: values.commissionRate,
        sortOrder: values.sortOrder,
        status: values.status ?? StatusActive.Active,
        serviceProducts,
      };
      if (imageBase64) payload.imageUrl = imageBase64;

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

  const saving = isPending || isUploading;

  return (
    <>
      <Modal
        open={open}
        onClose={() => onOpenChange(false)}
        title={isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
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
              form="service-form"
              variant="admin"
              size="sm"
              className="mb-0"
              loading={saving}
            >
              {isEdit ? "Cập nhật" : "Tạo dịch vụ"}
            </Button>
          </>
        }
      >
        {isEdit && detailQuery.isLoading ? (
          <div className="py-16 text-center text-sm text-kit-muted">
            Đang tải thông tin dịch vụ...
          </div>
        ) : (
          <form
            id="service-form"
            onSubmit={handleSubmit(onSubmit, goToErrorTab)}
            className="space-y-4"
          >
            <Tabs
              variant="body"
              activeId={activeTab}
              onChange={setActiveTab}
              tabs={[
                // Tab thông tin dịch vụ
                {
                  id: "info",
                  label: "Thông tin",
                  content: (
                    <div className="space-y-4">
                      <FormSection title="Thông tin dịch vụ">
                        <FormRow>
                          <FormField
                            label="Ảnh dịch vụ"
                            className="sm:col-span-2"
                          >
                            <ImageUpload
                              key={`${open}-${service?.id ?? "new"}`}
                              value={imageUrl || detail?.imageUrl}
                              onFileChange={setPendingFile}
                              shape="square"
                              label="Chọn ảnh dịch vụ"
                            />
                          </FormField>

                          <FormField
                            label="Mã dịch vụ"
                            tooltip={
                              isEdit
                                ? "Mã được hệ thống tạo tự động, không chỉnh sửa."
                                : "Mã sẽ được hệ thống tạo tự động sau khi lưu."
                            }
                          >
                            <Input
                              value={
                                isEdit
                                  ? (detail?.code ?? service?.code ?? "")
                                  : ""
                              }
                              placeholder={isEdit ? "" : "Tự động tạo"}
                              disabled
                              readOnly
                            />
                          </FormField>

                          <FormField
                            label="Tên dịch vụ"
                            required
                            error={errors.name?.message}
                          >
                            <Input
                              {...register("name")}
                              placeholder="Nhập tên dịch vụ"
                              invalid={!!errors.name}
                            />
                          </FormField>

                          <FormField
                            label="Nhóm dịch vụ"
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
                                  <option value="">Chọn nhóm dịch vụ</option>
                                  {categories.map((category: ServiceCategoryDto) => (
                                    <option
                                      key={category.id}
                                      value={category.id?.toString() || ""}
                                    >
                                      {category.name}
                                    </option>
                                  ))}
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
                            label="Thời gian (phút)"
                            error={errors.durationMins?.message}
                          >
                            <Select
                              value={durationMins ? String(durationMins) : ""}
                              onChange={(event) =>
                                setValue(
                                  "durationMins",
                                  Number(event.target.value),
                                  { shouldValidate: true },
                                )
                              }
                              invalid={!!errors.durationMins}
                              placeholder="Chọn thời gian"
                              options={SERVICE_DURATION_OPTIONS}
                            />
                          </FormField>

                          <FormField
                            label="Thứ tự hiển thị"
                            error={errors.sortOrder?.message}
                          >
                            <Input
                              {...register("sortOrder", {
                                valueAsNumber: true,
                              })}
                              type="number"
                              placeholder="0"
                              invalid={!!errors.sortOrder}
                            />
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
                            label="Mô tả ngắn"
                            error={errors.description?.message}
                            className="sm:col-span-2"
                          >
                            <Textarea
                              {...register("description")}
                              placeholder="Mô tả ngắn..."
                              invalid={!!errors.description}
                            />
                          </FormField>

                          <FormField
                            label="Nội dung chi tiết"
                            error={errors.content?.message}
                            className="sm:col-span-2"
                          >
                            <Textarea
                              {...register("content")}
                              placeholder="Nội dung chi tiết dịch vụ..."
                              className="min-h-25"
                              invalid={!!errors.content}
                            />
                          </FormField>
                        </FormRow>
                      </FormSection>
                    </div>
                  ),
                },

                // Tab sản phẩm tiêu hao
                {
                  id: "products",
                  label: "Sản phẩm",
                  content: (
                    <div className="space-y-4">
                      {productFields.map((field, index) => {
                        const errorObj = errors.serviceProducts?.[index];
                        const productId = watchProducts?.[index]?.productId;
                        const quantity =
                          watchProducts?.[index]?.quantityUsed || 0;
                        const selectedProduct = findProductById(
                          products,
                          productId,
                        );
                        const unitCost =
                          watchProducts?.[index]?.unitCost ??
                          selectedProduct?.costPrice ??
                          0;
                        const lineTotal = unitCost * quantity;

                        return (
                          <div
                            key={field.id}
                            className="grid grid-cols-12 items-start gap-3 rounded-lg border border-kit bg-kit-page/50 p-3"
                          >
                            <div className="col-span-4">
                              <SearchableSelect
                                value={productId?.toString() || ""}
                                onChange={(value: string) => {
                                  const id = parseInt(value);
                                  const product = findProductById(products, id);
                                  setValue(
                                    `serviceProducts.${index}.productId`,
                                    id,
                                  );
                                  setValue(
                                    `serviceProducts.${index}.unitCost`,
                                    product?.costPrice ?? 0,
                                  );
                                }}
                                options={productOptions}
                                placeholder="Chọn sản phẩm"
                                searchPlaceholder="Tìm sản phẩm..."
                                clearable={false}
                                invalid={!!errorObj?.productId}
                              />
                              {errorObj?.productId ? (
                                <span className="mt-1 block text-xs text-kit-danger">
                                  {errorObj.productId.message}
                                </span>
                              ) : null}
                            </div>

                            <div className="col-span-2">
                              <div className="flex h-9 items-center justify-end rounded border border-kit bg-kit-page px-3 text-xs font-medium text-kit-heading">
                                {formatCurrency(unitCost)}
                              </div>
                            </div>
                            <div className="col-span-1">
                              <Input
                                {...register(
                                  `serviceProducts.${index}.quantityUsed`,
                                  { valueAsNumber: true },
                                )}
                                type="number"
                                placeholder="SL"
                                invalid={!!errorObj?.quantityUsed}
                              />
                              {errorObj?.quantityUsed ? (
                                <span className="mt-1 block text-xs text-kit-danger">
                                  {errorObj.quantityUsed.message}
                                </span>
                              ) : null}
                            </div>

                            <div className="col-span-2">
                              <div className="flex h-9 items-center justify-end rounded border border-kit bg-kit-page px-3 text-xs font-medium text-kit-heading">
                                {formatCurrency(lineTotal > 0 ? lineTotal : 0)}
                              </div>
                            </div>

                            <div className="col-span-2">
                              <Input
                                {...register(`serviceProducts.${index}.note`)}
                                placeholder="Ghi chú"
                              />
                            </div>

                            <div className="col-span-1 flex justify-end">
                              <Button
                                type="button"
                                variant="outline-danger"
                                size="icon-sm"
                                className="mb-0"
                                onClick={() => removeProduct(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mb-0 w-full border-dashed"
                        onClick={() =>
                          appendProduct({
                            productId: 0,
                            quantityUsed: 1,
                            unitCost: 0,
                            note: "",
                          })
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm sản phẩm
                      </Button>
                    </div>
                  ),
                },

                // Tab định giá
                {
                  id: "pricing",
                  label: "Định giá",
                  content: (
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-xs font-semibold text-kit-muted">
                          Chi phí
                        </p>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                          <FormField
                            label="Giá vốn"
                            required
                            tooltip="Chi phí gốc của dịch vụ"
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
                            label="Chi phí tiêu hao"
                            tooltip="Tự tính từ sản phẩm tiêu hao ở tab Sản phẩm"
                          >
                            <div className="flex h-9 items-center rounded border border-kit bg-kit-page px-3 text-sm font-medium text-kit-heading">
                              {formatCurrency(productCost)}
                            </div>
                          </FormField>

                          <FormField
                            label="Tổng giá vốn"
                            tooltip="Giá vốn + chi phí tiêu hao"
                          >
                            <div className="flex h-9 items-center rounded border border-kit bg-kit-page px-3 text-sm font-semibold text-kit-heading">
                              {formatCurrency(totalCost)}
                            </div>
                          </FormField>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold text-kit-muted">
                          Định giá
                        </p>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <FormField
                            label="Phần trăm hoa hồng"
                            error={errors.commissionRate?.message}
                          >
                            <Input
                              {...register("commissionRate", {
                                valueAsNumber: true,
                              })}
                              type="number"
                              placeholder="0"
                              invalid={!!errors.commissionRate}
                            />
                          </FormField>

                          <FormField
                            label="Phần trăm lãi mong muốn"
                            tooltip="Phần trăm lãi trên giá vốn (sau hoa hồng). VD: 100% = lãi bằng giá vốn."
                            error={errors.desiredProfitPercent?.message}
                          >
                            <Input
                              {...register("desiredProfitPercent", {
                                valueAsNumber: true,
                              })}
                              type="number"
                              placeholder="20"
                              invalid={!!errors.desiredProfitPercent}
                            />
                          </FormField>

                          <FormField
                            label="Giá bán tối thiểu"
                            tooltip="Mức hòa vốn sau hoa hồng. Bạn có thể nhập tay hoặc áp dụng gợi ý."
                            error={errors.minSellingPrice?.message}
                          >
                            <CurrencyInput
                              value={minSellingPrice}
                              onChange={(value) =>
                                setValue("minSellingPrice", value ?? 0)
                              }
                              placeholder="0"
                            />
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-kit-muted">
                              <span>
                                Gợi ý hòa vốn:{" "}
                                <span className="font-semibold text-kit-heading">
                                  {formatCurrency(suggestedMinPrice)}
                                </span>
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mb-0 h-7 px-2 text-xs"
                                onClick={() =>
                                  setValue(
                                    "minSellingPrice",
                                    suggestedMinPrice,
                                    {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    },
                                  )
                                }
                              >
                                Áp dụng gợi ý
                              </Button>
                            </div>
                          </FormField>

                          <FormField
                            label="Giá bán"
                            required
                            tooltip="Gợi ý = giá vốn × (1 + % lãi) ÷ (1 − % hoa hồng)."
                            error={errors.sellingPrice?.message}
                          >
                            <CurrencyInput
                              value={sellingPrice}
                              onChange={(value) =>
                                setValue("sellingPrice", value ?? 0)
                              }
                              placeholder="0"
                            />
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-kit-muted">
                              <span>
                                Gợi ý lãi {desiredProfitPercent}% trên giá vốn:{" "}
                                <span className="font-semibold text-kit-heading">
                                  {formatCurrency(suggestedSellPrice)}
                                </span>
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mb-0 h-7 px-2 text-xs"
                                onClick={() =>
                                  setValue("sellingPrice", suggestedSellPrice, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  })
                                }
                              >
                                Áp dụng gợi ý
                              </Button>
                            </div>
                            {belowMin ? (
                              <p className="mt-1.5 text-xs text-kit-danger">
                                Giá bán đang thấp hơn giá tối thiểu gợi ý (
                                {formatCurrency(suggestedMinPrice)}).
                              </p>
                            ) : null}
                          </FormField>
                        </div>
                      </div>

                      <div className="border border-kit bg-kit-page/60 p-3">
                        <p className="mb-2 text-xs font-semibold text-kit-muted">
                          Lãi dự kiến
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span>
                            Hoa hồng:{" "}
                            <span className="font-medium text-kit-heading">
                              {formatCurrency(commissionAmount)}
                            </span>
                          </span>
                          <span>
                            Lãi gộp:{" "}
                            <span
                              className={`font-semibold ${profitTextClass(profitTone)}`}
                            >
                              {formatCurrency(grossProfit)}
                            </span>
                          </span>
                          <span>
                            % lãi / giá vốn:{" "}
                            <span
                              className={`font-semibold ${profitTextClass(profitTone)}`}
                            >
                              {markupOnCostPercent != null
                                ? `${markupOnCostPercent}%`
                                : "—"}
                            </span>
                          </span>
                          <span>
                            Biên lãi / giá bán:{" "}
                            <span
                              className={`font-semibold ${profitTextClass(profitTone)}`}
                            >
                              {grossMarginPercent != null
                                ? `${grossMarginPercent}%`
                                : "—"}
                            </span>
                          </span>
                          <Badge variant={profitBadgeVariant(profitTone)} soft>
                            {layNhanLai(profitTone)}
                          </Badge>
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-kit-muted">
                          <p>
                            Hoa hồng: tiền trả kỹ thuật viên, tính theo % trên
                            giá bán.
                          </p>
                          <p>
                            Lãi gộp: tiền còn lại sau khi trừ tổng giá vốn và
                            hoa hồng (giá bán − tổng giá vốn − hoa hồng).
                          </p>
                          <p>
                            % lãi / giá vốn: lãi gộp so với tổng giá vốn. Ví dụ
                            100% nghĩa là lãi bằng đúng số tiền đã bỏ ra.
                          </p>
                          <p>
                            Biên lãi / giá bán: lãi gộp chiếm bao nhiêu % trong
                            giá bán.
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </form>
        )}
      </Modal>

      <ServiceCategoryForm
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        onSuccess={(category) => {
          if (category.id) setValue("categoryId", category.id);
        }}
      />
    </>
  );
}
