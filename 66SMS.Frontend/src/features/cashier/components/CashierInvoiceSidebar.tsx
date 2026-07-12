import { useState } from "react";
import {
  X,
  Check,
  CreditCard,
  Banknote,
  QrCode,
  Plus,
  Wallet,
} from "lucide-react";
import type { CashierBooking } from "../types";
import { cn } from "@/lib/utils";

interface CashierInvoiceSidebarProps {
  booking: CashierBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onPay: (bookingId: string, paymentMethod: string) => void;
  onRequestDeposit?: (bookingId: string) => void;
  isPaying?: boolean;
  onRedirectToPOS?: (booking: CashierBooking) => void;
}

export function CashierInvoiceSidebar({
  booking,
  isOpen,
  onClose,
  onPay,
  onRequestDeposit,
  isPaying = false,
  onRedirectToPOS,
}: CashierInvoiceSidebarProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash");

  if (!isOpen || !booking) return null;

  const canPay = booking.status === "unpaid" || booking.status === "completed";
  const isPaid = booking.status === "paid";
  const amountDue = canPay ? booking.remainingAmount : 0;

  const methods = [
    { id: "cash", label: "Tiền mặt", icon: Banknote },
    { id: "transfer", label: "Chuyển khoản", icon: QrCode },
    { id: "card", label: "Thẻ / POS", icon: CreditCard },
    { id: "wallet", label: "Ví khách hàng", icon: Wallet, isWallet: true },
    { id: "vnpay", label: "VNPAY", icon: Wallet, isVnpay: true },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] bg-white rounded-[5px] border border-adminGold-600/30 shadow-[0_12px_40px_rgba(42,31,26,0.22)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="h-14 flex items-center justify-between px-5 border-b border-adminGold-600/20 bg-adminGray-50/30">
        <h2 className="font-semibold text-adminInk">
          Chi tiết hóa đơn {booking.invoiceCode ? `#${booking.invoiceCode}` : ""}
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-[5px] hover:bg-adminGray-50 text-adminGray-600 hover:text-adminInk transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
        <div className="flex items-center gap-3 mb-6 p-4 rounded-[5px] border border-adminGold-600/20 bg-adminGray-50/20">
          <div className="w-12 h-12 rounded-full bg-adminGold-600/10 flex items-center justify-center text-adminGold-600 font-bold text-lg">
            {booking.customerName.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-adminInk">
              {booking.customerName}
            </h3>
            <p className="text-sm text-adminGray-600">
              {booking.customerPhone || "Chưa cập nhật SĐT"}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm text-adminInk">
              Dịch vụ & Sản phẩm
            </h4>
            <button className="text-xs font-medium text-adminGreen-600 hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Thêm
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-adminInk">
                  {booking.serviceName}
                </p>
                <p className="text-xs text-adminGray-600">
                  KTV: {booking.staffName}
                </p>
              </div>
              <div className="text-sm font-medium text-adminInk">
                {booking.totalAmount.toLocaleString("vi-VN")}đ
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 p-3 rounded-[5px] bg-adminGreen-50 border border-adminGreen-200 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-adminInk/70">Đã cọc (20%):</span>
            <span className="font-medium text-adminGreen-600">
              {booking.depositPaid
                ? `${Math.min(booking.paidAmount, booking.depositAmount).toLocaleString("vi-VN")}đ`
                : "Chưa cọc"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-adminInk/70">Đã thu tổng:</span>
            <span className="font-medium text-adminInk">
              {booking.paidAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        {booking.status !== "unpaid" && (
          <>
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-adminInk mb-3">
                Phương thức thanh toán
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {methods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      disabled={method.isWallet && (booking.customerWalletBalance || 0) < amountDue}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 rounded-[5px] transition-all relative overflow-hidden",
                        isSelected
                          ? "border-2 border-adminGreen-600 bg-adminGreen-50 text-adminGreen-600"
                          : method.isWallet && (booking.customerWalletBalance || 0) < amountDue
                            ? "border border-adminGray-100 bg-adminGray-50 text-adminGray-400 cursor-not-allowed opacity-60"
                            : "border border-adminGold-600/20 hover:border-adminGold-600/40 text-adminGray-600 hover:bg-adminGray-50/20",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span
                        className={cn(
                          "text-xs font-medium text-center",
                          method.isVnpay && !isSelected && "text-lotus-vnpay font-bold tracking-wide",
                        )}
                      >
                        {method.label}
                        {method.isWallet && (
                          <span className="block text-2xs opacity-80 mt-0.5">
                            ({(booking.customerWalletBalance || 0).toLocaleString("vi-VN")}đ)
                          </span>
                        )}
                      </span>
                      {method.isWallet && (booking.customerWalletBalance || 0) < amountDue && (
                         <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                           <span className="text-2xs font-bold text-state-danger-text bg-white px-2 py-0.5 rounded border border-state-danger-border rotate-[-10deg]">KHÔNG ĐỦ SỐ DƯ</span>
                         </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "vnpay" && (
                <div className="mt-4 p-4 border border-lotus-vnpay/20 bg-lotus-vnpay/5 rounded-[5px] flex flex-col items-center justify-center relative overflow-hidden transition-all">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lotus-vnpay to-lotus-vnpay-red"></div>
                  <p className="text-sm text-center font-semibold text-adminInk">
                    Thanh toán phần còn lại qua VNPAY
                  </p>
                  <p className="text-lg font-bold text-lotus-vnpay mt-2">
                    {amountDue.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-sm text-adminInk mb-2">
                Ghi chú
              </h4>
              <textarea
                placeholder="Nhập ghi chú hóa đơn..."
                defaultValue={booking.note || ""}
                className="w-full text-sm border border-adminGold-600/20 bg-adminGray-50/10 rounded-[5px] p-3 min-h-[80px] focus:outline-none focus:border-adminGreen-600 focus:ring-1 focus:ring-adminGreen-600 resize-none text-adminInk placeholder:text-adminGray-600"
              ></textarea>
            </div>
          </>
        )}
      </div>

      <div className="p-5 border-t border-adminGold-600/20 bg-adminGray-50/30">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-adminGray-600">Tổng dịch vụ (gốc):</span>
            <span className="font-medium text-adminInk">
              {(booking.totalAmount + (booking.discountAmount ?? 0)).toLocaleString("vi-VN")}đ
            </span>
          </div>
          {(booking.discountAmount ?? 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-adminGray-600">Giảm giá (khuyến mãi):</span>
              <span className="font-medium text-adminGreen-600">
                -{(booking.discountAmount ?? 0).toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-adminGray-600">Thực thu (sau giảm):</span>
            <span className="font-medium text-adminInk">
              {booking.totalAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-adminGray-600">Đã thu (cọc + tạm ứng):</span>
            <span className="font-medium text-adminGreen-600">
              -{booking.paidAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-adminGold-600/20 mt-2">
            <span className="font-bold text-adminInk">Còn lại cần thu:</span>
            <span className="font-bold text-adminGreen-600 text-lg">
              {amountDue.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        {!canPay && !isPaid && (
          <p className="text-xs text-state-warning-text bg-state-warning-bg border border-state-warning-border/50 rounded-[5px] p-2.5 mb-3">
            Chỉ thanh toán phần còn lại sau khi nhân viên hoàn thành dịch vụ
            (trạng thái chờ thanh toán).
          </p>
        )}

        {isPaid && booking.invoiceCode && (
          <p className="text-xs text-state-success-text bg-state-success-bg border border-state-success-border rounded-[5px] p-2.5 mb-3 text-center font-medium">
            Hóa đơn đã được phát hành thành công: #{booking.invoiceCode}
          </p>
        )}

        {canPay && !booking.depositPaid && !!booking.depositDeadlineAt && (
          <p className="text-xs text-state-warning-text bg-state-warning-bg border border-state-warning-border/50 rounded-[5px] p-2.5 mb-3">
            Khách đặt lịch online nhưng chưa đặt cọc. Thu toàn bộ{" "}
            {booking.totalAmount.toLocaleString("vi-VN")}đ.
          </p>
        )}

        {booking.status === "unpaid" && onRedirectToPOS ? (
          <button
            onClick={() => onRedirectToPOS(booking)}
            disabled={isPaying}
            className="w-full py-3 rounded-[5px] bg-adminGreen-600 hover:bg-adminGreen-600/90 flex items-center justify-center gap-2 text-white font-semibold text-sm transition-all shadow-md"
          >
            <CreditCard className="w-5 h-5" />
            <span>Thanh toán hóa đơn tại POS</span>
          </button>
        ) : booking.status === "pending" && !booking.depositDeadlineAt && onRequestDeposit ? (
          <button
            onClick={() => onRequestDeposit(booking.id)}
            disabled={isPaying}
            className={cn(
              "w-full py-3 rounded-[5px] flex items-center justify-center gap-2 text-white font-semibold text-sm transition-all shadow-md",
              isPaying
                ? "bg-adminGray-400/50 cursor-not-allowed text-white/80 shadow-none"
                : "bg-adminGreen-600 hover:bg-adminGreen-600/90"
            )}
          >
            <Wallet className="w-5 h-5" />
            {isPaying ? "Đang xử lý..." : "Xác nhận & Yêu cầu khách cọc"}
          </button>
        ) : (
          <button
            onClick={() => onPay(booking.id, paymentMethod)}
            className={cn(
              "w-full py-3 rounded-[5px] flex items-center justify-center gap-2 text-white font-semibold text-sm transition-all shadow-md",
              isPaid || isPaying || !canPay
                ? "bg-adminGray-400/50 cursor-not-allowed text-white/80 shadow-none"
                  : paymentMethod === "vnpay"
                    ? "bg-gradient-to-r from-lotus-vnpay to-lotus-vnpay-red hover:opacity-90 shadow-lotus-vnpay/20"
                    : "bg-adminGreen-600 hover:bg-adminGreen-600/90 shadow-sm hover:shadow-md",
            )}
            disabled={isPaid || isPaying || !canPay}
          >
            <Check className="w-5 h-5" />
            {isPaying
              ? "Đang xử lý..."
              : isPaid
                ? "Đã thanh toán"
                : !canPay
                  ? "Chưa thể thanh toán"
                  : paymentMethod === "vnpay"
                    ? `Thanh toán VNPAY (${amountDue.toLocaleString("vi-VN")}đ)`
                    : paymentMethod === "wallet"
                      ? `Trừ Ví Khách (${amountDue.toLocaleString("vi-VN")}đ)`
                      : `Thu phần còn lại (${amountDue.toLocaleString("vi-VN")}đ)`}
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
