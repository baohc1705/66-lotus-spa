import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Clock3,
  XCircle,
  Tag,
  DollarSign,
  StickyNote,
} from "lucide-react";
import { useMyBookings } from "../hooks/useMyBookings";
import type { AppointmentDto } from "../types/booking.types";
import { Loader2 } from "lucide-react";
import { bookingApi } from "../api/booking.api";
import { APPOINTMENT_STATUS } from "../constants/appointment.constants";

export function MyBookingsPanel() {
  const { data: bookings, isLoading, isError } = useMyBookings();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isPayingId, setIsPayingId] = useState<number | null>(null);

  const canPayDeposit = (booking: AppointmentDto) => {
    if (booking.status !== APPOINTMENT_STATUS.CONFIRMED) return false;
    if (!booking.depositDeadlineAt) return false;

    // Nếu đã thanh toán một phần (cọc) thì không cho cọc nữa
    if ((booking.paidAmount || 0) > 0) return false;

    const deadline = new Date(booking.depositDeadlineAt).getTime();
    const now = new Date().getTime();
    return deadline > now;
  };

  const handlePayDeposit = async (
    e: React.MouseEvent,
    appointmentId: number,
  ) => {
    e.stopPropagation();
    setIsPayingId(appointmentId);
    try {
      const url = await bookingApi.getDepositVnPayUrl(appointmentId);
      if (url) {
        window.location.assign(url); // Tự động chuyển hướng sang VNPAY
      }
    } catch (error) {
      console.error("Lỗi khi tạo URL thanh toán cọc", error);
      alert("Đã xảy ra lỗi khi tạo liên kết thanh toán. Vui lòng thử lại.");
    } finally {
      setIsPayingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-lotus-rose animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-lotus-cream w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-10 h-10 text-lotus-gold" />
        </div>
        <p className="text-lotus-stone text-lg">Bạn chưa có lịch hẹn nào.</p>
        <p className="text-sm text-gray-500 mt-2">
          Các lịch hẹn đã đặt sẽ hiển thị tại đây.
        </p>
      </div>
    );
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status?: number) => {
    switch (status) {
      case 0: // Fallback
      case APPOINTMENT_STATUS.PENDING:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-status-pending/10 text-status-pending border border-status-pending/20">
            <Clock3 className="w-4 h-4" /> Chờ xác nhận
          </span>
        );
      case APPOINTMENT_STATUS.CONFIRMED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-status-confirmed/10 text-status-confirmed border border-status-confirmed/20">
            <CheckCircle2 className="w-4 h-4" /> Đã xác nhận - Chờ đặt cọc
          </span>
        );
      case APPOINTMENT_STATUS.WAITING:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-status-waiting/10 text-status-waiting border border-status-waiting/20">
            <Clock3 className="w-4 h-4" /> Chờ phục vụ
          </span>
        );
      case APPOINTMENT_STATUS.IN_SERVICE:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-status-in-progress/10 text-status-in-progress border border-status-in-progress/20">
            <Clock3 className="w-4 h-4" /> Đang phục vụ
          </span>
        );
      case APPOINTMENT_STATUS.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-status-completed/10 text-status-completed border border-status-completed/20">
            <CheckCircle2 className="w-4 h-4" /> Đã hoàn thành
          </span>
        );
      case APPOINTMENT_STATUS.CANCELLED:
      case APPOINTMENT_STATUS.NO_SHOW:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-status-cancelled/10 text-status-cancelled border border-status-cancelled/20">
            <XCircle className="w-4 h-4" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200">
            Không xác định
          </span>
        );
    }
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2
          className="text-2xl font-semibold text-lotus-deep"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Lịch hẹn của tôi
        </h2>
        <span className="bg-lotus-cream text-lotus-rose px-3 py-1 rounded-full text-sm font-medium">
          {bookings.length} lịch hẹn
        </span>
      </div>

      <div className="space-y-4">
        {bookings.map((booking: AppointmentDto) => (
          <div
            key={booking.id}
            className={`border rounded-xl overflow-hidden transition-all duration-300 ${
              expandedId === booking.id
                ? "border-lotus-rose ring-1 ring-lotus-rose/20 bg-white"
                : "border-gray-100 bg-gray-50/50 hover:border-lotus-gold/50 hover:bg-white"
            }`}
          >
            {/* Header (Always visible) */}
            <div
              className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
              onClick={() => toggleExpand(booking.id!)}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    Mã lịch hẹn:{" "}
                    <span className="text-lotus-rose">
                      {booking.appointmentCode || `#${booking.id}`}
                    </span>
                  </span>
                  <div className="md:hidden flex items-center gap-2">
                    {canPayDeposit(booking) && (
                      <button
                        onClick={(e) => handlePayDeposit(e, booking.id!)}
                        disabled={isPayingId === booking.id}
                        className="px-3 py-1 bg-lotus-leaf text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-sm"
                      >
                        {isPayingId === booking.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <DollarSign className="w-3 h-3" />
                        )}
                        Cọc
                      </button>
                    )}
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Ngày đặt: {booking.createdAt}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-lotus-gold" />
                    <span>
                      {booking.appointmentDate
                        ? new Intl.DateTimeFormat("vi-VN").format(
                            new Date(booking.appointmentDate),
                          )
                        : "Chưa xác định"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-lotus-gold" />
                    <span>
                      {booking.timeSlotStartTime
                        ? `${booking.timeSlotStartTime.substring(0, 5)} - ${booking.timeSlotEndTime?.substring(0, 5)}`
                        : "Chưa xếp giờ"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                {canPayDeposit(booking) && (
                  <button
                    onClick={(e) => handlePayDeposit(e, booking.id!)}
                    disabled={isPayingId === booking.id}
                    className="px-4 py-1.5 bg-lotus-leaf text-white text-sm font-medium rounded-full hover:bg-lotus-leaf/90 transition flex items-center gap-2 shadow-sm"
                  >
                    {isPayingId === booking.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <DollarSign className="w-4 h-4" />
                    )}
                    Thanh toán cọc
                  </button>
                )}
                {getStatusBadge(booking.status)}
                <button className="p-1 hover:bg-lotus-cream rounded-full transition-colors text-gray-400">
                  {expandedId === booking.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                expandedId === booking.id
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-5 border-t border-gray-100 bg-white space-y-6">
                  {/* Grid info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 border-b border-gray-50 pb-2">
                        Thông tin dịch vụ
                      </h4>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-sm">
                          <Tag className="w-4 h-4 text-lotus-stone mt-0.5" />
                          <div>
                            <span className="text-gray-500 block mb-1">
                              Dịch vụ đã chọn:
                            </span>
                            {booking.serviceNames &&
                            booking.serviceNames.length > 0 ? (
                              <ul className="space-y-1">
                                {booking.serviceNames.map((srv, idx) => (
                                  <li
                                    key={idx}
                                    className="text-gray-900 font-medium before:content-['•'] before:mr-2 before:text-lotus-gold"
                                  >
                                    {srv}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-900">
                                Không có thông tin
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <DollarSign className="w-4 h-4 text-lotus-stone" />
                          <div>
                            <span className="text-gray-500 mr-2">
                              Tổng tiền:
                            </span>
                            <span className="text-lotus-rose font-semibold">
                              {formatCurrency(booking.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {booking.depositPercent ? (
                          <div className="flex items-center gap-3 text-sm pl-7">
                            <span className="text-gray-500 mr-2">
                              Cọc yêu cầu ({booking.depositPercent}%):
                            </span>
                            <span className="text-lotus-gold font-medium">
                              {formatCurrency(
                                ((booking.totalAmount || 0) *
                                  booking.depositPercent) /
                                  100,
                              )}
                            </span>
                          </div>
                        ) : null}

                        {booking.depositDeadlineAt &&
                          booking.status === APPOINTMENT_STATUS.CONFIRMED && (
                            <div className="flex items-center gap-3 text-sm pl-7">
                              <span className="text-gray-500 mr-2">
                                Hạn chót cọc:
                              </span>
                              <span className="text-red-600 font-medium">
                                {new Intl.DateTimeFormat("vi-VN", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                }).format(new Date(booking.depositDeadlineAt))}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 border-b border-gray-50 pb-2">
                        Nhân viên & Địa điểm
                      </h4>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <User className="w-4 h-4 text-lotus-stone" />
                          <div>
                            <span className="text-gray-500 mr-2">
                              Nhân viên:
                            </span>
                            <span className="text-gray-900 font-medium">
                              {booking.staffFullName || "Chưa xếp nhân viên"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-lotus-stone" />
                          <div>
                            <span className="text-gray-500 mr-2">
                              Phòng/Giường:
                            </span>
                            <span className="text-gray-900 font-medium">
                              {booking.positionRoomName
                                ? `${booking.positionRoomName} - ${booking.positionName}`
                                : "Chưa xếp phòng"}
                            </span>
                          </div>
                        </div>

                        {booking.note && (
                          <div className="flex items-start gap-3 text-sm">
                            <StickyNote className="w-4 h-4 text-lotus-stone mt-0.5" />
                            <div>
                              <span className="text-gray-500 block mb-1">
                                Ghi chú:
                              </span>
                              <p className="text-gray-900 bg-gray-50 p-2 rounded-lg text-xs italic">
                                {booking.note}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
