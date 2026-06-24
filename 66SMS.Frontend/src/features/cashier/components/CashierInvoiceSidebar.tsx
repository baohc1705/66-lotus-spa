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
}

export function CashierInvoiceSidebar({
  booking,
  isOpen,
  onClose,
  onPay,
  onRequestDeposit,
  isPaying = false,
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
        className="relative w-full max-w-md max-h-[90vh] bg-white rounded-[5px] border border-lotus-gold/30 shadow-[0_12px_40px_rgba(42,31,26,0.22)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="h-14 flex items-center justify-between px-5 border-b border-lotus-gold/20 bg-lotus-cream/30">
        <h2 className="font-semibold text-lotus-deep">Chi tiết hóa đơn</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-[5px] hover:bg-lotus-cream text-lotus-stone hover:text-lotus-deep transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
        <div className="flex items-center gap-3 mb-6 p-4 rounded-[5px] border border-lotus-gold/20 bg-lotus-cream/20">
          <div className="w-12 h-12 rounded-full bg-lotus-gold/10 flex items-center justify-center text-lotus-gold font-bold text-lg">
            {booking.customerName.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-lotus-deep">
              {booking.customerName}
            </h3>
            <p className="text-sm text-lotus-stone">
              {booking.customerPhone || "Chưa cập nhật SĐT"}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm text-lotus-deep">
              Dịch vụ & Sản phẩm
            </h4>
            <button className="text-xs font-medium text-lotus-leaf hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Thêm
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-lotus-deep">
                  {booking.serviceName}
                </p>
                <p className="text-xs text-lotus-stone">
                  KTV: {booking.staffName}
                </p>
              </div>
              <div className="text-sm font-medium text-lotus-deep">
                {booking.totalAmount.toLocaleString("vi-VN")}đ
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 p-3 rounded-[5px] bg-lotus-leaf/5 border border-lotus-leaf/20 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-lotus-deep/70">Đã cọc (20%):</span>
            <span className="font-medium text-lotus-leaf">
              {booking.depositPaid
                ? `${Math.min(booking.paidAmount, booking.depositAmount).toLocaleString("vi-VN")}đ`
                : "Chưa cọc"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-lotus-deep/70">Đã thu tổng:</span>
            <span className="font-medium text-lotus-deep">
              {booking.paidAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-sm text-lotus-deep mb-3">
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
                      ? "border-2 border-lotus-leaf bg-lotus-leaf/5 text-lotus-leaf"
                      : method.isWallet && (booking.customerWalletBalance || 0) < amountDue
                        ? "border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                        : "border border-lotus-gold/20 hover:border-lotus-gold/40 text-lotus-stone hover:bg-lotus-cream/20",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span
                    className={cn(
                      "text-xs font-medium text-center",
                      method.isVnpay && !isSelected && "text-[#005BAA] font-bold tracking-wide",
                    )}
                  >
                    {method.label}
                    {method.isWallet && (
                      <span className="block text-[10px] opacity-80 mt-0.5">
                        ({(booking.customerWalletBalance || 0).toLocaleString("vi-VN")}đ)
                      </span>
                    )}
                  </span>
                  {method.isWallet && (booking.customerWalletBalance || 0) < amountDue && (
                     <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                       <span className="text-[10px] font-bold text-red-500 bg-white px-2 py-0.5 rounded border border-red-100 rotate-[-10deg]">KHÔNG ĐỦ SỐ DƯ</span>
                     </div>
                  )}
                </button>
              );
            })}
          </div>

          {paymentMethod === "vnpay" && (
            <div className="mt-4 p-4 border border-[#005BAA]/20 bg-[#005BAA]/5 rounded-[5px] flex flex-col items-center justify-center relative overflow-hidden transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#005BAA] to-[#ED1B24]"></div>
              <p className="text-sm text-center font-semibold text-gray-800">
                Thanh toán phần còn lại qua VNPAY
              </p>
              <p className="text-lg font-bold text-[#005BAA] mt-2">
                {amountDue.toLocaleString("vi-VN")}đ
              </p>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-sm text-lotus-deep mb-2">
            Ghi chú
          </h4>
          <textarea
            placeholder="Nhập ghi chú hóa đơn..."
            defaultValue={booking.note || ""}
            className="w-full text-sm border border-lotus-gold/20 bg-lotus-cream/10 rounded-[5px] p-3 min-h-[80px] focus:outline-none focus:border-lotus-leaf focus:ring-1 focus:ring-lotus-leaf resize-none text-lotus-deep placeholder:text-lotus-stone"
          ></textarea>
        </div>
      </div>

      <div className="p-5 border-t border-lotus-gold/20 bg-lotus-cream/30">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-lotus-stone">Tổng dịch vụ:</span>
            <span className="font-medium text-lotus-deep">
              {booking.totalAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-lotus-stone">Đã thu (cọc + tạm ứng):</span>
            <span className="font-medium text-lotus-leaf">
              -{booking.paidAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-lotus-gold/20 mt-2">
            <span className="font-bold text-lotus-deep">Còn lại cần thu:</span>
            <span className="font-bold text-lotus-rose text-lg">
              {amountDue.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        {!canPay && !isPaid && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/50 rounded-[5px] p-2.5 mb-3">
            Chỉ thanh toán phần còn lại sau khi nhân viên hoàn thành dịch vụ
            (trạng thái chờ thanh toán).
          </p>
        )}

        {canPay && !booking.depositPaid && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200/50 rounded-[5px] p-2.5 mb-3">
            Khách chưa đặt cọc online. Không thể thu phần còn lại.
          </p>
        )}

        {booking.status === "pending" && !booking.depositDeadlineAt && onRequestDeposit ? (
          <button
            onClick={() => onRequestDeposit(booking.id)}
            disabled={isPaying}
            className={cn(
              "w-full py-3 rounded-[5px] flex items-center justify-center gap-2 text-white font-semibold text-sm transition-all shadow-md",
              isPaying
                ? "bg-lotus-stone/50 cursor-not-allowed text-white/80 shadow-none"
                : "bg-[#005BAA] hover:bg-[#005BAA]/90 shadow-blue-500/20"
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
              isPaid || isPaying || !canPay || (!booking.depositPaid && booking.status !== "confirmed")
                ? "bg-lotus-stone/50 cursor-not-allowed text-white/80 shadow-none"
                : paymentMethod === "vnpay"
                  ? "bg-gradient-to-r from-[#005BAA] to-[#ED1B24] hover:opacity-90 shadow-blue-500/20"
                  : "bg-lotus-leaf hover:bg-lotus-leaf/90 shadow-lotus-leaf/20 hover:shadow-lotus-leaf/40",
            )}
            disabled={isPaid || isPaying || !canPay || (!booking.depositPaid && booking.status !== "confirmed")}
          >
            <Check className="w-5 h-5" />
            {isPaying
              ? "Đang xử lý..."
              : isPaid
                ? "Đã thanh toán"
                : !canPay
                  ? "Chưa thể thanh toán"
                  : (!booking.depositPaid && booking.status !== "confirmed")
                    ? "Chưa đặt cọc"
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
