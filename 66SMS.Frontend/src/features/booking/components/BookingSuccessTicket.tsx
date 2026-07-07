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
      {/* Decorative Grid is now in BookingPage.tsx */}

      <div className="max-w-md w-full bg-lotus-surface rounded-3xl p-8 border border-lotus-muted shadow-2xl relative z-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>

        <h2 className="text-3xl font-bold text-lotus-deep font-display mb-2">
          Đặt cọc & giữ lịch thành công!
        </h2>
        <p className="text-lotus-stone text-sm mb-6">
          Hoa Sen Spa đã nhận thông tin đặt cọc và giữ lịch hẹn của bạn. Phần
          còn lại thanh toán sau khi sử dụng dịch vụ tại spa.
        </p>

        {/* Ticket Information */}
        <div className="bg-lotus-rose-light rounded-2xl p-5 border border-lotus-muted text-left mb-6 flex flex-col gap-3.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-lotus-gold rounded-full blur-xl"></div>

          <div className="flex justify-between items-center border-b border-lotus-muted pb-2.5">
            <span className="text-xs text-lotus-stone font-medium uppercase tracking-wider">
              Mã đặt lịch:
            </span>
            <span className="font-mono font-bold text-lotus-rose tracking-wide text-base">
              BK{ticketId}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 text-sm">
            {selectedSalon && (
              <div className="flex justify-between pb-2 mb-1 border-b border-lotus-muted">
                <span className="text-lotus-stone">Chi nhánh:</span>
                <span className="font-semibold text-lotus-deep text-right max-w-[200px]">
                  {selectedSalon.name}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-lotus-stone">Dịch vụ:</span>
              <span className="font-semibold text-lotus-deep text-right max-w-[200px] truncate">
                {selectedService?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-lotus-stone">Thời gian:</span>
              <span className="font-semibold text-lotus-deep">
                {selectedTimeSlot?.time} · {formatDateString(selectedDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-lotus-stone">Chuyên viên:</span>
              <span className="font-semibold text-lotus-deep">
                {selectedTechnician?.name || "Sắp xếp tự động"}
              </span>
            </div>
            {selectedPosition && (
              <div className="flex justify-between mt-1 pt-1 border-t border-lotus-muted">
                <span className="text-lotus-stone">Phòng / Vị trí:</span>
                <span className="font-semibold text-lotus-deep text-right">
                  {selectedPosition?.name} ({selectedPosition?.roomName})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Notice */}
        <div className="flex gap-2.5 bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 text-left text-xs text-amber-800 mb-8 leading-relaxed">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Vui lòng đến trước **10 phút** so với lịch hẹn để chúng tôi phục vụ
            trà nóng và làm thủ tục kiểm tra da miễn phí.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              resetBooking();
              window.location.href = "/";
            }}
            className="w-full bg-lotus-rose text-white font-medium px-6 py-3.5 rounded-xl transition-all hover:bg-lotus-rose shadow-md"
          >
            Về trang chủ
          </button>
          <a
            href="#"
            className="text-sm font-semibold text-lotus-rose hover:underline mt-2"
          >
            Quản lý lịch hẹn của tôi
          </a>
        </div>
      </div>
    </div>
  );
};
