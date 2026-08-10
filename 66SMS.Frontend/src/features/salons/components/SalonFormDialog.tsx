import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, MapPin, FileText, Loader2 } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { FormRow } from "@/shared/forms/FormRow";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { Checkbox } from "@/shared/forms/Checkbox";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { fileToBase64 } from "@/shared/lib/fileToBase64";

import {
  useCreateSalonMutation,
  useUpdateSalonMutation,
  useSalonDetail,
} from "../hooks/useSalons";
import {
  useProvinces,
  useWardsByProvince,
} from "@/features/address/hooks/useAddress";
import {
  createSalonSchema,
  updateSalonSchema,
  type SalonFormValues,
} from "../schemas/salon.schema";
import type { SalonDTO } from "../types/salon.types";
import type {
  ProvinceDto,
  WardDto,
} from "@/features/address/types/address.types";

interface SalonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId?: number | null;
}

const STATUS_OPTIONS = [
  { value: "1", label: "Hoạt động" },
  { value: "0", label: "Tạm đóng" },
  { value: "3", label: "Đóng cửa" },
];

export function SalonFormDialog({
  open,
  onOpenChange,
  salonId = null,
}: SalonFormDialogProps) {
  const isEdit = salonId != null && salonId > 0;
  const detailQuery = useSalonDetail(open && isEdit ? salonId : null);
  const salon = detailQuery.data?.data;
  const createMutation = useCreateSalonMutation();
  const updateMutation = useUpdateSalonMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<SalonFormValues>({
    resolver: zodResolver(
      isEdit ? updateSalonSchema : createSalonSchema,
    ) as Resolver<SalonFormValues>,
    defaultValues: getDefaultValues(null),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const statusValue = watch("status");
  const imageUrlValue = watch("imageUrl");
  const isPrimaryValue = watch("isPrimary");
  const selectedProvince = watch("provinceCode");
  const provincesQuery = useProvinces();
  const wardsQuery = useWardsByProvince(selectedProvince);

  useEffect(() => {
    if (!open) return;
    setPendingFile(null);
    if (isEdit) {
      if (salon) reset(getDefaultValues(salon));
    } else {
      reset(getDefaultValues(null));
    }
  }, [open, isEdit, salon, reset]);

  const onSubmit = async (data: SalonFormValues) => {
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
        imageUrl: data.imageUrl ?? "",
        imageBase64,
        fullAddress: parts.join(", "),
      };

      if (isEdit && salonId) {
        updateMutation.mutate(
          { id: salonId, payload },
          {
            onSuccess: (result) => {
              if (result.isSuccess) onOpenChange(false);
            },
          },
        );
      } else {
        createMutation.mutate(
          payload as Parameters<typeof createMutation.mutate>[0],
          {
            onSuccess: (result) => {
              if (result.isSuccess) onOpenChange(false);
            },
          },
        );
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
      title={isEdit ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
      size="lg"
      scrollable
    >
      {isEdit && detailQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-kit-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Đang tải thông tin chi nhánh...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormSection icon={Building2} title="Thông tin cơ bản">
            <div className="mb-5">
              <ImageUpload
                value={imageUrlValue || salon?.imageUrl}
                onFileChange={setPendingFile}
                shape="square"
                label="Đổi ảnh chi nhánh"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField
                label="Mã chi nhánh"
                tooltip={
                  isEdit
                    ? "Mã được hệ thống tạo tự động, không chỉnh sửa."
                    : "Mã sẽ được hệ thống tạo tự động sau khi lưu."
                }
              >
                <Input
                  value={isEdit ? (salon?.code ?? "") : ""}
                  placeholder={isEdit ? "" : "Tự động tạo"}
                  disabled
                  readOnly
                />
              </FormField>
              <FormField
                label="Tên chi nhánh *"
                error={errors.name?.message}
                className="sm:col-span-2"
              >
                <Input
                  {...register("name")}
                  placeholder="Chi nhánh Quận 1"
                  invalid={!!errors.name}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField label="Số điện thoại *" error={errors.phone?.message}>
                <Input
                  {...register("phone")}
                  placeholder="0901234567"
                  invalid={!!errors.phone}
                />
              </FormField>
              <FormField label="Email" error={errors.email?.message}>
                <Input
                  {...register("email")}
                  placeholder="chinhanh@spa.vn"
                  invalid={!!errors.email}
                />
              </FormField>
              <FormField label="Mã số thuế" error={errors.taxCode?.message}>
                <Input
                  {...register("taxCode")}
                  placeholder="0123456789"
                  invalid={!!errors.taxCode}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection icon={MapPin} title="Địa chỉ">
            <FormRow>
              <FormField
                label="Tỉnh/Thành phố *"
                error={errors.provinceCode?.message}
              >
                <SearchableSelect
                  value={watch("provinceCode") ?? ""}
                  onChange={(value) => {
                    setValue("provinceCode", value, { shouldValidate: true });
                    setValue("wardCode", "", { shouldValidate: true });
                  }}
                  options={provinceOptions}
                  placeholder="Chọn tỉnh/thành phố"
                  searchPlaceholder="Tìm tỉnh/thành phố..."
                  invalid={!!errors.provinceCode}
                />
              </FormField>
              <FormField label="Phường/Xã *" error={errors.wardCode?.message}>
                <SearchableSelect
                  value={watch("wardCode") ?? ""}
                  onChange={(value) =>
                    setValue("wardCode", value, { shouldValidate: true })
                  }
                  options={wardOptions}
                  placeholder="Chọn phường/xã"
                  searchPlaceholder="Tìm phường/xã..."
                  disabled={!watch("provinceCode") || wardsQuery.isLoading}
                  invalid={!!errors.wardCode}
                />
              </FormField>
            </FormRow>
            <FormField
              label="Số nhà, tên đường"
              error={errors.streetAddress?.message}
            >
              <Input
                {...register("streetAddress")}
                placeholder="123 Nguyễn Trãi"
                invalid={!!errors.streetAddress}
              />
            </FormField>
          </FormSection>

          <FormSection icon={FileText} title="Mô tả & Trạng thái">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField
                label="Ngày làm việc"
                tooltip='Chuỗi số thứ trong tuần, ví dụ "1234567" = tất cả các ngày'
                error={errors.workingDays?.message}
              >
                <Input
                  {...register("workingDays")}
                  placeholder="1234567"
                  invalid={!!errors.workingDays}
                />
              </FormField>
              <FormField
                label="Thứ tự hiển thị"
                error={errors.sortOrder?.message}
              >
                <Input
                  {...register("sortOrder")}
                  type="number"
                  placeholder="0"
                  invalid={!!errors.sortOrder}
                />
              </FormField>
              <FormField label="Trạng thái">
                <Select
                  value={statusValue?.toString() ?? "1"}
                  onChange={(e) => setValue("status", Number(e.target.value))}
                  options={STATUS_OPTIONS}
                  placeholder="Chọn trạng thái"
                />
              </FormField>
            </div>
            <FormField
              label="Trụ sở chính"
              tooltip="Chỉ một chi nhánh là trụ sở chính."
            >
              <Checkbox
                id="salon-is-primary"
                checked={!!isPrimaryValue}
                onChange={(checked) => setValue("isPrimary", checked)}
                label="Đánh dấu là trụ sở chính"
              />
            </FormField>
            <FormField label="Mô tả" error={errors.description?.message}>
              <Textarea
                {...register("description")}
                placeholder="Mô tả chi nhánh..."
                rows={3}
                invalid={!!errors.description}
              />
            </FormField>
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
              loading={isPending || isUploading}
            >
              {isEdit ? "Cập nhật" : "Tạo chi nhánh"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function getDefaultValues(salon?: SalonDTO | null): SalonFormValues {
  if (salon) {
    return {
      name: salon.name ?? "",
      phone: salon.phone ?? "",
      email: salon.email ?? "",
      streetAddress: salon.streetAddress ?? "",
      provinceCode: salon.provinceCode ?? "",
      wardCode: salon.wardCode ?? "",
      fullAddress: salon.fullAddress ?? "",
      taxCode: salon.taxCode ?? "",
      workingDays: salon.workingDays ?? "",
      imageUrl: salon.imageUrl ?? "",
      description: salon.description ?? "",
      sortOrder: salon.sortOrder ?? 0,
      isPrimary: salon.isPrimary === true,
      status: salon.status ?? 1,
    };
  }
  return {
    name: "",
    phone: "",
    email: "",
    streetAddress: "",
    provinceCode: "",
    wardCode: "",
    fullAddress: "",
    taxCode: "",
    workingDays: "",
    imageUrl: "",
    description: "",
    sortOrder: 0,
    isPrimary: false,
    status: 1,
  };
}
