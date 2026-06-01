import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { useNavigate } from "react-router-dom";
import {
  loginSchema,
  type LoginFormData,
} from "@/features/auth/schemas/loginSchema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export const LoginForm = () => {
  const navigate = useNavigate();
  const login = useLogin();

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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="usernameOrEmail">Tài khoản / Email</Label>
            <Input id="usernameOrEmail" {...register("usernameOrEmail")} />
            {errors.usernameOrEmail && (
              <p className="text-sm text-red-500">
                {errors.usernameOrEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
          <div className="text-center">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Quên mật khẩu?
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
