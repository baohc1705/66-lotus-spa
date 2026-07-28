import { CheckCircle2, Loader2, MapPin, Phone, Play, User, X } from 'lucide-react'
import {
  APPOINTMENT_STATUS_DOT_CLASS,
  APPOINTMENT_STATUS_LABELS,
} from '@/features/booking/constants/appointment.constants'
import { FormField } from '@/shared/components/forms/FormField'
import { formatDateTimeDisplay } from '@/shared/utils/date.utils'
import { cn } from '@/lib/utils'
import { BOOKING_STATUS_LABELS, BookingStatus, type StaffScheduleBooking } from '../types'

interface BookingDetailPanelProps {
  booking: StaffScheduleBooking | null
  dateLabel?: string
  onClose: () => void
  onStartService?: (bookingId: string) => void
  onCompleteService?: (bookingId: string) => void
  isUpdating?: boolean
}

function calcDurationMins(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null
  return eh * 60 + em - (sh * 60 + sm)
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
  const code = booking.appointmentCode || booking.id
  const durationMins = calcDurationMins(booking.startTime, booking.endTime)
  const statusLabel =
    BOOKING_STATUS_LABELS[booking.status] ??
    APPOINTMENT_STATUS_LABELS[booking.status] ??
    `Trạng thái #${booking.status}`
  const statusDot =
    APPOINTMENT_STATUS_DOT_CLASS[booking.status] ?? 'bg-adminGray-400'
  const completedAtLabel = booking.completedAt
    ? formatDateTimeDisplay(booking.completedAt)
    : '—'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-adminGray-50 rounded-[5px] border border-adminGold-600/30 shadow-[0_12px_40px_rgba(42,31,26,0.22)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-14 flex items-center justify-between px-5 border-b border-adminGold-600/20 bg-white/70 shrink-0">
          <div>
            <h2 className="font-semibold text-adminInk">
              Lịch hẹn
              <span className="ml-2 font-normal text-adminGray-600">(Mã: {code})</span>
            </h2>
            {dateLabel && (
              <p className="text-xs text-adminGray-600 mt-0.5">{dateLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[5px] hover:bg-adminGray-50 text-adminGray-600 hover:text-adminInk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-start gap-4 p-4 rounded-[5px] border border-adminGold-600/20 bg-white">
            <div className="w-14 h-14 rounded-full bg-adminGold-600/15 flex items-center justify-center text-adminGold-600 font-bold text-xl shrink-0">
              {booking.customerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 text-adminInk font-semibold">
                <User className="w-4 h-4 text-adminGray-600 shrink-0" />
                <span className="truncate">{booking.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-adminGray-600">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{booking.customerPhone || '—'}</span>
              </div>
            </div>
            <div className="text-right text-xs text-adminGray-600 shrink-0">
              <div>Mã: {code}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-[5px] border border-adminGold-600/20 bg-white">
            <FormField label="Ngày hẹn">
              <div className="h-10 px-3 flex items-center rounded-[5px] border border-adminGold-600/20 bg-adminGray-50 text-sm text-adminInk">
                {dateLabel || '—'}
              </div>
            </FormField>
            <FormField label="Giờ hẹn">
              <div className="h-10 px-3 flex items-center rounded-[5px] border border-adminGold-600/20 bg-adminGray-50 text-sm text-adminInk">
                {booking.startTime} – {booking.endTime}
              </div>
            </FormField>
            <FormField label="Thời lượng">
              <div className="h-10 px-3 flex items-center rounded-[5px] border border-adminGold-600/20 bg-adminGray-50 text-sm text-adminInk">
                {durationMins != null ? `${durationMins} phút` : '—'}
              </div>
            </FormField>
            <FormField label="Thời gian hoàn thành">
              <div className="h-10 px-3 flex items-center rounded-[5px] border border-adminGold-600/20 bg-adminGray-50 text-sm text-adminInk">
                {completedAtLabel}
              </div>
            </FormField>
          </div>

          <div className="rounded-[5px] border border-adminGold-600/20 bg-white overflow-hidden">
            <div className="grid grid-cols-[1.4fr_1fr] gap-2 px-4 py-2.5 bg-adminGray-50/80 border-b border-adminGold-600/15 text-xs font-semibold text-adminGray-600 uppercase tracking-wide">
              <span>Dịch vụ</span>
              <span>Phòng / Chỗ ngồi</span>
            </div>
            <div className="grid grid-cols-[1.4fr_1fr] gap-2 px-4 py-3 text-sm text-adminInk items-start">
              <span className="font-medium">{booking.serviceName}</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-adminGold-600 shrink-0" />
                {booking.positionName || '—'}
              </span>
            </div>
          </div>

          <div className="rounded-[5px] border border-adminGold-600/20 bg-white p-4">
            <div className="text-sm font-semibold text-adminInk mb-2">Trạng thái</div>
            <div className="inline-flex items-center gap-2 text-sm text-adminInk">
              <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', statusDot)} />
              <span className="font-medium">{statusLabel}</span>
            </div>
          </div>

          {booking.note && (
            <FormField label="Ghi chú">
              <div className="min-h-[72px] px-3 py-2 rounded-[5px] border border-adminGold-600/20 bg-adminGray-50 text-sm text-adminInk whitespace-pre-wrap">
                {booking.note}
              </div>
            </FormField>
          )}
        </div>

        <div className="px-5 py-4 border-t border-adminGold-600/20 bg-white/80 flex flex-wrap items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-[5px] border border-adminGold-600/30 text-sm font-medium text-adminInk hover:bg-adminGray-50"
          >
            Đóng
          </button>
          {canStart && onStartService && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onStartService(booking.id)}
              className="h-10 px-4 rounded-[5px] text-sm font-semibold text-white inline-flex items-center gap-2 bg-state-info-solid hover:bg-state-info-solid/90 disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Bắt đầu phục vụ
            </button>
          )}
          {canComplete && onCompleteService && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onCompleteService(booking.id)}
              className="h-10 px-4 rounded-[5px] text-sm font-semibold text-white inline-flex items-center gap-2 bg-adminGreen-600 hover:bg-adminGreen-600/90 disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Hoàn thành phục vụ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
