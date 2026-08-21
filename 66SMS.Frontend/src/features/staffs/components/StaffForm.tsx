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
import type { RoleDTO } from "@/features/auth/types/auth.types";
import { useSalons } from "@/features/salons/hooks/useSalons";
import {
  useCreateStaff,
  useStaffDetail,
  useUpdateStaff,
} from "@/features/staffs/hooks/useStaffs";
import type {
  CreateStaffRequest,
  StaffDto,
  StaffFullDto,
  UpdateStaffRequest,
} from "@/features/staffs/types/staff.types";
import { Modal } from "@/shared/components/Modal";
import { Tabs } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import { CurrencyInput } from "@/shared/forms/CurrencyInput";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Input } from "@/shared/forms/Input";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import { Select } from "@/shared/forms/Select";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { parseToDateInput } from "@/shared/utils/date.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, User } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useForm,
  useWatch,
  type FieldErrors,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";

const VIETNAM_PHONE_REGEX = /^(0[2-9]|84[2-9])\d{8}$/;

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
  { value: "3", label: "Nghỉ việc" },
];

const SALARY_TYPE_OPTIONS = [
  { value: "1", label: "Theo giờ" },
  { value: "2", label: "Theo ngày công" },
];

// Validate dữ liệu client side
const staffSchema = z.object({
  salonId: z.coerce.number().min(1, "Vui lòng chọn chi nhánh"),
  fullName: z
    .string()
    .min(1, "Họ tên không được để trống")
    .max(100, "Tối đa 100 ký tự"),
  phone: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .regex(VIETNAM_PHONE_REGEX, "Số điện thoại không hợp lệ"),
  avatarUrl: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.coerce.number().min(0).optional(),
  nationalId: z
    .string()
    .max(20, "Tối đa 20 ký tự")
    .optional()
    .or(z.literal("")),
  hireDate: z.string().optional().or(z.literal("")),
  contractType: z
    .string()
    .max(100, "Tối đa 100 ký tự")
    .optional()
    .or(z.literal("")),
  basicSalary: z.coerce.number().min(0, "Lương không được âm").optional(),
  salaryType: z.coerce.number().min(1).max(2).optional(),
  status: z.coerce.number().min(0).optional(),
  role: z.string().optional(),
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(100, "Tối đa 100 ký tự")
    .optional()
    .or(z.literal("")),
  streetAddress: z.string().max(200).optional().or(z.literal("")),
  provinceCode: z.string().max(20).optional().or(z.literal("")),
  wardCode: z.string().max(20).optional().or(z.literal("")),
  fullAddress: z.string().max(500).optional().or(z.literal("")),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: StaffDto | StaffFullDto | null;
}

// Hàm getDefaultValues để lấy giá trị mặc định cho form
function getDefaultValues(
  staff?: StaffFullDto | null,
  managedSalonId?: number | null,
): StaffFormData {
  if (!staff) {
    return {
      salonId: managedSalonId ?? 0,
      fullName: "",
      phone: "",
      email: "",
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

  return {
    salonId: staff.salonId != null ? staff.salonId : (managedSalonId ?? 0),
    fullName: staff.fullName ?? "",
    phone: staff.phone ?? "",
    email: staff.email ?? "",
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

export function StaffForm({ open, onOpenChange, staff }: Props) {
  // Kiểm tra xem có phải là chỉnh sửa không
  const isEdit = !!staff?.id;
  const managedSalonId = useAuthStore((state) => state.managedSalonId);
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  // Kiểm tra xem có phải là đang xử lý không
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Sửa thì load chi tiết để lấy địa chỉ, ngày sinh, loại lương
  const detailQuery = useStaffDetail(open && isEdit ? staff?.id : null);
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
      setActiveTab("personal");
      setPendingFile(null);
    }
  }

  const { data: salonsResult } = useSalons({ pageIndex: 1, pageSize: 100 });
  const salons = salonsResult?.data?.items ?? [];
  const { data: rolesResult } = useGetAllRoles();
  const roles = rolesResult?.data ?? [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema) as Resolver<StaffFormData>,
    defaultValues: getDefaultValues(null, managedSalonId),
  });

  const selectedProvince = useWatch({ control, name: "provinceCode" });
  const avatarUrl = useWatch({ control, name: "avatarUrl" });
  const selectedSalonId = useWatch({ control, name: "salonId" });
  const gender = useWatch({ control, name: "gender" });
  const contractType = useWatch({ control, name: "contractType" });
  const salaryType = useWatch({ control, name: "salaryType" });
  const basicSalary = useWatch({ control, name: "basicSalary" });
  const status = useWatch({ control, name: "status" });
  const role = useWatch({ control, name: "role" });
  const wardCode = useWatch({ control, name: "wardCode" });

  const provincesQuery = useProvinces();
  const wardsQuery = useWardsByProvince(selectedProvince);

  const salonOptions: { value: string; label: string }[] = [];
  for (let index = 0; index < salons.length; index++) {
    const salon = salons[index];
    if (!salon.id) continue;
    salonOptions.push({
      value: String(salon.id),
      label: salon.name ?? "",
    });
  }

  const provinceOptions: { value: string; label: string }[] = [];
  const provinces = provincesQuery.data?.data ?? [];
  for (let index = 0; index < provinces.length; index++) {
    const province = provinces[index];
    provinceOptions.push({
      value: province.code ?? "",
      label: province.name ?? "",
    });
  }

  const wardOptions: { value: string; label: string }[] = [];
  const wards = wardsQuery.data?.data ?? [];
  for (let index = 0; index < wards.length; index++) {
    const ward = wards[index];
    wardOptions.push({
      value: ward.code ?? "",
      label: ward.name ?? "",
    });
  }

  // Reset form khi mở modal; sửa thì đợi API chi tiết xong
  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      if (detail) reset(getDefaultValues(detail, managedSalonId));
      return;
    }
    reset(getDefaultValues(null, managedSalonId));
  }, [open, isEdit, detail, reset, managedSalonId]);

  // Hàm goToErrorTab để chuyển tab khi có lỗi validate
  function goToErrorTab(formErrors: FieldErrors<StaffFormData>) {
    if (
      formErrors.fullName ||
      formErrors.phone ||
      formErrors.email ||
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
    setActiveTab("work");
  }

  // Hàm onSubmit để xử lý dữ liệu form khi submit
  async function onSubmit(values: StaffFormData) {
    setIsUploading(true);
    try {
      let avatarBase64: string | undefined;
      if (pendingFile) {
        avatarBase64 = await fileToBase64(pendingFile);
      }

      let provinceName = "";
      for (let index = 0; index < provinces.length; index++) {
        const province: ProvinceDto = provinces[index];
        if (province.code === values.provinceCode) {
          provinceName = province.name ?? "";
          break;
        }
      }

      let wardName = "";
      for (let index = 0; index < wards.length; index++) {
        const ward: WardDto = wards[index];
        if (ward.code === values.wardCode) {
          wardName = ward.name ?? "";
          break;
        }
      }

      const addressParts: string[] = [];
      if (values.streetAddress) addressParts.push(values.streetAddress);
      if (wardName) addressParts.push(wardName);
      if (provinceName) addressParts.push(provinceName);

      if (isEdit && staff?.id) {
        const data: UpdateStaffRequest = {
          salonId: values.salonId,
          fullName: values.fullName,
          phone: values.phone,
          email: values.email || undefined,
          dateOfBirth: values.dateOfBirth || undefined,
          gender: values.gender,
          nationalId: values.nationalId || undefined,
          hireDate: values.hireDate || undefined,
          contractType: values.contractType || undefined,
          basicSalary: values.basicSalary,
          salaryType: values.salaryType,
          status: values.status,
          streetAddress: values.streetAddress || undefined,
          provinceCode: values.provinceCode || undefined,
          wardCode: values.wardCode || undefined,
          fullAddress: addressParts.join(", "),
          role: values.role,
        };
        if (avatarBase64) data.avatarUrl = avatarBase64;

        updateMutation.mutate(
          { id: staff.id, data },
          {
            onSuccess: (result) => {
              if (result.isSuccess !== true) return;
              onOpenChange(false);
            },
          },
        );
        return;
      }

      const payload: CreateStaffRequest = {
        salonId: values.salonId,
        fullName: values.fullName,
        phone: values.phone,
        email: values.email || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender,
        nationalId: values.nationalId || undefined,
        hireDate: values.hireDate || undefined,
        contractType: values.contractType || undefined,
        basicSalary: values.basicSalary,
        salaryType: values.salaryType,
        status: values.status,
        streetAddress: values.streetAddress || undefined,
        provinceCode: values.provinceCode || undefined,
        wardCode: values.wardCode || undefined,
        fullAddress: addressParts.join(", "),
        role: values.role,
      };
      if (avatarBase64) payload.avatarUrl = avatarBase64;

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

  const saving = isPending || isUploading;

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
      size="xl"
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
            form="staff-form"
            variant="admin"
            size="sm"
            className="mb-0"
            loading={saving}
          >
            {isEdit ? "Cập nhật" : "Tạo nhân viên"}
          </Button>
        </>
      }
    >
      {isEdit && detailQuery.isLoading ? (
        <div className="py-16 text-center text-sm text-kit-muted">
          Đang tải thông tin nhân viên...
        </div>
      ) : (
        <form
          id="staff-form"
          onSubmit={handleSubmit(onSubmit, goToErrorTab)}
          className="space-y-4"
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
                    <FormSection title="Hồ sơ cá nhân" icon={User}>
                      <FormField label="Ảnh đại diện">
                        <ImageUpload
                          key={`${open}-${staff?.id ?? "new"}`}
                          value={avatarUrl || staff?.avatarUrl}
                          onFileChange={setPendingFile}
                          shape="circle"
                          label="Đổi ảnh đại diện"
                        />
                      </FormField>

                      <FormRow>
                        <FormField
                          label="Họ tên"
                          required
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
                          label="Số điện thoại"
                          required
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
                          label="Email"
                          tooltip="Để trống thì hệ thống tự tạo email theo mã nhân viên"
                          error={errors.email?.message}
                        >
                          <Input
                            {...register("email")}
                            type="email"
                            placeholder="nv@lotusspa.com.vn"
                            invalid={!!errors.email}
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
                            value={gender?.toString() ?? ""}
                            onChange={(event) =>
                              setValue("gender", Number(event.target.value))
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
                            value={selectedProvince ?? ""}
                            onChange={(value: string) => {
                              setValue("provinceCode", value);
                              setValue("wardCode", "");
                            }}
                            options={provinceOptions}
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
                            value={wardCode ?? ""}
                            onChange={(value: string) =>
                              setValue("wardCode", value)
                            }
                            options={wardOptions}
                            placeholder="Chọn phường/xã"
                            searchPlaceholder="Tìm phường/xã..."
                            disabled={!selectedProvince || wardsQuery.isLoading}
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
                      </FormRow>
                    </FormSection>
                  </div>
                ),
              },
              {
                id: "work",
                label: "Thông tin công việc",
                content: (
                  <div className="space-y-4">
                    <FormSection title="Thông tin công việc" icon={Briefcase}>
                      <FormRow>
                        <FormField
                          label="Chi nhánh"
                          required
                          tooltip="Chọn chi nhánh mà nhân viên này thuộc về"
                          error={errors.salonId?.message}
                        >
                          <SearchableSelect
                            value={
                              selectedSalonId ? String(selectedSalonId) : ""
                            }
                            onChange={(value: string) => {
                              if (!value) {
                                setValue("salonId", 0, {
                                  shouldValidate: true,
                                });
                                return;
                              }
                              setValue("salonId", Number(value), {
                                shouldValidate: true,
                              });
                            }}
                            options={salonOptions}
                            disabled={salonsResult === undefined}
                            placeholder={
                              salonsResult === undefined
                                ? "Đang tải chi nhánh..."
                                : salons.length === 0
                                  ? "Không có chi nhánh"
                                  : "Chọn chi nhánh..."
                            }
                            searchPlaceholder="Tìm chi nhánh..."
                            invalid={!!errors.salonId}
                          />
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
                            value={contractType ?? ""}
                            onChange={(event) =>
                              setValue("contractType", event.target.value)
                            }
                            options={CONTRACT_TYPE_OPTIONS}
                            placeholder="Chọn loại HĐ"
                          />
                        </FormField>

                        <FormField label="Loại lương">
                          <Select
                            value={salaryType?.toString() ?? "2"}
                            onChange={(event) =>
                              setValue("salaryType", Number(event.target.value))
                            }
                            options={SALARY_TYPE_OPTIONS}
                          />
                        </FormField>

                        <FormField
                          label="Lương cơ bản"
                          error={errors.basicSalary?.message}
                        >
                          <CurrencyInput
                            value={basicSalary}
                            onChange={(value) =>
                              setValue("basicSalary", value, {
                                shouldValidate: true,
                              })
                            }
                            placeholder="10.000.000"
                            invalid={!!errors.basicSalary}
                          />
                        </FormField>

                        <FormField label="Trạng thái">
                          <Select
                            value={status?.toString() ?? "1"}
                            onChange={(event) =>
                              setValue("status", Number(event.target.value))
                            }
                            options={STATUS_OPTIONS}
                          />
                        </FormField>

                        <FormField
                          label="Vai trò"
                          required
                          error={errors.role?.message}
                        >
                          <Select
                            value={role ?? ""}
                            onChange={(event) =>
                              setValue("role", event.target.value)
                            }
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
                            {roles.map((item: RoleDTO) => (
                              <option
                                key={item.id}
                                value={item.code || item.name}
                              >
                                {item.name}
                              </option>
                            ))}
                          </Select>
                        </FormField>
                      </FormRow>
                    </FormSection>
                  </div>
                ),
              },
            ]}
          />
        </form>
      )}
    </Modal>
  );
}
