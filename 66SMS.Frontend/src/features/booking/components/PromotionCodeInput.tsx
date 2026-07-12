import { CheckCircle2, Loader2, Sparkles, Ticket, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { bookingApi } from "../api/booking.api";
import { useBookingStore } from "../stores/bookingStore";

interface PromotionCodeInputProps {
  variant?: "default" | "ticket";
}

export const PromotionCodeInput: React.FC<PromotionCodeInputProps> = ({
  variant = "default",
}) => {
  const isTicket = variant === "ticket";
  const {
    guests,
    appliedPromotion,
    setAppliedPromotion,
    promotionCode,
    setPromotionCode,
    clearPromotion,
  } = useBookingStore();

  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = guests.reduce(
    (sum, g) => sum + (g.selectedService?.sellingPrice || 0),
    0
  );

  const handleApply = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();

    if (!code) {
      setError("Vui lòng nhập mã khuyến mãi");
      return;
    }

    if (total <= 0) {
      setError("Vui lòng chọn dịch vụ trước khi áp dụng mã");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await bookingApi.validatePromotion(code, total);

      setAppliedPromotion(result);
      setPromotionCode(code);
      setInputCode("");
      toast.success("Áp dụng mã khuyến mãi thành công!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Mã không hợp lệ";
      setError(msg);
      clearPromotion();
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    clearPromotion();
    setInputCode("");
    setError("");
    toast.info("Đã hủy bỏ mã khuyến mãi");
  };

  if (appliedPromotion) {
    return (
      <div
        className={`bg-success-bg p-3 flex items-center justify-between ${
          isTicket ? "rounded-full" : "rounded-sm"
        }`}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success-text shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-success-text flex items-center gap-1.5">
              <span>Mã: {promotionCode}</span>
              <span className="bg-surface text-success-text px-1.5 py-0.5 rounded-sm text-2xs font-medium">
                Đã áp dụng
              </span>
            </div>
            <div className="text-success-text font-semibold mt-0.5">
              Giảm -{appliedPromotion.discountAmount.toLocaleString("vi-VN")}đ
            </div>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="text-warm-400 hover:text-error-text transition-colors p-1.5 hover:bg-error-bg rounded-sm"
          title="Xóa mã"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
          <input
            type="text"
            placeholder="Nhập mã khuyến mãi..."
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              if (error) setError("");
            }}
            disabled={loading}
            className={`w-full border border-warm-100 bg-surface py-2.5 pl-9 pr-3 text-xs font-medium uppercase text-ink placeholder:normal-case placeholder:text-warm-600 hover:border-warm-300 focus:outline-none focus:border-rose-600 disabled:bg-warm-50 disabled:text-warm-400 ${
              isTicket ? "rounded-full" : "rounded-sm"
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !inputCode.trim()}
          className={`px-4 py-2.5 bg-rose-600 text-white hover:bg-rose-500 disabled:bg-warm-50 disabled:text-warm-300 font-bold text-xs transition-all shrink-0 flex items-center justify-center gap-1 ${
            isTicket ? "rounded-full" : "rounded-sm"
          }`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              Áp dụng
              {isTicket && <Sparkles className="w-3 h-3" />}
            </>
          )}
        </button>
      </div>
      {error && (
        <span className="text-xs text-error-text font-bold ml-1">{error}</span>
      )}
    </form>
  );
};
