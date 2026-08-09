import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, ShoppingBag } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { parseToDateInput } from "@/shared/utils/date.utils";
import axiosInstance from "@/shared/api/axiosInstance";

import { useCreateCustomer, useUpdateCustomer } from "../hooks/useCustomers";
import {
  useProvinces,
  useWardsByProvince,
} from "@/features/address/hooks/useAddress";
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

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerDto | null;
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
          (province: ProvinceDto) => province.code === data.provinceCode,
        )?.name ?? "";
      const wardName =
        wardsQuery.data?.data?.find(
          (ward: WardDto) => ward.code === data.wardCode,
        )?.name ?? "";
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
                  await axiosInstance.post("/membership-cards", {
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

  const provinceOptions = (provincesQuery.data?.data ?? []).map(
    (province: ProvinceDto) => ({
      value: province.code ?? "",
      label: province.name ?? "",
    }),
  );

  const wardOptions = (wardsQuery.data?.data ?? []).map((ward: WardDto) => ({
    value: ward.code ?? "",
    label: ward.name ?? "",
  }));

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
      size="lg"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection icon={User} title="Thông tin cá nhân">
          <div className="mb-5">
            <ImageUpload
              value={avatarUrlValue || customer?.avatarUrl}
              onFileChange={setPendingFile}
              shape="circle"
              label="Đổi ảnh đại diện"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField
              label="Họ tên *"
              tooltip="Vui lòng nhập họ và tên đầy đủ của khách hàng"
              error={errors.fullName?.message}
            >
              <Input
                {...register("fullName")}
                placeholder="Nguyễn Văn A"
                invalid={!!errors.fullName}
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
                invalid={!!errors.phone}
              />
            </FormField>
            <FormField
              label="Email *"
              tooltip="Email dùng làm tài khoản khách hàng"
              error={errors.email?.message}
            >
              <Input
                {...register("email")}
                type="email"
                placeholder="khach@email.com"
                readOnly={isEdit}
                invalid={!!errors.email}
              />
            </FormField>
            <FormField label="Ngày sinh" error={errors.dateOfBirth?.message}>
              <Input
                {...register("dateOfBirth")}
                type="date"
                invalid={!!errors.dateOfBirth}
              />
            </FormField>
            <FormField label="Giới tính">
              <Select
                value={watch("gender")?.toString() ?? ""}
                onChange={(e) => setValue("gender", Number(e.target.value))}
                options={GENDER_OPTIONS}
                placeholder="Chọn giới tính"
              />
            </FormField>
            <FormField
              label="Tỉnh/Thành phố"
              error={errors.provinceCode?.message}
            >
              <SearchableSelect
                value={watch("provinceCode") ?? ""}
                onChange={(value) => {
                  setValue("provinceCode", value);
                  setValue("wardCode", "");
                }}
                options={provinceOptions}
                placeholder="Chọn tỉnh/thành phố"
                searchPlaceholder="Tìm tỉnh/thành phố..."
                invalid={!!errors.provinceCode}
              />
            </FormField>
            <FormField label="Phường/Xã" error={errors.wardCode?.message}>
              <SearchableSelect
                value={watch("wardCode") ?? ""}
                onChange={(value) => setValue("wardCode", value)}
                options={wardOptions}
                placeholder="Chọn phường/xã"
                searchPlaceholder="Tìm phường/xã..."
                disabled={!watch("provinceCode") || wardsQuery.isLoading}
                invalid={!!errors.wardCode}
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
                invalid={!!errors.streetAddress}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection icon={ShoppingBag} title="Thông tin khách hàng">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField label="Nguồn khách">
              <Select
                value={watch("source") ?? ""}
                onChange={(e) => setValue("source", e.target.value)}
                options={SOURCE_OPTIONS}
                placeholder="Chọn nguồn"
              />
            </FormField>
            <FormField label="Trạng thái">
              <Select
                value={watch("status")?.toString() ?? "1"}
                onChange={(e) => setValue("status", Number(e.target.value))}
                options={STATUS_OPTIONS}
                placeholder="Chọn trạng thái"
              />
            </FormField>
            <FormField
              label="Ghi chú"
              error={errors.note?.message}
              className="sm:col-span-2"
            >
              <Textarea
                {...register("note")}
                placeholder="Ghi chú thêm về khách hàng..."
                rows={3}
                invalid={!!errors.note}
              />
            </FormField>
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
            {COMMON_MSG.cancel}
          </Button>
          <Button
            type="submit"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={isPending || isUploading}
          >
            {isEdit ? "Cập nhật" : "Tạo khách hàng"}
          </Button>
        </div>
      </form>
    </Modal>
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
