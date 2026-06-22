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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import { Textarea } from "@/shared/components/ui/textarea";
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
import { uploadApi } from "@/shared/api/upload.api";
import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerDto | null;
}

const GENDER_OPTIONS = [
  { value: "0", label: "Nam" },
  { value: "1", label: "Nữ" },
  { value: "2", label: "Khác" },
];

const STATUS_OPTIONS = [
  { value: "1", label: "Hoạt động" },
  { value: "0", label: "Ngưng hoạt động" },
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
      let avatarUrl = data.avatarUrl ?? "";
      if (pendingFile) {
        const result = await uploadApi.uploadImage(pendingFile, "customer");
        avatarUrl = result.isSuccess && result.data ? result.data : "";
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
      const payload = { ...data, avatarUrl, fullAddress: parts.join(", ") };

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField
                label="Họ tên *"
                tooltip="Vui lòng nhập họ và tên đầy đủ của khách hàng"
                error={errors.fullName?.message}
              >
                <Input
                  {...register("fullName")}
                  placeholder="Nguyễn Văn A"
                  className="h-9 text-[13px]"
                />
              </FormField>
              <FormField
                label="Số điện thoại *"
                tooltip="Số điện thoại phải có 10 chữ số"
                error={errors.phone?.message}
              >
                <Input
                  {...register("phone")}
                  placeholder="0901234567"
                  className="h-9 text-[13px]"
                />
              </FormField>
              <FormField label="Ngày sinh" error={errors.dateOfBirth?.message}>
                <Input
                  {...register("dateOfBirth")}
                  type="date"
                  className="h-9 text-[13px]"
                />
              </FormField>
              <FormField label="Giới tính">
                <Select
                  value={watch("gender")?.toString() ?? ""}
                  onValueChange={(v) => setValue("gender", Number(v))}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
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
              <FormField
                label="Số nhà, tên đường"
                error={errors.streetAddress?.message}
                className="sm:col-span-2"
              >
                <Input
                  {...register("streetAddress")}
                  placeholder="123 Đường ABC"
                  className="h-9 text-[13px]"
                />
              </FormField>
            </div>
          </FormSection>

          {/* === Section: Thông tin khách hàng === */}
          <FormSection icon={ShoppingBag} title="Thông tin khách hàng">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {/* Điểm tích lũy được quản lý tự động bởi hệ thống */}
              <FormField label="Nguồn khách">
                <Select
                  value={watch("source") ?? ""}
                  onValueChange={(v) => setValue("source", v)}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn nguồn" />
                  </SelectTrigger>
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
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField
                label="Ghi chú"
                error={errors.note?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  {...register("note")}
                  placeholder="Ghi chú thêm về khách hàng..."
                  className="text-[13px] min-h-[60px] resize-none"
                />
              </FormField>
            </div>
          </FormSection>

          {/* Note: Account creation is handled via public registration only */}

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
              {isEdit ? "Cập nhật" : "Tạo khách hàng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Helper Components ----

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
        <Icon className="w-4 h-4 text-lotus-leaf" />
        <h3 className="text-[13px] font-semibold text-lotus-deep">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FormField({
  label,
  error,
  tooltip,
  className,
  children,
}: {
  label: string;
  error?: string;
  tooltip?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const isRequired = label.includes("*");
  const cleanLabel = label.replace("*", "").trim();

  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label className="flex items-center gap-1 text-[12px] font-semibold text-lotus-deep/80">
        {cleanLabel}
        {isRequired &&
          (tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-red-500 cursor-help hover:text-red-600 focus:outline-none select-none">
                  *
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-red-500">*</span>
          ))}
      </Label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ---- Default Values ----

function getDefaultValues(customer?: CustomerDto | null): CustomerFormValues {
  if (customer) {
    return {
      fullName: customer.fullName ?? "",
      phone: customer.phone ?? "",
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
