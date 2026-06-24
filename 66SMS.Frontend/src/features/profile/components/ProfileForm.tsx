import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  type ProfileFormValues,
} from "../schemas/profile.schemas";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { Button } from "@/shared/components/ui/button";
import {
  Camera,
  User,
  Phone,
  Fingerprint,
  ShieldCheck,
  Loader2,
  Calendar,
  Activity,
  Star,
} from "lucide-react";
import type { ProfileResponse } from "../types/profile.types";
import { useEffect, useCallback } from "react";
import { formatDisplayDate, parseToDateInput } from "@/shared/utils/date.utils";
import { useMyMembershipCard } from "../hooks/useMembershipInfo";
import { useUpdateCustomer } from "@/features/customers/hooks/useCustomers";
import { useUpdateStaff } from "@/features/staffs/hooks/useStaffs";
import { useQueryClient } from "@tanstack/react-query";
import type { CustomerDto } from "@/features/customers/types/customer.types";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import { uploadApi } from "@/shared/api/upload.api";
import { toast } from "sonner";

interface ProfileFormProps {
  initialData?: ProfileResponse;
  customerDetail?: CustomerDto | null;
  staffDetail?: StaffDto | null;
}

export function ProfileForm({
  initialData,
  customerDetail,
  staffDetail,
}: ProfileFormProps) {
  const qc = useQueryClient();
  const updateProfile = useUpdateProfile();
  const updateCustomer = useUpdateCustomer();
  const updateStaff = useUpdateStaff();

  const isCustomer = initialData?.profileType === "Customer";
  const isStaff = initialData?.profileType === "Staff";
  const { data: card } = useMyMembershipCard(isCustomer);

  const isPending =
    updateProfile.isPending ||
    updateCustomer.isPending ||
    updateStaff.isPending;

  const getInitialFormValues = useCallback(() => {
    if (isCustomer && customerDetail) {
      return {
        fullName: customerDetail.fullName ?? "",
        phoneNumber: customerDetail.phone ?? "",
        profilePhotoUrl: customerDetail.avatarUrl ?? "",
        gender:
          customerDetail.gender !== null && customerDetail.gender !== undefined
            ? Number(customerDetail.gender)
            : null,
        dateOfBirth: parseToDateInput(customerDetail.dateOfBirth) ?? "",
      };
    }
    if (isStaff && staffDetail) {
      return {
        fullName: staffDetail.fullName ?? "",
        phoneNumber: staffDetail.phone ?? "",
        profilePhotoUrl: staffDetail.avatarUrl ?? "",
        gender:
          staffDetail.gender !== null && staffDetail.gender !== undefined
            ? Number(staffDetail.gender)
            : null,
        dateOfBirth: parseToDateInput(staffDetail.dateOfBirth) ?? "",
      };
    }
    return {
      fullName: initialData?.fullName ?? "",
      phoneNumber: initialData?.phone ?? "",
      profilePhotoUrl: initialData?.avatarUrl ?? "",
      gender:
        initialData?.gender !== null && initialData?.gender !== undefined
          ? Number(initialData.gender)
          : null,
      dateOfBirth: parseToDateInput(initialData?.dateOfBirth) ?? "",
    };
  }, [isCustomer, customerDetail, isStaff, staffDetail, initialData]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: getInitialFormValues(),
  });

  useEffect(() => {
    reset(getInitialFormValues());
  }, [getInitialFormValues, reset]);

  const onSubmit = (data: ProfileFormValues) => {
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

    if (isCustomer && customerDetail?.id) {
      updateCustomer.mutate(
        { id: customerDetail.id, payload },
        {
          onSuccess: (res) => {
            if (res.isSuccess) {
              qc.invalidateQueries({ queryKey: ["profile"] });
            }
          },
        },
      );
    } else if (isStaff && staffDetail?.id) {
      updateStaff.mutate(
        { id: staffDetail.id, payload },
        {
          onSuccess: (res) => {
            if (res.isSuccess) {
              qc.invalidateQueries({ queryKey: ["profile"] });
            }
          },
        },
      );
    } else {
      updateProfile.mutate({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        profilePhotoUrl: data.profilePhotoUrl,
      });
    }
  };

  const handleAvatarClick = () => {
    const fileInput = document.getElementById("avatar-upload-input");
    fileInput?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadApi.uploadImage(file, "profile");
      if (result.isSuccess && result.data) {
        setValue("profilePhotoUrl", result.data);
        toast.success(
          "Tải ảnh đại diện lên thành công. Đừng quên bấm Lưu thay đổi!",
        );
      } else {
        toast.error(result.message || "Tải ảnh đại diện thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi tải ảnh đại diện");
    }
  };

  const avatarUrl = watch("profilePhotoUrl");

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Profile Card (Avatar & Status) */}
        <div className="w-full lg:w-[35%] flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-md bg-lotus-cream p-6 flex flex-col items-center">
            <input
              id="avatar-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div
              onClick={handleAvatarClick}
              className="relative z-10 w-32 h-32 rounded-full p-1 shadow-sm mb-4 bg-white border border-lotus-rose/20 cursor-pointer group"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lotus-rose/40">
                    <User className="w-16 h-16" />
                  </div>
                )}

                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                {initialData?.status === "Active"
                  ? "Đang hoạt động"
                  : initialData?.status || "Thành viên"}
              </p>
            </div>

            {isCustomer && (
              <div className="w-full mt-6 pt-4 border-t border-lotus-gold/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-lotus-stone flex items-center gap-1">
                    <Star className="w-4 h-4 text-lotus-gold" />
                    Hạng thành viên:
                  </span>
                  <span className="text-sm font-semibold text-lotus-deep">
                    {card?.tierName || "Thường"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-lotus-stone flex items-center gap-1">
                    <Activity className="w-4 h-4 text-lotus-rose" />
                    Điểm tích lũy:
                  </span>
                  <span className="text-sm font-semibold text-lotus-deep">
                    {customerDetail?.loyaltyPoint || 0}
                  </span>
                </div>
              </div>
            )}

            {isStaff && (
              <div className="w-full mt-6 pt-4 border-t border-lotus-gold/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-lotus-stone flex items-center gap-1">
                    <Fingerprint className="w-4 h-4 text-lotus-stone" />
                    Mã nhân viên:
                  </span>
                  <span className="text-sm font-semibold text-lotus-deep">
                    {staffDetail?.code || "---"}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-lotus-stone flex items-center gap-1">
                    <Activity className="w-4 h-4 text-lotus-stone" />
                    Loại hợp đồng:
                  </span>
                  <span className="text-sm font-semibold text-lotus-deep">
                    {staffDetail?.contractType || "---"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-lotus-stone flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-lotus-stone" />
                    Ngày vào làm:
                  </span>
                  <span className="text-sm font-semibold text-lotus-deep">
                    {formatDisplayDate(staffDetail?.hireDate)}
                  </span>
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
                  Cập nhật thông tin để chúng tôi có thể hỗ trợ và phục vụ bạn
                  tốt hơn.
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
                  <select
                    value={watch("gender") ?? ""}
                    onChange={(e) =>
                      setValue(
                        "gender",
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-lotus-rose/20 focus:border-lotus-rose transition-all text-lotus-deep"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="0">Nam</option>
                    <option value="1">Nữ</option>
                    <option value="2">Khác</option>
                  </select>
                  {errors.gender && (
                    <p className="text-sm text-lotus-error">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-lotus-stone" />
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    {...register("dateOfBirth")}
                    className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-lotus-rose/20 focus:border-lotus-rose transition-all text-lotus-deep"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-lotus-error">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
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
