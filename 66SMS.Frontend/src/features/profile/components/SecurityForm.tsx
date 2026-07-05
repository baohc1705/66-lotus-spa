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
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-lotus-deep mb-2 flex items-center gap-2 font-sans">
          <Lock className="w-6 h-6 text-lotus-stone" />
          Đổi mật khẩu
        </h3>
        <p className="text-sm text-lotus-stone">
          Bạn nên sử dụng mật khẩu mạnh mà bạn chưa sử dụng ở nơi khác.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-lotus-deep ml-1">
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            {...register("currentPassword")}
            className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lotus-rose/20 focus:border-lotus-rose transition-all bg-white text-lotus-deep"
          />
          {errors.currentPassword && (
            <p className="text-xs text-lotus-error ml-1">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-lotus-deep ml-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              {...register("newPassword")}
              className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lotus-rose/20 focus:border-lotus-rose transition-all bg-white text-lotus-deep"
            />
            {errors.newPassword && (
              <p className="text-xs text-lotus-error ml-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-lotus-deep ml-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lotus-rose/20 focus:border-lotus-rose transition-all bg-white text-lotus-deep"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-lotus-error ml-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="pt-6">
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full sm:w-auto px-8 py-3 rounded-md shadow-sm bg-lotus-rose hover:bg-lotus-rose/90 text-white"
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
