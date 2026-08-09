import { useEffect, useState } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, KeyRound, Loader2, User } from "lucide-react";

import { Modal } from "@/shared/components/Modal";
import { Tabs } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Input } from "@/shared/forms/Input";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Select } from "@/shared/forms/Select";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { parseToDateInput } from "@/shared/utils/date.utils";
import {
  useProvinces,
  useWardsByProvince,
} from "@/features/address/hooks/useAddress";
import type {
  ProvinceDto,
  WardDto,
} from "@/features/address/types/address.types";
import { useGetAllRoles } from "@/features/auth/hooks/useGetAllRoles";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useSalons } from "@/features/salons/hooks/useSalons";
import type { RoleDTO } from "@/features/auth/types/auth.types";

import {
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useStaffDetail,
} from "../hooks/useStaffs";
import { createStaffSchema, updateStaffSchema } from "../schemas/staff.schema";
import type {
  StaffDto,
  StaffFullDto,
  StaffFormValues,
  CreateStaffPayload,
  UpdateStaffPayload,
} from "../types/staff.types";

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: StaffDto | StaffFullDto | null;
}

const GENDER_OPTIONS = [
  { value: "0", label: "Nam" },
  { value: "1", label: "Nữ" },
  { value: "2", label: "Khác" },
];

const CONTRACT_TYPE_OPTIONS = [
  { value: "fulltime", label: "Toàn thời gian" },
  { value: "parttime", label: "Bán thời gian" },
  { value: "probation", label: "Thử việc" },
];

const STATUS_OPTIONS = [
  { value: "1", label: "Đang làm" },
  { value: "0", label: "Tạm nghỉ" },
  { value: "2", label: "Nghỉ việc" },
];

const SALARY_TYPE_OPTIONS = [
  { value: "1", label: "Theo giờ" },
  { value: "2", label: "Theo ngày công" },
];

export function StaffFormDialog({
  open,
  onOpenChange,
  staff,
}: StaffFormDialogProps) {
  const isEdit = !!staff?.id;
  const managedSalonId = useAuthStore((s) => s.managedSalonId);
  const { data: salonsResult } = useSalons({ pageIndex: 1, pageSize: 100 });
  const salons = salonsResult?.data?.items ?? [];
  const { data: rolesResult } = useGetAllRoles();
  const roles = rolesResult?.data ?? [];

  const createMutation = useCreateStaffMutation();
  const updateMutation = useUpdateStaffMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const detailQuery = useStaffDetail(open && isEdit ? staff!.id! : null);
  const detail = detailQuery.data?.data;
  const formSource = isEdit ? (detail ?? null) : null;

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(
      isEdit ? updateStaffSchema : createStaffSchema,
    ) as Resolver<StaffFormValues>,
    defaultValues: getDefaultValues(null, managedSalonId),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedProvince = watch("provinceCode");
  const avatarUrl = watch("avatarUrl");
  const provincesQuery = useProvinces();
  const wardsQuery = useWardsByProvince(selectedProvince);

  useEffect(() => {
    if (!open) return;
    setPendingFile(null);
    setActiveTab("personal");
    if (isEdit) {
      if (formSource) reset(getDefaultValues(formSource, managedSalonId));
    } else {
      reset(getDefaultValues(null, managedSalonId));
    }
  }, [open, isEdit, formSource, reset, managedSalonId]);

  function goToErrorTab(formErrors: FieldErrors<StaffFormValues>) {
    if (
      formErrors.fullName ||
      formErrors.phone ||
      formErrors.dateOfBirth ||
      formErrors.gender ||
      formErrors.nationalId ||
      formErrors.provinceCode ||
      formErrors.wardCode ||
      formErrors.streetAddress
    ) {
      setActiveTab("personal");
      return;
    }
    if (
      formErrors.salonId ||
      formErrors.hireDate ||
      formErrors.contractType ||
      formErrors.salaryType ||
      formErrors.basicSalary ||
      formErrors.status ||
      formErrors.role
    ) {
      setActiveTab("work");
    }
  }

  const onSubmit = async (data: StaffFormValues) => {
    setIsUploading(true);
    try {
      let avatarBase64: string | undefined;
      if (pendingFile) {
        avatarBase64 = await fileToBase64(pendingFile);
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

      const payload: CreateStaffPayload = {
        salonId: data.salonId,
        fullName: data.fullName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender,
        nationalId: data.nationalId || undefined,
        hireDate: data.hireDate || undefined,
        contractType: data.contractType || undefined,
        basicSalary: data.basicSalary,
        salaryType: data.salaryType,
        status: data.status,
        streetAddress: data.streetAddress || undefined,
        provinceCode: data.provinceCode || undefined,
        wardCode: data.wardCode || undefined,
        fullAddress: parts.join(", "),
        role: data.role,
      };

      if (avatarBase64) {
        payload.avatarUrl = avatarBase64;
      }

      if (isEdit && staff?.id) {
        updateMutation.mutate(
          { id: staff.id, payload: payload as UpdateStaffPayload },
          {
            onSuccess: (result) => {
              if (result.isSuccess) onOpenChange(false);
            },
          },
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
      size="xl"
      scrollable
    >
      {isEdit && detailQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-kit-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Đang tải thông tin nhân viên...</span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit, goToErrorTab)}
          className="space-y-3"
        >
          <Tabs
            variant="body"
            activeId={activeTab}
            onChange={setActiveTab}
            tabs={[
              {
                id: "personal",
                label: "Thông tin cá nhân",
                content: (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-kit-heading">
                      <User className="h-4 w-4 text-kit-primary" />
                      Hồ sơ cá nhân
                    </div>

                    <ImageUpload
                      key={`${open}-${staff?.id ?? "new"}`}
                      value={avatarUrl || staff?.avatarUrl}
                      onFileChange={setPendingFile}
                      shape="circle"
                      label="Đổi ảnh đại diện"
                    />

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <FormField
                        label="Họ tên *"
                        tooltip="Vui lòng nhập họ và tên đầy đủ của nhân viên"
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
                        label="Ngày sinh"
                        error={errors.dateOfBirth?.message}
                      >
                        <Input
                          {...register("dateOfBirth")}
                          type="date"
                          invalid={!!errors.dateOfBirth}
                        />
                      </FormField>

                      <FormField label="Giới tính">
                        <Select
                          value={watch("gender")?.toString() ?? ""}
                          onChange={(e) =>
                            setValue("gender", Number(e.target.value))
                          }
                          options={GENDER_OPTIONS}
                          placeholder="Chọn giới tính"
                        />
                      </FormField>

                      <FormField
                        label="CMND/CCCD"
                        error={errors.nationalId?.message}
                      >
                        <Input
                          {...register("nationalId")}
                          placeholder="012345678901"
                          invalid={!!errors.nationalId}
                        />
                      </FormField>

                      <FormField
                        label="Tỉnh/Thành phố"
                        error={errors.provinceCode?.message}
                      >
                        <SearchableSelect
                          value={watch("provinceCode") ?? ""}
                          onChange={(v: string) => {
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
                          invalid={!!errors.provinceCode}
                        />
                      </FormField>

                      <FormField
                        label="Phường/Xã"
                        error={errors.wardCode?.message}
                      >
                        <SearchableSelect
                          value={watch("wardCode") ?? ""}
                          onChange={(v: string) => setValue("wardCode", v)}
                          options={(wardsQuery.data?.data ?? []).map(
                            (w: WardDto) => ({
                              value: w.code ?? "",
                              label: w.name ?? "",
                            }),
                          )}
                          placeholder="Chọn phường/xã"
                          searchPlaceholder="Tìm phường/xã..."
                          disabled={
                            !watch("provinceCode") || wardsQuery.isLoading
                          }
                          invalid={!!errors.wardCode}
                        />
                      </FormField>

                      <FormField
                        label="Số nhà, tên đường"
                        error={errors.streetAddress?.message}
                        className="md:col-span-2"
                      >
                        <Input
                          {...register("streetAddress")}
                          placeholder="123 Đường ABC"
                          invalid={!!errors.streetAddress}
                        />
                      </FormField>
                    </div>
                  </div>
                ),
              },
              {
                id: "work",
                label: "Công việc",
                content: (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-kit-heading">
                      <Briefcase className="h-4 w-4 text-kit-primary" />
                      Thông tin công việc
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <FormField
                        label="Chi nhánh *"
                        tooltip="Chọn chi nhánh mà nhân viên này thuộc về"
                        error={
                          (errors as Record<string, { message?: string }>)
                            .salonId?.message
                        }
                      >
                        <Select
                          value={watch("salonId")?.toString() ?? ""}
                          onChange={(e) =>
                            setValue("salonId", Number(e.target.value))
                          }
                          disabled={salonsResult === undefined}
                          placeholder={
                            salonsResult === undefined
                              ? "Đang tải chi nhánh..."
                              : salons.length === 0
                                ? "Không có chi nhánh"
                                : "Chọn chi nhánh..."
                          }
                        >
                          <option value="">Chọn chi nhánh</option>
                          {salons.map((s) => (
                            <option key={s.id} value={String(s.id)}>
                              {s.name}
                            </option>
                          ))}
                        </Select>
                      </FormField>

                      <FormField
                        label="Ngày vào làm"
                        error={errors.hireDate?.message}
                      >
                        <Input
                          {...register("hireDate")}
                          type="date"
                          invalid={!!errors.hireDate}
                        />
                      </FormField>

                      <FormField label="Loại hợp đồng">
                        <Select
                          value={watch("contractType") ?? ""}
                          onChange={(e) =>
                            setValue("contractType", e.target.value)
                          }
                          options={CONTRACT_TYPE_OPTIONS}
                          placeholder="Chọn loại HĐ"
                        />
                      </FormField>

                      <FormField label="Loại lương">
                        <Select
                          value={watch("salaryType")?.toString() ?? "2"}
                          onChange={(e) =>
                            setValue("salaryType", Number(e.target.value))
                          }
                          options={SALARY_TYPE_OPTIONS}
                        />
                      </FormField>

                      <FormField
                        label="Đơn giá (theo giờ/ngày tùy loại lương)"
                        error={errors.basicSalary?.message}
                      >
                        <Input
                          {...register("basicSalary", { valueAsNumber: true })}
                          type="number"
                          placeholder="10000000"
                          invalid={!!errors.basicSalary}
                        />
                      </FormField>

                      <FormField label="Trạng thái">
                        <Select
                          value={watch("status")?.toString() ?? "1"}
                          onChange={(e) =>
                            setValue("status", Number(e.target.value))
                          }
                          options={STATUS_OPTIONS}
                        />
                      </FormField>

                      <FormField label="Vai trò *" error={errors.role?.message}>
                        <Select
                          value={watch("role") ?? ""}
                          onChange={(e) => setValue("role", e.target.value)}
                          disabled={rolesResult === undefined}
                          invalid={!!errors.role}
                          placeholder={
                            rolesResult === undefined
                              ? "Đang tải vai trò..."
                              : roles.length === 0
                                ? "Không có vai trò"
                                : "Chọn vai trò..."
                          }
                        >
                          <option value="">Chọn vai trò</option>
                          {roles.map((r: RoleDTO) => (
                            <option key={r.id} value={r.code || r.name}>
                              {r.name}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                    </div>

                    {!isEdit ? (
                      <div className="flex items-start gap-2.5 rounded-lg border border-kit bg-kit-page px-3.5 py-3 text-xs text-kit-body">
                        <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-kit-primary" />
                        <div>
                          <p className="font-semibold text-kit-heading">
                            Tài khoản đăng nhập tự động
                          </p>
                          <p className="mt-0.5 text-kit-muted">
                            Tài khoản (tên đăng nhập & mật khẩu mặc định) sẽ
                            được hệ thống tạo tự động dựa trên mã nhân viên sau
                            khi bạn nhấn tạo mới.
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />

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
              {isEdit ? "Cập nhật" : "Tạo nhân viên"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function getDefaultValues(
  staff?: StaffFullDto | null,
  managedSalonId?: number | null,
): StaffFormValues {
  if (staff) {
    return {
      salonId: staff.salonId ?? managedSalonId ?? undefined,
      fullName: staff.fullName ?? "",
      phone: staff.phone ?? "",
      dateOfBirth: parseToDateInput(staff.dateOfBirth),
      gender: staff.gender ?? undefined,
      nationalId: staff.nationalId ?? "",
      avatarUrl: staff.avatarUrl ?? "",
      hireDate: parseToDateInput(staff.hireDate),
      contractType: staff.contractType ?? "",
      basicSalary: staff.basicSalary ?? undefined,
      salaryType: staff.salaryType ?? 2,
      status: staff.status ?? 1,
      role: staff.role ?? "staff",
      streetAddress: staff.streetAddress ?? "",
      provinceCode: staff.provinceCode ?? "",
      wardCode: staff.wardCode ?? "",
      fullAddress: staff.fullAddress ?? "",
    };
  }
  return {
    salonId: managedSalonId ?? undefined,
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: undefined,
    nationalId: "",
    avatarUrl: "",
    hireDate: "",
    contractType: "",
    basicSalary: undefined,
    salaryType: 2,
    status: 1,
    role: "staff",
    streetAddress: "",
    provinceCode: "",
    wardCode: "",
    fullAddress: "",
  };
}
