import { useAuthStore } from "@/features/auth/stores/authStore";
import {
  useMembershipTiers,
  useMyMembershipCard,
} from "@/features/profile/hooks/useMembershipInfo";
import type { Result } from "@/shared/types/common.types";
import type { AxiosError } from "axios";
import { Loader2, Ticket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { bookingApi } from "../api/booking.api";
import { useActivePromotions } from "../hooks/useBookingData";
import { useBookingStore } from "../stores/bookingStore";
import type { ActivePromotionDto } from "../types/booking.types";

function formatDiscountLabel(promo: ActivePromotionDto): string {
  if (promo.discountType === 1) {
    const percent = promo.discountValue ?? 0;
    const max =
      promo.maxDiscountAmount != null && promo.maxDiscountAmount > 0
        ? ` (tối đa ${promo.maxDiscountAmount.toLocaleString("vi-VN")}đ)`
        : "";
    return `Giảm ${percent}%${max}`;
  }
  if (promo.discountType === 2) {
    return `Giảm ${(promo.discountValue ?? 0).toLocaleString("vi-VN")}đ`;
  }
  return promo.discountTypeName || "Khuyến mãi";
}

export function ActivePromotionList() {
  const { data, isLoading, isError } = useActivePromotions();
  const {
    guests,
    appliedPromotion,
    promotionCode,
    setAppliedPromotion,
    setPromotionCode,
    clearPromotion,
  } = useBookingStore();

  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  const accessToken = useAuthStore((s) => s.accessToken);
  const membershipCardQuery = useMyMembershipCard(!!accessToken);
  const tiersQuery = useMembershipTiers();

  const membershipTiers = tiersQuery.data?.find(
    (t) => t.id === membershipCardQuery.data?.membershipTierId,
  );
  const membershipPercent = membershipTiers?.discountPercent ?? 0;

  const servicesSubTotal = guests.reduce(
    (sum, g) => sum + (g.selectedService?.sellingPrice || 0),
    0,
  );
  const membershipDiscount =
    membershipPercent > 0 && servicesSubTotal > 0
      ? Math.round((servicesSubTotal * membershipPercent) / 100)
      : 0;
  const orderTotalForPromo = Math.max(0, servicesSubTotal - membershipDiscount);

  const promotions = data ?? [];

  const handleApply = async (promo: ActivePromotionDto) => {
    const code = promo.code.trim().toUpperCase();
    if (!code) return;

    if (servicesSubTotal <= 0) {
      toast.error("Vui lòng chọn dịch vụ trước khi áp dụng mã");
      return;
    }

    if (promotionCode === code && appliedPromotion) {
      toast.info("Mã này đã được áp dụng");
      return;
    }

    try {
      setApplyingCode(code);
      const result = await bookingApi.validatePromotion(
        code,
        orderTotalForPromo,
      );
      setAppliedPromotion(result);
      setPromotionCode(code);
      toast.success(`Đã áp dụng mã ${code}`);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<Result<unknown>>;
      const msg =
        axiosErr.response?.data?.message ??
        (err instanceof Error ? err.message : "Không thể áp dụng mã");
      toast.error(msg);
      clearPromotion();
    } finally {
      setApplyingCode(null);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="h-px bg-warm-100" />
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-warm-600">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Đang tải khuyến mãi...
        </div>
      </>
    );
  }

  if (isError || promotions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="h-px bg-warm-100" />
      <div className="flex flex-col gap-2">
        <p className="text-2xs font-bold uppercase tracking-wider text-gold-600">
          Khuyến mãi đang áp dụng
        </p>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
          {promotions.map((promo: ActivePromotionDto) => {
            const code = promo.code.toUpperCase();
            const isApplied = promotionCode === code && !!appliedPromotion;
            const isApplying = applyingCode === code;

            return (
              <button
                key={promo.id}
                type="button"
                disabled={isApplying}
                onClick={() => handleApply(promo)}
                className={`w-full text-left rounded-sm border px-3 py-2.5 transition-all ${
                  isApplied
                    ? "border-success-text/40 bg-success-bg"
                    : "border-warm-100 bg-warm-50 hover:border-rose-300 hover:bg-rose-50/40"
                }`}
              >
                <div className="flex items-start gap-2">
                  <Ticket
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isApplied ? "text-success-text" : "text-rose-600"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-ink truncate">
                        {code}
                      </span>
                      {isApplying ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600 shrink-0" />
                      ) : isApplied ? (
                        <span className="text-2xs font-bold text-success-text shrink-0">
                          Đã chọn
                        </span>
                      ) : (
                        <span className="text-2xs font-bold text-rose-600 shrink-0">
                          Áp dụng
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-ink mt-0.5 line-clamp-1">
                      {promo.name}
                    </p>
                    <p className="text-2xs text-rose-600 font-medium mt-0.5">
                      {formatDiscountLabel(promo)}
                    </p>
                    {promo.minOrderValue != null && promo.minOrderValue > 0 && (
                      <p className="text-2xs text-warm-600 mt-0.5">
                        Đơn tối thiểu{" "}
                        {promo.minOrderValue.toLocaleString("vi-VN")}đ
                      </p>
                    )}
                    {promo.endDate && (
                      <p className="text-2xs text-warm-500 mt-0.5">
                        HSD: {promo.endDate}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
