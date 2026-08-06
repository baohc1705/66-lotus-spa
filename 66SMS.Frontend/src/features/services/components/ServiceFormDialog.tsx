import { useAdminProducts } from "@/features/products/hooks/useProducts";
import type { ProductDto } from "@/features/products/types/product.types";
import { ServiceCategoryFormDialog } from "@/features/service_categories/components/ServiceCategoryFormDialog";
import { useServiceCategories } from "@/features/service_categories/hooks/useServiceCategories";
import type { ServiceCategoryDto } from "@/features/service_categories/types/serviceCategory.types";
import {
  useCreateService,
  useServiceDetail,
  useUpdateService,
} from "@/features/services/hooks/useServices";
import { AdminCurrencyInput } from "@/shared/components/forms/AdminCurrencyInput";
import { AdminInput } from "@/shared/components/forms/AdminInput";
import { AdminSelectTrigger } from "@/shared/components/forms/AdminSelectTrigger";
import { AdminTextarea } from "@/shared/components/forms/AdminTextarea";
import { FormField } from "@/shared/components/forms/FormField";
import { FormSection } from "@/shared/components/forms/FormSection";
import { ImageUpload } from "@/shared/components/ImageUpload";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { StatusActive } from "@/shared/constants/status.enum";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { formatCurrency } from "@/shared/utils/currency";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  Box,
  CircleDollarSign,
  FileText,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
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
  getProfitBadgeClass,
  getProfitLabel,
  getProfitTextClass,
  getProfitTone,
  roundVnd,
} from "../utils/servicePricing";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceListDto | null;
  onSuccess?: (service: ServiceListDto) => void;
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

  const { data: productsResult } = useAdminProducts({
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
    if (isEdit) {
      if (formSource) reset(getDefaultValues(formSource));
    } else {
      reset(getDefaultValues(null));
    }
  }, [open, isEdit, formSource, reset]);

  const watchProducts = watch("serviceProducts");
  const watchCostPrice = watch("costPrice") || 0;
  const watchCommissionRate = watch("commissionRate") || 0;
  const watchDesiredProfit = watch("desiredProfitPercent") || 0;
  const watchSellingPrice = watch("sellingPrice") || 0;

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
            </DialogTitle>
          </DialogHeader>

          {isEdit && detailQuery.isLoading ? (
            <div className="flex items-center justify-center py-16 text-adminGray-600 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Đang tải thông tin dịch vụ...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormSection icon={Activity} title="Thông tin cơ bản">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                    <AdminInput
                      value={
                        isEdit ? (formSource?.code ?? service?.code ?? "") : ""
                      }
                      placeholder={isEdit ? "" : "Tự động tạo"}
                      disabled
                      readOnly
                    />
                  </FormField>

                  <FormField label="Tên dịch vụ *" error={errors.name?.message}>
                    <AdminInput
                      {...register("name")}
                      placeholder="Nhập tên dịch vụ"
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
                          onValueChange={(val) =>
                            setValue("categoryId", parseInt(val))
                          }
                        >
                          <AdminSelectTrigger>
                            <SelectValue placeholder="Chọn nhóm dịch vụ" />
                          </AdminSelectTrigger>
                          <SelectContent>
                            {categories.map((c: ServiceCategoryDto) => (
                              <SelectItem
                                key={c.id}
                                value={c.id?.toString() || ""}
                              >
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => setCategoryOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm
                      </Button>
                    </div>
                  </FormField>

                  <FormField
                    label="Thời gian (phút)"
                    error={errors.durationMins?.message}
                  >
                    <Controller
                      name="durationMins"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(val) => field.onChange(parseInt(val))}
                        >
                          <AdminSelectTrigger>
                            <SelectValue placeholder="Chọn thời gian" />
                          </AdminSelectTrigger>
                          <SelectContent>
                            {SERVICE_DURATION_OPTIONS.map((mins) => (
                              <SelectItem key={mins} value={String(mins)}>
                                {mins} phút
                              </SelectItem>
                            ))}
                            {field.value &&
                              !(
                                SERVICE_DURATION_OPTIONS as readonly number[]
                              ).includes(field.value) && (
                                <SelectItem value={String(field.value)}>
                                  {field.value} phút
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Thứ tự hiển thị"
                    error={errors.sortOrder?.message}
                  >
                    <AdminInput
                      {...register("sortOrder", { valueAsNumber: true })}
                      type="number"
                      placeholder="0"
                    />
                  </FormField>

                  <FormField label="Trạng thái" error={errors.status?.message}>
                    <div className="flex items-center h-9">
                      <Switch
                        checked={watch("status") === StatusActive.Active}
                        onCheckedChange={(checked) =>
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
              </FormSection>

              <FormSection icon={Box} title="Sản phẩm tiêu hao">
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
                        className="grid grid-cols-12 gap-3 items-start border p-3 rounded-lg bg-adminGray-50/50"
                      >
                        <div className="col-span-4">
                          <SearchableSelect
                            value={productId?.toString() || ""}
                            onValueChange={(val) => {
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
                            className="h-9"
                          />
                          {errorObj?.productId && (
                            <span className="text-state-danger-text text-xs mt-1 block">
                              {errorObj.productId.message}
                            </span>
                          )}
                        </div>

                        <div className="col-span-2">
                          <AdminInput
                            {...register(
                              `serviceProducts.${index}.quantityUsed`,
                              { valueAsNumber: true },
                            )}
                            type="number"
                            placeholder="SL"
                          />
                          {errorObj?.quantityUsed && (
                            <span className="text-state-danger-text text-xs mt-1 block">
                              {errorObj.quantityUsed.message}
                            </span>
                          )}
                        </div>

                        <div className="col-span-3">
                          <div className="lotus-admin-select-trigger flex items-center justify-end bg-adminGray-100 border border-transparent text-xs text-adminInk font-medium">
                            {formatCurrency(lineTotal > 0 ? lineTotal : 0)}
                          </div>
                        </div>

                        <div className="col-span-2">
                          <AdminInput
                            {...register(`serviceProducts.${index}.note`)}
                            placeholder="Ghi chú"
                          />
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-state-danger-text hover:text-state-danger-text hover:bg-state-danger-bg"
                            onClick={() => removeProduct(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                    onClick={() =>
                      appendProduct({
                        productId: 0,
                        quantityUsed: 1,
                        unitCost: 0,
                        note: "",
                      })
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sản phẩm
                  </Button>
                </div>
              </FormSection>

              <FormSection icon={CircleDollarSign} title="Chi phí & định giá">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-adminGray-600 mb-2">
                      Chi phí
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <FormField
                        label="Giá vốn *"
                        tooltip="Chi phí gốc của dịch vụ (chưa gồm sản phẩm tiêu hao)"
                        error={errors.costPrice?.message}
                      >
                        <Controller
                          name="costPrice"
                          control={control}
                          render={({ field }) => (
                            <AdminCurrencyInput
                              value={field.value}
                              onChange={(v) => field.onChange(v ?? 0)}
                              onBlur={field.onBlur}
                              placeholder="0"
                            />
                          )}
                        />
                      </FormField>

                      <FormField
                        label="Chi phí tiêu hao"
                        tooltip="Tự tính từ sản phẩm tiêu hao phía trên"
                      >
                        <div className="lotus-admin-select-trigger flex items-center bg-adminGray-50 border border-transparent text-sm text-adminInk font-medium">
                          {formatCurrency(productCost)}
                        </div>
                      </FormField>

                      <FormField
                        label="Tổng giá vốn"
                        tooltip="Giá vốn + chi phí tiêu hao"
                      >
                        <div className="lotus-admin-select-trigger flex items-center bg-adminGray-50 border border-transparent text-sm font-semibold text-adminInk">
                          {formatCurrency(totalCost)}
                        </div>
                      </FormField>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-adminGray-600 mb-2">
                      Định giá
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        label="Tỷ lệ hoa hồng (%)"
                        error={errors.commissionRate?.message}
                      >
                        <AdminInput
                          {...register("commissionRate", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          placeholder="0"
                        />
                      </FormField>

                      <FormField
                        label="% lãi mong muốn"
                        tooltip="% lãi trên giá vốn (sau hoa hồng). VD: 100% = lãi bằng giá vốn."
                        error={errors.desiredProfitPercent?.message}
                      >
                        <AdminInput
                          {...register("desiredProfitPercent", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          placeholder="20"
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
                            <AdminCurrencyInput
                              value={field.value}
                              onChange={(v) => field.onChange(v ?? 0)}
                              onBlur={field.onBlur}
                              placeholder="0"
                            />
                          )}
                        />
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-adminGray-600">
                          <span>
                            Gợi ý hòa vốn:{" "}
                            <span className="font-semibold text-adminInk">
                              {formatCurrency(suggestedMinPrice)}
                            </span>
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() =>
                              setValue("minSellingPrice", suggestedMinPrice, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
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
                            <AdminCurrencyInput
                              value={field.value}
                              onChange={(v) => field.onChange(v ?? 0)}
                              onBlur={field.onBlur}
                              placeholder="0"
                            />
                          )}
                        />
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-adminGray-600">
                          <span>
                            Gợi ý lãi {watchDesiredProfit}% trên giá vốn:{" "}
                            <span className="font-semibold text-adminInk">
                              {formatCurrency(suggestedSellPrice)}
                            </span>
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
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
                          <p className="mt-1.5 text-xs text-state-danger-text">
                            Giá bán đang thấp hơn giá tối thiểu gợi ý (
                            {formatCurrency(suggestedMinPrice)}).
                          </p>
                        )}
                      </FormField>
                    </div>
                  </div>

                  <div className="border border-adminGray-100 bg-adminGray-50/60 p-3">
                    <p className="text-xs font-semibold text-adminGray-600 mb-2">
                      Lãi dự kiến
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span>
                        Hoa hồng:{" "}
                        <span className="font-medium text-adminInk">
                          {formatCurrency(commissionAmount)}
                        </span>
                      </span>
                      <span>
                        Lãi gộp:{" "}
                        <span
                          className={`font-semibold ${getProfitTextClass(profitTone)}`}
                        >
                          {formatCurrency(grossProfit)}
                        </span>
                      </span>
                      <span>
                        % lãi / giá vốn:{" "}
                        <span
                          className={`font-semibold ${getProfitTextClass(profitTone)}`}
                        >
                          {markupOnCostPercent != null
                            ? `${markupOnCostPercent}%`
                            : "—"}
                        </span>
                      </span>
                      <span>
                        Biên lãi / giá bán:{" "}
                        <span
                          className={`font-semibold ${getProfitTextClass(profitTone)}`}
                        >
                          {grossMarginPercent != null
                            ? `${grossMarginPercent}%`
                            : "—"}
                        </span>
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${getProfitBadgeClass(profitTone)}`}
                      >
                        {getProfitLabel(profitTone)}
                      </span>
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection icon={FileText} title="Mô tả">
                <div className="grid grid-cols-1 gap-2">
                  <FormField
                    label="Mô tả ngắn"
                    error={errors.description?.message}
                  >
                    <AdminTextarea
                      {...register("description")}
                      placeholder="Mô tả ngắn..."
                    />
                  </FormField>

                  <FormField
                    label="Nội dung chi tiết"
                    error={errors.content?.message}
                  >
                    <AdminTextarea
                      {...register("content")}
                      placeholder="Nội dung chi tiết dịch vụ..."
                      className="min-h-[100px]"
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
                  disabled={isPending || isUploading}
                >
                  {COMMON_MSG.cancel}
                </Button>
                <Button
                  type="submit"
                  variant="admin"
                  size="sm"
                  loading={isPending || isUploading}
                >
                  {isEdit ? "Cập nhật" : "Tạo dịch vụ"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ServiceCategoryFormDialog
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
