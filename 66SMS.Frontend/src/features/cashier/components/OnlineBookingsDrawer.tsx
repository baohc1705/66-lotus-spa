import { useState } from "react";
import { Calendar, Clock, Loader2, Phone, X, Check, Ban } from "lucide-react";
import {
  useOnlineBookings,
  useUpdateBookingStatus,
} from "../hooks/useOnlineBookings";

interface OnlineBookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingStatus = {
  Waiting: 3,
  Cancelled: 8,
} as const;

export function OnlineBookingsDrawer({
  isOpen,
  onClose,
}: OnlineBookingsDrawerProps) {
  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
  } = useOnlineBookings();
  const updateStatus = useUpdateBookingStatus();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = (id: string, status: number) => {
    setUpdatingId(id);
    updateStatus.mutate(
      { id, status },
      {
        onSettled: () => setUpdatingId(null),
      },
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-adminGray-50 shadow-[0_20px_40px_rgba(42,31,26,0.1)] z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-adminGold-600/20">
        <div className="h-14 flex items-center justify-between px-4 border-b border-adminGold-600/20 bg-adminGray-50">
          <h2 className="font-semibold text-adminInk flex items-center gap-2">
            <Calendar className="w-5 h-5 text-adminGreen-600" />
            Lịch online chờ xác nhận
            {bookings.length > 0 && (
              <span className="bg-adminGreen-600 text-white text-xs px-2 py-0.5 rounded-full">
                {bookings.length}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-admin hover:bg-adminGold-600/10 text-adminGray-600 hover:text-adminInk transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-adminGreen-600" />
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-state-danger-text text-sm mb-2">Lỗi khi tải lịch hẹn</p>
              <button
                onClick={() => refetch()}
                className="text-adminGreen-600 text-sm hover:underline font-medium"
              >
                Thử lại
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 bg-adminGray-50 rounded-full flex items-center justify-center mb-4 border border-adminGold-600/20">
                <Calendar className="w-8 h-8 text-adminGray-600" />
              </div>
              <p className="text-adminInk/70 font-medium">
                Không có lịch hẹn chờ duyệt
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-adminGold-600/20 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-adminGold-600/40 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-adminInk">
                        {b.customerName}
                      </h3>
                      {b.customerPhone && (
                        <p className="text-sm text-adminGray-600 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5" />
                          {b.customerPhone}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-adminGreen-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(b.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm bg-adminGray-50/30 rounded-xl p-3 border border-adminGold-600/10">
                    <div className="flex items-center gap-2 text-adminInk/80">
                      <Calendar className="w-4 h-4 text-adminGray-600" />
                      <span>{b.bookingDate}</span>
                      <span className="text-adminGold-600/40">|</span>
                      <Clock className="w-4 h-4 text-adminGray-600" />
                      <span className="font-medium text-adminInk">
                        {b.startTime} - {b.endTime}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-adminGold-600/10">
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-adminGray-600">Dịch vụ:</span>
                        <span className="font-medium text-adminInk">
                          {b.serviceName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-adminGray-600">KTV:</span>
                        <span className="font-medium text-adminInk">
                          {b.staffName}
                        </span>
                      </div>
                    </div>
                    {b.note && (
                      <div className="mt-2 pt-2 border-t border-adminGold-600/10 text-adminInk/70 text-xs italic">
                        " {b.note} "
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={updatingId === b.id}
                      onClick={() =>
                        handleUpdateStatus(b.id, BookingStatus.Waiting)
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 bg-adminGreen-600 text-white py-2 rounded-admin text-sm font-medium hover:bg-adminGreen-600/90 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {updatingId === b.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Xác nhận & cọc
                    </button>
                    <button
                      disabled={updatingId === b.id}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Bạn có chắc chắn muốn hủy lịch hẹn này? Nếu khách đã đặt cọc, hệ thống sẽ tự động hoàn tiền vào ví của khách.",
                          )
                        ) {
                          handleUpdateStatus(b.id, BookingStatus.Cancelled);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-adminGray-50 text-adminInk py-2 rounded-admin text-sm font-medium hover:bg-adminGold-600/20 disabled:opacity-50 transition-colors border border-adminGold-600/20"
                    >
                      <Ban className="w-4 h-4 text-adminGray-600" />
                      Hủy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
