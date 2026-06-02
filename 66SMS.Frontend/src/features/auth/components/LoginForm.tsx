import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin } from "@/features/auth/hooks/useLogin";
import {
  loginSchema,
  type LoginFormData,
} from "@/features/auth/schemas/loginSchema";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";

export const LoginForm = () => {
  const navigate = useNavigate();
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
    login.mutate(data, {
      onSuccess: ({ data: result }) => {
        if (result?.isSuccess) navigate("/dashboard");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="usernameOrEmail">Email hoặc tên đăng nhập</Label>
        <Input
          id="usernameOrEmail"
          type="text"
          placeholder="Nhập email hoặc tên đăng nhập"
          autoComplete="username"
          aria-invalid={!!errors.usernameOrEmail}
          {...register("usernameOrEmail")}
        />
        {errors.usernameOrEmail && (
          <p className="text-xs text-[var(--spa-error)] flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-[var(--spa-error)]" />
            {errors.usernameOrEmail.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
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

      <div className="flex justify-end">
        <a
          href="/forgot-password"
          className="text-sm font-medium text-[var(--spa-rose)] hover:text-[var(--spa-rose-hover)] transition-colors"
        >
          Quên mật khẩu?
        </a>
      </div>

      <button
        type="submit"
        disabled={login.isPending}
        className={`w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-white font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-200 ${login.isPending ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"}`}
        style={{
          background: login.isPending
            ? "#6B7280"
            : "linear-gradient(135deg, #E91E8C, #C4177A)",
        }}
      >
        {login.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          <>
            <span>Đăng nhập</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
