import { CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useBookingStore } from "../stores/bookingStore";
import { useMyBookings } from "../hooks/useMyBookings";
import { formatDate } from "@/shared/utils/date.utils";
import type { AppointmentDto } from "../types/booking.types";

export function BookingSuccessTicket() {
  const {
    guests,
    resetBooking,
    selectedSalon,
    contactInfo,
    createdBookingIds,
  } = useBookingStore();

  const { data: myBookings = [], isLoading } = useMyBookings();

  const createdBookings = myBookings.filter(
    (b: AppointmentDto) => b.id != null && createdBookingIds.includes(b.id),
  );

  const formatTime = (t?: string) => {
    if (!t) return "";
    return t.substring(0, 5);
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      <div className="lotus-panel relative z-10 w-full max-w-lg p-8 text-center animate-in fade-in zoom-in duration-500 sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
          <CheckCircle2 className="h-10 w-10 text-success-text" />
        </div>

        <h2 className="mb-6 font-display text-3xl font-semibold text-ink">
          Đặt lịch thành công!
        </h2>

        {isLoading && createdBookingIds.length > 0 ? (
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-warm-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải thông tin lịch hẹn...
          </div>
        ) : createdBookings.length > 0 ? (
          <div className="mb-6 flex flex-col gap-3">
            {createdBookings.map((booking: AppointmentDto) => (
              <div
                key={booking.id}
                className="flex flex-col gap-3 overflow-hidden bg-rose-50 border border-rose-100 p-5 text-left"
              >
                <div className="flex justify-between items-center border-b border-warm-100 pb-2.5">
                  <span className="text-xs text-warm-600 font-medium uppercase tracking-wider">
                    Mã đặt lịch
                  </span>
                  <span className="font-mono font-bold text-rose-600 tracking-wide text-base">
                    {booking.appointmentCode || `#${booking.id}`}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-sm">
                  {(booking.salonName || selectedSalon?.name) && (
                    <div className="flex justify-between">
                      <span className="text-warm-600">Chi nhánh:</span>
                      <span className="font-semibold text-ink text-right max-w-[200px]">
                        {booking.salonName || selectedSalon?.name}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-warm-600">Dịch vụ:</span>
                    <span className="font-semibold text-ink text-right max-w-[200px]">
                      {booking.serviceNames?.length
                        ? booking.serviceNames.join(", ")
                        : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-warm-600">Thời gian:</span>
                    <span className="font-semibold text-ink">
                      {formatTime(booking.timeSlotStartTime)}
                      {booking.appointmentDate
                        ? ` · ${formatDate(booking.appointmentDate).format("DD/MM/YYYY")}`
                        : ""}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-warm-600">Chuyên viên:</span>
                    <span className="font-semibold text-ink">
                      {booking.staffFullName || "Sắp xếp tự động"}
                    </span>
                  </div>

                  {contactInfo?.fullName && (
                    <div className="flex justify-between">
                      <span className="text-warm-600">Người đặt:</span>
                      <span className="font-semibold text-ink">
                        {contactInfo.fullName}
                      </span>
                    </div>
                  )}

                  {booking.totalAmount != null && (
                    <div className="flex justify-between border-t border-warm-100 pt-2 mt-1">
                      <span className="text-warm-600">Tổng tiền:</span>
                      <span className="font-bold text-rose-600">
                        {booking.totalAmount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-6 flex flex-col gap-3">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className="flex flex-col gap-3 overflow-hidden bg-rose-50 border border-rose-100 p-5 text-left"
              >
                <div className="flex justify-between items-center border-b border-warm-100 pb-2.5">
                  <span className="text-xs text-warm-600 font-medium uppercase tracking-wider">
                    Mã đặt lịch
                  </span>
                  <span className="font-mono font-bold text-rose-600 tracking-wide text-base">
                    {createdBookingIds[0]
                      ? `#${createdBookingIds[0]}`
                      : "Đã ghi nhận"}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-sm">
                  {selectedSalon && (
                    <div className="flex justify-between">
                      <span className="text-warm-600">Chi nhánh:</span>
                      <span className="font-semibold text-ink text-right max-w-[200px]">
                        {selectedSalon.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-warm-600">Dịch vụ:</span>
                    <span className="font-semibold text-ink text-right max-w-[200px]">
                      {guest.selectedService?.name || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-600">Thời gian:</span>
                    <span className="font-semibold text-ink">
                      {guest.selectedTimeSlot?.time}
                      {guest.selectedDate
                        ? ` · ${formatDate(guest.selectedDate).format("DD/MM/YYYY")}`
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-600">Chuyên viên:</span>
                    <span className="font-semibold text-ink">
                      {guest.selectedTechnician?.name || "Sắp xếp tự động"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              resetBooking();
              window.location.href = "/";
            }}
            className="w-full rounded-full bg-rose-600 px-6 py-3.5 font-geist text-sm font-medium text-white transition-all hover:bg-rose-500"
          >
            Về trang chủ
          </button>
          <Link
            to="/profile?tab=bookings"
            onClick={() => resetBooking()}
            className="text-sm font-semibold text-rose-600 hover:text-rose-400 mt-2"
          >
            Quản lý lịch hẹn của tôi
          </Link>
        </div>
      </div>
    </div>
  );
}
