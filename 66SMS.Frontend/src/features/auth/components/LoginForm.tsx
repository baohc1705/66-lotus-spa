import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2, Lock, User } from "lucide-react";
import { useLogin } from "@/features/auth/hooks/useLogin";
import {
  loginSchema,
  type LoginFormData,
} from "@/features/auth/schemas/loginSchema";
import { Input } from "@/shared/components/ui/input";
import { Link } from "react-router-dom";

export const LoginForm = () => {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Email / Username */}
      <div className="space-y-1.5">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#a3a3a3] pointer-events-none w-5 h-5">
            <User className="w-5 h-5" />
          </span>
          <Input
            id="usernameOrEmail"
            type="text"
            placeholder="Email hoặc tên đăng nhập"
            autoComplete="username"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm outline-none transition-all duration-200 focus:border-[#be7a87] focus:ring-1 focus:ring-[#be7a87]"
            aria-invalid={!!errors.usernameOrEmail}
            {...register("usernameOrEmail")}
          />
        </div>
        {errors.usernameOrEmail && (
          <p className="text-xs text-red-500 font-medium pl-1">
            {errors.usernameOrEmail.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#a3a3a3] pointer-events-none w-5 h-5">
            <Lock className="w-5 h-5" />
          </span>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            autoComplete="current-password"
            className="w-full h-11 pl-11 pr-12 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm outline-none transition-all duration-200 focus:border-[#be7a87] focus:ring-1 focus:ring-[#be7a87]"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 font-medium pl-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Forgot Password */}
      <div className="flex justify-end">
        <Link to="/forgot-password" className="text-xs font-normal text-[#be7a87] hover:text-[#ac6a77] hover:underline transition-colors">
          Quên mật khẩu?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={login.isPending}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-white bg-[#be7a87] font-semibold text-sm transition-all duration-200 outline-none hover:bg-[#ac6a77] hover:shadow-lg active:bg-[#995f6a] disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
      >
        {login.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          <span>Đăng nhập</span>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-400">hoặc</span>
        </div>
      </div>

      {/* Register Redirect */}
      <div className="text-center text-xs text-gray-500">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="font-semibold text-[#be7a87] hover:text-[#ac6a77] hover:underline transition-colors">
          Đăng ký ngay
        </Link>
      </div>
    </form>
  );
};

