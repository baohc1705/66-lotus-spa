import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useCreateCustomer } from "@/features/customers/hooks/useCustomers";
import {
  createCustomerSchema,
  type CreateCustomerFormData,
} from "@/features/customers/schemas/customer.schema";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.input<typeof createCustomerSchema>,
    unknown,
    CreateCustomerFormData
  >({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: CreateCustomerFormData) => {
    createCustomer.mutate(
      {
        ...data,
      },
      {
        onSuccess: () => {
          toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
          navigate("/login");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Họ và tên</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Nhập họ và tên"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-xs text-[var(--spa-error)] flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-[var(--spa-error)]" />
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Nhập số điện thoại"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-[var(--spa-error)] flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-[var(--spa-error)]" />
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="userName">Tên đăng nhập</Label>
          <Input
            id="userName"
            type="text"
            placeholder="Tên đăng nhập"
            autoComplete="username"
            aria-invalid={!!errors.userName}
            {...register("userName")}
          />
          {errors.userName && (
            <p className="text-xs text-[var(--spa-error)] flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-[var(--spa-error)]" />
              {errors.userName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Nhập email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-[var(--spa-error)] flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-[var(--spa-error)]" />
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            autoComplete="new-password"
            className="pr-12"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-[var(--spa-error)] flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-[var(--spa-error)]" />
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            className="pr-12"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-[var(--spa-error)] flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-[var(--spa-error)]" />
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={createCustomer.isPending}
        className={`w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-white font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-200 mt-2 ${createCustomer.isPending ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"}`}
        style={{
          background: createCustomer.isPending
            ? "#6B7280"
            : "linear-gradient(135deg, #E91E8C, #C4177A)",
        }}
      >
        {createCustomer.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang đăng ký...</span>
          </>
        ) : (
          <>
            <span>Đăng ký</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
