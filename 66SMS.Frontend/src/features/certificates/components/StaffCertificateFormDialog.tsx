import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { FormSection } from "@/shared/forms/FormSection";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { parseToDateInput } from "@/shared/utils/date.utils";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import { useStaffs } from "@/features/staffs/hooks/useStaffs";

import {
  useCreateStaffCertificate,
  useUpdateStaffCertificate,
} from "../hooks/useStaffCertificates";
import { useCertificateTypes } from "../hooks/useCertificateTypes";
import {
  createStaffCertificateSchema,
  type StaffCertificateFormValues,
} from "../schemas/staffCertificate.schema";
import type {
  StaffCertificateDTO,
  CertificateTypeDTO,
} from "../types/certificate.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: StaffCertificateDTO | null;
  staffId?: number;
}

const STATUS_OPTIONS = [
  { value: "0", label: "Chờ xác minh" },
  { value: "1", label: "Đang hiệu lực" },
  { value: "2", label: "Hết hạn" },
  { value: "3", label: "Đã thu hồi" },
];

function getDefaults(
  item?: StaffCertificateDTO | null,
  staffId?: number,
): StaffCertificateFormValues {
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

export function StaffCertificateFormDialog({
  open,
  onOpenChange,
  item,
  staffId,
}: Props) {
  const isEdit = !!item;
  const createMutation = useCreateStaffCertificate();
  const updateMutation = useUpdateStaffCertificate();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const typesQuery = useCertificateTypes({ pageIndex: 1, pageSize: 100 });
  const types = typesQuery.data?.data?.items ?? [];

  const showStaffSelect = !isEdit && !staffId;
  const staffsQuery = useStaffs({ pageIndex: 1, pageSize: 100 });
  const staffs = staffsQuery.data?.data?.items ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
  } = useForm<StaffCertificateFormValues>({
    resolver: zodResolver(
      createStaffCertificateSchema,
    ) as Resolver<StaffCertificateFormValues>,
    defaultValues: getDefaults(item, staffId),
  });

  useEffect(() => {
    if (!open) return;
    reset(getDefaults(item, staffId));
    setPendingFile(null);
  }, [open, item, staffId, reset]);

  const onSubmit = async (data: StaffCertificateFormValues) => {
    if (!isEdit && showStaffSelect && (!data.staffId || data.staffId <= 0)) {
      setError("staffId", { message: "Vui lòng chọn nhân viên" });
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

    if (isEdit && item?.id) {
      updateMutation.mutate(
        {
          id: item.id,
          payload: {
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
            if (result.isSuccess) onOpenChange(false);
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
          if (result.isSuccess) onOpenChange(false);
        },
      },
    );
  };

  const typeOptions = types.map((type: CertificateTypeDTO) => ({
    value: String(type.id),
    label: type.name ?? "",
  }));

  const staffOptions = staffs.map((staff: StaffDto) => ({
    value: String(staff.id),
    label: staff.fullName ?? "",
  }));

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa chứng chỉ" : "Thêm chứng chỉ nhân viên"}
      size="lg"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <FormSection icon={ShieldCheck} title="Thông tin chứng chỉ">
          {showStaffSelect ? (
            <FormField label="Nhân viên *" error={errors.staffId?.message}>
              <Select
                value={watch("staffId") ? String(watch("staffId")) : ""}
                onChange={(e) => setValue("staffId", Number(e.target.value))}
                options={staffOptions}
                placeholder="Chọn nhân viên"
                invalid={!!errors.staffId}
              />
            </FormField>
          ) : null}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField
              label="Loại chứng chỉ *"
              error={errors.certificateTypeId?.message}
            >
              <Select
                value={
                  watch("certificateTypeId")
                    ? String(watch("certificateTypeId"))
                    : ""
                }
                onChange={(e) =>
                  setValue("certificateTypeId", Number(e.target.value))
                }
                options={typeOptions}
                placeholder="Chọn loại chứng chỉ"
                invalid={!!errors.certificateTypeId}
              />
            </FormField>

            <FormField label="Trạng thái" error={errors.status?.message}>
              <Select
                value={String(watch("status") ?? 0)}
                onChange={(e) => setValue("status", Number(e.target.value))}
                options={STATUS_OPTIONS}
                invalid={!!errors.status}
              />
            </FormField>
          </div>

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

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
          </div>

          <FormField
            label="Ảnh scan chứng chỉ"
            error={errors.documentUrl?.message}
            help="Tải ảnh scan/chụp chứng chỉ (JPG, PNG, WEBP)."
          >
            <ImageUpload
              key={`${open}-${item?.id ?? "new"}`}
              value={watch("documentUrl") || item?.documentUrl}
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

        <div className="flex justify-end gap-2 border-t border-kit pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mb-0"
            onClick={() => onOpenChange(false)}
            disabled={isPending || isUploading}
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
            {isEdit ? "Cập nhật" : "Thêm chứng chỉ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
