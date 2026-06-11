import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import {
  useCreateService,
  useUpdateService,
} from "@/features/services/hooks/useServices";
import type { ServiceDTO } from "../types/service.types";
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
  Link as LinkIcon,
  Image as ImageIcon,
  Box,
} from "lucide-react";
import { FormField } from "@/shared/components/forms/FormField";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useServiceCategories } from "@/features/service_categories/hooks/useServiceCategories";
import { useProducts } from "@/features/products/hooks/useProducts";
import { ServiceCategoryFormDialog } from "@/features/service_categories/components/ServiceCategoryFormDialog";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceDTO | null;
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
}: ServiceFormDialogProps) {
  const isEdit = !!service;
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [categoryOpen, setCategoryOpen] = useState(false);

  // Fetch lookups
  const { data: categoriesData } = useServiceCategories({
    pageIndex: 1,
    pageSize: 500,
  });
  const categories = useMemo(
    () => categoriesData?.data?.items ?? [],
    [categoriesData],
  );

  const { data: productsData } = useProducts({ pageIndex: 1, pageSize: 500 });
  const products = useMemo(
    () => productsData?.data?.items ?? [],
    [productsData],
  );

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(
      isEdit ? updateServiceSchema : createServiceSchema,
    ) as Resolver<ServiceFormValues>,
    defaultValues: getDefaultValues(service),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "images",
  });

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: "serviceProducts",
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(service));
    }
  }, [open, service, reset]);

  // Handle dynamic pricing calculation
  const watchProducts = watch("serviceProducts");
  const watchCostPrice = watch("costPrice");

  useEffect(() => {
    let productsCost = 0;
    if (watchProducts) {
      watchProducts.forEach((vp) => {
        if (vp.productId && vp.quantityUsed) {
          const product = products.find((p) => p.id === vp.productId);
          if (product?.costPrice) {
            productsCost += product.costPrice * vp.quantityUsed;
          }
        }
      });
    }
    const base = watchCostPrice || 0;
    setValue("sellingPrice", base + productsCost);
  }, [watchProducts, watchCostPrice, products, setValue]);

  const onSubmit = (data: ServiceFormValues) => {
    // Map to payload
    const payload = {
      ...data,
      images: data.images?.map((img) => ({
        url: img.url,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
      })),
      serviceProducts: data.serviceProducts?.map((sp) => ({
        productId: sp.productId,
        quantityUsed: sp.quantityUsed,
        note: sp.note,
      })),
    };

    if (isEdit && service?.id) {
      updateMutation.mutate(
        {
          id: service.id,
          payload: payload as UpdateServicePayload,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
    } else {
      createMutation.mutate(payload as CreateServicePayload, {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormField
                  label="Mã dịch vụ"
                  tooltip="Để trống hệ thống sẽ tự sinh"
                  error={errors.code?.message}
                >
                  <Input
                    {...register("code")}
                    placeholder="Ví dụ: DV001"
                    className="h-9"
                  />
                </FormField>

                <FormField label="Tên dịch vụ *" error={errors.name?.message}>
                  <Input
                    {...register("name")}
                    placeholder="Nhập tên dịch vụ"
                    className="h-9"
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
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Chọn nhóm dịch vụ" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
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
                      className="h-9 px-3 shrink-0"
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
                  <Input
                    {...register("durationMins", { valueAsNumber: true })}
                    type="number"
                    placeholder="60"
                    className="h-9"
                  />
                </FormField>

                <FormField
                  label="Giá cơ bản *"
                  tooltip="Giá cơ bản của dịch vụ (Chưa bao gồm sản phẩm đi kèm)"
                  error={errors.costPrice?.message}
                >
                  <Input
                    {...register("costPrice", { valueAsNumber: true })}
                    type="number"
                    placeholder="0"
                    className="h-9"
                  />
                </FormField>

                <FormField
                  label="Giá bán"
                  tooltip="Giá bán = Giá cơ bản + Chi phí sản phẩm"
                  error={errors.sellingPrice?.message}
                >
                  <Input
                    {...register("sellingPrice", { valueAsNumber: true })}
                    type="number"
                    disabled
                    className="h-9 bg-stone-50"
                  />
                </FormField>

                <FormField
                  label="Tỷ lệ hoa hồng (%)"
                  error={errors.commissionRate?.message}
                >
                  <Input
                    {...register("commissionRate", { valueAsNumber: true })}
                    type="number"
                    placeholder="0"
                    className="h-9"
                  />
                </FormField>

                <FormField
                  label="Thứ tự hiển thị"
                  error={errors.sortOrder?.message}
                >
                  <Input
                    {...register("sortOrder", { valueAsNumber: true })}
                    type="number"
                    placeholder="0"
                    className="h-9"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField
                    label="Mô tả ngắn"
                    error={errors.description?.message}
                  >
                    <Textarea
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
                    <Textarea
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
                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-3 items-start border p-3 rounded-lg bg-stone-50/50"
                    >
                      <div className="col-span-5">
                        <Select
                          value={
                            watch(
                              `serviceProducts.${index}.productId`,
                            )?.toString() || ""
                          }
                          onValueChange={(val) => {
                            setValue(
                              `serviceProducts.${index}.productId`,
                              parseInt(val),
                            );
                            const prod = products.find(
                              (p) => p.id === parseInt(val),
                            );
                            if (prod)
                              setValue(
                                `serviceProducts.${index}.costPrice`,
                                prod.costPrice,
                              );
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Chọn sản phẩm" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem
                                key={p.id}
                                value={p.id?.toString() || ""}
                              >
                                {p.name} - {p.costPrice?.toLocaleString() || 0}đ
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errorObj?.productId && (
                          <span className="text-red-500 text-xs mt-1 block">
                            {errorObj.productId.message}
                          </span>
                        )}
                      </div>

                      <div className="col-span-3">
                        <Input
                          {...register(
                            `serviceProducts.${index}.quantityUsed`,
                            { valueAsNumber: true },
                          )}
                          type="number"
                          placeholder="SL"
                          className="h-9"
                        />
                        {errorObj?.quantityUsed && (
                          <span className="text-red-500 text-xs mt-1 block">
                            {errorObj.quantityUsed.message}
                          </span>
                        )}
                      </div>

                      <div className="col-span-3">
                        <Input
                          {...register(`serviceProducts.${index}.note`)}
                          placeholder="Ghi chú"
                          className="h-9"
                        />
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
              <div className="space-y-4">
                {imageFields.map((field, index) => {
                  const isPrimary = watch(`images.${index}.isPrimary`);
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
                              <span className="text-red-500 text-xs mt-1 block">
                                {errorObj.url.message}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 pl-7">
                          <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                            <input
                              type="radio"
                              name="primaryImage"
                              checked={isPrimary}
                              onChange={() => {
                                // Reset all others
                                const currentImages =
                                  form.getValues("images") || [];
                                currentImages.forEach((_, i) =>
                                  setValue(`images.${i}.isPrimary`, false),
                                );
                                setValue(`images.${index}.isPrimary`, true);
                              }}
                              className="accent-lotus-leaf"
                            />
                            Ảnh chính
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-stone-600">
                              Thứ tự:
                            </span>
                            <Input
                              {...register(`images.${index}.sortOrder`, {
                                valueAsNumber: true,
                              })}
                              type="number"
                              className="h-7 w-20 px-2"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-1"
                        onClick={() => removeImage(index)}
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
                      sortOrder: 0,
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm link ảnh
                </Button>
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

      {/* Nested Category Dialog */}
      <ServiceCategoryFormDialog
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        onSuccess={(cat) => {
          if (cat.id) {
            setValue("categoryId", cat.id);
          }
        }}
      />
    </>
  );
}

function getDefaultValues(service?: ServiceDTO | null): ServiceFormValues {
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
        service.images?.map((i) => ({
          url: i.url || "",
          sortOrder: i.sortOrder || 0,
          isPrimary: i.isPrimary || false,
        })) ?? [],
      serviceProducts:
        service.serviceProducts?.map((sp) => ({
          productId: sp.productId ?? 0,
          quantityUsed: sp.quantityUsed ?? 1,
          note: sp.note ?? "",
          costPrice: 0, // Will be populated on select/load if needed
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
