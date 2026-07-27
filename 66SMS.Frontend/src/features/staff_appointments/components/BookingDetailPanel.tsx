import { Loader2, X, Clock, User, Phone, Sparkles, FileText, Play, CheckCircle2 } from 'lucide-react'
import { BOOKING_STATUS_LABELS, BookingStatus, type StaffScheduleBooking } from '../types'

interface BookingDetailPanelProps {
  booking: StaffScheduleBooking | null
  dateLabel?: string
  onClose: () => void
  onStartService?: (bookingId: string) => void
  onCompleteService?: (bookingId: string) => void
  isUpdating?: boolean
}

export function BookingDetailPanel({
  booking,
  dateLabel,
  onClose,
  onStartService,
  onCompleteService,
  isUpdating = false,
}: BookingDetailPanelProps) {
  if (!booking) return null

  const canStart = booking.status === BookingStatus.Waiting
  const canComplete = booking.status === BookingStatus.InService
  const isPending = booking.status === BookingStatus.Pending
  const isCompletedUnpaid =
    booking.status === BookingStatus.Completed &&
    (booking.paidAmount ?? 0) < booking.totalAmount

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Đóng"
      />
      <aside className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-adminGray-100">
          <div>
            <h2 className="text-lg font-semibold text-adminInk">Chi tiết lịch hẹn</h2>
            {dateLabel && <p className="text-sm text-adminGray-600">{dateLabel}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-adminGray-100 text-adminGray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center gap-3 p-4 bg-adminGray-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-state-info-bg flex items-center justify-center">
              <User className="w-5 h-5 text-state-info-text" />
            </div>
            <div>
              <p className="font-semibold text-adminInk">{booking.customerName}</p>
              {booking.customerPhone && (
                <p className="text-sm text-adminGray-600 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  {booking.customerPhone}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-adminGold-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-adminGray-600 uppercase tracking-wide">Dịch vụ</p>
                <p className="font-medium text-adminInk">{booking.serviceName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-state-info-text shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-adminGray-600 uppercase tracking-wide">Thời gian</p>
                <p className="font-medium text-adminInk">
                  {booking.startTime} – {booking.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-adminGray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-adminGray-600 uppercase tracking-wide">Trạng thái</p>
                <p className="font-medium text-adminInk">
                  {BOOKING_STATUS_LABELS[booking.status] ?? `Trạng thái #${booking.status}`}
                </p>
                {booking.totalAmount > 0 && (
                  <p className="text-sm text-adminGray-600 mt-1">
                    Tổng: {booking.totalAmount.toLocaleString('vi-VN')}đ
                  </p>
                )}
              </div>
            </div>

            {booking.note && (
              <div className="p-3 bg-state-warning-bg border border-state-warning-border rounded-lg text-sm text-state-warning-text">
                <p className="text-xs font-medium text-state-warning-text mb-1">Ghi chú</p>
                {booking.note}
              </div>
            )}

            {isPending && (
              <p className="text-sm text-state-warning-text bg-state-warning-bg border border-state-warning-border rounded-lg p-3">
                Lịch đang chờ thu ngân duyệt. Sau khi được duyệt, bạn có thể bắt đầu phục vụ.
              </p>
            )}

            {isCompletedUnpaid && (
              <p className="text-sm text-state-info-text bg-state-info-bg border border-state-info-border rounded-lg p-3">
                Dịch vụ đã hoàn tất. Khách chuyển sang quầy thu ngân để thanh toán.
              </p>
            )}
          </div>
        </div>

        {(canStart || canComplete) && (
          <div className="p-5 border-t border-adminGray-100 space-y-2">
            {canStart && onStartService && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStartService(booking.id)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-state-info-solid text-white font-semibold text-sm hover:bg-state-info-solid/90 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                Bắt đầu phục vụ
              </button>
            )}
            {canComplete && onCompleteService && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onCompleteService(booking.id)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-adminGreen-600 text-white font-semibold text-sm hover:bg-adminGreen-700 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                Hoàn thành — chờ thanh toán
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
