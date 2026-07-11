import React from "react";
import { CheckCircle2, Info } from "lucide-react";
import { useBookingStore } from "../stores/bookingStore";

export const BookingSuccessTicket: React.FC = () => {
  const { guests, resetBooking, selectedSalon } = useBookingStore();

  const primaryGuest = guests[0];
  const {
    selectedService,
    selectedDate,
    selectedTimeSlot,
    selectedTechnician,
    selectedPosition,
  } = primaryGuest || {};

  const ticketId = React.useMemo(() => Math.floor(Math.random() * 10000), []);

  const formatDateString = (d: Date | null) => {
    if (!d) return "";
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      <div className="lotus-panel relative z-10 w-full max-w-lg p-8 text-center animate-in fade-in zoom-in duration-500 sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
          <CheckCircle2 className="h-10 w-10 text-success-text" />
        </div>

        <h2 className="mb-2 font-display text-3xl font-semibold text-ink">
          Đặt cọc & giữ lịch thành công!
        </h2>
        <p className="mb-6 font-geist text-sm leading-relaxed text-warm-600">
          Hoa Sen Spa đã nhận thông tin đặt cọc và giữ lịch hẹn của bạn. Phần
          còn lại thanh toán sau khi sử dụng dịch vụ tại spa.
        </p>

        {/* Ticket Information */}
        <div className="relative mb-6 flex flex-col gap-3.5 overflow-hidden bg-rose-50 border border-rose-100 p-5 text-left">

          <div className="flex justify-between items-center border-b border-warm-100 pb-2.5">
            <span className="text-xs text-warm-600 font-medium uppercase tracking-wider">
              Mã đặt lịch:
            </span>
            <span className="font-mono font-bold text-rose-600 tracking-wide text-base">
              BK{ticketId}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 text-sm">
            {selectedSalon && (
              <div className="flex justify-between pb-2 mb-1 border-b border-warm-100">
                <span className="text-warm-600">Chi nhánh:</span>
                <span className="font-semibold text-ink text-right max-w-[200px]">
                  {selectedSalon.name}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-warm-600">Dịch vụ:</span>
              <span className="font-semibold text-ink text-right max-w-[200px] truncate">
                {selectedService?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-600">Thời gian:</span>
              <span className="font-semibold text-ink">
                {selectedTimeSlot?.time} · {formatDateString(selectedDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-600">Chuyên viên:</span>
              <span className="font-semibold text-ink">
                {selectedTechnician?.name || "Sắp xếp tự động"}
              </span>
            </div>
            {selectedPosition && (
              <div className="flex justify-between mt-1 pt-1 border-t border-warm-100">
                <span className="text-warm-600">Phòng / Vị trí:</span>
                <span className="font-semibold text-ink text-right">
                  {selectedPosition?.name} ({selectedPosition?.roomName})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Notice */}
        <div className="mb-8 flex gap-2.5 bg-warning-bg p-4 text-left text-xs leading-relaxed text-warning-text">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-warning-text" />
          <p>
            Vui lòng đến trước 10 phút so với lịch hẹn để chúng tôi phục vụ trà
            nóng và làm thủ tục kiểm tra da miễn phí.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              resetBooking();
              window.location.href = "/";
            }}
            className="w-full rounded-full bg-rose-600 px-6 py-3.5 font-geist text-sm font-medium text-white transition-all hover:bg-rose-500"
          >
            Về trang chủ
          </button>
          <a
            href="#"
            className="text-sm font-semibold text-rose-600 hover:text-rose-400 mt-2"
          >
            Quản lý lịch hẹn của tôi
          </a>
        </div>
      </div>
    </div>
  );
};
