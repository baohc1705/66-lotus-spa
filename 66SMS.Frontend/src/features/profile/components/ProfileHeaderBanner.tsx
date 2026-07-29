import { Calendar, Wallet, Star, User as UserIcon } from "lucide-react";
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
  const { data: card } = useMyMembershipCard(true);
  const { data: tiers = [] } = useMembershipTiers();
  const { data: bookings = [] } = useMyBookings();

  const currentTierName = card?.tierName || "Đồng";
  const loyaltyPoints = profile?.customerInfo?.loyaltyPoint || 0;
  const calculatedSpending = loyaltyPoints * 10000;

  const sortedTiers = [...tiers].sort((a, b) => a.minSpending - b.minSpending);
  const currentTierIndex = sortedTiers.findIndex(
    (t) => t.name.toLowerCase() === currentTierName.toLowerCase(),
  );

  const nextTier =
    currentTierIndex !== -1 && currentTierIndex < sortedTiers.length - 1
      ? sortedTiers[currentTierIndex + 1]
      : null;

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

  if (tiers.length === 0) {
    spendingNeeded = 600000;
    progressPercent = 40;
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm p-3 md:p-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-rose-50">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName || "User avatar"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-7 h-7 text-lotus-rose" />
            )}
          </div>

          <div className="space-y-0.5">
            <h2 className="text-lg md:text-xl font-extrabold text-ink tracking-tight uppercase leading-none">
              {profile?.fullName || profile?.username || "Khách hàng"}
            </h2>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-lotus-gold text-white text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-white text-white" />
              Hạng {currentTierName}
            </div>

            <p className="text-xs text-warm-600 font-medium">
              Mã thành viên:{" "}
              <span className="font-bold text-ink">
                {card?.cardCode ||
                  "HS-" + (profile?.customerInfo?.id || "668899")}
              </span>
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full">
          <p className="text-xs font-bold text-ink mb-1.5">
            Tiến độ thăng hạng
          </p>
          <div className="flex items-center justify-between text-xs text-warm-600 mb-1">
            <span>
              Hiện tại:{" "}
              <span className="text-lotus-gold font-bold">
                {currentTierName}
              </span>
            </span>
            <span>
              Mục tiêu:{" "}
              <span className="text-rose-600 font-bold">
                {nextTier ? nextTier.name : "Bạc"}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-warm-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-lotus-rose h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-lotus-rose shrink-0">
              {Math.round(progressPercent)}%
            </span>
          </div>

          <p className="text-xs text-warm-400 mt-1.5 font-medium">
            {nextTier ? (
              <>
                Còn{" "}
                <span className="font-bold text-ink">
                  {formatCurrency(spendingNeeded)}
                </span>{" "}
                để đạt hạng {nextTier.name}
              </>
            ) : (
              <>
                Còn{" "}
                <span className="font-bold text-ink">
                  {formatCurrency(spendingNeeded)}
                </span>{" "}
                để đạt hạng Bạc
              </>
            )}
          </p>
        </div>

        <div className="rounded-lg p-2.5 bg-lotus-cream/60 flex items-center justify-between w-full lg:w-[45%] lg:max-w-md">
          <div className="flex-1 text-center">
            <Calendar className="text-rose-500 w-4 h-4 mx-auto mb-1" />
            <p className="text-base md:text-lg font-extrabold text-ink">
              {bookings.length}
            </p>
            <p className="text-2xs md:text-xs text-warm-600 font-semibold tracking-wide uppercase">
              Lịch hẹn
            </p>
          </div>
          <div className="w-[1px] h-8 bg-warm-200/80" />
          <div className="flex-1 text-center">
            <Star className="text-gold-600 w-4 h-4 mx-auto mb-1" />
            <p className="text-base md:text-lg font-extrabold text-ink">
              {loyaltyPoints}
            </p>
            <p className="text-2xs md:text-xs text-warm-600 font-semibold tracking-wide uppercase">
              Điểm thưởng
            </p>
          </div>
          <div className="w-[1px] h-8 bg-warm-200/80" />
          <div className="flex-1 text-center">
            <Wallet className="text-success-text w-4 h-4 mx-auto mb-1" />
            <p className="text-base md:text-lg font-extrabold text-ink">
              {formatCurrency(calculatedSpending)}
            </p>
            <p className="text-2xs md:text-xs text-warm-600 font-semibold tracking-wide uppercase">
              Chi tiêu tích lũy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
