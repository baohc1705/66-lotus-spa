import {
  useProvinces,
  useWardsByProvince,
} from "@/features/address/hooks/useAddress";
import type {
  ProvinceDto,
  WardDto,
} from "@/features/address/types/address.types";
import {
  CUSTOMER_KEYS,
  useUpdateCustomer,
} from "@/features/customers/hooks/useCustomers";
import type { CustomerDto } from "@/features/customers/types/customer.types";
import { Button } from "@/shared/components/ui/button";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import { fileToBase64 } from "@/shared/lib/fileToBase64";
import { parseToDateInput } from "@/shared/utils/date.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Camera,
  Fingerprint,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMyMembershipCard } from "../hooks/useMembershipInfo";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import {
  customerProfileSchema,
  type CustomerProfileFormValues,
} from "../schemas/profile.schemas";
import type { ProfileResponse } from "../types/profile.types";

interface ProfileFormProps {
  initialData?: ProfileResponse;
  customerDetail?: CustomerDto | null;
}

export function ProfileForm({ initialData, customerDetail }: ProfileFormProps) {
  const qc = useQueryClient();
  const updateProfile = useUpdateProfile();
  const updateCustomer = useUpdateCustomer();
  useMyMembershipCard(true);

  const isPending = updateProfile.isPending || updateCustomer.isPending;
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(
    null,
  );

  const getInitialFormValues = useCallback((): CustomerProfileFormValues => {
    const fromCustomer = customerDetail;
    const fromInfo = initialData?.customerInfo;

    return {
      fullName: fromCustomer?.fullName ?? initialData?.fullName ?? "",
      phoneNumber: fromCustomer?.phone ?? initialData?.phone ?? "",
      profilePhotoUrl: fromCustomer?.avatarUrl ?? initialData?.avatarUrl ?? "",
      gender:
        fromCustomer?.gender !== null && fromCustomer?.gender !== undefined
          ? Number(fromCustomer.gender)
          : initialData?.gender !== null && initialData?.gender !== undefined
            ? Number(initialData.gender)
            : null,
      dateOfBirth:
        parseToDateInput(
          fromCustomer?.dateOfBirth ?? initialData?.dateOfBirth,
        ) ?? "",
      streetAddress:
        fromCustomer?.streetAddress ?? fromInfo?.streetAddress ?? "",
      provinceCode: fromCustomer?.provinceCode ?? fromInfo?.provinceCode ?? "",
      wardCode: fromCustomer?.wardCode ?? fromInfo?.wardCode ?? "",
      username: initialData?.username ?? "",
      email: initialData?.email ?? "",
    };
  }, [customerDetail, initialData]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: getInitialFormValues(),
  });

  useEffect(() => {
    reset(getInitialFormValues());
    setPendingAvatarFile(null);
    setLocalAvatarPreview(null);
  }, [getInitialFormValues, reset]);

  const selectedProvince = watch("provinceCode");
  const provincesQuery = useProvinces();
  const wardsQuery = useWardsByProvince(selectedProvince || null);

  const onSubmit = async (data: CustomerProfileFormValues) => {
    if (!customerDetail?.id) {
      toast.error("Không tìm thấy thông tin khách hàng");
      return;
    }

    const provinceName =
      provincesQuery.data?.data?.find(
        (p: ProvinceDto) => p.code === data.provinceCode,
      )?.name ?? "";
    const wardName =
      wardsQuery.data?.data?.find((w: WardDto) => w.code === data.wardCode)
        ?.name ?? "";
    const parts = [data.streetAddress, wardName, provinceName].filter(Boolean);

    let imageBase64: string | undefined;
    if (pendingAvatarFile) {
      imageBase64 = await fileToBase64(pendingAvatarFile);
    }

    const customerPayload = {
      fullName: data.fullName,
      phone: data.phoneNumber,
      avatarUrl: data.profilePhotoUrl ?? undefined,
      imageBase64,
      gender:
        data.gender !== null && data.gender !== undefined
          ? Number(data.gender)
          : undefined,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth : undefined,
      streetAddress: data.streetAddress || undefined,
      provinceCode: data.provinceCode || undefined,
      wardCode: data.wardCode || undefined,
      fullAddress: parts.join(", ") || undefined,
    };

    const accountPayload = {
      username: data.username,
      email: data.email,
    };

    try {
      const [customerRes, accountRes] = await Promise.all([
        updateCustomer.mutateAsync({
          id: customerDetail.id,
          payload: customerPayload,
        }),
        updateProfile.mutateAsync(accountPayload),
      ]);

      if (customerRes.isSuccess && accountRes.isSuccess) {
        setPendingAvatarFile(null);
        setLocalAvatarPreview(null);
        qc.invalidateQueries({ queryKey: ["profile"] });
        qc.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
      }
    } catch {
      // toast đã xử lý trong hooks
    }
  };

  const handleAvatarClick = () => {
    const fileInput = document.getElementById("avatar-upload-input");
    fileInput?.click();
  };

  const handleAvatarChange = (e: { target: { files: FileList | null } }) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingAvatarFile(file);
    setLocalAvatarPreview(URL.createObjectURL(file));
    toast.success("Đã chọn ảnh mới. Đừng quên bấm Lưu thay đổi!");
  };

  const avatarUrl = localAvatarPreview ?? watch("profilePhotoUrl");

  const inputClass =
    "w-full px-4 py-3 rounded-none border border-lotus-stone/30 bg-white focus:outline-none focus:border-lotus-rose focus:ring-1 focus:ring-lotus-rose transition-colors text-lotus-deep";

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="w-full lg:w-[35%] flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-md bg-lotus-cream p-4 flex flex-col items-center">
            <input
              id="avatar-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div
              onClick={handleAvatarClick}
              className="relative z-10 w-60 h-60 rounded-full p-0.5 shadow-sm mb-3 cursor-pointer group"
            >
              <div className="w-full h-full rounded-full overflow-hidden relative">
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
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[65%]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-lotus-deep mb-1 font-sans">
                  Thông tin cá nhân
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                    <User className="w-4 h-4 text-lotus-stone" />
                    Họ và tên
                  </label>
                  <input
                    {...register("fullName")}
                    placeholder="Nhập họ tên của bạn"
                    className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="0">Nam</option>
                    <option value="1">Nữ</option>
                    <option value="2">Khác</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-lotus-stone" />
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    {...register("dateOfBirth")}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-lotus-stone" />
                    Tỉnh/Thành phố
                  </label>
                  <SearchableSelect
                    value={watch("provinceCode") ?? ""}
                    onValueChange={(v) => {
                      setValue("provinceCode", v);
                      setValue("wardCode", "");
                    }}
                    options={(provincesQuery.data?.data ?? []).map(
                      (p: ProvinceDto) => ({
                        value: p.code ?? "",
                        label: p.name ?? "",
                      }),
                    )}
                    placeholder="Chọn tỉnh/thành phố"
                    searchPlaceholder="Tìm tỉnh/thành phố..."
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-lotus-stone" />
                    Phường/Xã
                  </label>
                  <SearchableSelect
                    value={watch("wardCode") ?? ""}
                    onValueChange={(v) => setValue("wardCode", v)}
                    options={(wardsQuery.data?.data ?? []).map(
                      (w: WardDto) => ({
                        value: w.code ?? "",
                        label: w.name ?? "",
                      }),
                    )}
                    placeholder="Chọn phường/xã"
                    searchPlaceholder="Tìm phường/xã..."
                    disabled={!watch("provinceCode") || wardsQuery.isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-lotus-stone" />
                    Số nhà, tên đường
                  </label>
                  <input
                    {...register("streetAddress")}
                    placeholder="123 Đường ABC"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-lotus-deep mb-1 font-sans">
                  Tài khoản đăng nhập
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-lotus-stone" />
                    Tên đăng nhập
                  </label>
                  <input
                    {...register("username")}
                    placeholder="Tên đăng nhập"
                    className={inputClass}
                  />
                  {errors.username && (
                    <p className="text-sm text-lotus-error">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-lotus-deep flex items-center gap-2">
                    <Mail className="w-4 h-4 text-lotus-stone" />
                    Email
                  </label>
                  <input
                    {...register("email")}
                    placeholder="Địa chỉ email"
                    className={inputClass}
                  />
                  {errors.email && (
                    <p className="text-sm text-lotus-error">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
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
      </div>
    </div>
  );
}
