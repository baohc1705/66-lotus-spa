import {
    useProvinces,
    useWardsByProvince,
} from "@/features/address/hooks/useAddress";
import type {
    ProvinceDto,
    WardDto,
} from "@/features/address/types/address.types";
import {
    useCreateCustomer,
    useUpdateCustomer,
} from "@/features/customers/hooks/useCustomers";
import type {
    CreateCustomerRequest,
    CustomerDto,
    UpdateCustomerRequest,
} from "@/features/customers/types/customer.types";
import axiosInstance from "@/shared/api/axiosInstance";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Input } from "@/shared/forms/Input";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { parseToDateInput } from "@/shared/utils/date.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";
import { GENDER_OPTIONS, SOURCE_OPTIONS } from "../constants/customer.const";

const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/;

const customerBaseSchema = z.object({
  fullName: z
    .string()
    .min(1, "Họ tên không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  phone: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .regex(VIETNAM_PHONE_REGEX, "Số điện thoại không hợp lệ"),
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ")
    .max(100, "Tối đa 100 ký tự"),
  dateOfBirth: z.string().optional(),
  gender: z.coerce.number().min(0).optional(),
  avatarUrl: z.string().max(500).optional().or(z.literal("")),
  loyaltyPoint: z.coerce
    .number()
    .min(0, "Điểm tích lũy không được âm")
    .optional(),
  source: z.string().max(100, "Tối đa 100 ký tự").optional().or(z.literal("")),
  status: z.coerce.number().min(0).optional(),
  note: z.string().max(500, "Tối đa 500 ký tự").optional().or(z.literal("")),
  streetAddress: z.string().max(500).optional().or(z.literal("")),
  provinceCode: z.string().optional().or(z.literal("")),
  wardCode: z.string().optional().or(z.literal("")),
  fullAddress: z.string().optional().or(z.literal("")),
});

const updateCustomerSchema = customerBaseSchema.partial().extend({
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(100, "Tối đa 100 ký tự")
    .optional()
    .or(z.literal("")),
});

const createCustomerSchema = customerBaseSchema;

type CustomerFormData = z.infer<typeof createCustomerSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerDto | null;
  onCreated?: (customerId: number) => void;
}

function getDefaultValues(customer?: CustomerDto | null): CustomerFormData {
  if (customer) {
    return {
      fullName: customer.fullName ?? "",
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      dateOfBirth: parseToDateInput(customer.dateOfBirth),
      gender: customer.gender != null ? Number(customer.gender) : undefined,
      avatarUrl: customer.avatarUrl ?? "",
      loyaltyPoint: customer.loyaltyPoint ?? undefined,
      source: customer.source ?? "",
      status: customer.status != null ? Number(customer.status) : 1,
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

export function CustomerForm({
  open,
  onOpenChange,
  customer,
  onCreated,
}: Props) {
  const isEdit = !!customer?.id;
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(
      isEdit ? updateCustomerSchema : createCustomerSchema,
    ) as Resolver<CustomerFormData>,
    defaultValues: getDefaultValues(null),
  });

  const formKey = !open
    ? "closed"
    : isEdit
      ? `edit-${customer?.id ?? "loading"}`
      : "new";
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);
  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      setPendingFile(null);
      reset(getDefaultValues(customer));
    }
  }

  const avatarUrl = useWatch({ control, name: "avatarUrl" });
  const provinceCode = useWatch({ control, name: "provinceCode" });
  const wardCode = useWatch({ control, name: "wardCode" });
  const gender = useWatch({ control, name: "gender" });
  const source = useWatch({ control, name: "source" });

  const provincesQuery = useProvinces();
  const wardsQuery = useWardsByProvince(provinceCode);

  const provinces = provincesQuery.data?.data ?? [];
  const wards = wardsQuery.data?.data ?? [];

  const provinceOptions: { value: string; label: string }[] = [];
  for (let index = 0; index < provinces.length; index++) {
    const province = provinces[index] as ProvinceDto;
    provinceOptions.push({
      value: province.code ?? "",
      label: province.name ?? "",
    });
  }

  const wardOptions: { value: string; label: string }[] = [];
  for (let index = 0; index < wards.length; index++) {
    const ward = wards[index] as WardDto;
    wardOptions.push({
      value: ward.code ?? "",
      label: ward.name ?? "",
    });
  }

  async function onSubmit(data: CustomerFormData) {
    setIsUploading(true);
    try {
      let imageBase64: string | undefined;
      if (pendingFile) {
        imageBase64 = await fileToBase64(pendingFile);
      }

      let provinceName = "";
      for (let index = 0; index < provinces.length; index++) {
        const province = provinces[index] as ProvinceDto;
        if (province.code === data.provinceCode) {
          provinceName = province.name ?? "";
          break;
        }
      }

      let wardName = "";
      for (let index = 0; index < wards.length; index++) {
        const ward = wards[index] as WardDto;
        if (ward.code === data.wardCode) {
          wardName = ward.name ?? "";
          break;
        }
      }

      const addressParts: string[] = [];
      if (data.streetAddress) addressParts.push(data.streetAddress);
      if (wardName) addressParts.push(wardName);
      if (provinceName) addressParts.push(provinceName);

      const payload = {
        ...data,
        avatarUrl: data.avatarUrl ?? "",
        imageBase64,
        fullAddress: addressParts.join(", "),
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth : undefined,
      };

      if (isEdit && customer?.id) {
        updateMutation.mutate(
          { id: customer.id, payload: payload as UpdateCustomerRequest },
          {
            onSuccess: (result) => {
              if (result.isSuccess !== true) return;
              onOpenChange(false);
            },
          },
        );
        return;
      }

      createMutation.mutate(payload as CreateCustomerRequest, {
        onSuccess: async (result) => {
          if (result.isSuccess !== true) return;

          const customerId = result.data as unknown as number;
          if (customerId > 0) {
            try {
              await axiosInstance.post("/membership-cards", {
                customerId,
                membershipTierName: "common",
                issuedAt: new Date().toLocaleDateString,
                status: 1,
              });
            } catch (error) {
              console.error(
                "Failed to automatically create membership card:",
                error,
              );
            }
            onCreated?.(customerId);
          }

          onOpenChange(false);
        },
      });
    } finally {
      setIsUploading(false);
    }
  }

  const saving = isPending || isUploading;

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
      size="lg"
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
            form="customer-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={saving}
          >
            {isEdit ? "Cập nhật" : "Tạo khách hàng"}
          </Button>
        </>
      }
    >
      <form
        id="customer-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormSection icon={User} title="Thông tin khách hàng">
          <FormRow>
            <FormField label="Ảnh đại diện" className="sm:col-span-2">
              <ImageUpload
                key={`${open}-${customer?.id ?? "new"}`}
                value={avatarUrl || customer?.avatarUrl}
                onFileChange={setPendingFile}
                shape="circle"
                label="Đổi ảnh đại diện"
              />
            </FormField>

            <FormField label="Họ tên" required error={errors.fullName?.message}>
              <Input
                {...register("fullName")}
                placeholder="Nguyễn Văn A"
                invalid={!!errors.fullName}
              />
            </FormField>

            <FormField
              label="Số điện thoại"
              required
              error={errors.phone?.message}
            >
              <Input
                {...register("phone")}
                placeholder="0901234567"
                invalid={!!errors.phone}
              />
            </FormField>

            <FormField label="Email" required error={errors.email?.message}>
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
                value={gender != null ? String(gender) : ""}
                onChange={(event) =>
                  setValue("gender", Number(event.target.value))
                }
                options={GENDER_OPTIONS}
                placeholder="Chọn giới tính"
              />
            </FormField>
            <FormField label="Nguồn khách">
              <Select
                value={source ?? ""}
                onChange={(event) => setValue("source", event.target.value)}
                options={SOURCE_OPTIONS}
                placeholder="Chọn nguồn"
              />
            </FormField>
            <FormField
              label="Tỉnh/Thành phố"
              error={errors.provinceCode?.message}
            >
              <SearchableSelect
                value={provinceCode ?? ""}
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
                value={wardCode ?? ""}
                onChange={(value) => setValue("wardCode", value)}
                options={wardOptions}
                placeholder="Chọn phường/xã"
                searchPlaceholder="Tìm phường/xã..."
                disabled={!provinceCode || wardsQuery.isLoading}
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
          </FormRow>
          {/* 
            <FormField label="Trạng thái">
              <Select
                value={status != null ? String(status) : "1"}
                onChange={(event) =>
                  setValue("status", Number(event.target.value))
                }
                options={STATUS_OPTIONS}
                placeholder="Chọn trạng thái"
              />
            </FormField> */}
        </FormSection>
      </form>
    </Modal>
  );
}
