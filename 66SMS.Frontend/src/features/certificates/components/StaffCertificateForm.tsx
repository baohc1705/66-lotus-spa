import { useCertificateTypes } from "@/features/certificates/hooks/useCertificateTypes";
import {
  useCreateMineCertificate,
  useCreateStaffCertificate,
  useUpdateStaffCertificate,
} from "@/features/certificates/hooks/useStaffCertificates";
import type { StaffCertificateDto } from "@/features/certificates/types/certificate.types";
import { useStaffs } from "@/features/staffs/hooks/useStaffs";
import type { StaffDto } from "@/features/staffs/types/staff.types";
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
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";
import type { CertificateTypeDto } from "../types/certificateType.types";

// Validate dữ liệu client side
const staffCertificateSchema = z.object({
  staffId: z.coerce.number().min(1, "Vui lòng chọn nhân viên"),
  certificateTypeId: z.coerce.number().min(1, "Vui lòng chọn loại chứng chỉ"),
  certificateName: z
    .string()
    .min(1, "Tên chứng chỉ không được để trống")
    .max(200, "Tối đa 200 ký tự"),
  certificateNumber: z
    .string()
    .max(50, "Tối đa 50 ký tự")
    .optional()
    .or(z.literal("")),
  issuingOrganization: z
    .string()
    .min(1, "Tổ chức cấp không được để trống")
    .max(200, "Tối đa 200 ký tự"),
  issuedDate: z.string().min(1, "Ngày cấp không được để trống"),
  expiryDate: z.string().optional().or(z.literal("")),
  documentUrl: z.string().optional().or(z.literal("")),
  note: z.string().max(500, "Tối đa 500 ký tự").optional().or(z.literal("")),
  status: z.coerce.number().min(0).optional().default(0),
});

type StaffCertificateFormData = z.infer<typeof staffCertificateSchema>;

const STATUS_OPTIONS = [
  { value: "0", label: "Chờ xác minh" },
  { value: "1", label: "Đang hiệu lực" },
  { value: "2", label: "Hết hạn" },
  { value: "3", label: "Đã thu hồi" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffCertificate?: StaffCertificateDto | null;
  staffId?: number;
  submitMode?: boolean;
}

function getDefaultValues(
  item?: StaffCertificateDto | null,
  staffId?: number,
): StaffCertificateFormData {
  return {
    staffId: item?.staffId ?? staffId ?? 0,
    certificateTypeId: item?.certificateTypeId ?? 0,
    certificateName: item?.certificateName ?? "",
    certificateNumber: item?.certificateNumber ?? "",
    issuingOrganization: item?.issuingOrganization ?? "",
    issuedDate: parseToDateInput(item?.issuedDate),
    expiryDate: parseToDateInput(item?.expiryDate),
    documentUrl: item?.documentUrl ?? "",
    note: item?.note ?? "",
    status: item?.status ?? 0,
  };
}

export function StaffCertificateForm({
  open,
  onOpenChange,
  staffCertificate,
  staffId,
  submitMode = false,
}: Props) {
  const isEdit = !!staffCertificate;
  const createMutation = useCreateStaffCertificate();
  const createMineMutation = useCreateMineCertificate();
  const updateMutation = useUpdateStaffCertificate();
  const isPending =
    createMutation.isPending ||
    createMineMutation.isPending ||
    updateMutation.isPending;

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Reset form khi mở modal bằng formKey
  const formKey = !open
    ? "closed"
    : isEdit
      ? `edit-${staffCertificate?.id ?? "loading"}`
      : "new";
  const [appliedFormKey, setAppliedFormKey] = useState(formKey);

  // Lấy danh sách loại chứng chỉ
  const typesQuery = useCertificateTypes({ pageIndex: 1, pageSize: 100 });
  const types = typesQuery.data?.data?.items ?? [];

  // Chỉ hiện chọn nhân viên khi tạo mới + không có staffId + không phải submitMode
  const showStaffSelect = !isEdit && !staffId && !submitMode;
  const staffsQuery = useStaffs(
    { pageIndex: 1, pageSize: 100 },
    showStaffSelect,
  );
  const staffs = staffsQuery.data?.data?.items ?? [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    setError,
  } = useForm<StaffCertificateFormData>({
    resolver: zodResolver(
      staffCertificateSchema,
    ) as Resolver<StaffCertificateFormData>,
    defaultValues: getDefaultValues(null, staffId),
  });

  const selectedStaffId = useWatch({ control, name: "staffId" });
  const selectedTypeId = useWatch({ control, name: "certificateTypeId" });
  const status = useWatch({ control, name: "status" });
  const documentUrl = useWatch({ control, name: "documentUrl" });

  if (formKey !== appliedFormKey) {
    setAppliedFormKey(formKey);
    if (open === true) {
      reset(getDefaultValues(staffCertificate, staffId));
      setPendingFile(null);
    }
  }

  // Build options cho select
  const typeOptions: { value: string; label: string }[] = [];
  for (let index = 0; index < types.length; index++) {
    const type: CertificateTypeDto = types[index];
    if (!type.id) continue;
    typeOptions.push({ value: String(type.id), label: type.name ?? "" });
  }

  const staffOptions: { value: string; label: string }[] = [];
  for (let index = 0; index < staffs.length; index++) {
    const staff: StaffDto = staffs[index];
    if (!staff.id) continue;
    staffOptions.push({ value: String(staff.id), label: staff.fullName ?? "" });
  }

  // Sửa trước, tạo sau
  async function onSubmit(data: StaffCertificateFormData) {
    if (!isEdit && showStaffSelect && (!data.staffId || data.staffId <= 0)) {
      setError("staffId", { message: "Vui lòng chọn nhân viên" });
      return;
    }

    if (!data.certificateTypeId || data.certificateTypeId <= 0) {
      setError("certificateTypeId", {
        message: "Vui lòng chọn loại chứng chỉ",
      });
      return;
    }

    let imageBase64: string | undefined;
    if (pendingFile) {
      setIsUploading(true);
      try {
        imageBase64 = await fileToBase64(pendingFile);
      } finally {
        setIsUploading(false);
      }
    }

    if (isEdit && staffCertificate?.id) {
      updateMutation.mutate(
        {
          id: staffCertificate.id,
          data: {
            certificateTypeId: data.certificateTypeId,
            certificateName: data.certificateName,
            certificateNumber: data.certificateNumber || undefined,
            issuingOrganization: data.issuingOrganization,
            issuedDate: data.issuedDate,
            expiryDate: data.expiryDate || undefined,
            documentUrl: data.documentUrl || undefined,
            imageBase64,
            note: data.note || undefined,
            status: data.status,
          },
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess !== true) return;
            onOpenChange(false);
          },
        },
      );
      return;
    }

    if (submitMode) {
      createMineMutation.mutate(
        {
          certificateTypeId: data.certificateTypeId,
          certificateName: data.certificateName,
          certificateNumber: data.certificateNumber || undefined,
          issuingOrganization: data.issuingOrganization,
          issuedDate: data.issuedDate,
          expiryDate: data.expiryDate || undefined,
          documentUrl: data.documentUrl || undefined,
          imageBase64,
          note: data.note || undefined,
        },
        {
          onSuccess: (result) => {
            if (result.isSuccess !== true) return;
            onOpenChange(false);
          },
        },
      );
      return;
    }

    createMutation.mutate(
      {
        staffId: data.staffId,
        certificateTypeId: data.certificateTypeId,
        certificateName: data.certificateName,
        certificateNumber: data.certificateNumber || undefined,
        issuingOrganization: data.issuingOrganization,
        issuedDate: data.issuedDate,
        expiryDate: data.expiryDate || undefined,
        documentUrl: data.documentUrl || undefined,
        imageBase64,
        note: data.note || undefined,
        status: data.status,
      },
      {
        onSuccess: (result) => {
          if (result.isSuccess !== true) return;
          onOpenChange(false);
        },
      },
    );
  }

  let dialogTitle = "Thêm chứng chỉ nhân viên";
  if (isEdit) dialogTitle = "Chỉnh sửa chứng chỉ";
  else if (submitMode) dialogTitle = "Nộp chứng chỉ";

  let submitLabel = "Thêm chứng chỉ";
  if (isEdit) submitLabel = "Cập nhật";
  else if (submitMode) submitLabel = "Nộp chứng chỉ";

  const saving = isPending || isUploading;

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={dialogTitle}
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
            form="staff-certificate-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={saving}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        id="staff-certificate-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        <FormSection icon={ShieldCheck} title="Thông tin chứng chỉ">
          {showStaffSelect ? (
            <FormField label="Nhân viên *" error={errors.staffId?.message}>
              <SearchableSelect
                value={selectedStaffId ? String(selectedStaffId) : ""}
                onChange={(value: string) => {
                  if (!value) {
                    setValue("staffId", 0, { shouldValidate: true });
                    return;
                  }
                  setValue("staffId", Number(value), { shouldValidate: true });
                }}
                options={staffOptions}
                placeholder="Chọn nhân viên"
                searchPlaceholder="Tìm nhân viên..."
                invalid={!!errors.staffId}
              />
            </FormField>
          ) : null}

          <FormRow>
            <FormField
              label="Loại chứng chỉ *"
              error={errors.certificateTypeId?.message}
            >
              <SearchableSelect
                value={selectedTypeId ? String(selectedTypeId) : ""}
                onChange={(value: string) => {
                  if (!value) {
                    setValue("certificateTypeId", 0, { shouldValidate: true });
                    return;
                  }
                  setValue("certificateTypeId", Number(value), {
                    shouldValidate: true,
                  });
                }}
                options={typeOptions}
                placeholder="Chọn loại chứng chỉ"
                searchPlaceholder="Tìm loại chứng chỉ..."
                invalid={!!errors.certificateTypeId}
              />
            </FormField>

            {!submitMode ? (
              <FormField label="Trạng thái" error={errors.status?.message}>
                <Select
                  value={String(status ?? 0)}
                  onChange={(event) =>
                    setValue("status", Number(event.target.value))
                  }
                  options={STATUS_OPTIONS}
                  invalid={!!errors.status}
                />
              </FormField>
            ) : null}
          </FormRow>

          <FormField
            label="Tên chứng chỉ *"
            error={errors.certificateName?.message}
          >
            <Input
              {...register("certificateName")}
              placeholder="Chứng chỉ Massage Trị liệu Quốc tế"
              invalid={!!errors.certificateName}
            />
          </FormField>

          <FormRow>
            <FormField
              label="Số chứng chỉ"
              error={errors.certificateNumber?.message}
            >
              <Input
                {...register("certificateNumber")}
                placeholder="VN-2024-12345"
                invalid={!!errors.certificateNumber}
              />
            </FormField>

            <FormField
              label="Tổ chức cấp *"
              error={errors.issuingOrganization?.message}
            >
              <Input
                {...register("issuingOrganization")}
                placeholder="Bộ Y tế / CIDESCO"
                invalid={!!errors.issuingOrganization}
              />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField label="Ngày cấp *" error={errors.issuedDate?.message}>
              <Input
                {...register("issuedDate")}
                type="date"
                invalid={!!errors.issuedDate}
              />
            </FormField>

            <FormField
              label="Ngày hết hạn"
              help="Để trống nếu không hết hạn"
              error={errors.expiryDate?.message}
            >
              <Input
                {...register("expiryDate")}
                type="date"
                invalid={!!errors.expiryDate}
              />
            </FormField>
          </FormRow>

          <FormField
            label="Ảnh scan chứng chỉ"
            error={errors.documentUrl?.message}
            help="Tải ảnh scan/chụp chứng chỉ (JPG, PNG, WEBP)."
          >
            <ImageUpload
              key={`${open}-${staffCertificate?.id ?? "new"}`}
              value={documentUrl || staffCertificate?.documentUrl}
              onFileChange={(file: File | null) => {
                setPendingFile(file);
                if (!file) setValue("documentUrl", "");
              }}
              size="lg"
              label="Chọn ảnh"
            />
          </FormField>

          <FormField label="Ghi chú" error={errors.note?.message}>
            <Textarea
              {...register("note")}
              placeholder="Ghi chú thêm..."
              rows={3}
              invalid={!!errors.note}
            />
          </FormField>
        </FormSection>
      </form>
    </Modal>
  );
}
