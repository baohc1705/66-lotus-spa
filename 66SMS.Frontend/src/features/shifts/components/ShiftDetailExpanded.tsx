import { Clock, CalendarCheck, CheckCircle2, History } from 'lucide-react'
import type { ShiftDTO } from '../types/shift.types'
import { formatDisplayDate } from '@/shared/utils/date.utils'

interface ShiftDetailExpandedProps {
  shift: ShiftDTO
}

export function ShiftDetailExpanded({ shift }: ShiftDetailExpandedProps) {
  // Sort periods by effectiveFrom descending
  const periods = [...(shift.shiftPeriodDTOs || [])].sort((a, b) => {
    const dateA = a.effectiveFrom ? new Date(a.effectiveFrom).getTime() : 0;
    const dateB = b.effectiveFrom ? new Date(b.effectiveFrom).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="bg-adminGray-50/30 w-full overflow-hidden p-6 border-b border-adminGray-100/50">
      <div className="flex flex-col gap-6">
        {/* Header Info */}
        <div className="flex items-center gap-4 border-b border-adminGray-100/50 pb-4">
          <div className="w-12 h-12 rounded-full bg-adminGreen-100 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-adminGreen-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-adminInk">{shift.name ?? 'Ca làm việc'}</h3>
            <p className="text-sm text-adminGray-600 mt-0.5">
              {shift.description || 'Không có mô tả cho ca làm việc này.'}
            </p>
          </div>
        </div>

        {/* Periods History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-adminGray-600" />
            <h4 className="text-sm font-semibold text-adminInk">Lịch sử thời gian áp dụng</h4>
          </div>

          {periods.length === 0 ? (
            <p className="text-sm text-adminGray-600">Chưa có dữ liệu thời gian.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {periods.map((period, index) => {
                const isActive = !period.effectiveTo;
                const fromDate = period.effectiveFrom ? formatDisplayDate(period.effectiveFrom) : '—';
                const toDate = period.effectiveTo ? formatDisplayDate(period.effectiveTo) : 'Vô thời hạn';
                const startTime = period.shiftStart?.substring(0, 5) || '—';
                const endTime = period.shiftEnd?.substring(0, 5) || '—';

                return (
                  <div 
                    key={period.id ?? index} 
                    className={`relative p-4 rounded-xl border ${isActive ? 'border-adminGreen-600/40 bg-adminGreen-50 shadow-sm' : 'border-adminGray-100/60 bg-white'}`}
                  >
                    {/* Active Badge */}
                    {isActive && (
                      <div className="absolute -top-2.5 -right-2.5">
                        <span className="flex items-center gap-1 bg-adminGreen-600 text-white text-2xs font-medium px-2 py-1 rounded-full shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          Đang áp dụng
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-adminInk">
                          <Clock className="w-4 h-4 text-adminGray-600" />
                          {startTime} - {endTime}
                        </div>
                      </div>

                      <div className="h-px w-full bg-adminGray-100"></div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-adminGray-600">
                          <CalendarCheck className="w-3.5 h-3.5 opacity-70" />
                          <span>Áp dụng từ: <span className="font-medium text-adminInk/80">{fromDate}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-adminGray-600">
                          <CalendarCheck className="w-3.5 h-3.5 opacity-70" />
                          <span>Kết thúc: <span className="font-medium text-adminInk/80">{toDate}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
