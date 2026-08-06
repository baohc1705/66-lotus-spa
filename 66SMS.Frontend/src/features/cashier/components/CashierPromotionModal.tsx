import { useState } from "react";
import type { AxiosError } from "axios";
import { Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { bookingApi } from "@/features/booking/api/booking.api";
import { useActivePromotions } from "@/features/booking/hooks/useBookingData";
import type { ActivePromotionDto } from "@/features/booking/types/booking.types";
import { AdminInput } from "@/shared/components/forms/AdminInput";
import { FormField } from "@/shared/components/forms/FormField";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { COMMON_MSG } from "@/shared/constants/common.messages";
import type { Result } from "@/shared/types/common.types";
import { cn } from "@/lib/utils";

interface CashierPromotionModalProps {
  open: boolean;
  onClose: () => void;
  orderTotal: number;
  currentDiscount: number;
  currentPromotionCode?: string | null;
  onApplyManual: (amount: number) => void;
  onApplyPromotion: (code: string, discountAmount: number) => void;
  onClear: () => void;
}

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

export function CashierPromotionModal({
  open,
  onClose,
  orderTotal,
  currentDiscount,
  currentPromotionCode,
  onApplyManual,
  onApplyPromotion,
  onClear,
}: CashierPromotionModalProps) {
  const { data, isLoading, isError } = useActivePromotions();
  const promotions = data ?? [];

  const [tab, setTab] = useState<"promo" | "manual">("promo");
  const [tempDiscount, setTempDiscount] = useState(currentDiscount);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  const handleClose = () => {
    setTab("promo");
    setApplyingCode(null);
    onClose();
  };

  const handleApplyPromo = async (promo: ActivePromotionDto) => {
    const code = promo.code.trim().toUpperCase();
    if (!code) return;

    if (orderTotal <= 0) {
      toast.error("Vui lòng thêm mặt hàng trước khi áp dụng khuyến mãi");
      return;
    }

    if (currentPromotionCode === code) {
      toast.info("Mã này đã được áp dụng");
      return;
    }

    try {
      setApplyingCode(code);
      const result = await bookingApi.validatePromotion(code, orderTotal);
      onApplyPromotion(code, result.discountAmount);
      toast.success(`Đã áp dụng mã ${code}`);
      handleClose();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<Result<unknown>>;
      const msg =
        axiosErr.response?.data?.message ??
        (err instanceof Error ? err.message : "Không thể áp dụng mã");
      toast.error(msg);
    } finally {
      setApplyingCode(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-adminInk">
            Giảm giá / Khuyến mãi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              variant={tab === "promo" ? "admin" : "outline"}
              onClick={() => setTab("promo")}
            >
              Khuyến mãi
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tab === "manual" ? "admin" : "outline"}
              onClick={() => {
                setTempDiscount(currentDiscount);
                setTab("manual");
              }}
            >
              Giảm thủ công
            </Button>
          </div>

          {tab === "promo" ? (
            <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-adminGray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải khuyến mãi...
                </div>
              )}

              {!isLoading && (isError || promotions.length === 0) && (
                <p className="text-sm text-adminGray-600 text-center py-8">
                  Không có khuyến mãi đang áp dụng.
                </p>
              )}

              {!isLoading &&
                promotions.map((promo: ActivePromotionDto) => {
                  const code = promo.code.toUpperCase();
                  const isApplied = currentPromotionCode === code;
                  const isApplying = applyingCode === code;

                  return (
                    <button
                      key={promo.id}
                      type="button"
                      disabled={isApplying}
                      onClick={() => handleApplyPromo(promo)}
                      className={cn(
                        "w-full text-left rounded-[5px] border px-3 py-3 transition",
                        isApplied
                          ? "border-adminGreen-600/40 bg-adminGreen-600/5"
                          : "border-adminGray-100 bg-adminGray-50/40 hover:border-adminGold-600/40 hover:bg-white",
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <Ticket
                          className={cn(
                            "w-4 h-4 shrink-0 mt-0.5",
                            isApplied
                              ? "text-adminGreen-600"
                              : "text-adminGold-600",
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-sm font-semibold text-adminInk truncate">
                              {code}
                            </span>
                            {isApplying ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-adminGreen-600 shrink-0" />
                            ) : isApplied ? (
                              <span className="text-xs font-semibold text-adminGreen-600 shrink-0">
                                Đã chọn
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-adminGold-600 shrink-0">
                                Áp dụng
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-adminInk mt-0.5 line-clamp-1">
                            {promo.name}
                          </p>
                          <p className="text-xs text-adminGray-600 mt-0.5">
                            {formatDiscountLabel(promo)}
                            {promo.minOrderValue != null &&
                              promo.minOrderValue > 0 &&
                              ` · Đơn tối thiểu ${promo.minOrderValue.toLocaleString("vi-VN")}đ`}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          ) : (
            <FormField label="Số tiền giảm (VND)">
              <AdminInput
                type="number"
                min={0}
                value={tempDiscount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTempDiscount(Number(e.target.value) || 0)
                }
                placeholder="Nhập số tiền giảm..."
              />
              <p className="text-xs text-adminGray-600 mt-1">
                Giảm thủ công sẽ bỏ mã khuyến mãi đang chọn (nếu có).
              </p>
            </FormField>
          )}
        </div>

        <DialogFooter className="pt-2 gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-state-danger-text hover:text-state-danger-text hover:bg-state-danger-bg border-state-danger-text/30"
            onClick={() => {
              onClear();
              handleClose();
              toast.success("Đã xóa giảm giá");
            }}
          >
            Xóa giảm giá
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
            >
              {COMMON_MSG.cancel}
            </Button>
            {tab === "manual" && (
              <Button
                type="button"
                variant="admin"
                size="sm"
                onClick={() => {
                  onApplyManual(Math.max(0, tempDiscount));
                  handleClose();
                  toast.success("Đã áp dụng giảm giá");
                }}
              >
                Xác nhận
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
