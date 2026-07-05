import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { User, Lock, Loader2, Camera, Save } from "lucide-react";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useUpdateProfile } from "@/features/profile/hooks/useUpdateProfile";
import { useChangePassword } from "@/features/profile/hooks/useChangePassword";
import { useUpdateStaffMutation } from "@/features/staffs/hooks/useStaffs";
import {
  profileSchema,
  changePasswordSchema,
  type ProfileFormValues,
  type ChangePasswordFormValues,
} from "@/features/profile/schemas/profile.schemas";
import { formatDisplayDate, parseToDateInput } from "@/shared/utils/date.utils";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { uploadApi } from "@/shared/api/upload.api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const qc = useQueryClient();
  const { data: profile, isLoading, isError } = useProfile();
  const isStaff = profile?.profileType === "Staff";


  const updateProfileMutation = useUpdateProfile();
  const updateStaffMutation = useUpdateStaffMutation();
  const changePasswordMutation = useChangePassword();

  const isProfilePending = updateProfileMutation.isPending || updateStaffMutation.isPending;
  const isSecurityPending = changePasswordMutation.isPending;

  const { mySalon } = useAuthStore();

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    setValue: setValueProfile,
    watch: watchProfile,
    formState: { errors: errorsProfile },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      profilePhotoUrl: "",
      gender: null,
      dateOfBirth: "",
    },
  });

  const getInitialProfileValues = useCallback(() => {
    return {
      fullName: profile?.fullName ?? "",
      phoneNumber: profile?.phone ?? "",
      profilePhotoUrl: profile?.avatarUrl ?? "",
      gender: profile?.gender !== null && profile?.gender !== undefined ? Number(profile.gender) : null,
      dateOfBirth: parseToDateInput(profile?.dateOfBirth) ?? "",
    };
  }, [profile]);

  useEffect(() => {
    if (profile) {
      resetProfile(getInitialProfileValues());
    }
  }, [profile, resetProfile, getInitialProfileValues]);

  // Security form
  const {
    register: registerSecurity,
    handleSubmit: handleSubmitSecurity,
    reset: resetSecurity,
    formState: { errors: errorsSecurity },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitProfile = (data: ProfileFormValues) => {
    const payload = {
      fullName: data.fullName,
      phone: data.phoneNumber,
      avatarUrl: data.profilePhotoUrl ?? undefined,
      gender: data.gender !== null && data.gender !== undefined ? Number(data.gender) : undefined,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth : undefined,
    };

    if (isStaff && profile?.staffInfo?.id) {
      updateStaffMutation.mutate(
        { id: profile.staffInfo.id, payload },
        {
          onSuccess: (res) => {
            if (res.isSuccess) {
              qc.invalidateQueries({ queryKey: ["profile"] });
            }
          },
        }
      );
    } else {
      updateProfileMutation.mutate({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        profilePhotoUrl: data.profilePhotoUrl,
      });
    }
  };

  const onSubmitSecurity = (data: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(data, {
      onSuccess: (result) => {
        if (result.isSuccess) {
          resetSecurity();
        }
      },
    });
  };

  const handleAvatarClick = () => {
    const fileInput = document.getElementById("admin-avatar-upload-input");
    fileInput?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadApi.uploadImage(file, "profile");
      if (result.isSuccess && result.data) {
        setValueProfile("profilePhotoUrl", result.data);
        toast.success(
          "Tải ảnh đại diện lên thành công. Đừng quên bấm Lưu thông tin!"
        );
      } else {
        toast.error(result.message || "Tải ảnh đại diện thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi tải ảnh đại diện");
    }
  };

  const avatarUrl = watchProfile("profilePhotoUrl");

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-lotus-leaf animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-center min-h-[500px]">
        <p className="text-red-500 font-medium mb-4">
          Không thể tải thông tin tài khoản
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-lotus-leaf font-semibold hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-sans antialiased text-lotus-deep">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row gap-6"
      >
        {/* Left Column: Avatar Card & Menu Card */}
        <div className="w-full lg:w-[260px] shrink-0 flex flex-col gap-6">
          {/* Avatar Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-admin border-0 shadow-sm p-6 flex flex-col items-center">
            <input
              id="admin-avatar-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div
              onClick={handleAvatarClick}
              className="relative w-36 h-36 rounded-full border border-stone-200/50 p-1 bg-white cursor-pointer group shrink-0 shadow-inner"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white relative flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-50 rounded-full text-stone-300">
                    <User className="w-16 h-16" />
                  </div>
                )}
                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full duration-300">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <h3 className="mt-4 text-base font-bold text-lotus-deep font-sans text-center truncate w-full">
              {profile?.fullName || profile?.username || "Người dùng"}
            </h3>
          </div>

          {/* Menu Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-admin border-0 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-stone-200/30 bg-white/30">
              <span className="text-[11px] font-bold text-lotus-stone uppercase tracking-wider block">Menu</span>
            </div>
            <nav className="flex flex-col">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-all ${
                  activeTab === "profile"
                    ? "bg-lotus-leaf/10 text-lotus-leaf font-bold"
                    : "text-lotus-stone bg-white/10 hover:bg-white/50 hover:text-lotus-deep"
                }`}
              >
                <User className="w-4 h-4" />
                Thông tin tài khoản
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-all ${
                  activeTab === "security"
                    ? "bg-lotus-leaf/10 text-lotus-leaf font-bold"
                    : "text-lotus-stone bg-white/10 hover:bg-white/50 hover:text-lotus-deep"
                }`}
              >
                <Lock className="w-4 h-4" />
                Đổi mật khẩu
              </button>
            </nav>
          </div>
        </div>

        {/* Right Column: Tab Content */}
        <div className="flex-grow">
          {activeTab === "profile" ? (
            <div className="bg-white/70 backdrop-blur-md rounded-admin border-0 shadow-sm overflow-hidden min-h-[500px]">
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/30 bg-white/30">
                <span className="font-bold text-sm md:text-base text-lotus-deep">Thông tin tài khoản</span>
                <button
                  type="submit"
                  form="profile-form"
                  disabled={isProfilePending}
                  className="bg-lotus-leaf hover:bg-lotus-leaf/90 text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                >
                  {isProfilePending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Lưu thông tin
                </button>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8">
                {/* Profile Form fields */}
                <form id="profile-form" onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Email đăng nhập */}
                    <div className="space-y-2 text-left">
                      <label className="text-sm font-semibold text-lotus-deep block">Email đăng nhập</label>
                      <input
                        type="text"
                        value={profile?.email || ""}
                        readOnly
                        disabled
                        className="w-full px-4 py-3 rounded-md border border-stone-200/30 bg-stone-100/60 text-stone-400 text-sm shadow-inner cursor-not-allowed outline-none"
                      />
                    </div>

                    {/* Họ tên */}
                    <div className="space-y-2 text-left">
                      <label className="text-sm font-semibold text-lotus-deep block">Họ tên</label>
                      <input
                        type="text"
                        {...registerProfile("fullName")}
                        className="w-full px-4 py-3 rounded-md border border-stone-200/50 bg-white/80 text-lotus-deep text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-lotus-leaf/10 focus:border-lotus-leaf transition-all"
                      />
                      {errorsProfile.fullName && (
                        <p className="text-xs text-red-500 mt-1">{errorsProfile.fullName.message}</p>
                      )}
                    </div>

                    {/* Email liên lạc */}
                    <div className="space-y-2 text-left">
                      <label className="text-sm font-semibold text-lotus-deep block">Email liên lạc</label>
                      <input
                        type="text"
                        value={profile?.email || ""}
                        readOnly
                        disabled
                        className="w-full px-4 py-3 rounded-md border border-stone-200/30 bg-stone-100/60 text-stone-400 text-sm shadow-inner cursor-not-allowed outline-none"
                      />
                    </div>

                    {/* Điện thoại */}
                    <div className="space-y-2 text-left">
                      <label className="text-sm font-semibold text-lotus-deep block">Điện thoại</label>
                      <input
                        type="text"
                        {...registerProfile("phoneNumber")}
                        className="w-full px-4 py-3 rounded-md border border-stone-200/50 bg-white/80 text-lotus-deep text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-lotus-leaf/10 focus:border-lotus-leaf transition-all"
                      />
                      {errorsProfile.phoneNumber && (
                        <p className="text-xs text-red-500 mt-1">{errorsProfile.phoneNumber.message}</p>
                      )}
                    </div>

                    {/* Giới tính */}
                    <div className="space-y-2 text-left">
                      <label className="text-sm font-semibold text-lotus-deep block">Giới tính</label>
                      <select
                        value={watchProfile("gender") ?? ""}
                        onChange={(e) =>
                          setValueProfile(
                            "gender",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        className="w-full px-4 py-3 rounded-md border border-stone-200/50 bg-white/80 text-lotus-deep text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-lotus-leaf/10 focus:border-lotus-leaf transition-all"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="0">Nam</option>
                        <option value="1">Nữ</option>
                        <option value="2">Khác</option>
                      </select>
                    </div>

                    {/* Ngày sinh */}
                    <div className="space-y-2 text-left">
                      <label className="text-sm font-semibold text-lotus-deep block">Ngày sinh</label>
                      <input
                        type="date"
                        {...registerProfile("dateOfBirth")}
                        className="w-full px-4 py-3 rounded-md border border-stone-200/50 bg-white/80 text-lotus-deep text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-lotus-leaf/10 focus:border-lotus-leaf transition-all"
                      />
                    </div>
                  </div>
                </form>

                {/* Additional metadata row (Chi nhánh / Quyền hạn / Staff metadata) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 mt-8 border-t border-stone-200/30 text-left">
                  <div>
                    <span className="text-xs font-semibold text-lotus-stone uppercase tracking-wider block mb-1">Chi nhánh</span>
                    <span className="text-sm font-bold text-lotus-deep block">{mySalon?.salonName || "HoaSenSpa TPHCM"}</span>
                    <span className="text-xs text-lotus-stone block mt-0.5">Đồng Tháp</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-lotus-stone uppercase tracking-wider block mb-1">Quyền hạn</span>
                    <span className="text-sm font-bold text-lotus-deep block">{profile?.roles?.[0] || "Admin"}</span>
                  </div>
                  {profile?.staffInfo && (
                    <>
                      <div>
                        <span className="text-xs font-semibold text-lotus-stone uppercase tracking-wider block mb-1">Mã nhân viên</span>
                        <span className="text-sm font-bold text-lotus-deep block">{profile.staffInfo.code || "---"}</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-lotus-stone uppercase tracking-wider block mb-1">Ngày vào làm</span>
                        <span className="text-sm font-bold text-lotus-deep block">{formatDisplayDate(profile.staffInfo.hireDate)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-md rounded-admin border-0 shadow-sm overflow-hidden min-h-[500px]">
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/30 bg-white/30">
                <span className="font-bold text-sm md:text-base text-lotus-deep">Đổi mật khẩu</span>
                <button
                  type="submit"
                  form="security-form"
                  disabled={isSecurityPending}
                  className="bg-lotus-leaf hover:bg-lotus-leaf/90 text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                >
                  {isSecurityPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Cập nhật mật khẩu
                </button>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 text-left">
                <form id="security-form" onSubmit={handleSubmitSecurity(onSubmitSecurity)} className="space-y-5 max-w-xl">
                  {/* Mật khẩu hiện tại */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-lotus-deep block">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      {...registerSecurity("currentPassword")}
                      className="w-full px-4 py-3 rounded-md border border-stone-200/50 bg-white/80 text-lotus-deep text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-lotus-leaf/10 focus:border-lotus-leaf transition-all"
                    />
                    {errorsSecurity.currentPassword && (
                      <p className="text-xs text-red-500 mt-1">{errorsSecurity.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Mật khẩu mới */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-lotus-deep block">Mật khẩu mới</label>
                      <input
                        type="password"
                        {...registerSecurity("newPassword")}
                        className="w-full px-4 py-3 rounded-md border border-stone-200/50 bg-white/80 text-lotus-deep text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-lotus-leaf/10 focus:border-lotus-leaf transition-all"
                      />
                      {errorsSecurity.newPassword && (
                        <p className="text-xs text-red-500 mt-1">{errorsSecurity.newPassword.message}</p>
                      )}
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-lotus-deep block">Xác nhận mật khẩu</label>
                      <input
                        type="password"
                        {...registerSecurity("confirmPassword")}
                        className="w-full px-4 py-3 rounded-md border border-stone-200/50 bg-white/80 text-lotus-deep text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-lotus-leaf/10 focus:border-lotus-leaf transition-all"
                      />
                      {errorsSecurity.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">{errorsSecurity.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}


