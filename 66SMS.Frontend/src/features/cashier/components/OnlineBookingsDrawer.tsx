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
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#FBF7F2] shadow-[0_20px_40px_rgba(42,31,26,0.1)] z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-lotus-gold/20">
        <div className="h-14 flex items-center justify-between px-4 border-b border-lotus-gold/20 bg-lotus-cream">
          <h2 className="font-semibold text-lotus-deep flex items-center gap-2">
            <Calendar className="w-5 h-5 text-lotus-primary" />
            Lịch online chờ xác nhận
            {bookings.length > 0 && (
              <span className="bg-lotus-rose text-white text-xs px-2 py-0.5 rounded-full">
                {bookings.length}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-admin hover:bg-lotus-gold/10 text-lotus-stone hover:text-lotus-deep transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-lotus-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm mb-2">Lỗi khi tải lịch hẹn</p>
              <button
                onClick={() => refetch()}
                className="text-lotus-primary text-sm hover:underline font-medium"
              >
                Thử lại
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 bg-lotus-cream rounded-full flex items-center justify-center mb-4 border border-lotus-gold/20">
                <Calendar className="w-8 h-8 text-lotus-stone" />
              </div>
              <p className="text-lotus-deep/70 font-medium">
                Không có lịch hẹn chờ duyệt
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-lotus-gold/20 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-lotus-gold/40 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lotus-deep">
                        {b.customerName}
                      </h3>
                      {b.customerPhone && (
                        <p className="text-sm text-lotus-stone flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5" />
                          {b.customerPhone}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lotus-rose">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(b.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm bg-lotus-cream/30 rounded-xl p-3 border border-lotus-gold/10">
                    <div className="flex items-center gap-2 text-lotus-deep/80">
                      <Calendar className="w-4 h-4 text-lotus-stone" />
                      <span>{b.bookingDate}</span>
                      <span className="text-lotus-gold/40">|</span>
                      <Clock className="w-4 h-4 text-lotus-stone" />
                      <span className="font-medium text-lotus-deep">
                        {b.startTime} - {b.endTime}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-lotus-gold/10">
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-lotus-stone">Dịch vụ:</span>
                        <span className="font-medium text-lotus-deep">
                          {b.serviceName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-lotus-stone">KTV:</span>
                        <span className="font-medium text-lotus-deep">
                          {b.staffName}
                        </span>
                      </div>
                    </div>
                    {b.note && (
                      <div className="mt-2 pt-2 border-t border-lotus-gold/10 text-lotus-deep/70 text-xs italic">
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
                      className="flex-1 flex items-center justify-center gap-1.5 bg-lotus-primary text-white py-2 rounded-admin text-sm font-medium hover:bg-lotus-primary/90 disabled:opacity-50 transition-colors shadow-sm"
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
                      className="flex-1 flex items-center justify-center gap-1.5 bg-lotus-cream text-lotus-deep py-2 rounded-admin text-sm font-medium hover:bg-lotus-gold/20 disabled:opacity-50 transition-colors border border-lotus-gold/20"
                    >
                      <Ban className="w-4 h-4 text-lotus-stone" />
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
