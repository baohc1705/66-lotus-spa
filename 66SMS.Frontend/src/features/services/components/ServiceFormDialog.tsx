import { useProductsAdmin } from "@/features/products/hooks/useProducts";
import type { ProductDto } from "@/features/products/types/product.types";
import { ServiceCategoryForm } from "@/features/service_categories/components/ServiceCategoryForm";
import { useServiceCategories } from "@/features/service_categories/hooks/useServiceCategories";
import type { ServiceCategoryDto } from "@/features/service_categories/types/serviceCategory.types";
import {
  useCreateService,
  useServiceDetail,
  useUpdateService,
} from "@/features/services/hooks/useServices";
import { Modal } from "@/shared/components/Modal";
import { Tabs } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import { Badge } from "@/shared/elements/Badge";
import { CurrencyInput } from "@/shared/forms/CurrencyInput";
import { FormField } from "@/shared/forms/FormField";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Input } from "@/shared/forms/Input";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Select } from "@/shared/forms/Select";
import { Switch } from "@/shared/forms/Switch";
import { Textarea } from "@/shared/forms/Textarea";
import { StatusActive } from "@/shared/constants/status.enum";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { formatCurrency } from "@/shared/utils/currency";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type FieldErrors,
  type Resolver,
} from "react-hook-form";
import { SERVICE_DURATION_OPTIONS } from "../constants/service.durations";
import {
  createServiceSchema,
  type CreateServicePayload,
  type ServiceFormValues,
  type UpdateServicePayload,
} from "../schemas/service.schema";
import type {
  ServiceDetailDto,
  ServiceListDto,
  ServiceProductResponse,
} from "../types/service.types";
import {
  calcCommissionAmount,
  calcGrossMarginPercent,
  calcGrossProfit,
  calcMarkupOnCostPercent,
  calcSuggestedMinPrice,
  calcSuggestedSellPrice,
  getProfitLabel,
  getProfitTone,
  roundVnd,
  type ProfitTone,
} from "../utils/servicePricing";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceListDto | null;
  onSuccess?: (service: ServiceListDto) => void;
}

function profitBadgeVariant(
  tone: ProfitTone,
): "success" | "danger" | "secondary" {
  if (tone === "profit") return "success";
  if (tone === "loss") return "danger";
  return "secondary";
}

function profitTextClass(tone: ProfitTone): string {
  if (tone === "profit") return "text-kit-success";
  if (tone === "loss") return "text-kit-danger";
  return "text-kit-muted";
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  onSuccess,
}: ServiceFormDialogProps) {
  const isEdit = !!service?.id;
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const detailQuery = useServiceDetail(open && isEdit ? service!.id! : null);
  const detail = detailQuery.data?.data;
  const formSource = isEdit ? (detail ?? null) : null;

  const { data: categoriesResult } = useServiceCategories({
    pageIndex: 1,
    pageSize: 100,
  });
  const categories = useMemo(
    () => categoriesResult?.data?.items ?? [],
    [categoriesResult],
  );

  const { data: productsResult } = useProductsAdmin({
    pageIndex: 1,
    pageSize: 1000,
  });
  const products = useMemo(
    () => productsResult?.data?.items ?? [],
    [productsResult],
  );
  const productOptions = useMemo(
    () =>
      products.map((p: ProductDto) => ({
        value: String(p.id ?? ""),
        label: `${p.name ?? ""} - ${formatCurrency(p.costPrice)}`,
      })),
    [products],
  );

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(createServiceSchema) as Resolver<ServiceFormValues>,
    defaultValues: getDefaultValues(null),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = form;

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: "serviceProducts",
  });

  useEffect(() => {
    if (!open) return;
    setPendingFile(null);
    setActiveTab("basic");
    if (isEdit) {
      if (formSource) reset(getDefaultValues(formSource));
    } else {
      reset(getDefaultValues(null));
    }
  }, [open, isEdit, formSource, reset]);

  function goToErrorTab(formErrors: FieldErrors<ServiceFormValues>) {
    if (
      formErrors.name ||
      formErrors.categoryId ||
      formErrors.durationMins ||
      formErrors.sortOrder ||
      formErrors.status ||
      formErrors.description ||
      formErrors.content
    ) {
      setActiveTab("basic");
      return;
    }
    if (formErrors.serviceProducts) {
      setActiveTab("products");
      return;
    }
    if (
      formErrors.costPrice ||
      formErrors.commissionRate ||
      formErrors.desiredProfitPercent ||
      formErrors.minSellingPrice ||
      formErrors.sellingPrice
    ) {
      setActiveTab("pricing");
    }
  }

  const watchProducts = watch("serviceProducts");
  const watchCostPrice = watch("costPrice") || 0;
  const watchCommissionRate = watch("commissionRate") || 0;
  const watchDesiredProfit = watch("desiredProfitPercent") || 0;
  const watchSellingPrice = watch("sellingPrice") || 0;
  const selectedDuration = watch("durationMins");

  let productCost = 0;
  if (watchProducts && watchProducts.length > 0) {
    for (const p of watchProducts) {
      const unitFromForm = p.unitCost;
      if (unitFromForm != null && unitFromForm > 0) {
        productCost += unitFromForm * (p.quantityUsed || 0);
        continue;
      }
      const prod = products.find(
        (prodItem: ProductDto) => prodItem.id === p.productId,
      );
      if (prod && prod.costPrice) {
        productCost += prod.costPrice * (p.quantityUsed || 0);
      }
    }
  }
  productCost = roundVnd(productCost);
  const totalCost = roundVnd(watchCostPrice + productCost);
  const suggestedMinPrice = calcSuggestedMinPrice(
    totalCost,
    watchCommissionRate,
  );
  const suggestedSellPrice = calcSuggestedSellPrice(
    totalCost,
    watchCommissionRate,
    watchDesiredProfit,
  );
  const commissionAmount = calcCommissionAmount(
    watchSellingPrice,
    watchCommissionRate,
  );
  const grossProfit = calcGrossProfit(
    watchSellingPrice,
    totalCost,
    commissionAmount,
  );
  const grossMarginPercent = calcGrossMarginPercent(
    watchSellingPrice,
    grossProfit,
  );
  const markupOnCostPercent = calcMarkupOnCostPercent(totalCost, grossProfit);
  const profitTone = getProfitTone(grossProfit);
  const belowMin =
    watchSellingPrice > 0 && watchSellingPrice < suggestedMinPrice;

  const onSubmit = async (data: ServiceFormValues) => {
    setIsUploading(true);
    try {
      let imageBase64: string | undefined;
      if (pendingFile) {
        imageBase64 = await fileToBase64(pendingFile);
      }

      const serviceProducts = (data.serviceProducts || [])
        .filter((sp) => sp.productId && sp.productId > 0)
        .map((sp) => {
          const prod = products.find(
            (prodItem: ProductDto) => prodItem.id === sp.productId,
          );
          return {
            productId: sp.productId,
            quantityUsed: sp.quantityUsed,
            unitCost: sp.unitCost ?? prod?.costPrice ?? undefined,
            note: sp.note || undefined,
          };
        });

      if (isEdit && service?.id) {
        const payload: UpdateServicePayload = {
          categoryId: data.categoryId,
          name: data.name,
          description: data.description || undefined,
          content: data.content || undefined,
          durationMins: data.durationMins,
          costPrice: data.costPrice,
          minSellingPrice: data.minSellingPrice,
          sellingPrice: data.sellingPrice,
          commissionRate: data.commissionRate,
          sortOrder: data.sortOrder,
          status: data.status,
          serviceProducts,
        };
        if (imageBase64) {
          payload.imageUrl = imageBase64;
        }

        updateMutation.mutate(
          { id: service.id, payload },
          {
            onSuccess: (result) => {
              if (result.isSuccess) {
                onOpenChange(false);
                onSuccess?.({ ...service, ...payload });
              }
            },
          },
        );
      } else {
        const payload: CreateServicePayload = {
          categoryId: data.categoryId,
          name: data.name,
          description: data.description || undefined,
          content: data.content || undefined,
          durationMins: data.durationMins,
          costPrice: data.costPrice,
          minSellingPrice: data.minSellingPrice,
          sellingPrice: data.sellingPrice,
          commissionRate: data.commissionRate,
          sortOrder: data.sortOrder,
          status: data.status,
          serviceProducts,
        };
        if (imageBase64) {
          payload.imageUrl = imageBase64;
        }

        createMutation.mutate(payload, {
          onSuccess: (result) => {
            if (result.isSuccess) {
              onOpenChange(false);
              onSuccess?.(payload as ServiceListDto);
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
        title={isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
        size="xl"
        scrollable
      >
        {isEdit && detailQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-kit-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Đang tải thông tin dịch vụ...</span>
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
                        <div className="md:col-span-2">
                          <ImageUpload
                            key={`${open}-${service?.id ?? "new"}`}
                            value={watch("imageUrl") || formSource?.imageUrl}
                            onFileChange={setPendingFile}
                            shape="square"
                            label="Chọn ảnh dịch vụ"
                          />
                        </div>

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
                                ? (formSource?.code ?? service?.code ?? "")
                                : ""
                            }
                            placeholder={isEdit ? "" : "Tự động tạo"}
                            disabled
                            readOnly
                          />
                        </FormField>

                        <FormField
                          label="Tên dịch vụ *"
                          error={errors.name?.message}
                        >
                          <Input
                            {...register("name")}
                            placeholder="Nhập tên dịch vụ"
                            invalid={!!errors.name}
                          />
                        </FormField>

                        <FormField
                          label="Nhóm dịch vụ *"
                          error={errors.categoryId?.message}
                        >
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Select
                                value={watch("categoryId")?.toString() || ""}
                                onChange={(e) =>
                                  setValue("categoryId", Number(e.target.value))
                                }
                                invalid={!!errors.categoryId}
                              >
                                <option value="">Chọn nhóm dịch vụ</option>
                                {categories.map((c: ServiceCategoryDto) => (
                                  <option
                                    key={c.id}
                                    value={c.id?.toString() || ""}
                                  >
                                    {c.name}
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
                          label="Thời gian (phút)"
                          error={errors.durationMins?.message}
                        >
                          <Select
                            value={
                              selectedDuration ? String(selectedDuration) : ""
                            }
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

                        <FormField
                          label="Trạng thái"
                          error={errors.status?.message}
                        >
                          <div className="flex h-9 items-center">
                            <Switch
                              checked={watch("status") === StatusActive.Active}
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
                            placeholder="Mô tả ngắn..."
                            invalid={!!errors.description}
                          />
                        </FormField>

                        <FormField
                          label="Nội dung chi tiết"
                          error={errors.content?.message}
                        >
                          <Textarea
                            {...register("content")}
                            placeholder="Nội dung chi tiết dịch vụ..."
                            className="min-h-25"
                            invalid={!!errors.content}
                          />
                        </FormField>
                      </div>
                    </div>
                  ),
                },
                {
                  id: "products",
                  label: "Sản phẩm",
                  content: (
                    <div className="space-y-4">
                      {productFields.map((field, index) => {
                        const errorObj = errors.serviceProducts?.[index];
                        const productId = watch(
                          `serviceProducts.${index}.productId`,
                        );
                        const quantity =
                          watch(`serviceProducts.${index}.quantityUsed`) || 0;
                        const selectedProduct = products.find(
                          (p: ProductDto) => p.id === productId,
                        );
                        const unitCost =
                          watch(`serviceProducts.${index}.unitCost`) ??
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
                                onChange={(val: string) => {
                                  const id = parseInt(val);
                                  const prod = products.find(
                                    (p: ProductDto) => p.id === id,
                                  );
                                  setValue(
                                    `serviceProducts.${index}.productId`,
                                    id,
                                  );
                                  setValue(
                                    `serviceProducts.${index}.unitCost`,
                                    prod?.costPrice ?? 0,
                                  );
                                }}
                                options={productOptions}
                                placeholder="Chọn sản phẩm"
                                searchPlaceholder="Tìm sản phẩm..."
                                clearable={false}
                                invalid={!!errorObj?.productId}
                              />
                              {errorObj?.productId && (
                                <span className="mt-1 block text-xs text-kit-danger">
                                  {errorObj.productId.message}
                                </span>
                              )}
                            </div>

                            <div className="col-span-2">
                              <Input
                                {...register(
                                  `serviceProducts.${index}.quantityUsed`,
                                  { valueAsNumber: true },
                                )}
                                type="number"
                                placeholder="SL"
                                invalid={!!errorObj?.quantityUsed}
                              />
                              {errorObj?.quantityUsed && (
                                <span className="mt-1 block text-xs text-kit-danger">
                                  {errorObj.quantityUsed.message}
                                </span>
                              )}
                            </div>

                            <div className="col-span-3">
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
                            label="Giá vốn *"
                            tooltip="Chi phí gốc của dịch vụ"
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
                            label="Tỷ lệ hoa hồng (%)"
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
                            label="% lãi mong muốn"
                            tooltip="% lãi trên giá vốn (sau hoa hồng). VD: 100% = lãi bằng giá vốn."
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
                            <Controller
                              name="minSellingPrice"
                              control={control}
                              render={({ field }) => (
                                <CurrencyInput
                                  value={field.value}
                                  onChange={(v) => field.onChange(v ?? 0)}
                                  onBlur={field.onBlur}
                                  placeholder="0"
                                />
                              )}
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
                            label="Giá bán *"
                            tooltip="Gợi ý = giá vốn × (1 + % lãi) ÷ (1 − % hoa hồng)."
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
                                />
                              )}
                            />
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-kit-muted">
                              <span>
                                Gợi ý lãi {watchDesiredProfit}% trên giá vốn:{" "}
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
                            {belowMin && (
                              <p className="mt-1.5 text-xs text-kit-danger">
                                Giá bán đang thấp hơn giá tối thiểu gợi ý (
                                {formatCurrency(suggestedMinPrice)}).
                              </p>
                            )}
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
                            {getProfitLabel(profitTone)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />

            <div className="flex justify-end gap-2 border-t border-kit pt-3">
              <Button
                type="button"
                variant="outline"
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
                {isEdit ? "Cập nhật" : "Tạo dịch vụ"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ServiceCategoryForm
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        onSuccess={(cat: ServiceCategoryDto) => {
          if (cat.id) setValue("categoryId", cat.id);
        }}
      />
    </>
  );
}

function getDefaultValues(
  service?: ServiceDetailDto | null,
): ServiceFormValues {
  if (service) {
    return {
      categoryId: service.categoryId ?? 0,
      code: service.code ?? "",
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
      serviceProducts:
        service.serviceProducts?.map((sp: ServiceProductResponse) => ({
          id: sp.id,
          productId: sp.productId ?? 0,
          quantityUsed: sp.quantityUsed ?? 1,
          unitCost: sp.unitCost ?? 0,
          note: sp.note ?? "",
        })) ?? [],
    };
  }

  return {
    categoryId: 0,
    code: "",
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
