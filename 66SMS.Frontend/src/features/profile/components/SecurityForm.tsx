import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../schemas/profile.schemas";
import { useChangePassword } from "../hooks/useChangePassword";
import { Button } from "@/shared/components/ui/button";
import { Lock, Loader2 } from "lucide-react";

export function SecurityForm() {
  const { mutate, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormValues) => {
    mutate(data, {
      onSuccess: (result) => {
        if (result.isSuccess) {
          reset();
        }
      },
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-lotus-deep mb-1 flex items-center gap-2 font-sans">
          <Lock className="w-5 h-5 text-lotus-stone" />
          Đổi mật khẩu
        </h3>
        <p className="text-sm text-lotus-stone">
          Bạn nên sử dụng mật khẩu mạnh mà bạn chưa sử dụng ở nơi khác.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-lotus-deep">
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            {...register("currentPassword")}
            className="w-full px-3 py-2.5 border-2 border-lotus-rose rounded-md focus:outline-none transition-all bg-lotus-cream/70 text-lotus-deep"
          />
          {errors.currentPassword && (
            <p className="text-xs text-lotus-error">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-lotus-deep">
              Mật khẩu mới
            </label>
            <input
              type="password"
              {...register("newPassword")}
              className="w-full px-3 py-2.5 border-2 border-lotus-rose rounded-md focus:outline-none focus:ring-2 focus:ring-lotus-rose/20 transition-all bg-lotus-cream/70 text-lotus-deep"
            />
            {errors.newPassword && (
              <p className="text-xs text-lotus-error">
                {errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-lotus-deep">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="w-full px-3 py-2.5 border-2 border-lotus-rose rounded-md focus:outline-none focus:ring-2 focus:ring-lotus-rose/20 transition-all bg-lotus-cream/70 text-lotus-deep"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-lotus-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="pt-3">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-2.5 rounded-md shadow-sm bg-lotus-rose hover:bg-lotus-rose/90 text-white"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </span>
            ) : (
              "Cập nhật mật khẩu"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
