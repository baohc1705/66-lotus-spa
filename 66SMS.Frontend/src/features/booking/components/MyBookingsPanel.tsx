import { formatCurrency } from '@/shared/utils/currency';
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  Wallet,
  Loader2,
} from "lucide-react";
import { useMyBookings } from "../hooks/useMyBookings";
import type { AppointmentDto } from "../types/booking.types";
import { bookingApi } from "../api/booking.api";
import { APPOINTMENT_STATUS } from "../constants/appointment.constants";
import { getMyWallet } from "../../wallet/api/wallet.api";
import { useQuery } from "@tanstack/react-query";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

export function MyBookingsPanel() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading, isError } = useMyBookings();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isPayingId, setIsPayingId] = useState<number | null>(null);
  const [isPayingWalletId, setIsPayingWalletId] = useState<number | null>(null);
  const [isPostponingId, setIsPostponingId] = useState<number | null>(null);

  const [walletConfirm, setWalletConfirm] = useState<{
    open: boolean;
    appointmentId?: number;
    depositAmount?: number;
  }>({ open: false });

  const { data: walletData } = useQuery({
    queryKey: ["my-wallet"],
    queryFn: getMyWallet,
  });
  const walletBalance = walletData?.data?.balance || 0;

  const canPayDeposit = (booking: AppointmentDto) => {
    if (booking.status !== APPOINTMENT_STATUS.CONFIRMED) return false;
    if (!booking.depositDeadlineAt) return false;

    // Nếu đã thanh toán một phần (cọc) thì không cho cọc nữa
    if ((booking.paidAmount || 0) > 0) return false;

    const deadline = new Date(booking.depositDeadlineAt).getTime();
    const now = new Date().getTime();
    return deadline > now;
  };

  const canPostpone = (booking: AppointmentDto) => {
    return booking.status === APPOINTMENT_STATUS.WAITING;
  };

  
  const handlePostpone = async (
    e: React.MouseEvent,
    appointmentId: number,
    paidAmount?: number,
  ) => {
    e.stopPropagation();

    const confirmMsg = `Bạn có chắc chắn muốn hoãn lịch hẹn này không?\n\nSố tiền cọc đã thanh toán (${formatCurrency(paidAmount)}) sẽ được tự động hoàn lại vào Ví của bạn để sử dụng cho lần đặt lịch tiếp theo.`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setIsPostponingId(appointmentId);
    try {
      const isSuccess = await bookingApi.postponeBooking(appointmentId);
      if (isSuccess) {
        toast.success("Hoãn lịch thành công! Tiền cọc đã được hoàn vào ví.");
        queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        queryClient.invalidateQueries({ queryKey: ["my-wallet"] });
        queryClient.invalidateQueries({ queryKey: ["my-wallet-transactions"] });
      } else {
        toast.error("Không thể hoãn lịch.");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi hoãn lịch.");
    } finally {
      setIsPostponingId(null);
    }
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

  const openWalletConfirm = (e: React.MouseEvent, appointmentId: number, depositAmount: number) => {
    e.stopPropagation();
    setWalletConfirm({ open: true, appointmentId, depositAmount });
  };

  const executePayWithWallet = async () => {
    if (!walletConfirm.appointmentId) return;
    setIsPayingWalletId(walletConfirm.appointmentId);
    setWalletConfirm({ open: false });
    
    try {
      const isSuccess = await bookingApi.payDepositWithWallet(walletConfirm.appointmentId);
      if (isSuccess) {
        toast.success("Thanh toán cọc bằng ví thành công!");
        queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        queryClient.invalidateQueries({ queryKey: ["my-wallet"] });
        queryClient.invalidateQueries({ queryKey: ["my-wallet-transactions"] });
      } else {
        toast.error("Không thể thanh toán bằng ví.");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi thanh toán bằng ví.");
    } finally {
      setIsPayingWalletId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-7 h-7 text-rose-600 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-error-text">
        Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="bg-page w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-7 h-7 text-gold-600" />
        </div>
        <p className="text-warm-600">Bạn chưa có lịch hẹn nào.</p>
        <p className="text-sm text-warm-600 mt-1">
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-status-pending/10 text-status-pending border border-status-pending/20 whitespace-nowrap">
            <Clock3 className="w-3.5 h-3.5" /> Chờ xác nhận
          </span>
        );
      case APPOINTMENT_STATUS.CONFIRMED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-status-confirmed/10 text-status-confirmed border border-status-confirmed/20 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác nhận - Chờ đặt cọc
          </span>
        );
      case APPOINTMENT_STATUS.WAITING:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-status-waiting/10 text-status-waiting border border-status-waiting/20 whitespace-nowrap">
            <Clock3 className="w-3.5 h-3.5" /> Chờ phục vụ
          </span>
        );
      case APPOINTMENT_STATUS.IN_SERVICE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-status-in-progress/10 text-status-in-progress border border-status-in-progress/20 whitespace-nowrap">
            <Clock3 className="w-3.5 h-3.5" /> Đang phục vụ
          </span>
        );
      case APPOINTMENT_STATUS.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-status-completed/10 text-status-completed border border-status-completed/20 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn thành
          </span>
        );
      case APPOINTMENT_STATUS.CANCELLED:
      case APPOINTMENT_STATUS.NO_SHOW:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-status-cancelled/10 text-status-cancelled border border-status-cancelled/20 whitespace-nowrap">
            <XCircle className="w-3.5 h-3.5" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-warm-50 text-ink border border-warm-100 whitespace-nowrap">
            Không xác định
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3">
        <h2
          className="text-xl font-semibold text-ink"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Lịch hẹn của tôi
        </h2>
        <span className="bg-page text-rose-600 px-2.5 py-0.5 rounded-md text-sm font-medium">
          {bookings.length} lịch hẹn
        </span>
      </div>

      <div className="space-y-3">
        {bookings.map((booking: AppointmentDto) => (
          <div
            key={booking.id}
            className={`rounded-lg overflow-hidden transition-all duration-300 ${
              expandedId === booking.id
                ? "bg-white ring-1 ring-rose-600/20 shadow-sm"
                : "bg-warm-50/80 hover:bg-white shadow-sm"
            }`}
          >
            {/* Header (Always visible) */}
            <div
              className="p-4 cursor-pointer flex flex-col md:flex-row justify-between gap-4 select-none"
              onClick={() => toggleExpand(booking.id!)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-ink truncate">
                    Mã lịch hẹn:{" "}
                    <span className="text-rose-600">
                      {booking.appointmentCode || `#${booking.id}`}
                    </span>
                  </span>
                  <div className="hidden md:block">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-warm-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-warm-400">Ngày đặt:</span> 
                    <span>{booking.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gold-600" />
                    <span>
                      {booking.appointmentDate
                        ? new Intl.DateTimeFormat("vi-VN").format(
                            new Date(booking.appointmentDate),
                          )
                        : "Chưa xác định"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gold-600" />
                    <span>
                      {booking.timeSlotStartTime
                        ? `${booking.timeSlotStartTime.substring(0, 5)} - ${booking.timeSlotEndTime?.substring(0, 5)}`
                        : "Chưa xếp giờ"}
                    </span>
                  </div>
                  {canPayDeposit(booking) && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-gold-600" />
                      <span className="text-ink font-medium">
                        Cần cọc: <span className="text-rose-600">{formatCurrency(((booking.totalAmount || 0) * (booking.depositPercent || 0)) / 100)}</span>
                        <span className="text-warm-600 font-normal ml-1">({booking.depositPercent}%)</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Mobile Badge */}
                <div className="mt-3 md:hidden">
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Actions Area */}
              <div className="flex items-center gap-2 md:self-center shrink-0">
                <div className="flex flex-wrap items-center gap-2 justify-end">
                  {canPayDeposit(booking) && (
                    <>
                      {walletBalance >=
                        ((booking.totalAmount || 0) *
                          (booking.depositPercent || 0)) /
                          100 && (
                        <button
                          onClick={(e) =>
                            openWalletConfirm(
                              e,
                              booking.id!,
                              ((booking.totalAmount || 0) *
                                (booking.depositPercent || 0)) /
                                100,
                            )
                          }
                          disabled={
                            isPayingWalletId === booking.id ||
                            isPayingId === booking.id
                          }
                          className="px-3 py-1.5 bg-gold-600 text-white text-xs font-medium rounded-md hover:bg-gold-600/90 transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                        >
                          {isPayingWalletId === booking.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wallet className="w-3.5 h-3.5" />
                          )}
                          Cọc bằng Ví
                        </button>
                      )}
                      <button
                        onClick={(e) => handlePayDeposit(e, booking.id!)}
                        disabled={
                          isPayingId === booking.id ||
                          isPayingWalletId === booking.id
                        }
                        className="px-3 py-1.5 bg-success-text text-white text-xs font-medium rounded-md hover:bg-success-text/90 transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                      >
                        {isPayingId === booking.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <DollarSign className="w-3.5 h-3.5" />
                        )}
                        Cọc VNPAY
                      </button>
                    </>
                  )}
                  {canPostpone(booking) && (
                    <button
                      onClick={(e) =>
                        handlePostpone(e, booking.id!, booking.paidAmount)
                      }
                      disabled={isPostponingId === booking.id}
                      className="px-3 py-1.5 border border-error-bg text-error-text hover:bg-error-bg text-xs font-medium rounded-md transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                    >
                      {isPostponingId === booking.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      Hoãn lịch
                    </button>
                  )}
                </div>
                
                <button className="p-1.5 hover:bg-warm-100 rounded-md transition-colors text-warm-400 ml-1">
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
                <div className="p-5 border-t border-warm-100 bg-white space-y-6">
                  {/* Grid info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-ink border-b border-warm-50 pb-2">
                        Thông tin dịch vụ
                      </h4>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-sm">
                          <Tag className="w-4 h-4 text-warm-600 mt-0.5" />
                          <div>
                            <span className="text-warm-600 block mb-1">
                              Dịch vụ đã chọn:
                            </span>
                            {booking.serviceNames &&
                            booking.serviceNames.length > 0 ? (
                              <ul className="space-y-1">
                                {booking.serviceNames.map((srv, idx) => (
                                  <li
                                    key={idx}
                                    className="text-ink font-medium before:content-['•'] before:mr-2 before:text-gold-600"
                                  >
                                    {srv}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-ink">
                                Không có thông tin
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <DollarSign className="w-4 h-4 text-warm-600" />
                          <div>
                            <span className="text-warm-600 mr-2">
                              Tổng tiền:
                            </span>
                            <span className="text-rose-600 font-semibold">
                              {formatCurrency(booking.totalAmount)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm pl-7">
                          <span className="text-warm-600 mr-2">
                            Cọc yêu cầu ({booking.depositPercent}%):
                          </span>
                          <span className="text-gold-600 font-medium">
                            {formatCurrency(
                              ((booking.totalAmount || 0) *
                                (booking.depositPercent || 0)) /
                                100,
                            )}
                          </span>
                        </div>

                        {booking.depositDeadlineAt &&
                          booking.status === APPOINTMENT_STATUS.CONFIRMED && (
                            <div className="flex items-center gap-3 text-sm pl-7">
                              <span className="text-warm-600 mr-2">
                                Hạn chót cọc:
                              </span>
                              <span className="text-error-text font-medium">
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
                      <h4 className="font-medium text-ink border-b border-warm-50 pb-2">
                        Nhân viên & Địa điểm
                      </h4>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <User className="w-4 h-4 text-warm-600" />
                          <div>
                            <span className="text-warm-600 mr-2">
                              Nhân viên:
                            </span>
                            <span className="text-ink font-medium">
                              {booking.staffFullName || "Chưa xếp nhân viên"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-warm-600" />
                          <div>
                            <span className="text-warm-600 mr-2">
                              Phòng/Giường:
                            </span>
                            <span className="text-ink font-medium">
                              {booking.positionRoomName
                                ? `${booking.positionRoomName} - ${booking.positionName}`
                                : "Chưa xếp phòng"}
                            </span>
                          </div>
                        </div>

                        {booking.note && (
                          <div className="flex items-start gap-3 text-sm">
                            <StickyNote className="w-4 h-4 text-warm-600 mt-0.5" />
                            <div>
                              <span className="text-warm-600 block mb-1">
                                Ghi chú:
                              </span>
                              <p className="text-ink bg-warm-50 p-2 rounded-lg text-xs italic">
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

      <ConfirmDialog
        open={walletConfirm.open}
        onOpenChange={(open) => setWalletConfirm({ ...walletConfirm, open })}
        onConfirm={executePayWithWallet}
        title="Xác nhận thanh toán cọc"
        description={
          <div className="space-y-3 mt-2">
            <p>Bạn có muốn thanh toán cọc bằng Ví cho lịch hẹn này không?</p>
            <div className="bg-warm-50 p-3 rounded-md space-y-2 text-sm border border-warm-100">
              <div className="flex justify-between">
                <span className="text-warm-600">Số tiền cọc:</span>
                <span className="font-medium text-rose-600">{formatCurrency(walletConfirm.depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-600">Số dư hiện tại:</span>
                <span className="font-medium text-ink">{formatCurrency(walletBalance)}</span>
              </div>
            </div>
            <p className="text-xs text-warm-600 italic">Số dư ví của bạn sẽ bị trừ tương ứng sau khi xác nhận.</p>
          </div>
        }
        loading={isPayingWalletId !== null}
        confirmLabel="Thanh toán"
        cancelLabel="Hủy bỏ"
      />
    </div>
  );
}
