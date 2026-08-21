import { useMemo, useState } from "react";
import { Plus, ShoppingCart, Trash2, User, Wallet } from "lucide-react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCustomers } from "@/features/customers/hooks/useCustomers";
import type { ProductDto } from "@/features/products/types/product.types";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useTreatmentCourses } from "@/features/treatment_courses/hooks/useTreatmentCourses";
import type { TreatmentCourseDto } from "@/features/treatment_courses/types/treatmentCourse.types";
import type { ServiceDto } from "@/features/services/types/service.types";
import { useServices } from "@/features/services/hooks/useServices";
import { useStaffs } from "@/features/staffs/hooks/useStaffs";
import { useSalons } from "@/features/salons/hooks/useSalons";
import { useAuthStore } from "@/features/auth/stores/authStore";

import { useCreateInvoice } from "@/features/invoices/hooks/useInvoices";
import {
  INVOICE_ITEM_TYPE,
  PAYMENT_METHOD,
  POINT_VALUE_VND,
  type CreateInvoiceItemRequest,
  type CreateInvoiceRequest,
} from "@/features/invoices/types/invoice.types";
import { Modal } from "@/shared/components/Modal";
import { Tabs } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { formatCurrency } from "@/shared/utils/currency";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const itemSchema = z.object({
  itemType: z.coerce.number().min(1, "Vui lòng chọn loại").max(3),
  refId: z.coerce.number().min(1, "Vui lòng chọn mặt hàng"),
  quantity: z.coerce.number().min(1, "Phải lớn hơn hoặc bằng 1"),
  discountAmount: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  staffId: z.coerce.number().optional(),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
});

const invoiceSchema = z.object({
  customerId: z.coerce.number().optional(),
  customerName: z
    .string()
    .max(200, "Tối đa 200 ký tự")
    .optional()
    .or(z.literal("")),
  customerPhone: z
    .string()
    .max(20, "Tối đa 20 ký tự")
    .optional()
    .or(z.literal("")),
  salonId: z.coerce.number().optional(),
  discountAmount: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  applyMembershipDiscount: z.boolean().optional(),
  loyaltyPointsUsed: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  taxAmount: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  paymentMethod: z
    .number()
    .min(1, "Vui lòng chọn phương thức thanh toán")
    .max(4),
  paidAmount: z.coerce.number().min(0, "Phải lớn hơn hoặc bằng 0").optional(),
  transactionId: z
    .string()
    .max(100, "Tối đa 100 ký tự")
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .max(500, "Tối đa 500 ký tự")
    .optional()
    .or(z.literal("")),
  items: z.array(itemSchema).min(1, "Hóa đơn cần ít nhất 1 mặt hàng"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const ITEM_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: String(INVOICE_ITEM_TYPE.SERVICE), label: "Dịch vụ" },
  { value: String(INVOICE_ITEM_TYPE.PRODUCT), label: "Sản phẩm" },
  { value: String(INVOICE_ITEM_TYPE.TREATMENT_COURSE), label: "Liệu trình" },
];

const PAYMENT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: String(PAYMENT_METHOD.CASH), label: "Tiền mặt" },
  { value: String(PAYMENT_METHOD.BANK_TRANSFER), label: "Chuyển khoản" },
  { value: String(PAYMENT_METHOD.WALLET), label: "Ví" },
  { value: String(PAYMENT_METHOD.VNPAY), label: "VNPay" },
];

const MEMBERSHIP_DISCOUNT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "1", label: "Có" },
  { value: "0", label: "Không" },
];

export function InvoiceForm({ open, onOpenChange }: Props) {
  const createMutation = useCreateInvoice();
  const isPending = createMutation.isPending;

  const effectiveSalonId = useAuthStore((s) => s.getEffectiveSalonId());

  const { data: salonsResult } = useSalons({ pageIndex: 1, pageSize: 100 });

  const { data: customersResult } = useCustomers({ pageIndex: 1, pageSize: 200 });

  const { data: servicesResult } = useServices({ pageIndex: 1, pageSize: 200 });
  const services: ServiceDto[] = servicesResult?.data?.items ?? [];

  const { data: productsResult } = useProducts({ pageIndex: 1, pageSize: 200 });
  const products: ProductDto[] = productsResult?.data?.items ?? [];

  const { data: coursesResult } = useTreatmentCourses({
    pageIndex: 1,
    pageSize: 200,
  });
  const courses: TreatmentCourseDto[] = coursesResult?.data?.items ?? [];

  const { data: staffsResult } = useStaffs({ pageIndex: 1, pageSize: 200 });

  const formKey = !open
    ? "closed"
    : effectiveSalonId != null
      ? `new-${effectiveSalonId}`
      : "new-loading";

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormData>,
    defaultValues: getDefaultValues(effectiveSalonId ?? undefined),
  });

  const [appliedFormKey, setAppliedFormKey] = useState(formKey);
  const [activeTab, setActiveTab] = useState<"customer" | "items" | "payment">(
    "customer",
  );

  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      setActiveTab("customer");
      form.reset(getDefaultValues(effectiveSalonId ?? undefined));
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const getUnitPrice = (itemType: number, refId: number): number => {
    if (!refId) return 0;

    if (itemType === INVOICE_ITEM_TYPE.SERVICE) {
      return services.find((s) => s.id === refId)?.sellingPrice ?? 0;
    }
    if (itemType === INVOICE_ITEM_TYPE.PRODUCT) {
      return products.find((p) => p.id === refId)?.sellingPrice ?? 0;
    }
    if (itemType === INVOICE_ITEM_TYPE.TREATMENT_COURSE) {
      return courses.find((c) => c.id === refId)?.sellingPrice ?? 0;
    }

    return 0;
  };

  const watchedItems = watch("items");
  let subTotal = 0;
  for (let index = 0; index < (watchedItems ?? []).length; index++) {
    const item = watchedItems[index];
    const unit = getUnitPrice(Number(item.itemType), Number(item.refId));
    const line =
      unit * Number(item.quantity || 0) -
      Number(item.discountAmount || 0);
    subTotal = subTotal + Math.max(line, 0);
  }

  const manualDiscount = Number(watch("discountAmount") || 0);
  const pointsValue = Number(watch("loyaltyPointsUsed") || 0) * POINT_VALUE_VND;
  const tax = Number(watch("taxAmount") || 0);
  const totalPreview = Math.max(subTotal - manualDiscount - pointsValue + tax, 0);

  const customerOptions = useMemo(() => {
    const customers = customersResult?.data?.items ?? [];
    const items: Array<{ value: string; label: string }> = [];
    for (let index = 0; index < customers.length; index++) {
      const customer = customers[index];
      items.push({
        value: String(customer.id ?? ""),
        label: `${customer.fullName ?? ""} — ${customer.phone ?? ""}`,
      });
    }
    return items;
  }, [customersResult?.data?.items]);

  const salonOptions = useMemo(() => {
    const salons = salonsResult?.data?.items ?? [];
    const items: Array<{ value: string; label: string }> = [];
    for (let index = 0; index < salons.length; index++) {
      const salon = salons[index];
      items.push({
        value: String(salon.id ?? ""),
        label: `${salon.name ?? ""} — ${salon.code ?? ""}`,
      });
    }
    return items;
  }, [salonsResult?.data?.items]);

  const staffOptions = useMemo(() => {
    const staffs = staffsResult?.data?.items ?? [];
    const items: Array<{ value: string; label: string }> = [];
    for (let index = 0; index < staffs.length; index++) {
      const staff = staffs[index];
      items.push({
        value: String(staff.id ?? ""),
        label: staff.fullName ?? "",
      });
    }
    return items;
  }, [staffsResult?.data?.items]);

  const getOptionsForType = (itemType: number) => {
    const items: Array<{ value: string; label: string }> = [];

    if (itemType === INVOICE_ITEM_TYPE.SERVICE) {
      for (let index = 0; index < services.length; index++) {
        const service = services[index];
        items.push({
          value: String(service.id ?? ""),
          label: `${service.name ?? ""} — ${formatCurrency(service.sellingPrice ?? 0)}`,
        });
      }
      return items;
    }

    if (itemType === INVOICE_ITEM_TYPE.PRODUCT) {
      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        items.push({
          value: String(product.id ?? ""),
          label: `${product.name ?? ""} — ${formatCurrency(product.sellingPrice ?? 0)}`,
        });
      }
      return items;
    }

    if (itemType === INVOICE_ITEM_TYPE.TREATMENT_COURSE) {
      for (let index = 0; index < courses.length; index++) {
        const course = courses[index];
        items.push({
          value: String(course.id ?? ""),
          label: `${course.name ?? ""} — ${formatCurrency(course.sellingPrice ?? 0)}`,
        });
      }
      return items;
    }

    return items;
  };

  const onSubmit = (data: InvoiceFormData) => {
    const items: CreateInvoiceItemRequest[] = [];
    for (let index = 0; index < data.items.length; index++) {
      const item = data.items[index];
      items.push({
        itemType: item.itemType,
        refId: item.refId,
        quantity: item.quantity,
        discountAmount: item.discountAmount || 0,
        staffId: item.staffId || undefined,
        note: item.note || undefined,
      });
    }

    const payload: CreateInvoiceRequest = {
      customerId: data.customerId || undefined,
      customerName: data.customerName || undefined,
      customerPhone: data.customerPhone || undefined,
      salonId: data.salonId || undefined,
      discountAmount: data.discountAmount || 0,
      applyMembershipDiscount: data.applyMembershipDiscount ?? true,
      loyaltyPointsUsed: data.loyaltyPointsUsed || 0,
      taxAmount: data.taxAmount || 0,
      paymentMethod: data.paymentMethod,
      paidAmount: data.paidAmount || 0,
      transactionId: data.transactionId || undefined,
      note: data.note || undefined,
      items,
    };

    createMutation.mutate(payload, {
      onSuccess: (result) => {
        if (result.isSuccess !== true) return;
        onOpenChange(false);
      },
    });
  };

  const saving = isPending;

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Lập hóa đơn"
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
            form="invoice-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={saving}
          >
            Lập hóa đơn
          </Button>
        </>
      }
    >
      <form
        id="invoice-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Tabs
          variant="body"
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as "customer" | "items" | "payment")}
          tabs={[
            {
              id: "customer",
              label: "Khách hàng",
              content: (
                <FormSection icon={User} title="Khách hàng">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <FormField label="Khách hàng (có sẵn)">
                      <SearchableSelect
                        value={watch("customerId")?.toString() ?? ""}
                        onChange={(value: string) =>
                          setValue(
                            "customerId",
                            value ? Number(value) : undefined,
                          )
                        }
                        options={customerOptions}
                        placeholder="Chọn khách (bỏ trống nếu khách vãng lai)"
                        searchPlaceholder="Tìm tên / Số điện thoại..."
                      />
                    </FormField>

                    <FormField label="Chi nhánh / Salon">
                      <SearchableSelect
                        value={watch("salonId")?.toString() ?? ""}
                        onChange={(value: string) =>
                          setValue(
                            "salonId",
                            value ? Number(value) : undefined,
                          )
                        }
                        options={salonOptions}
                        placeholder="Chọn chi nhánh..."
                        searchPlaceholder="Tìm chi nhánh..."
                      />
                    </FormField>

                    <FormField label="Tên khách vãng lai">
                      <Input
                        {...register("customerName")}
                        placeholder="VD: Chị Lan"
                      />
                    </FormField>

                    <FormField label="Số điện thoại khách vãng lai">
                      <Input
                        {...register("customerPhone")}
                        placeholder="09xxxxxxxx"
                      />
                    </FormField>

                    <FormField
                      label="Hình thức TT *"
                      error={errors.paymentMethod?.message}
                      className="sm:col-span-2"
                    >
                      <Select
                        value={watch("paymentMethod")?.toString() ?? "1"}
                        onChange={(e) =>
                          setValue("paymentMethod", Number(e.target.value))
                        }
                        options={PAYMENT_OPTIONS}
                        invalid={!!errors.paymentMethod}
                      />
                    </FormField>
                  </div>
                </FormSection>
              ),
            },
            {
              id: "items",
              label: "Mặt hàng",
              content: (
                <FormSection icon={ShoppingCart} title="Mặt hàng">
                  {typeof errors.items?.message === "string" ? (
                    <p className="text-xs text-state-danger-text font-medium mb-2">
                      {errors.items.message}
                    </p>
                  ) : null}
                  {errors.items?.root?.message ? (
                    <p className="text-xs text-state-danger-text font-medium mb-2">
                      {errors.items.root.message}
                    </p>
                  ) : null}

                  <div className="space-y-3">
                    {fields.map((field, index) => {
                      const itemType = Number(watch(`items.${index}.itemType`));
                      const refId = Number(watch(`items.${index}.refId`));
                      const qty = Number(watch(`items.${index}.quantity`) || 0);
                      const lineDiscount = Number(
                        watch(`items.${index}.discountAmount`) || 0,
                      );

                      const unit = getUnitPrice(itemType, refId);
                      const lineTotal = Math.max(unit * qty - lineDiscount, 0);

                      return (
                        <div
                          key={field.id}
                          className="grid grid-cols-12 gap-2 items-start p-3 bg-adminGray-50 rounded-lg border border-adminGray-100"
                        >
                          <FormField label="Loại *" className="col-span-2">
                            <Select
                              value={
                                watch(`items.${index}.itemType`)?.toString() ??
                                String(INVOICE_ITEM_TYPE.SERVICE)
                              }
                              onChange={(e) => {
                                setValue(
                                  `items.${index}.itemType`,
                                  Number(e.target.value),
                                );
                                setValue(`items.${index}.refId`, 0);
                              }}
                              options={ITEM_TYPE_OPTIONS}
                            />
                          </FormField>

                          <FormField
                            label="Mặt hàng *"
                            className="col-span-4"
                            error={errors.items?.[index]?.refId?.message}
                          >
                            <SearchableSelect
                              value={refId ? String(refId) : ""}
                              onChange={(value: string) =>
                                setValue(
                                  `items.${index}.refId`,
                                  value ? Number(value) : 0,
                                )
                              }
                              options={getOptionsForType(itemType)}
                              placeholder="Chọn mặt hàng"
                              searchPlaceholder="Tìm..."
                              invalid={!!errors.items?.[index]?.refId}
                            />
                          </FormField>

                          <FormField label="SL *" className="col-span-1">
                            <Input
                              {...register(`items.${index}.quantity`)}
                              type="number"
                              min={1}
                            />
                          </FormField>

                          <FormField label="Giảm dòng" className="col-span-2">
                            <Input
                              {...register(`items.${index}.discountAmount`)}
                              type="number"
                              min={0}
                            />
                          </FormField>

                          <FormField
                            label="Kỹ thuật viên"
                            className="col-span-2"
                          >
                            <SearchableSelect
                              value={
                                watch(`items.${index}.staffId`)?.toString() ??
                                ""
                              }
                              onChange={(value: string) =>
                                setValue(
                                  `items.${index}.staffId`,
                                  value ? Number(value) : undefined,
                                )
                              }
                              options={staffOptions}
                              placeholder="—"
                              searchPlaceholder="Tìm kỹ thuật viên..."
                            />
                          </FormField>

                          <div className="col-span-1 flex justify-end items-end h-9">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="mb-0 text-state-danger-text hover:text-state-danger-text hover:bg-state-danger-bg"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="col-span-12 text-right text-xs text-adminGray-600">
                            Đơn giá: <strong>{formatCurrency(unit)}</strong> · Thành
                            tiền:{" "}
                            <strong className="text-adminInk">
                              {formatCurrency(lineTotal)}
                            </strong>
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
                        append({
                          itemType: INVOICE_ITEM_TYPE.SERVICE,
                          refId: 0,
                          quantity: 1,
                          discountAmount: 0,
                          staffId: undefined,
                          note: "",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm mặt hàng
                    </Button>
                  </div>
                </FormSection>
              ),
            },
            {
              id: "payment",
              label: "Thanh toán",
              content: (
                <FormSection icon={Wallet} title="Thanh toán">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <FormField label="Giảm giá hóa đơn">
                      <Input
                        {...register("discountAmount")}
                        type="number"
                        min={0}
                      />
                    </FormField>

                    <FormField label="Điểm sử dụng">
                      <Input
                        {...register("loyaltyPointsUsed")}
                        type="number"
                        min={0}
                      />
                    </FormField>

                    <FormField label="Thuế (VAT)">
                      <Input {...register("taxAmount")} type="number" min={0} />
                    </FormField>

                    <FormField label="Khách trả">
                      <Input {...register("paidAmount")} type="number" min={0} />
                    </FormField>

                    <FormField label="Mã giao dịch">
                      <Input
                        {...register("transactionId")}
                        placeholder="Mã CK / VNPay"
                      />
                    </FormField>

                    <FormField label="Áp dụng hạng thành viên">
                      <Select
                        value={
                          (watch("applyMembershipDiscount") ?? true) ? "1" : "0"
                        }
                        onChange={(e) =>
                          setValue(
                            "applyMembershipDiscount",
                            e.target.value === "1",
                          )
                        }
                        options={MEMBERSHIP_DISCOUNT_OPTIONS}
                      />
                    </FormField>

                    <FormField label="Ghi chú" className="sm:col-span-3">
                      <Textarea
                        {...register("note")}
                        placeholder="Ghi chú hóa đơn..."
                        rows={2}
                      />
                    </FormField>
                  </div>

                  <div className="mt-4 rounded-lg bg-adminGray-50/40 border border-adminGray-100 p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-adminGray-600">Tạm tính</span>
                      <strong>{formatCurrency(subTotal)}</strong>
                    </div>

                    {manualDiscount > 0 ? (
                      <div className="flex justify-between">
                        <span className="text-adminGray-600">Giảm giá</span>
                        <span>-{formatCurrency(manualDiscount)}</span>
                      </div>
                    ) : null}

                    {pointsValue > 0 ? (
                      <div className="flex justify-between">
                        <span className="text-adminGray-600">
                          Điểm quy đổi
                        </span>
                        <span>-{formatCurrency(pointsValue)}</span>
                      </div>
                    ) : null}

                    {tax > 0 ? (
                      <div className="flex justify-between">
                        <span className="text-adminGray-600">Thuế</span>
                        <span>+{formatCurrency(tax)}</span>
                      </div>
                    ) : null}

                    <div className="flex justify-between border-t border-adminGray-100 pt-1 text-sm">
                      <span className="font-semibold text-adminInk">
                        Tổng (ước tính)
                      </span>
                      <strong className="text-adminGreen-600">
                        {formatCurrency(totalPreview)}
                      </strong>
                    </div>

                    <p className="text-xs text-adminGray-600 italic pt-1">
                      * Chưa gồm giảm giá hạng thành viên — số chính xác do hệ thống
                      tính khi lưu.
                    </p>
                  </div>
                </FormSection>
              ),
            },
          ]}
        />
      </form>
    </Modal>
  );
}

function getDefaultValues(defaultSalonId?: number): InvoiceFormData {
  return {
    customerId: undefined,
    customerName: "",
    customerPhone: "",
    salonId: defaultSalonId,
    discountAmount: 0,
    applyMembershipDiscount: true,
    loyaltyPointsUsed: 0,
    taxAmount: 0,
    paymentMethod: PAYMENT_METHOD.CASH,
    paidAmount: 0,
    transactionId: "",
    note: "",
    items: [],
  };
}

