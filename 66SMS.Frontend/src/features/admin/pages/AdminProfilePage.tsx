import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { User, Lock, Loader2, Save } from "lucide-react";
import { useProfile } from "@/features/profile/hooks/useProfile";
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
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/kitToast";
import { Button } from "@/shared/elements/Button";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from "@/shared/elements/Card";
import { ListGroup, ListGroupItem } from "@/shared/elements/ListGroup";
import { FormField } from "@/shared/forms/FormField";
import { FormRow } from "@/shared/forms/FormRow";
import { FormSection } from "@/shared/forms/FormSection";
import { ImageUpload } from "@/shared/forms/ImageUpload";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { containerVariants, itemVariants } from "@/shared/motion/pageVariants";

const GENDER_OPTIONS = [
  { value: "0", label: "Nam" },
  { value: "1", label: "Nữ" },
  { value: "2", label: "Khác" },
];

export function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarKey, setAvatarKey] = useState(0);
  const qc = useQueryClient();
  const { data: profile, isLoading, isError } = useProfile();

  const updateStaffMutation = useUpdateStaffMutation();
  const changePasswordMutation = useChangePassword();

  const isProfilePending = updateStaffMutation.isPending;
  const isSecurityPending = changePasswordMutation.isPending;

  const { mySalon } = useAuthStore();

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
      setPendingAvatarFile(null);
      setAvatarKey((key) => key + 1);
    }
  }, [profile, resetProfile, getInitialProfileValues]);

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

  const onSubmitProfile = async (data: ProfileFormValues) => {
    if (!profile?.staffInfo?.id) {
      toast.error("Không tìm thấy thông tin nhân viên");
      return;
    }

    const salonId = useAuthStore.getState().getEffectiveSalonId() ?? mySalon?.salonId;
    if (!salonId) {
      toast.error("Không tìm thấy chi nhánh");
      return;
    }

    let avatarBase64: string | undefined;
    if (pendingAvatarFile) {
      avatarBase64 = await fileToBase64(pendingAvatarFile);
    }

    const payload = {
      salonId,
      fullName: data.fullName,
      phone: data.phoneNumber,
      gender:
        data.gender !== null && data.gender !== undefined
          ? Number(data.gender)
          : undefined,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth : undefined,
      ...(avatarBase64 ? { avatarUrl: avatarBase64 } : {}),
    };

    updateStaffMutation.mutate(
      { id: profile.staffInfo.id, payload },
      {
        onSuccess: (res) => {
          if (res.isSuccess) {
            setPendingAvatarFile(null);
            setAvatarKey((key) => key + 1);
            qc.invalidateQueries({ queryKey: ["profile"] });
          }
        },
      },
    );
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

  const handleAvatarFileChange = (file: File | null) => {
    setPendingAvatarFile(file);
    if (file) {
      toast.success("Đã chọn ảnh mới. Đừng quên bấm Lưu thông tin!");
    }
  };

  const genderValue = watchProfile("gender");
  const avatarUrl = watchProfile("profilePhotoUrl");

  if (!isLoading && profile?.profileType === "Customer") {
    return <Navigate to="/profile" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-125 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-kit-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-125 flex-col items-center justify-center text-center">
        <p className="mb-4 font-medium text-kit-danger">
          Không thể tải thông tin tài khoản
        </p>
        <Button
          variant="link"
          onClick={() => window.location.reload()}
          className="mb-0 mr-0 font-semibold"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full font-sans text-kit-body antialiased">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col gap-3 lg:flex-row"
      >
        <motion.div
          variants={itemVariants}
          className="flex w-full shrink-0 flex-col gap-3 lg:w-65"
        >
          <Card className="mb-0">
            <CardBody className="flex flex-col items-center py-6">
              <ImageUpload
                key={avatarKey}
                value={avatarUrl || profile?.avatarUrl}
                onFileChange={handleAvatarFileChange}
                shape="circle"
                size="lg"
                label="Đổi ảnh đại diện"
              />
              <h3 className="mt-4 w-full truncate text-center font-sans text-base font-bold text-kit-heading">
                {profile?.fullName || profile?.username || "Người dùng"}
              </h3>
            </CardBody>
          </Card>

          <Card className="mb-0">
            <CardHeader className="h-auto py-2.5">
              <CardTitle className="mb-0 text-xs tracking-wider">Menu</CardTitle>
            </CardHeader>
            <CardBody className="p-2">
              <ListGroup flush className="rounded border-0">
                <ListGroupItem
                  action
                  active={activeTab === "profile"}
                  tone={activeTab === "profile" ? "primary" : "default"}
                  onClick={() => setActiveTab("profile")}
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 shrink-0" />
                    Thông tin tài khoản
                  </span>
                </ListGroupItem>
                <ListGroupItem
                  action
                  active={activeTab === "security"}
                  tone={activeTab === "security" ? "primary" : "default"}
                  onClick={() => setActiveTab("security")}
                >
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4 shrink-0" />
                    Đổi mật khẩu
                  </span>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="min-w-0 grow">
          {activeTab === "profile" ? (
            <Card className="mb-0 min-h-125">
              <CardHeader className="justify-between gap-2">
                <span className="text-sm font-bold text-kit-heading md:text-base">
                  Thông tin tài khoản
                </span>
                <Button
                  type="submit"
                  form="profile-form"
                  disabled={isProfilePending}
                  variant="primary"
                  size="sm"
                  loading={isProfilePending}
                  className="mb-0 mr-0"
                >
                  {!isProfilePending ? <Save className="mr-1.5 h-3.5 w-3.5" /> : null}
                  Lưu thông tin
                </Button>
              </CardHeader>

              <CardBody className="p-6 md:p-8">
                <form
                  id="profile-form"
                  onSubmit={handleSubmitProfile(onSubmitProfile)}
                  className="space-y-6"
                >
                  <FormSection icon={User} title="Thông tin cá nhân">
                    <FormRow>
                      <FormField label="Email đăng nhập">
                        <Input
                          type="text"
                          value={profile?.email || ""}
                          readOnly
                          disabled
                        />
                      </FormField>

                      <FormField
                        label="Họ tên"
                        required
                        error={errorsProfile.fullName?.message}
                      >
                        <Input type="text" {...registerProfile("fullName")} />
                      </FormField>

                      <FormField label="Email liên lạc">
                        <Input
                          type="text"
                          value={profile?.email || ""}
                          readOnly
                          disabled
                        />
                      </FormField>

                      <FormField
                        label="Điện thoại"
                        required
                        error={errorsProfile.phoneNumber?.message}
                      >
                        <Input type="text" {...registerProfile("phoneNumber")} />
                      </FormField>

                      <FormField
                        label="Giới tính"
                        error={errorsProfile.gender?.message}
                      >
                        <Select
                          value={
                            genderValue !== null && genderValue !== undefined
                              ? String(genderValue)
                              : ""
                          }
                          onChange={(event) =>
                            setValueProfile(
                              "gender",
                              event.target.value === ""
                                ? null
                                : Number(event.target.value),
                              { shouldValidate: true, shouldDirty: true },
                            )
                          }
                          options={GENDER_OPTIONS}
                          placeholder="Chọn giới tính"
                        />
                      </FormField>

                      <FormField
                        label="Ngày sinh"
                        error={errorsProfile.dateOfBirth?.message}
                      >
                        <Input
                          type="date"
                          {...registerProfile("dateOfBirth")}
                        />
                      </FormField>
                    </FormRow>
                  </FormSection>
                </form>

                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-kit pt-6 text-left md:grid-cols-4">
                  <div>
                    <span className="mb-1 block text-2xs font-semibold uppercase tracking-wider text-kit-muted">
                      Chi nhánh
                    </span>
                    <span className="block text-sm font-bold text-kit-heading">
                      {mySalon?.salonName || "HoaSenSpa TPHCM"}
                    </span>
                  </div>
                  <div>
                    <span className="mb-1 block text-2xs font-semibold uppercase tracking-wider text-kit-muted">
                      Quyền hạn
                    </span>
                    <span className="block text-sm font-bold text-kit-heading">
                      {profile?.roles?.[0] || "Admin"}
                    </span>
                  </div>
                  {profile?.staffInfo ? (
                    <>
                      <div>
                        <span className="mb-1 block text-2xs font-semibold uppercase tracking-wider text-kit-muted">
                          Mã nhân viên
                        </span>
                        <span className="block text-sm font-bold text-kit-heading">
                          {profile.staffInfo.code || "---"}
                        </span>
                      </div>
                      <div>
                        <span className="mb-1 block text-2xs font-semibold uppercase tracking-wider text-kit-muted">
                          Ngày vào làm
                        </span>
                        <span className="block text-sm font-bold text-kit-heading">
                          {formatDisplayDate(profile.staffInfo.hireDate)}
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="mb-0 min-h-125">
              <CardHeader className="justify-between gap-2">
                <span className="text-sm font-bold text-kit-heading md:text-base">
                  Đổi mật khẩu
                </span>
                <Button
                  type="submit"
                  form="security-form"
                  disabled={isSecurityPending}
                  variant="primary"
                  size="sm"
                  loading={isSecurityPending}
                  className="mb-0 mr-0"
                >
                  {!isSecurityPending ? <Save className="mr-1.5 h-3.5 w-3.5" /> : null}
                  Cập nhật mật khẩu
                </Button>
              </CardHeader>

              <CardBody className="p-6 text-left md:p-8">
                <form
                  id="security-form"
                  onSubmit={handleSubmitSecurity(onSubmitSecurity)}
                  className="max-w-xl space-y-3"
                >
                  <FormSection icon={Lock} title="Bảo mật">
                    <FormField
                      label="Mật khẩu hiện tại"
                      required
                      error={errorsSecurity.currentPassword?.message}
                    >
                      <Input
                        type="password"
                        {...registerSecurity("currentPassword")}
                      />
                    </FormField>

                    <FormRow>
                      <FormField
                        label="Mật khẩu mới"
                        required
                        error={errorsSecurity.newPassword?.message}
                      >
                        <Input
                          type="password"
                          {...registerSecurity("newPassword")}
                        />
                      </FormField>

                      <FormField
                        label="Xác nhận mật khẩu"
                        required
                        error={errorsSecurity.confirmPassword?.message}
                      >
                        <Input
                          type="password"
                          {...registerSecurity("confirmPassword")}
                        />
                      </FormField>
                    </FormRow>
                  </FormSection>
                </form>
              </CardBody>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
