import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  type ProfileFormValues,
} from "../schemas/profile.schemas";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { Button } from "@/shared/components/ui/button";
import { Camera, User, Phone, Mail, Fingerprint, ShieldCheck, Loader2, Calendar, Activity, Star } from "lucide-react";
import type { ProfileResponse } from "../types/profile.types";
import { useEffect } from "react";

interface ProfileFormProps {
  initialData?: ProfileResponse;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const { mutate, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialData?.fullName ?? "",
      phoneNumber: initialData?.phone ?? "",
      profilePhotoUrl: initialData?.avatarUrl ?? "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName ?? "",
        phoneNumber: initialData.phone ?? "",
        profilePhotoUrl: initialData.avatarUrl ?? "",
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    mutate(data);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatDOB = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const getGenderText = (gender?: number) => {
    if (gender === 1) return "Nam";
    if (gender === 2) return "Nữ";
    if (gender === 0) return "Khác";
    return "Chưa cập nhật";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Profile Card (Avatar & Status) */}
        <div className="w-full lg:w-[35%] flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-md bg-lotus-cream p-6 flex flex-col items-center">
            <div className="relative z-10 w-32 h-32 rounded-full p-1 shadow-sm mb-4 bg-white border border-lotus-rose/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                {initialData?.avatarUrl ? (
                  <img
                    src={initialData.avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lotus-rose/40">
                    <User className="w-16 h-16" />
                  </div>
                )}
                
                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="text-center relative z-10 space-y-2">
              <h3 className="font-bold text-xl text-lotus-deep font-serif">
                {initialData?.fullName || "Người dùng"}
              </h3>
              <p className="text-sm font-medium text-lotus-leaf inline-flex items-center justify-center gap-1.5 bg-lotus-leaf-light px-3 py-1 rounded-md">
                <ShieldCheck className="w-4 h-4" />
                {initialData?.status === "Active" ? "Đang hoạt động" : (initialData?.status || "Thành viên")}
              </p>
            </div>
            
            {initialData?.customerInfo && (
              <div className="w-full mt-6 pt-4 border-t border-lotus-gold/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-lotus-stone flex items-center gap-1">
                    <Star className="w-4 h-4 text-lotus-gold" />
                    Hạng thành viên:
                  </span>
                  <span className="text-sm font-semibold text-lotus-deep">Thường</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-lotus-stone flex items-center gap-1">
                    <Activity className="w-4 h-4 text-lotus-rose" />
                    Điểm tích lũy:
                  </span>
                  <span className="text-sm font-semibold text-lotus-deep">{initialData.customerInfo.loyaltyPoint || 0}</span>
                </div>
              </div>
            )}
            
            {initialData?.staffInfo && (
              <div className="w-full mt-6 pt-4 border-t border-lotus-gold/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-lotus-stone flex items-center gap-1">
                    <Fingerprint className="w-4 h-4 text-lotus-stone" />
                    Mã nhân viên:
                  </span>
                  <span className="text-sm font-semibold text-lotus-deep">{initialData.staffInfo.code || "---"}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-lotus-stone flex items-center gap-1">
                    <Activity className="w-4 h-4 text-lotus-stone" />
                    Loại hợp đồng:
                  </span>
                  <span className="text-sm font-semibold text-lotus-deep">{initialData.staffInfo.contractType || "---"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-lotus-stone flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-lotus-stone" />
                    Ngày vào làm:
                  </span>
                  <span className="text-sm font-semibold text-lotus-deep">{formatDOB(initialData.staffInfo.hireDate)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Form Details */}
        <div className="w-full lg:w-[65%]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative z-10">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-lotus-deep mb-2 font-serif">
                  Thông tin liên hệ
                </h3>
                <p className="text-lotus-stone text-sm">
                  Cập nhật thông tin để chúng tôi có thể hỗ trợ và phục vụ bạn tốt hơn.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                    <User className="w-4 h-4 text-lotus-stone" />
                    Họ và tên
                  </label>
                  <input
                    {...register("fullName")}
                    placeholder="Nhập họ tên của bạn"
                    className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-lotus-rose/20 focus:border-lotus-rose transition-all text-lotus-deep"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-lotus-error">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                    <Phone className="w-4 h-4 text-lotus-stone" />
                    Số điện thoại
                  </label>
                  <input
                    {...register("phoneNumber")}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-lotus-rose/20 focus:border-lotus-rose transition-all text-lotus-deep"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-lotus-error">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                    <User className="w-4 h-4 text-lotus-stone" />
                    Giới tính
                  </label>
                  <input
                    value={getGenderText(initialData?.gender)}
                    disabled
                    className="w-full px-4 py-3 rounded-md border border-gray-100 bg-lotus-cream text-lotus-stone cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-lotus-stone" />
                    Ngày sinh
                  </label>
                  <input
                    value={formatDOB(initialData?.dateOfBirth)}
                    disabled
                    className="w-full px-4 py-3 rounded-md border border-gray-100 bg-lotus-cream text-lotus-stone cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mt-8 mb-6 border-t border-gray-100 pt-6">
                <h3 className="text-xl font-bold text-lotus-deep font-serif mb-4">
                  Tài khoản hệ thống
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                      <Mail className="w-4 h-4 text-lotus-stone" />
                      Địa chỉ Email
                    </label>
                    <input
                      value={initialData?.email ?? ""}
                      disabled
                      className="w-full px-4 py-3 rounded-md border border-gray-100 bg-lotus-cream text-lotus-stone cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-lotus-stone" />
                      Tên đăng nhập
                    </label>
                    <input
                      value={initialData?.username ?? ""}
                      disabled
                      className="w-full px-4 py-3 rounded-md border border-gray-100 bg-lotus-cream text-lotus-stone cursor-not-allowed font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                      <Activity className="w-4 h-4 text-lotus-stone" />
                      Đăng nhập lần cuối
                    </label>
                    <input
                      value={formatDate(initialData?.lastLoginAt)}
                      disabled
                      className="w-full px-4 py-3 rounded-md border border-gray-100 bg-lotus-cream text-lotus-stone cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
