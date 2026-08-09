import { useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, User, ShoppingCart, Wallet } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { formatCurrency } from "@/shared/utils/currency";

import {
  invoiceSchema,
  type InvoiceFormValues,
} from "../schemas/invoice.schema";
import { useCreateInvoice } from "../hooks/useInvoices";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { useServices } from "@/features/services/hooks/useServices";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useTreatmentCourses } from "@/features/treatment_courses/hooks/useTreatmentCourses";
import { useStaffs } from "@/features/staffs/hooks/useStaffs";
import type { CustomerDto } from "@/features/customers/types/customer.types";
import type { ServiceDto } from "@/features/services/types/service.types";
import type { ProductDto } from "@/features/products/types/product.types";
import type { TreatmentCourseDto } from "@/features/treatment_courses/types/treatmentCourse.types";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import { useSalons } from "@/features/salons/hooks/useSalons";
import type { SalonDTO } from "@/features/salons/types/salon.types";
import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  INVOICE_ITEM_TYPE,
  PAYMENT_METHOD,
  POINT_VALUE_VND,
  type CreateInvoicePayload,
} from "../types/invoice.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ITEM_TYPE_OPTIONS = [
  { value: String(INVOICE_ITEM_TYPE.SERVICE), label: "Dịch vụ" },
  { value: String(INVOICE_ITEM_TYPE.PRODUCT), label: "Sản phẩm" },
  { value: String(INVOICE_ITEM_TYPE.TREATMENT_COURSE), label: "Liệu trình" },
];

const PAYMENT_OPTIONS = [
  { value: String(PAYMENT_METHOD.CASH), label: "Tiền mặt" },
  { value: String(PAYMENT_METHOD.BANK_TRANSFER), label: "Chuyển khoản" },
  { value: String(PAYMENT_METHOD.WALLET), label: "Ví" },
  { value: String(PAYMENT_METHOD.VNPAY), label: "VNPay" },
];

const MEMBERSHIP_DISCOUNT_OPTIONS = [
  { value: "1", label: "Có" },
  { value: "0", label: "Không" },
];

export function InvoiceFormDialog({ open, onOpenChange }: Props) {
  const createMutation = useCreateInvoice();
  const isPending = createMutation.isPending;

  const effectiveSalonId = useAuthStore((s) => s.getEffectiveSalonId());
  const { data: salonsResult } = useSalons({ pageIndex: 1, pageSize: 100 });
  const salons: SalonDTO[] = salonsResult?.data?.items ?? [];
  const customers: CustomerDto[] =
    useCustomers({ pageIndex: 1, pageSize: 200 }).data?.data?.items ?? [];
  const services: ServiceDto[] =
    useServices({ pageIndex: 1, pageSize: 200 }).data?.data?.items ?? [];
  const products: ProductDto[] =
    useProducts({ pageIndex: 1, pageSize: 200 }).data?.data?.items ?? [];
  const courses: TreatmentCourseDto[] =
    useTreatmentCourses({ pageIndex: 1, pageSize: 200 }).data?.data?.items ??
    [];
  const staffs: StaffDto[] =
    useStaffs({ pageIndex: 1, pageSize: 200 }).data?.data?.items ?? [];

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormValues>,
    defaultValues: getDefaultValues(effectiveSalonId ?? undefined),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (open) reset(getDefaultValues(effectiveSalonId ?? undefined));
  }, [open, reset, effectiveSalonId]);

  const getUnitPrice = (itemType: number, refId: number): number => {
    if (!refId) return 0;
    if (itemType === INVOICE_ITEM_TYPE.SERVICE)
      return services.find((s) => s.id === refId)?.sellingPrice ?? 0;
    if (itemType === INVOICE_ITEM_TYPE.PRODUCT)
      return products.find((p) => p.id === refId)?.sellingPrice ?? 0;
    if (itemType === INVOICE_ITEM_TYPE.TREATMENT_COURSE)
      return courses.find((c) => c.id === refId)?.sellingPrice ?? 0;
    return 0;
  };

  const getOptionsForType = (itemType: number) => {
    if (itemType === INVOICE_ITEM_TYPE.SERVICE)
      return services.map((s) => ({
        value: String(s.id ?? ""),
        label: `${s.name ?? ""} — ${formatCurrency(s.sellingPrice ?? 0)}`,
      }));
    if (itemType === INVOICE_ITEM_TYPE.PRODUCT)
      return products.map((p) => ({
        value: String(p.id ?? ""),
        label: `${p.name ?? ""} — ${formatCurrency(p.sellingPrice ?? 0)}`,
      }));
    if (itemType === INVOICE_ITEM_TYPE.TREATMENT_COURSE)
      return courses.map((c) => ({
        value: String(c.id ?? ""),
        label: `${c.name ?? ""} — ${formatCurrency(c.sellingPrice ?? 0)}`,
      }));
    return [];
  };

  const watchedItems = watch("items");
  let subTotal = 0;
  for (let index = 0; index < (watchedItems ?? []).length; index++) {
    const item = watchedItems[index];
    const unit = getUnitPrice(Number(item.itemType), Number(item.refId));
    const line =
      unit * Number(item.quantity || 0) - Number(item.discountAmount || 0);
    subTotal = subTotal + Math.max(line, 0);
  }
  const manualDiscount = Number(watch("discountAmount") || 0);
  const pointsValue = Number(watch("loyaltyPointsUsed") || 0) * POINT_VALUE_VND;
  const tax = Number(watch("taxAmount") || 0);
  const totalPreview = Math.max(
    subTotal - manualDiscount - pointsValue + tax,
    0,
  );

  const customerOptions = customers.map((c: CustomerDto) => ({
    value: String(c.id ?? ""),
    label: `${c.fullName ?? ""} — ${c.phone ?? ""}`,
  }));
  const salonOptions = salons.map((s: SalonDTO) => ({
    value: String(s.id ?? ""),
    label: `${s.name ?? ""} — ${s.code ?? ""}`,
  }));
  const staffOptions = staffs.map((s: StaffDto) => ({
    value: String(s.id ?? ""),
    label: s.fullName ?? "",
  }));

  const onSubmit = (data: InvoiceFormValues) => {
    const payload: CreateInvoicePayload = {
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
      items: data.items.map((i) => ({
        itemType: i.itemType,
        refId: i.refId,
        quantity: i.quantity,
        discountAmount: i.discountAmount || 0,
        staffId: i.staffId || undefined,
        note: i.note || undefined,
      })),
    };
    createMutation.mutate(payload, {
      onSuccess: (result) => {
        if (result.isSuccess) onOpenChange(false);
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Lập hóa đơn"
      size="xl"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection icon={User} title="Khách hàng">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FormField label="Khách hàng (có sẵn)">
              <SearchableSelect
                value={watch("customerId")?.toString() ?? ""}
                onChange={(value: string) =>
                  setValue("customerId", value ? Number(value) : undefined)
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
                  setValue("salonId", value ? Number(value) : undefined)
                }
                options={salonOptions}
                placeholder="Chọn chi nhánh..."
                searchPlaceholder="Tìm chi nhánh..."
              />
            </FormField>
            <FormField label="Tên khách vãng lai">
              <Input {...register("customerName")} placeholder="VD: Chị Lan" />
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

        <FormSection icon={ShoppingCart} title="Mặt hàng">
          {typeof errors.items?.message === "string" && (
            <p className="text-xs text-state-danger-text font-medium mb-2">
              {errors.items.message}
            </p>
          )}
          {errors.items?.root?.message && (
            <p className="text-xs text-state-danger-text font-medium mb-2">
              {errors.items.root.message}
            </p>
          )}
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
                        watch(`items.${index}.itemType`)?.toString() ?? "1"
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
                  <FormField label="Kỹ thuật viên" className="col-span-2">
                    <SearchableSelect
                      value={
                        watch(`items.${index}.staffId`)?.toString() ?? ""
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
                  <div className="col-span-1 flex items-end justify-center h-9 mt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="mb-0 text-state-danger-text hover:text-state-danger-text hover:bg-state-danger-bg"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
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
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-0 mt-3 text-xs gap-1.5"
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
            <Plus className="w-3.5 h-3.5" /> Thêm mặt hàng
          </Button>
        </FormSection>

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
                value={(watch("applyMembershipDiscount") ?? true) ? "1" : "0"}
                onChange={(e) =>
                  setValue("applyMembershipDiscount", e.target.value === "1")
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
            {manualDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-adminGray-600">Giảm giá</span>
                <span>-{formatCurrency(manualDiscount)}</span>
              </div>
            )}
            {pointsValue > 0 && (
              <div className="flex justify-between">
                <span className="text-adminGray-600">Điểm quy đổi</span>
                <span>-{formatCurrency(pointsValue)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-adminGray-600">Thuế</span>
                <span>+{formatCurrency(tax)}</span>
              </div>
            )}
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

        <div className="flex justify-end gap-2 border-t border-kit pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending}
          >
            Lập hóa đơn
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function getDefaultValues(defaultSalonId?: number): InvoiceFormValues {
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
