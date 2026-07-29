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
      <div className="space-y-1.5">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-warm-400 pointer-events-none w-5 h-5">
            <User className="w-5 h-5" />
          </span>
          <Input
            id="usernameOrEmail"
            type="text"
            placeholder="Email hoặc tên đăng nhập"
            autoComplete="username"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-warm-100 bg-white text-ink text-sm outline-none transition-all duration-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            aria-invalid={!!errors.usernameOrEmail}
            {...register("usernameOrEmail")}
          />
        </div>
        {errors.usernameOrEmail && (
          <p className="text-xs text-error-text font-medium pl-1">
            {errors.usernameOrEmail.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-warm-400 pointer-events-none w-5 h-5">
            <Lock className="w-5 h-5" />
          </span>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            autoComplete="current-password"
            className="w-full h-11 pl-11 pr-12 rounded-xl border border-warm-100 bg-white text-ink text-sm outline-none transition-all duration-200 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-warm-400 hover:text-warm-600 transition-colors"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-error-text font-medium pl-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Link to="/forgot-password" className="text-xs font-normal text-rose-600 hover:text-rose-500 hover:underline transition-colors">
          Quên mật khẩu?
        </Link>
      </div>

      <button
        type="submit"
        disabled={login.isPending}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-white bg-rose-600 font-semibold text-sm transition-all duration-200 outline-none hover:bg-rose-500 hover:shadow-lg active:bg-rose-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-warm-400"
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-warm-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-warm-400">hoặc</span>
        </div>
      </div>

      <div className="text-center text-xs text-warm-600">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="font-semibold text-rose-600 hover:text-rose-500 hover:underline transition-colors">
          Đăng ký ngay
        </Link>
      </div>
    </form>
  );
};
