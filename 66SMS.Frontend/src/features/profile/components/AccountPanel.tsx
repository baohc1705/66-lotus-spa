import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  accountSchema,
  type AccountFormValues,
} from "../schemas/profile.schemas";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { Button } from "@/shared/components/ui/button";
import { Mail, Fingerprint, Activity, Loader2 } from "lucide-react";
import type { ProfileResponse } from "../types/profile.types";
import { useEffect } from "react";

interface AccountPanelProps {
  initialData?: ProfileResponse;
}

export function AccountPanel({ initialData }: AccountPanelProps) {
  const { mutate, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      username: initialData?.username ?? "",
      email: initialData?.email ?? "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        username: initialData.username ?? "",
        email: initialData.email ?? "",
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data: AccountFormValues) => {
    mutate(data);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-lotus-deep mb-2 font-sans">
          Tài khoản hệ thống
        </h3>
        <p className="text-sm text-lotus-stone">
          Quản lý thông tin tài khoản và đăng nhập của bạn trên hệ thống.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-lotus-stone" />
            Tên đăng nhập
          </label>
          <input
            {...register("username")}
            placeholder="Tên đăng nhập"
            className="w-full px-4 py-3 rounded-md border border-warm-100 focus:outline-none focus:ring-2 focus:ring-lotus-rose/20 focus:border-lotus-rose transition-all bg-white text-lotus-deep"
          />
          {errors.username && (
            <p className="text-xs text-lotus-error">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
            <Mail className="w-4 h-4 text-lotus-stone" />
            Địa chỉ Email
          </label>
          <input
            {...register("email")}
            placeholder="Địa chỉ Email"
            className="w-full px-4 py-3 rounded-md border border-warm-100 focus:outline-none focus:ring-2 focus:ring-lotus-rose/20 focus:border-lotus-rose transition-all bg-white text-lotus-deep"
          />
          {errors.email && (
            <p className="text-xs text-lotus-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
            <Activity className="w-4 h-4 text-lotus-stone" />
            Đăng nhập lần cuối
          </label>
          <input
            value={formatDate(initialData?.lastLoginAt)}
            disabled
            className="w-full px-4 py-3 rounded-md border border-warm-100 bg-lotus-cream text-lotus-stone cursor-not-allowed"
          />
        </div>

        <div className="pt-6 flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-8 py-3 rounded-md shadow-sm bg-lotus-rose hover:bg-lotus-rose/90 text-white"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </span>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
