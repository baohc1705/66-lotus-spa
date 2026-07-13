import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import {
  useCreateService,
  useUpdateService,
} from "@/features/services/hooks/useServices";
import type { ServiceDto, ServiceImageResponse, ServiceProductResponse } from "../types/service.types";
import type { ServiceCategoryDto } from "@/features/service_categories/types/serviceCategory.types";
import type { ProductDto } from "@/features/products/types/product.types";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import {
  createServiceSchema,
  updateServiceSchema,
  type CreateServicePayload,
  type ServiceFormValues,
  type UpdateServicePayload,
} from "../schemas/service.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { FormSection } from "@/shared/components/forms/FormSection";
import {
  Activity,
  Plus,
  Trash2,
  Image as ImageIcon,
  Box,
  Camera,
  Star,
  X,
} from "lucide-react";
import { FormField } from "@/shared/components/forms/FormField";
import { AdminInput } from "@/shared/components/forms/AdminInput";
import { AdminTextarea } from "@/shared/components/forms/AdminTextarea";
import { AdminSelectTrigger } from "@/shared/components/forms/AdminSelectTrigger";
import { formatCurrency } from "@/shared/utils/currency";
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { useServiceCategories } from "@/features/service_categories/hooks/useServiceCategories";
import { useAdminProducts } from "@/features/products/hooks/useProducts";
import { ServiceCategoryFormDialog } from "@/features/service_categories/components/ServiceCategoryFormDialog";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceDto | null;
  onSuccess?: (service: ServiceDto) => void;
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  onSuccess,
}: ServiceFormDialogProps) {
  const isEdit = !!service;
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>({});
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Fetch lookups
  const { data: categoriesResult } = useServiceCategories({ pageIndex: 1, pageSize: 100 });
  const categories = useMemo(() => categoriesResult?.data?.items ?? [], [categoriesResult]);

  const { data: productsResult } = useAdminProducts({ pageIndex: 1, pageSize: 1000 });
  const products = useMemo(() => productsResult?.data?.items ?? [], [productsResult]);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(
      isEdit ? updateServiceSchema : createServiceSchema,
    ) as Resolver<ServiceFormValues>,
    defaultValues: getDefaultValues(service),
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
      setImagePreviews({});
      reset(getDefaultValues(service));
    }
  }, [open, service, reset]);

  // Recalculate selling price from cost price + sum of product cost
  const watchProducts = watch("serviceProducts");
  const watchCostPrice = watch("costPrice");
  const serializedProducts = JSON.stringify(watchProducts);

  useEffect(() => {
    let productsCost = 0;
    if (watchProducts && watchProducts.length > 0) {
      for (const p of watchProducts) {
        const prod = products.find((prodItem) => prodItem.id === p.productId);
        if (prod && prod.costPrice) {
          productsCost += prod.costPrice * (p.quantityUsed || 0);
        }
      }
    }
    const base = watchCostPrice || 0;
    setValue("sellingPrice", base + productsCost, { shouldValidate: true, shouldDirty: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedProducts, watchCostPrice, products, setValue]);

  const onSubmit = (data: ServiceFormValues) => {
    if (isEdit && service?.id) {
      updateMutation.mutate(
        {
          id: service.id,
          payload: data as UpdateServicePayload,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) {
              onOpenChange(false);
              onSuccess?.({ ...service, ...data } as ServiceDto);
            }
          },
        },
      );
    } else {
      createMutation.mutate(data as CreateServicePayload, {
        onSuccess: (result) => {
          if (result.isSuccess) {
            onOpenChange(false);
            onSuccess?.({ ...data } as ServiceDto);
          }
        },
      });
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
            <DialogDescription>
              {isEdit
                ? `Cập nhật thông tin dịch vụ ${service?.name ?? ""}`
                : "Điền thông tin để tạo dịch vụ"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormSection icon={Activity} title="Thông tin cơ bản">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <FormField
                  label="Mã dịch vụ"
                  tooltip="Để trống hệ thống sẽ tự sinh"
                  error={errors.code?.message}
                >
                  <AdminInput
                    {...register("code")}
                    placeholder="Ví dụ: DV001"
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
                  <AdminInput
                    {...register("durationMins", { valueAsNumber: true })}
                    type="number"
                    placeholder="60"
                  />
                </FormField>

                <FormField
                  label="Giá vốn *"
                  tooltip="Giá vốn của dịch vụ (Chưa bao gồm sản phẩm đi kèm)"
                  error={errors.costPrice?.message}
                >
                  <AdminInput
                    {...register("costPrice", { valueAsNumber: true })}
                    type="number"
                    placeholder="0"
                  />
                </FormField>

                <FormField
                  label="Giá bán"
                  tooltip="Giá bán = Giá vốn + Chi phí sản phẩm tiêu hao"
                  error={errors.sellingPrice?.message}
                >
                  <AdminInput
                    {...register("sellingPrice", { valueAsNumber: true })}
                    type="number"
                    disabled
                    className="bg-adminGray-50"
                  />
                </FormField>

                <FormField
                  label="Tỷ lệ hoa hồng (%)"
                  error={errors.commissionRate?.message}
                >
                  <AdminInput
                    {...register("commissionRate", { valueAsNumber: true })}
                    type="number"
                    placeholder="0"
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

                <div className="md:col-span-2">
                  <FormField
                    label="Mô tả ngắn"
                    error={errors.description?.message}
                  >
                    <AdminTextarea
                      {...register("description")}
                      placeholder="Mô tả ngắn..."
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
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

                <FormField label="Trạng thái" error={errors.status?.message}>
                  <div className="flex items-center h-9">
                    <Switch
                      checked={watch("status") === 1}
                      onCheckedChange={(checked) =>
                        setValue("status", checked ? 1 : 0)
                      }
                    />
                  </div>
                </FormField>
              </div>
            </FormSection>

            <FormSection icon={Box} title="Sản phẩm đi kèm">
              <div className="space-y-4">
                {productFields.map((field, index) => {
                  const errorObj = errors.serviceProducts?.[index];
                  const productId = watch(`serviceProducts.${index}.productId`);
                  const quantity = watch(`serviceProducts.${index}.quantityUsed`) || 0;
                  const selectedProduct = products.find((p: ProductDto) => p.id === productId);
                  const costPrice = selectedProduct?.costPrice || 0;
                  const total = costPrice * quantity;

                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-3 items-start border p-3 rounded-lg bg-adminGray-50/50"
                    >
                      <div className="col-span-4">
                        <Select
                          value={productId?.toString() || ""}
                          onValueChange={(val) => {
                            setValue(
                              `serviceProducts.${index}.productId`,
                              parseInt(val),
                            );
                          }}
                        >
                          <AdminSelectTrigger>
                            <SelectValue placeholder="Chọn sản phẩm" />
                          </AdminSelectTrigger>
                          <SelectContent>
                            {products.map((p: ProductDto) => (
                              <SelectItem
                                key={p.id}
                                value={p.id?.toString() || ""}
                              >
                                {p.name} - {formatCurrency(p.costPrice)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                           {formatCurrency(total > 0 ? total : 0)}
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
                    appendProduct({ productId: 0, quantityUsed: 1, note: "" })
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm
                </Button>
              </div>
            </FormSection>

            <FormSection icon={ImageIcon} title="Hình ảnh dịch vụ">
              <div className="flex flex-wrap gap-3">
                {imageFields.map((field, index) => {
                  const isPrimary = watch(`images.${index}.isPrimary`);
                  const preview = imagePreviews[index] || watch(`images.${index}.url`);
                  return (
                    <div key={field.id} className="flex flex-col gap-1.5 w-[110px]">
                      <div className="relative group/card">
                        <button
                          type="button"
                          onClick={() => document.getElementById(`service-img-${index}`)?.click()}
                          className={[
                            'h-[88px] w-full rounded-lg overflow-hidden transition-all',
                            preview
                              ? 'border border-adminGray-100 hover:border-adminGreen-600/60'
                              : 'border-2 border-dashed border-adminGray-300 bg-adminGray-50 hover:border-adminGreen-600 hover:bg-adminGreen-50',
                          ].join(' ')}
                        >
                          {preview ? (
                            <>
                              <img src={preview} alt="" className="h-full w-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity rounded-lg">
                                <Camera className="h-5 w-5 text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-adminGray-400 group-hover/card:text-adminGreen-600 transition-colors">
                              <ImageIcon className="h-6 w-6" />
                              <span className="text-2xs font-medium">Chọn ảnh</span>
                            </div>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1.5 -right-1.5 z-10 h-5 w-5 rounded-full bg-state-danger-solid text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-state-danger-solid shadow-sm"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {isPrimary && (
                          <div className="absolute bottom-1.5 left-1.5 bg-adminGreen-600 text-white text-2xs font-bold px-1.5 py-0.5 rounded-full leading-none pointer-events-none">
                            Chính
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        id={`service-img-${index}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setImagePreviews((prev: Record<number, string>) => ({ ...prev, [index]: URL.createObjectURL(file) }))
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const imgs = form.getValues('images') || [];
                          imgs.forEach((_, i) => { if (i !== index) setValue(`images.${i}.isPrimary`, false); });
                          setValue(`images.${index}.isPrimary`, !isPrimary);
                        }}
                        className={[
                          'flex items-center gap-1 text-xs font-medium transition-colors self-start',
                          isPrimary ? 'text-adminGreen-600' : 'text-adminGray-400 hover:text-adminGray-600',
                        ].join(' ')}
                      >
                        <Star className={`h-3 w-3 ${isPrimary ? 'fill-lotus-leaf' : ''}`} />
                        {isPrimary ? 'Ảnh chính' : 'Đặt chính'}
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => appendImage({ url: '', isPrimary: imageFields.length === 0, sortOrder: 0 })}
                  className="flex h-[88px] w-[110px] flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-adminGray-300 text-adminGray-400 transition-all hover:border-adminGreen-600 hover:bg-adminGreen-50 hover:text-adminGreen-600 self-start"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-2xs font-medium">Thêm ảnh</span>
                </button>
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
                loading={isPending}
              >
                {isEdit ? "Cập nhật" : "Tạo dịch vụ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ServiceCategoryFormDialog
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        onSuccess={(cat: ServiceCategoryDto) => {
          setValue("categoryId", cat.id!);
        }}
      />
    </>
  );
}

function getDefaultValues(service?: ServiceDto | null): ServiceFormValues {
  if (service) {
    return {
      categoryId: service.categoryId ?? 0,
      code: service.code ?? "",
      name: service.name ?? "",
      description: service.description ?? "",
      content: service.content ?? "",
      durationMins: service.durationMins ?? 0,
      costPrice: service.costPrice ?? 0,
      sellingPrice: service.sellingPrice ?? 0,
      commissionRate: service.commissionRate ?? 0,
      sortOrder: service.sortOrder ?? 0,
      status: service.status ?? 0,
      images:
        service.images?.map((i: ServiceImageResponse) => ({
          id: i.id,
          url: i.url || "",
          sortOrder: i.sortOrder || 0,
          isPrimary: i.isPrimary || false,
        })) ?? [],
      serviceProducts:
        service.serviceProducts?.map((sp: ServiceProductResponse) => ({
          id: sp.id,
          productId: sp.productId ?? 0,
          quantityUsed: sp.quantityUsed ?? 1,
          note: sp.note ?? "",
          costPrice: 0,
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
    sellingPrice: 0,
    commissionRate: 0,
    sortOrder: 0,
    status: 1,
    images: [],
    serviceProducts: [],
  };
}
