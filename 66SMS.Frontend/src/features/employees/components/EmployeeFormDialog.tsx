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
import { useCreateEmployee, useUpdateEmployee } from "../hooks/useEmployees";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeFormData,
  type UpdateEmployeeFormData,
  type EmployeeFormValues,
} from "../schemas/employee.schema";

import type { EmployeeDto } from "../types/employee.types";
import { User, Briefcase, KeyRound } from "lucide-react";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeDto | null;
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

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
}: EmployeeFormDialogProps) {
  const isEdit = !!employee;
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Dynamic schema & form based on create vs edit
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(
      isEdit ? updateEmployeeSchema : createEmployeeSchema,
    ) as Resolver<EmployeeFormValues>,
    defaultValues: getDefaultValues(employee),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  // Reset form when dialog opens/closes or employee changes
  useEffect(() => {
    if (open) {
      reset(getDefaultValues(employee));
    }
  }, [open, employee, reset]);

  const onSubmit = (data: EmployeeFormValues) => {
    if (isEdit && employee?.id) {
      updateMutation.mutate(
        { id: employee.id, payload: data as UpdateEmployeeFormData },
        {
          onSuccess: (result) => {
            if (result.isSuccess) onOpenChange(false);
          },
        },
      );
    } else {
      createMutation.mutate(data as CreateEmployeeFormData, {
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
              ? `Cập nhật thông tin nhân viên ${employee?.fullName ?? ""}`
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
              <FormField label="Địa chỉ" error={errors.fullAddress?.message}>
                <Input
                  {...register("fullAddress")}
                  placeholder="123 Đường ABC, Quận 1, TP.HCM"
                  className="h-9 text-[13px]"
                />
              </FormField>
            </div>
          </FormSection>

          {/* === Section: Thông tin công việc === */}
          <FormSection icon={Briefcase} title="Thông tin công việc">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
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

function getDefaultValues(employee?: EmployeeDto | null): EmployeeFormValues {
  if (employee) {
    return {
      fullName: employee.fullName ?? "",
      phone: employee.phone ?? "",
      dob: employee.dob ?? "",
      gender: employee.gender ? Number(employee.gender) : undefined,
      nationalId: employee.nationalId ?? "",
      image: employee.image ?? "",
      hireDate: employee.hireDate ?? "",
      contractType: employee.contractType ?? "",
      basicSalary: employee.basicSalary ?? undefined,
      status: employee.status ? Number(employee.status) : 1,
      streetAddress: employee.streetAddress ?? "",
      provinceCode: employee.provinceCode ?? "",
      wardCode: employee.wardCode ?? "",
      fullAddress: employee.fullAddress ?? "",
      userName: employee.username ?? "",
      email: employee.email ?? "",
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
