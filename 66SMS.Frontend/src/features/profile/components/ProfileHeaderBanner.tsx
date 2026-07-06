import { Calendar, Award, Wallet, Star, User as UserIcon } from "lucide-react";
import { formatCurrency } from "@/shared/utils/currency";
import {
  useMyMembershipCard,
  useMembershipTiers,
} from "../hooks/useMembershipInfo";
import { useMyBookings } from "@/features/booking/hooks/useMyBookings";
import type { UserDto } from "@/features/users/types/user.types";

interface ProfileHeaderBannerProps {
  profile?: UserDto;
}

export function ProfileHeaderBanner({ profile }: ProfileHeaderBannerProps) {
  const isCustomer = profile?.profileType === "Customer";

  // Call hooks conditionally (React Query will handle query key caching, enabled parameter prevents errors)
  const { data: card } = useMyMembershipCard(isCustomer);
  const { data: tiers = [] } = useMembershipTiers();
  const { data: bookings = [] } = useMyBookings();

  // Calculate tier details
  const currentTierName = card?.tierName || "Đồng";
  const loyaltyPoints = profile?.customerInfo?.loyaltyPoint || 0;

  // Calculate total spending (using 10,000đ per loyalty point)
  const calculatedSpending = loyaltyPoints * 10000;

  // Find current tier index and next tier
  const sortedTiers = [...tiers].sort((a, b) => a.minSpending - b.minSpending);
  const currentTierIndex = sortedTiers.findIndex(
    (t) => t.name.toLowerCase() === currentTierName.toLowerCase(),
  );

  const nextTier =
    currentTierIndex !== -1 && currentTierIndex < sortedTiers.length - 1
      ? sortedTiers[currentTierIndex + 1]
      : null;

  // Calculate progress percent
  let progressPercent = 0;
  let spendingNeeded = 0;

  if (nextTier) {
    const minSpendingCurrent =
      currentTierIndex !== -1 ? sortedTiers[currentTierIndex].minSpending : 0;
    const minSpendingNext = nextTier.minSpending;
    const spendingInCurrentTierRange = calculatedSpending - minSpendingCurrent;
    const totalRangeNeeded = minSpendingNext - minSpendingCurrent;

    spendingNeeded = Math.max(0, minSpendingNext - calculatedSpending);
    progressPercent =
      totalRangeNeeded > 0
        ? Math.min(
            100,
            Math.max(0, (spendingInCurrentTierRange / totalRangeNeeded) * 100),
          )
        : 0;
  } else if (
    currentTierIndex === sortedTiers.length - 1 &&
    sortedTiers.length > 0
  ) {
    progressPercent = 100;
  }

  // Fallback calculations matching mock if tiers array is empty (standard client setup)
  if (tiers.length === 0 && isCustomer) {
    // If no tiers loaded yet, default to Bronze -> Silver progress mock
    spendingNeeded = 600000;
    progressPercent = 40;
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5 relative overflow-hidden mb-4">
      {/* Top thin brand accent border */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-lotus-rose via-lotus-rose/70 to-lotus-rose" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6">
        {/* Left: Avatar & User Basic Info */}
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-pink-100 flex items-center justify-center p-1 bg-white shadow-sm">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName || "User avatar"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-pink-50 flex items-center justify-center text-lotus-rose">
                  <UserIcon className="w-10 h-10" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight uppercase leading-none">
              {profile?.fullName || profile?.username || "Khách hàng"}
            </h2>

            {isCustomer ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-lotus-gold text-white text-xs font-bold shadow-sm">
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                Hạng {currentTierName}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                Nhân viên Spa
              </div>
            )}

            <p className="text-xs text-gray-500 font-medium">
              Mã thành viên:{" "}
              <span className="font-bold text-gray-900">
                {card?.cardCode ||
                  "HS-" + (profile?.customerInfo?.id || "668899")}
              </span>
            </p>
          </div>
        </div>

        {/* Middle: Progress Bar */}
        {isCustomer && (
          <div className="flex-1 flex flex-col justify-center max-w-md w-full">
            <p className="text-sm font-bold text-gray-900 mb-2">
              Tiến độ thăng hạng
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>
                Hiện tại:{" "}
                <span className="text-lotus-gold font-bold">
                  {currentTierName}
                </span>
              </span>
              <span>
                Mục tiêu:{" "}
                <span className="text-indigo-600 font-bold">
                  {nextTier ? nextTier.name : "Bạc"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-lotus-rose h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-extrabold text-lotus-rose shrink-0">
                {Math.round(progressPercent)}%
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-2 font-medium">
              {nextTier ? (
                <>
                  Còn{" "}
                  <span className="font-bold text-gray-800">
                    {formatCurrency(spendingNeeded)}
                  </span>{" "}
                  để đạt hạng {nextTier.name}
                </>
              ) : (
                <>
                  Còn{" "}
                  <span className="font-bold text-gray-800">
                    {formatCurrency(spendingNeeded)}
                  </span>{" "}
                  để đạt hạng Bạc
                </>
              )}
            </p>
          </div>
        )}

        {/* Right: Stats Panel */}
        {isCustomer ? (
          <div className="border border-gray-100 rounded-xl p-3 bg-white shadow-sm flex items-center justify-between w-full lg:w-[45%] lg:max-w-md">
            <div className="flex-1 text-center">
              <Calendar className="text-pink-500 w-5 h-5 mx-auto mb-1.5" />
              <p className="text-lg md:text-xl font-extrabold text-gray-900">
                {bookings.length}
              </p>
              <p className="text-lotus-admin-xs md:text-xs text-gray-500 font-semibold tracking-wide uppercase">
                Lịch hẹn
              </p>
            </div>
            <div className="w-[1px] h-10 bg-gray-200" />
            <div className="flex-1 text-center">
              <Star className="text-yellow-500 w-5 h-5 mx-auto mb-1.5" />
              <p className="text-lg md:text-xl font-extrabold text-gray-900">
                {loyaltyPoints}
              </p>
              <p className="text-lotus-admin-xs md:text-xs text-gray-500 font-semibold tracking-wide uppercase">
                Điểm thưởng
              </p>
            </div>
            <div className="w-[1px] h-10 bg-gray-200" />
            <div className="flex-1 text-center">
              <Wallet className="text-green-600 w-5 h-5 mx-auto mb-1.5" />
              <p className="text-lg md:text-xl font-extrabold text-gray-900">
                {formatCurrency(calculatedSpending)}
              </p>
              <p className="text-lotus-admin-xs md:text-xs text-gray-500 font-semibold tracking-wide uppercase">
                Chi tiêu tích lũy
              </p>
            </div>
          </div>
        ) : (
          // Staff Stats Panel
          <div className="border border-gray-100 rounded-xl p-3 bg-white shadow-sm flex items-center justify-between w-full lg:w-[40%] lg:max-w-sm">
            <div className="flex-1 text-center">
              <Calendar className="text-pink-500 w-5 h-5 mx-auto mb-1.5" />
              <p className="text-base md:text-lg font-bold text-gray-900">
                {bookings.length || 0}
              </p>
              <p className="text-lotus-admin-xs text-gray-500 font-semibold uppercase">
                Lịch hẹn
              </p>
            </div>
            <div className="w-[1px] h-10 bg-gray-200" />
            <div className="flex-1 text-center">
              <Award className="text-yellow-500 w-5 h-5 mx-auto mb-1.5" />
              <p className="text-sm md:text-base font-bold text-gray-900">
                {profile?.staffInfo?.contractType || "---"}
              </p>
              <p className="text-lotus-admin-xs text-gray-500 font-semibold uppercase">
                Hợp đồng
              </p>
            </div>
            <div className="w-[1px] h-10 bg-gray-200" />
            <div className="flex-1 text-center">
              <Star className="text-blue-500 w-5 h-5 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-gray-900">
                {profile?.staffInfo?.hireDate
                  ? new Date(profile.staffInfo.hireDate).toLocaleDateString(
                      "vi-VN",
                    )
                  : "---"}
              </p>
              <p className="text-lotus-admin-xs text-gray-500 font-semibold uppercase">
                Ngày làm
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
