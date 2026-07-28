import { AdminTextarea } from '@/shared/components/forms/AdminTextarea';
import { AdminInput } from '@/shared/components/forms/AdminInput';
import { AdminSelectTrigger } from '@/shared/components/forms/AdminSelectTrigger';
import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import { FormSection } from "@/shared/components/forms/FormSection";
import { FormField } from "@/shared/components/forms/FormField";
import { useCreateCustomer, useUpdateCustomer } from "../hooks/useCustomers";
import {
  useProvinces,
  useWardsByProvince,
} from "@/features/address/hooks/useAddress";
import { parseToDateInput } from "@/shared/utils/date.utils";
import {
  createCustomerSchema,
  updateCustomerSchema,
  type CustomerFormValues,
} from "../schemas/customer.schema";

import type {
  CreateCustomerPayload,
  CustomerDto,
  UpdateCustomerPayload,
} from "../types/customer.types";
import type {
  ProvinceDto,
  WardDto,
} from "@/features/address/types/address.types";
import { User, ShoppingBag } from "lucide-react";
import { ImageUpload } from "@/shared/components/ImageUpload";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import { COMMON_MSG } from "@/shared/constants/common.messages";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerDto | null;
  /** Gọi sau khi tạo khách thành công (POS chọn khách vừa tạo). */
  onCreated?: (customerId: number) => void;
}

const GENDER_OPTIONS = [
  { value: "0", label: "Nam" },
  { value: "1", label: "Nữ" },
  { value: "2", label: "Khác" },
];

const STATUS_OPTIONS = [
  { value: "0", label: "Ngưng hoạt động" },
  { value: "1", label: "Hoạt động" },
  { value: "2", label: "Tạm khóa" },
];

const SOURCE_OPTIONS = [
  { value: "Walk-in", label: "Đến trực tiếp" },
  { value: "Online", label: "Online" },
  { value: "Referral", label: "Giới thiệu" },
  { value: "Social Media", label: "Mạng xã hội" },
];

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onCreated,
}: CustomerFormDialogProps) {
  const isEdit = !!customer;
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Dynamic schema & form based on create vs edit
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(
      isEdit ? updateCustomerSchema : createCustomerSchema,
    ) as Resolver<CustomerFormValues>,
    defaultValues: getDefaultValues(customer),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const avatarUrlValue = watch("avatarUrl");
  const selectedProvince = watch("provinceCode");
  const provincesQuery = useProvinces();
  const wardsQuery = useWardsByProvince(selectedProvince);

  // Reset form when dialog opens/closes or customer changes
  useEffect(() => {
    if (open) {
      setPendingFile(null);
      reset(getDefaultValues(customer));
    }
  }, [open, customer, reset]);

  const onSubmit = async (data: CustomerFormValues) => {
    setIsUploading(true);
    try {
      let imageBase64: string | undefined;
      if (pendingFile) {
        imageBase64 = await fileToBase64(pendingFile);
      }
      const provinceName =
        provincesQuery.data?.data?.find(
          (p: ProvinceDto) => p.code === data.provinceCode,
        )?.name ?? "";
      const wardName =
        wardsQuery.data?.data?.find((w: WardDto) => w.code === data.wardCode)
          ?.name ?? "";
      const parts = [data.streetAddress, wardName, provinceName].filter(
        Boolean,
      );
      const payload = {
        ...data,
        avatarUrl: data.avatarUrl ?? "",
        imageBase64,
        fullAddress: parts.join(", "),
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth : undefined,
      };

      if (isEdit && customer?.id) {
        updateMutation.mutate(
          { id: customer.id, payload: payload as UpdateCustomerPayload },
          {
            onSuccess: (result) => {
              if (result.isSuccess) onOpenChange(false);
            },
          },
        );
      } else {
        createMutation.mutate(payload as CreateCustomerPayload, {
          onSuccess: async (result) => {
            if (result.isSuccess) {
              const customerId = result.data as unknown as number;
              if (customerId > 0) {
                try {
                  await axiosInstance.post(API.membershipCards, {
                    customerId,
                    membershipTierName: "common",
                    issuedAt: new Date().toISOString(),
                    status: 1,
                  });
                } catch (err) {
                  console.error(
                    "Failed to automatically create membership card:",
                    err,
                  );
                }
                onCreated?.(customerId);
              }
              onOpenChange(false);
            }
          },
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin khách hàng ${customer?.fullName ?? ""}`
              : "Điền thông tin để tạo khách hàng mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* === Section: Thông tin cá nhân === */}
          <FormSection icon={User} title="Thông tin cá nhân">
            <div className="mb-5">
              <ImageUpload
                value={avatarUrlValue || customer?.avatarUrl}
                onFileChange={setPendingFile}
                label="Đổi ảnh đại diện"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FormField
                label="Họ tên *"
                tooltip="Vui lòng nhập họ và tên đầy đủ của khách hàng"
                error={errors.fullName?.message}
              >
                <AdminInput
                  {...register("fullName")}
                  placeholder="Nguyễn Văn A"
                />
              </FormField>
              <FormField
                label="Số điện thoại *"
                tooltip="Số điện thoại phải có 10 chữ số"
                error={errors.phone?.message}
              >
                <AdminInput
                  {...register("phone")}
                  placeholder="0901234567"
                />
              </FormField>
              <FormField
                label="Email *"
                tooltip="Email dùng làm tài khoản khách hàng"
                error={errors.email?.message}
              >
                <AdminInput
                  {...register("email")}
                  type="email"
                  placeholder="khach@email.com"
                  readOnly={isEdit}
                />
              </FormField>
              <FormField label="Ngày sinh" error={errors.dateOfBirth?.message}>
                <AdminInput
                  {...register("dateOfBirth")}
                  type="date"
                />
              </FormField>
              <FormField label="Giới tính">
                <Select
                  value={watch("gender")?.toString() ?? ""}
                  onValueChange={(v) => setValue("gender", Number(v))}
                >
                  <AdminSelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </AdminSelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField
                label="Tỉnh/Thành phố"
                error={errors.provinceCode?.message}
              >
                <SearchableSelect
                  value={watch("provinceCode") ?? ""}
                  onValueChange={(v) => {
                    setValue("provinceCode", v);
                    setValue("wardCode", "");
                  }}
                  options={(provincesQuery.data?.data ?? []).map(
                    (p: ProvinceDto) => ({
                      value: p.code ?? "",
                      label: p.name ?? "",
                    }),
                  )}
                  placeholder="Chọn tỉnh/thành phố"
                  searchPlaceholder="Tìm tỉnh/thành phố..."
                  className="h-9"
                />
              </FormField>
              <FormField label="Phường/Xã" error={errors.wardCode?.message}>
                <SearchableSelect
                  value={watch("wardCode") ?? ""}
                  onValueChange={(v) => setValue("wardCode", v)}
                  options={(wardsQuery.data?.data ?? []).map((w: WardDto) => ({
                    value: w.code ?? "",
                    label: w.name ?? "",
                  }))}
                  placeholder="Chọn phường/xã"
                  searchPlaceholder="Tìm phường/xã..."
                  disabled={!watch("provinceCode") || wardsQuery.isLoading}
                  className="h-9"
                />
              </FormField>
              <div className="sm:col-span-2">
                <FormField
                  label="Số nhà, tên đường"
                  error={errors.streetAddress?.message}
                >
                  <AdminInput
                    {...register("streetAddress")}
                    placeholder="123 Đường ABC"
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* === Section: Thông tin khách hàng === */}
          <FormSection icon={ShoppingBag} title="Thông tin khách hàng">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FormField label="Nguồn khách">
                <Select
                  value={watch("source") ?? ""}
                  onValueChange={(v) => setValue("source", v)}
                >
                  <AdminSelectTrigger>
                    <SelectValue placeholder="Chọn nguồn" />
                  </AdminSelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Trạng thái">
                <Select
                  value={watch("status")?.toString() ?? "1"}
                  onValueChange={(v) => setValue("status", Number(v))}
                >
                  <AdminSelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </AdminSelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <div className="sm:col-span-2">
                <FormField
                  label="Ghi chú"
                  error={errors.note?.message}
                >
                  <AdminTextarea
                    {...register("note")}
                    placeholder="Ghi chú thêm về khách hàng..."
                    className="text-sm min-h-[60px] resize-none"
                  />
                </FormField>
              </div>
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
              loading={isPending || isUploading}
            >
              {isEdit ? "Cập nhật" : "Tạo khách hàng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValues(customer?: CustomerDto | null): CustomerFormValues {
  if (customer) {
    return {
      fullName: customer.fullName ?? "",
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      dateOfBirth: parseToDateInput(customer.dateOfBirth),
      gender: customer.gender ? Number(customer.gender) : undefined,
      avatarUrl: customer.avatarUrl ?? "",
      loyaltyPoint: customer.loyaltyPoint ?? undefined,
      source: customer.source ?? "",
      status: customer.status ? Number(customer.status) : 1,
      note: customer.note ?? "",
      streetAddress: customer.streetAddress ?? "",
      provinceCode: customer.provinceCode ?? "",
      wardCode: customer.wardCode ?? "",
      fullAddress: customer.fullAddress ?? "",
    };
  }
  return {
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: undefined,
    avatarUrl: "",
    loyaltyPoint: undefined,
    source: "",
    status: 1,
    note: "",
    streetAddress: "",
    provinceCode: "",
    wardCode: "",
    fullAddress: "",
  };
}
