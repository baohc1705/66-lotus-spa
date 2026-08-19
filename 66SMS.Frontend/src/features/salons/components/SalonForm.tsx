import {
  useProvinces,
  useWardsByProvince,
} from "@/features/address/hooks/useAddress";
import type {
  ProvinceDto,
  WardDto,
} from "@/features/address/types/address.types";
import {
  useCreateSalon,
  useSalonDetail,
  useUpdateSalon,
} from "@/features/salons/hooks/useSalons";
import type {
  CreateSalonRequest,
  SalonDto,
  SalonFullDto,
} from "@/features/salons/types/salon.types";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Input } from "@/shared/forms/Input";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, FileText, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useForm,
  useWatch,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";

const STATUS_OPTIONS = [
  { value: "1", label: "Hoạt động" },
  { value: "0", label: "Tạm đóng" },
  { value: "3", label: "Đóng cửa" },
];

const salonSchema = z.object({
  name: z
    .string()
    .min(1, "Tên chi nhánh không được để trống")
    .max(200, "Tối đa 200 ký tự"),
  phone: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .max(20, "Tối đa 20 ký tự"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(200)
    .optional()
    .or(z.literal("")),
  streetAddress: z.string().max(200).optional().or(z.literal("")),
  provinceCode: z
    .string()
    .min(1, "Tỉnh/Thành phố không được để trống")
    .max(20, "Tối đa 20 ký tự"),
  wardCode: z
    .string()
    .min(1, "Phường/Xã không được để trống")
    .max(20, "Tối đa 20 ký tự"),
  fullAddress: z.string().max(500).optional().or(z.literal("")),
  taxCode: z.string().max(20).optional().or(z.literal("")),
  workingDays: z.string().max(64).optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().optional(),
  isPrimary: z.boolean().optional(),
  status: z.coerce.number().optional(),
});

type SalonFormData = z.infer<typeof salonSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salon?: SalonDto | null;
}

function getDefaultValues(salon?: SalonFullDto | null): SalonFormData {
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

export function SalonForm({ open, onOpenChange, salon }: Props) {
  const isEdit = !!salon?.id;
  const createMutation = useCreateSalon();
  const updateMutation = useUpdateSalon();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const detailQuery = useSalonDetail(open && isEdit ? salon?.id : null);
  const detail = detailQuery.data?.data;

  const formKey = !open
    ? "closed"
    : isEdit
      ? `edit-${detail?.id ?? "loading"}`
      : "new";
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);
  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      setPendingFile(null);
    }
  }

  const provincesQuery = useProvinces();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<SalonFormData>({
    resolver: zodResolver(salonSchema) as Resolver<SalonFormData>,
    defaultValues: getDefaultValues(null),
  });

  const statusValue = useWatch({ control, name: "status" });
  const imageUrlValue = useWatch({ control, name: "imageUrl" });
  const isPrimaryValue = useWatch({ control, name: "isPrimary" });
  const selectedProvince = useWatch({ control, name: "provinceCode" });
  const selectedWard = useWatch({ control, name: "wardCode" });
  const wardsQuery = useWardsByProvince(selectedProvince);

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      if (detail) reset(getDefaultValues(detail));
      return;
    }
    reset(getDefaultValues(null));
  }, [open, isEdit, detail, reset]);

  async function onSubmit(data: SalonFormData) {
    setIsUploading(true);
    try {
      let imageBase64: string | undefined;
      if (pendingFile) {
        imageBase64 = await fileToBase64(pendingFile);
      }

      const provinces = provincesQuery.data?.data ?? [];
      let provinceName = "";
      for (let index = 0; index < provinces.length; index++) {
        if (provinces[index].code === data.provinceCode) {
          provinceName = provinces[index].name ?? "";
          break;
        }
      }

      const wards = wardsQuery.data?.data ?? [];
      let wardName = "";
      for (let index = 0; index < wards.length; index++) {
        if (wards[index].code === data.wardCode) {
          wardName = wards[index].name ?? "";
          break;
        }
      }

      const addressParts: string[] = [];
      if (data.streetAddress) addressParts.push(data.streetAddress);
      if (wardName) addressParts.push(wardName);
      if (provinceName) addressParts.push(provinceName);

      const payload: CreateSalonRequest = {
        ...data,
        imageUrl: data.imageUrl ?? "",
        imageBase64,
        fullAddress: addressParts.join(", "),
      };

      if (isEdit && salon?.id) {
        updateMutation.mutate(
          { id: salon.id, data: payload },
          {
            onSuccess: (result) => {
              if (result.isSuccess !== true) return;
              onOpenChange(false);
            },
          },
        );
        return;
      }

      createMutation.mutate(payload, {
        onSuccess: (result) => {
          if (result.isSuccess !== true) return;
          onOpenChange(false);
        },
      });
    } finally {
      setIsUploading(false);
    }
  }

  const provinceOptions: { value: string; label: string }[] = [];
  const provinceList = provincesQuery.data?.data ?? [];
  for (let index = 0; index < provinceList.length; index++) {
    const province = provinceList[index] as ProvinceDto;
    provinceOptions.push({
      value: province.code ?? "",
      label: province.name ?? "",
    });
  }

  const wardOptions: { value: string; label: string }[] = [];
  const wardList = wardsQuery.data?.data ?? [];
  for (let index = 0; index < wardList.length; index++) {
    const ward = wardList[index] as WardDto;
    wardOptions.push({
      value: ward.code ?? "",
      label: ward.name ?? "",
    });
  }

  const saving = isPending || isUploading;

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
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
            form="salon-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={saving}
          >
            {isEdit ? "Cập nhật" : "Tạo chi nhánh"}
          </Button>
        </>
      }
    >
      {isEdit && detailQuery.isLoading ? (
        <div className="py-16 text-center text-sm text-kit-muted">
          Đang tải thông tin chi nhánh...
        </div>
      ) : (
        <form
          id="salon-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormSection icon={Building2} title="Thông tin cơ bản">
            <div className="mb-5">
              <ImageUpload
                value={imageUrlValue || detail?.imageUrl}
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
                  value={isEdit ? (detail?.code ?? "") : ""}
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
                  value={selectedProvince ?? ""}
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
                  value={selectedWard ?? ""}
                  onChange={(value) =>
                    setValue("wardCode", value, { shouldValidate: true })
                  }
                  options={wardOptions}
                  placeholder="Chọn phường/xã"
                  searchPlaceholder="Tìm phường/xã..."
                  disabled={!selectedProvince || wardsQuery.isLoading}
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
                  onChange={(event) =>
                    setValue("status", Number(event.target.value))
                  }
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
        </form>
      )}
    </Modal>
  );
}
