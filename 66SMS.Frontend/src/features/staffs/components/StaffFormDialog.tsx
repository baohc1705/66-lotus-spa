import { useEffect } from "react";
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
import { useCreateStaff, useUpdateStaff } from "../hooks/useStaffs";
import { useProvinces, useWardsByProvince } from "@/features/address/hooks/useAddress";
import {
  createStaffSchema,
  updateStaffSchema,
  type CreateStaffFormData,
  type UpdateStaffFormData,
  type StaffFormValues,
} from "../schemas/staff.schema";

import type { StaffDto } from "../types/staff.types";
import { User, Briefcase, KeyRound } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useSalons } from "@/features/salons/hooks/useSalons";

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: StaffDto | null;
}

const GENDER_OPTIONS = [
  { value: "0", label: "Nam" },
  { value: "1", label: "Nữ" },
  { value: "2", label: "Khác" },
];

const CONTRACT_TYPE_OPTIONS = [
  { value: "Toàn thời gian", label: "Toàn thời gian" },
  { value: "Bán thời gian", label: "Bán thời gian" },
  { value: "Thời vụ", label: "Thời vụ" },
  { value: "Thử việc", label: "Thử việc" },
];

const STATUS_OPTIONS = [
  { value: "1", label: "Đang làm" },
  { value: "0", label: "Nghỉ việc" },
  { value: "2", label: "Tạm nghỉ" },
];

export function StaffFormDialog({
  open,
  onOpenChange,
  staff,
}: StaffFormDialogProps) {
  const isEdit = !!staff;
  const managedSalonId = useAuthStore((s) => s.managedSalonId);
  const isAdmin = managedSalonId === null;
  const { data: salonsResult } = useSalons({ pageIndex: 1, pageSize: 100 });
  const salons = salonsResult?.data?.items ?? [];

  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Dynamic schema & form based on create vs edit
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(
      isEdit ? updateStaffSchema : createStaffSchema,
    ) as Resolver<StaffFormValues>,
    defaultValues: getDefaultValues(staff),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const selectedProvince = watch("provinceCode");
  const provincesQuery = useProvinces();
  const wardsQuery = useWardsByProvince(selectedProvince);

  // Reset form when dialog opens/closes or staff changes
  useEffect(() => {
    if (open) {
      reset(getDefaultValues(staff));
    }
  }, [open, staff, reset]);

  const onSubmit = (data: StaffFormValues) => {
    const provinceName = provincesQuery.data?.data?.find(p => p.code === data.provinceCode)?.name ?? "";
    const wardName = wardsQuery.data?.data?.find(w => w.code === data.wardCode)?.name ?? "";
    const parts = [data.streetAddress, wardName, provinceName].filter(Boolean);
    const payload = { ...data, fullAddress: parts.join(", ") };

    if (isEdit && staff?.id) {
      updateMutation.mutate(
        { id: staff.id, payload: payload as UpdateStaffFormData },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
    } else {
      createMutation.mutate(payload as CreateStaffFormData, {
        onSuccess: (result) => {
          if (result.isSuccess) onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Cập nhật thông tin nhân viên ${staff?.fullName ?? ""}`
              : "Điền thông tin để tạo nhân viên mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* === Section: Thông tin cá nhân === */}
          <FormSection icon={User} title="Thông tin cá nhân">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <FormField
                label="Họ tên *"
                tooltip="Vui lòng nhập họ và tên đầy đủ của nhân viên"
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
              <FormField label="Ngày sinh" error={errors.dob?.message}>
                <Input
                  {...register("dob")}
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
              <FormField label="CMND/CCCD" error={errors.nationalId?.message}>
                <Input
                  {...register("nationalId")}
                  placeholder="012345678901"
                  className="h-9 text-[13px]"
                />
              </FormField>
              <FormField label="Tỉnh/Thành phố" error={errors.provinceCode?.message}>
                <SearchableSelect
                  value={watch("provinceCode") ?? ""}
                  onValueChange={v => {
                    setValue("provinceCode", v);
                    setValue("wardCode", "");
                  }}
                  options={(provincesQuery.data?.data ?? []).map(p => ({ value: p.code ?? "", label: p.name ?? "" }))}
                  placeholder="Chọn tỉnh/thành phố"
                  searchPlaceholder="Tìm tỉnh/thành phố..."
                  className="h-9"
                />
              </FormField>
              <FormField label="Phường/Xã" error={errors.wardCode?.message}>
                <SearchableSelect
                  value={watch("wardCode") ?? ""}
                  onValueChange={v => setValue("wardCode", v)}
                  options={(wardsQuery.data?.data ?? []).map(w => ({ value: w.code ?? "", label: w.name ?? "" }))}
                  placeholder="Chọn phường/xã"
                  searchPlaceholder="Tìm phường/xã..."
                  disabled={!watch("provinceCode") || wardsQuery.isLoading}
                  className="h-9"
                />
              </FormField>
              <FormField label="Số nhà, tên đường" error={errors.streetAddress?.message} className="sm:col-span-2">
                <Input
                  {...register("streetAddress")}
                  placeholder="123 Đường ABC"
                  className="h-9 text-[13px]"
                />
              </FormField>
            </div>
          </FormSection>

          {/* === Section: Thông tin công việc === */}
          <FormSection icon={Briefcase} title="Thông tin công việc">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {isAdmin && !isEdit && (
                <FormField
                  label="Chi nhánh *"
                  tooltip="Chọn chi nhánh mà nhân viên này thuộc về"
                  error={(errors as Record<string, { message?: string }>).salonId?.message}
                >
                  <Select
                    value={watch("salonId")?.toString() ?? ""}
                    onValueChange={(v) => setValue("salonId", Number(v))}
                  >
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue placeholder="Chọn chi nhánh..." />
                    </SelectTrigger>
                    <SelectContent>
                      {salons.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
              <FormField label="Ngày vào làm" error={errors.hireDate?.message}>
                <Input
                  {...register("hireDate")}
                  type="date"
                  className="h-9 text-[13px]"
                />
              </FormField>
              <FormField label="Loại hợp đồng">
                <Select
                  value={watch("contractType") ?? ""}
                  onValueChange={(v) => setValue("contractType", v)}
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Chọn loại HĐ" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField
                label="Lương cơ bản"
                error={errors.basicSalary?.message}
              >
                <Input
                  {...register("basicSalary")}
                  type="number"
                  placeholder="10000000"
                  className="h-9 text-[13px]"
                />
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
            </div>
          </FormSection>

          {/* === Section: Tài khoản (chỉ khi tạo mới) === */}
          {!isEdit && (
            <FormSection icon={KeyRound} title="Tài khoản đăng nhập">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <FormField
                  label="Tên tài khoản *"
                  tooltip="Tên đăng nhập viết liền, không dấu, không chứa ký tự đặc biệt"
                  error={
                    (errors as Record<string, { message?: string }>).userName
                      ?.message
                  }
                >
                  <Input
                    {...register("userName")}
                    placeholder="nguyenvana"
                    className="h-9 text-[13px]"
                  />
                </FormField>
                <FormField
                  label="Email *"
                  tooltip="Địa chỉ email hợp lệ (ví dụ: user@example.com)"
                  error={errors.email?.message}
                >
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="nv@hoasenspa.com"
                    className="h-9 text-[13px]"
                  />
                </FormField>
                <FormField
                  label="Mật khẩu *"
                  tooltip="Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số"
                  error={
                    (errors as Record<string, { message?: string }>).password
                      ?.message
                  }
                >
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="h-9 text-[13px]"
                  />
                </FormField>
                <FormField
                  label="Xác nhận mật khẩu *"
                  tooltip="Nhập lại mật khẩu khớp với mật khẩu ở trên"
                  error={
                    (errors as Record<string, { message?: string }>)
                      .confirmPassword?.message
                  }
                >
                  <Input
                    {...register("confirmPassword")}
                    type="password"
                    placeholder="••••••••"
                    className="h-9 text-[13px]"
                  />
                </FormField>
              </div>
            </FormSection>
          )}

          {/* === Account fields khi edit === */}
          {isEdit && (
            <FormSection icon={KeyRound} title="Tài khoản">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <FormField
                  label="Tên tài khoản *"
                  tooltip="Tên đăng nhập viết liền, không dấu"
                  error={errors.userName?.message}
                >
                  <Input
                    {...register("userName")}
                    placeholder="nguyenvana"
                    className="h-9 text-[13px]"
                  />
                </FormField>
                <FormField
                  label="Email *"
                  tooltip="Địa chỉ email hợp lệ"
                  error={errors.email?.message}
                >
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="nv@hoasenspa.com"
                    className="h-9 text-[13px]"
                  />
                </FormField>
              </div>
            </FormSection>
          )}

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
            <Button type="submit" variant="admin" size="sm" loading={isPending}>
              {isEdit ? "Cập nhật" : "Tạo nhân viên"}
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
  children,
}: {
  label: string;
  error?: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  const isRequired = label.includes("*");
  const cleanLabel = label.replace("*", "").trim();

  return (
    <div className="space-y-1">
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

function getDefaultValues(staff?: StaffDto | null): StaffFormValues {
  if (staff) {
    return {
      fullName: staff.fullName ?? "",
      phone: staff.phone ?? "",
      dob: staff.dob ?? "",
      gender: staff.gender ? Number(staff.gender) : undefined,
      nationalId: staff.nationalId ?? "",
      image: staff.image ?? "",
      hireDate: staff.hireDate ?? "",
      contractType: staff.contractType ?? "",
      basicSalary: staff.basicSalary ?? undefined,
      status: staff.status ? Number(staff.status) : 1,
      streetAddress: staff.streetAddress ?? "",
      provinceCode: staff.provinceCode ?? "",
      wardCode: staff.wardCode ?? "",
      fullAddress: staff.fullAddress ?? "",
      userName: staff.username ?? "",
      email: staff.email ?? "",
    };
  }
  return {
    fullName: "",
    phone: "",
    dob: "",
    gender: undefined,
    nationalId: "",
    image: "",
    hireDate: "",
    contractType: "",
    basicSalary: undefined,
    status: 1,
    streetAddress: "",
    provinceCode: "",
    wardCode: "",
    fullAddress: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };
}
