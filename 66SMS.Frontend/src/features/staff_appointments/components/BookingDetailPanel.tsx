import { Loader2, X, Clock, User, Phone, Sparkles, FileText, Play, CheckCircle2 } from 'lucide-react'
import type { StaffScheduleBooking } from '../types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ thu ngân duyệt',
  'not-arrived': 'Chưa tới',
  waiting: 'Đã duyệt — chờ phục vụ',
  'in-progress': 'Đang phục vụ',
  completed: 'Đã xong',
  unpaid: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  cancelled: 'Đã hủy',
}

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

  const canStart =
    booking.status === 'waiting' || booking.status === 'not-arrived'
  const canComplete = booking.status === 'in-progress'
  const isPending = booking.status === 'pending'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Đóng"
      />
      <aside className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Chi tiết lịch hẹn</h2>
            {dateLabel && <p className="text-sm text-gray-500">{dateLabel}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#1A56DB]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#1A56DB]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{booking.customerName}</p>
              {booking.customerPhone && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  {booking.customerPhone}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Dịch vụ</p>
                <p className="font-medium text-gray-900">{booking.serviceName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#1A56DB] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Thời gian</p>
                <p className="font-medium text-gray-900">
                  {booking.startTime} – {booking.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Trạng thái</p>
                <p className="font-medium text-gray-900">
                  {STATUS_LABELS[booking.status] ?? booking.status}
                </p>
                {booking.totalAmount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Tổng: {booking.totalAmount.toLocaleString('vi-VN')}đ
                  </p>
                )}
              </div>
            </div>

            {booking.note && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-900">
                <p className="text-xs font-medium text-amber-700 mb-1">Ghi chú</p>
                {booking.note}
              </div>
            )}

            {isPending && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                Lịch đang chờ thu ngân duyệt. Sau khi được duyệt, bạn có thể bắt đầu phục vụ.
              </p>
            )}

            {booking.status === 'unpaid' && (
              <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-3">
                Dịch vụ đã hoàn tất. Khách chuyển sang quầy thu ngân để thanh toán.
              </p>
            )}
          </div>
        </div>

        {(canStart || canComplete) && (
          <div className="p-5 border-t border-gray-100 space-y-2">
            {canStart && onStartService && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onStartService(booking.id)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A56DB] text-white font-semibold text-sm hover:bg-[#1A56DB]/90 disabled:opacity-50 transition-colors"
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
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
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
