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
import { Button } from "@/shared/components/ui/button";
import { FormField } from "@/shared/components/forms/FormField";
import { AdminInput } from "@/shared/components/forms/AdminInput";
import { AdminSelectTrigger } from "@/shared/components/forms/AdminSelectTrigger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { containerVariants, itemVariants } from "@/shared/motion/pageVariants";

export function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const qc = useQueryClient();
  const { data: profile, isLoading, isError } = useProfile();
  const isStaff = profile?.profileType === "Staff";

  const updateProfileMutation = useUpdateProfile();
  const updateStaffMutation = useUpdateStaffMutation();
  const changePasswordMutation = useChangePassword();

  const isProfilePending =
    updateProfileMutation.isPending || updateStaffMutation.isPending;
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
      gender:
        profile?.gender !== null && profile?.gender !== undefined
          ? Number(profile.gender)
          : null,
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
      gender:
        data.gender !== null && data.gender !== undefined
          ? Number(data.gender)
          : undefined,
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
        },
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
          "Tải ảnh đại diện lên thành công. Đừng quên bấm Lưu thông tin!",
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
        <Loader2 className="w-8 h-8 text-adminGreen-600 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-center min-h-[500px]">
        <p className="text-state-danger-text font-medium mb-4">
          Không thể tải thông tin tài khoản
        </p>
        <Button
          variant="link"
          onClick={() => window.location.reload()}
          className="text-adminGreen-600 font-semibold"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full font-sans antialiased text-adminInk">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col lg:flex-row gap-2"
      >
        {/* Left Column: Avatar Card & Menu Card */}
        <motion.div
          variants={itemVariants}
          className="w-full lg:w-[260px] shrink-0 flex flex-col gap-2"
        >
          {/* Avatar Card */}
          <div className="bg-white rounded-admin border border-adminGray-100/30 shadow-sm p-6 flex flex-col items-center">
            <input
              id="admin-avatar-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div
              onClick={handleAvatarClick}
              className="relative w-36 h-36 rounded-full border border-adminGray-100/50 p-1 bg-white cursor-pointer group shrink-0 shadow-inner"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white relative flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-adminGray-50 rounded-full text-adminGray-300">
                    <User className="w-16 h-16" />
                  </div>
                )}
                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full duration-300">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <h3 className="mt-4 text-base font-bold text-adminInk font-sans text-center truncate w-full">
              {profile?.fullName || profile?.username || "Người dùng"}
            </h3>
          </div>

          {/* Menu Card */}
          <div className="bg-white rounded-admin border border-adminGray-100/30 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-adminGray-100/30 bg-adminGray-50/50">
              <span className="text-xs font-bold text-adminGray-600 uppercase tracking-wider block">
                Menu
              </span>
            </div>
            <nav className="flex flex-col p-1.5 space-y-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`lotus-admin-sidebar-item ${
                  activeTab === "profile"
                    ? "is-active font-semibold"
                    : "hover:text-adminGreen-600 border-l-[3px] border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <User className="w-4 h-4 shrink-0 text-adminGray-400" />
                  <span>Thông tin tài khoản</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`lotus-admin-sidebar-item ${
                  activeTab === "security"
                    ? "is-active font-semibold"
                    : "hover:text-adminGreen-600 border-l-[3px] border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Lock className="w-4 h-4 shrink-0 text-adminGray-400" />
                  <span>Đổi mật khẩu</span>
                </div>
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Right Column: Tab Content */}
        <motion.div variants={itemVariants} className="flex-grow">
          {activeTab === "profile" ? (
            <div className="bg-white rounded-admin border border-adminGray-100/30 shadow-sm overflow-hidden min-h-[500px]">
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-adminGray-100/30 bg-adminGray-50/50">
                <span className="font-bold text-sm md:text-base text-adminInk">
                  Thông tin tài khoản
                </span>
                <Button
                  type="submit"
                  form="profile-form"
                  disabled={isProfilePending}
                  variant="admin"
                  size="sm"
                  loading={isProfilePending}
                  className="flex items-center gap-1.5"
                >
                  {!isProfilePending && <Save className="w-3.5 h-3.5" />}
                  Lưu thông tin
                </Button>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8">
                {/* Profile Form fields */}
                <form
                  id="profile-form"
                  onSubmit={handleSubmitProfile(onSubmitProfile)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {/* Email đăng nhập */}
                    <FormField label="Email đăng nhập">
                      <AdminInput
                        type="text"
                        value={profile?.email || ""}
                        readOnly
                        disabled
                      />
                    </FormField>

                    {/* Họ tên */}
                    <FormField
                      label="Họ tên *"
                      error={errorsProfile.fullName?.message}
                    >
                      <AdminInput
                        type="text"
                        {...registerProfile("fullName")}
                      />
                    </FormField>

                    {/* Email liên lạc */}
                    <FormField label="Email liên lạc">
                      <AdminInput
                        type="text"
                        value={profile?.email || ""}
                        readOnly
                        disabled
                      />
                    </FormField>

                    {/* Điện thoại */}
                    <FormField
                      label="Điện thoại *"
                      error={errorsProfile.phoneNumber?.message}
                    >
                      <AdminInput
                        type="text"
                        {...registerProfile("phoneNumber")}
                      />
                    </FormField>

                    {/* Giới tính */}
                    <FormField
                      label="Giới tính"
                      error={errorsProfile.gender?.message}
                    >
                      <Select
                        value={
                          watchProfile("gender") !== null &&
                          watchProfile("gender") !== undefined
                            ? watchProfile("gender")!.toString()
                            : ""
                        }
                        onValueChange={(val) =>
                          setValueProfile(
                            "gender",
                            val === "" ? null : Number(val),
                            { shouldValidate: true, shouldDirty: true },
                          )
                        }
                      >
                        <AdminSelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </AdminSelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Nam</SelectItem>
                          <SelectItem value="1">Nữ</SelectItem>
                          <SelectItem value="2">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    {/* Ngày sinh */}
                    <FormField
                      label="Ngày sinh"
                      error={errorsProfile.dateOfBirth?.message}
                    >
                      <AdminInput
                        type="date"
                        {...registerProfile("dateOfBirth")}
                      />
                    </FormField>
                  </div>
                </form>

                {/* Additional metadata row (Chi nhánh / Quyền hạn / Staff metadata) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 mt-8 border-t border-adminGray-100/30 text-left">
                  <div>
                    <span className="text-2xs font-semibold text-adminGray-600 uppercase tracking-wider block mb-1">
                      Chi nhánh
                    </span>
                    <span className="text-sm font-bold text-adminInk block">
                      {mySalon?.salonName || "HoaSenSpa TPHCM"}
                    </span>
                    <span className="text-2xs text-adminGray-600 block mt-0.5">
                      Đồng Tháp
                    </span>
                  </div>
                  <div>
                    <span className="text-2xs font-semibold text-adminGray-600 uppercase tracking-wider block mb-1">
                      Quyền hạn
                    </span>
                    <span className="text-sm font-bold text-adminInk block">
                      {profile?.roles?.[0] || "Admin"}
                    </span>
                  </div>
                  {profile?.staffInfo && (
                    <>
                      <div>
                        <span className="text-2xs font-semibold text-adminGray-600 uppercase tracking-wider block mb-1">
                          Mã nhân viên
                        </span>
                        <span className="text-sm font-bold text-adminInk block">
                          {profile.staffInfo.code || "---"}
                        </span>
                      </div>
                      <div>
                        <span className="text-2xs font-semibold text-adminGray-600 uppercase tracking-wider block mb-1">
                          Ngày vào làm
                        </span>
                        <span className="text-sm font-bold text-adminInk block">
                          {formatDisplayDate(profile.staffInfo.hireDate)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-admin border border-adminGray-100/30 shadow-sm overflow-hidden min-h-[500px]">
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-adminGray-100/30 bg-adminGray-50/50">
                <span className="font-bold text-sm md:text-base text-adminInk">
                  Đổi mật khẩu
                </span>
                <Button
                  type="submit"
                  form="security-form"
                  disabled={isSecurityPending}
                  variant="admin"
                  size="sm"
                  loading={isSecurityPending}
                  className="flex items-center gap-1.5"
                >
                  {!isSecurityPending && <Save className="w-3.5 h-3.5" />}
                  Cập nhật mật khẩu
                </Button>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 text-left">
                <form
                  id="security-form"
                  onSubmit={handleSubmitSecurity(onSubmitSecurity)}
                  className="space-y-5 max-w-xl"
                >
                  {/* Mật khẩu hiện tại */}
                  <FormField
                    label="Mật khẩu hiện tại *"
                    error={errorsSecurity.currentPassword?.message}
                  >
                    <AdminInput
                      type="password"
                      {...registerSecurity("currentPassword")}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Mật khẩu mới */}
                    <FormField
                      label="Mật khẩu mới *"
                      error={errorsSecurity.newPassword?.message}
                    >
                      <AdminInput
                        type="password"
                        {...registerSecurity("newPassword")}
                      />
                    </FormField>

                    {/* Xác nhận mật khẩu */}
                    <FormField
                      label="Xác nhận mật khẩu *"
                      error={errorsSecurity.confirmPassword?.message}
                    >
                      <AdminInput
                        type="password"
                        {...registerSecurity("confirmPassword")}
                      />
                    </FormField>
                  </div>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
