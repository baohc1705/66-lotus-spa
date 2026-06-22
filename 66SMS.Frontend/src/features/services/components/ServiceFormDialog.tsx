import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import {
  useCreateService,
  useUpdateService,
} from "@/features/services/hooks/useServices";
import { serviceProductApi, serviceImageApi } from "@/features/services/api/service.api";
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
  Image as ImageIcon,
  Box,
  Camera,
  Star,
  X,
} from "lucide-react";
import { uploadApi } from "@/shared/api/upload.api";
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
  const [pendingFiles, setPendingFiles] = useState<Record<number, File>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>({});
  const [isUploading, setIsUploading] = useState(false);
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
      setPendingFiles({});
      setImagePreviews({});
      reset(getDefaultValues(service));
    }
  }, [open, service, reset]);

  // Handle dynamic pricing calculation
  const watchProducts = watch("serviceProducts");
  const watchCostPrice = watch("costPrice");
  const serializedProducts = JSON.stringify(watchProducts);

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
    setValue("sellingPrice", base + productsCost, { shouldValidate: true, shouldDirty: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedProducts, watchCostPrice, products, setValue]);

  const onSubmit = async (data: ServiceFormValues) => {
    setIsUploading(true);
    try {
      const images = await Promise.all(
        (data.images || []).map(async (img, index) => {
          const file = pendingFiles[index];
          if (file) {
            const result = await uploadApi.uploadImage(file, 'service');
            return { id: img.id, url: (result.isSuccess && result.data) ? result.data : '', sortOrder: img.sortOrder, isPrimary: img.isPrimary };
          }
          return { id: img.id, url: img.url, sortOrder: img.sortOrder, isPrimary: img.isPrimary };
        })
      );
      
      if (isEdit && service?.id) {
        // Sync Service Products
        const existingProducts = service.serviceProducts || [];
        const formProducts = data.serviceProducts || [];
        
        // Delete
        const toDeleteProducts = existingProducts.filter(ep => !formProducts.some(fp => fp.id === ep.id));
        for (const p of toDeleteProducts) {
          if (p.id) await serviceProductApi.delete(p.id);
        }
        
        // Create / Update
        for (const fp of formProducts) {
          if (fp.id) {
            await serviceProductApi.update(fp.id, {
              serviceId: service.id,
              productId: fp.productId,
              quantityUsed: fp.quantityUsed,
              note: fp.note,
            });
          } else {
            await serviceProductApi.create({
              serviceId: service.id,
              productId: fp.productId,
              quantityUsed: fp.quantityUsed,
              note: fp.note,
            });
          }
        }

        // Sync Service Images
        const existingImages = service.images || [];
        const formImages = images;

        // Delete
        const toDeleteImages = existingImages.filter(ei => !formImages.some(fi => fi.id === ei.id));
        for (const img of toDeleteImages) {
          if (img.id) await serviceImageApi.delete(img.id);
        }

        // Create / Update
        for (const fi of formImages) {
          if (fi.id) {
            await serviceImageApi.update(fi.id, {
              serviceId: service.id,
              url: fi.url,
              sortOrder: fi.sortOrder,
              isPrimary: fi.isPrimary,
            });
          } else {
            if (fi.url) {
              await serviceImageApi.create({
                serviceId: service.id,
                url: fi.url,
                sortOrder: fi.sortOrder || 0,
                isPrimary: fi.isPrimary || false,
              });
            }
          }
        }

        const payload = {
          ...data,
          // Remove images and serviceProducts from payload because UpdateServiceCommand doesn't take them
        };

        updateMutation.mutate(
          { id: service.id, payload: payload as UpdateServicePayload },
          { onSuccess: (result) => { if (result.isSuccess) onOpenChange(false); } },
        );
      } else {
        const payload = {
          ...data,
          serviceImages: images.map(img => ({
            url: img.url,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary
          })),
          serviceProducts: data.serviceProducts?.map((sp) => ({
            productId: sp.productId,
            quantityUsed: sp.quantityUsed,
            note: sp.note,
          })),
        };
        createMutation.mutate(payload as CreateServicePayload, {
          onSuccess: (result) => { if (result.isSuccess) onOpenChange(false); },
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
                  label="Giá vốn *"
                  tooltip="Giá vốn của dịch vụ (Chưa bao gồm sản phẩm đi kèm)"
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
                  tooltip="Giá bán = Giá vốn + Chi phí sản phẩm tiêu hao"
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
                  const productId = watch(`serviceProducts.${index}.productId`);
                  const quantity = watch(`serviceProducts.${index}.quantityUsed`) || 0;
                  const selectedProduct = products.find((p) => p.id === productId);
                  const costPrice = selectedProduct?.costPrice || 0;
                  const total = costPrice * quantity;

                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-3 items-start border p-3 rounded-lg bg-stone-50/50"
                    >
                      <div className="col-span-4">
                        <Select
                          value={productId?.toString() || ""}
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
                                prod.costPrice ?? undefined,
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

                      <div className="col-span-2">
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
                         <div className="h-9 flex items-center justify-end px-3 bg-stone-100 rounded-md border border-transparent text-[13px] text-stone-700 font-medium">
                           {total > 0 ? `${total.toLocaleString()} đ` : '0 đ'}
                         </div>
                      </div>

                      <div className="col-span-2">
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
              <div className="flex flex-wrap gap-3">
                {imageFields.map((field, index) => {
                  const isPrimary = watch(`images.${index}.isPrimary`);
                  const preview = imagePreviews[index] || watch(`images.${index}.url`);
                  //const errorObj = errors.images?.[index];
                  return (
                    <div key={field.id} className="flex flex-col gap-1.5 w-[110px]">
                      {/* Image zone */}
                      <div className="relative group/card">
                        <button
                          type="button"
                          onClick={() => document.getElementById(`service-img-${index}`)?.click()}
                          className={[
                            'h-[88px] w-full rounded-lg overflow-hidden transition-all',
                            preview
                              ? 'border border-stone-200 hover:border-lotus-leaf/60'
                              : 'border-2 border-dashed border-stone-300 bg-stone-50 hover:border-lotus-leaf hover:bg-lotus-leaf/5',
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
                            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-stone-400 group-hover/card:text-lotus-leaf transition-colors">
                              <ImageIcon className="h-6 w-6" />
                              <span className="text-[10px] font-medium">Chọn ảnh</span>
                            </div>
                          )}
                        </button>
                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1.5 -right-1.5 z-10 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {/* Primary badge */}
                        {isPrimary && (
                          <div className="absolute bottom-1.5 left-1.5 bg-lotus-leaf text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none pointer-events-none">
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
                          setPendingFiles((prev: Record<number, File>) => ({ ...prev, [index]: file }))
                          setImagePreviews((prev: Record<number, string>) => ({ ...prev, [index]: URL.createObjectURL(file) }))
                        }}
                      />
                      {/* isPrimary star */}
                      <button
                        type="button"
                        onClick={() => {
                          const imgs = form.getValues('images') || [];
                          imgs.forEach((_, i) => { if (i !== index) setValue(`images.${i}.isPrimary`, false); });
                          setValue(`images.${index}.isPrimary`, !isPrimary);
                        }}
                        className={[
                          'flex items-center gap-1 text-[11px] font-medium transition-colors self-start',
                          isPrimary ? 'text-lotus-leaf' : 'text-stone-400 hover:text-stone-600',
                        ].join(' ')}
                      >
                        <Star className={`h-3 w-3 ${isPrimary ? 'fill-lotus-leaf' : ''}`} />
                        {isPrimary ? 'Ảnh chính' : 'Đặt chính'}
                      </button>
                    </div>
                  );
                })}

                {/* Add card */}
                <button
                  type="button"
                  onClick={() => appendImage({ url: '', isPrimary: imageFields.length === 0, sortOrder: 0 })}
                  className="flex h-[88px] w-[110px] flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-stone-300 text-stone-400 transition-all hover:border-lotus-leaf hover:bg-lotus-leaf/5 hover:text-lotus-leaf self-start"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Thêm ảnh</span>
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
                Hủy
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
          id: i.id,
          url: i.url || "",
          sortOrder: i.sortOrder || 0,
          isPrimary: i.isPrimary || false,
        })) ?? [],
      serviceProducts:
        service.serviceProducts?.map((sp) => ({
          id: sp.id,
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
