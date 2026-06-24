import { Search, Filter, ChevronLeft, ChevronRight, Calendar, Plus, Rows3, Columns3 } from 'lucide-react'
import type { CashierViewMode } from '../types'

interface CashierToolbarProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  onAddBooking: () => void
  viewMode: CashierViewMode
  onViewModeChange: (mode: CashierViewMode) => void
}

export function CashierToolbar({ currentDate, onDateChange, onAddBooking, viewMode, onViewModeChange }: CashierToolbarProps) {
  const handlePrevDay = () => {
    const prev = new Date(currentDate)
    prev.setDate(prev.getDate() - 1)
    onDateChange(prev)
  }

  const handleNextDay = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + 1)
    onDateChange(next)
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-lotus-gold/10 sticky top-0 z-30">
      {/* Left: Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-lotus-stone w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm khách hàng (F4)..."
            className="pl-9 pr-4 py-2 bg-lotus-cream/30 border border-lotus-gold/20 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-lotus-leaf/20 focus:border-lotus-leaf transition-all text-lotus-deep placeholder:text-lotus-stone"
          />
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-full border border-lotus-gold/20 hover:bg-lotus-cream text-lotus-deep transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Middle: Status Legend */}
      <div className="hidden xl:flex flex-wrap items-center justify-center gap-3 text-xs font-medium max-w-[60%]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-pending"></span>
          <span className="text-lotus-deep/80">Chờ xác nhận</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-confirmed"></span>
          <span className="text-lotus-deep/80">Đã xác nhận</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-waiting"></span>
          <span className="text-lotus-deep/80">Chờ phục vụ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-in-progress"></span>
          <span className="text-lotus-deep/80">Đang phục vụ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-completed"></span>
          <span className="text-lotus-deep/80">Hoàn thành</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-cancelled"></span>
          <span className="text-lotus-deep/80">Đã hủy</span>
        </div>
      </div>

      {/* Right: Date Nav & Action */}
      <div className="flex items-center gap-4">
        {/* View Toggle: Timeline (hàng ngang) / Cột (cũ) */}
        <div className="flex items-center bg-lotus-cream/30 p-1 rounded-admin border border-lotus-gold/20">
          <button
            onClick={() => onViewModeChange('timeline')}
            title="Nhân viên theo hàng, thời gian chạy ngang"
            className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-md transition-all ${
              viewMode === 'timeline'
                ? 'bg-white shadow-sm text-lotus-deep'
                : 'text-lotus-deep/70 hover:text-lotus-deep'
            }`}
          >
            <Rows3 className="w-4 h-4" />
            Timeline
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            title="Nhân viên theo cột, thời gian chạy dọc"
            className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-md transition-all ${
              viewMode === 'grid'
                ? 'bg-white shadow-sm text-lotus-deep'
                : 'text-lotus-deep/70 hover:text-lotus-deep'
            }`}
          >
            <Columns3 className="w-4 h-4" />
            Cột
          </button>
        </div>

        <div className="flex items-center bg-lotus-cream/30 p-1 rounded-admin border border-lotus-gold/20">
          <button 
            onClick={handleToday}
            className="px-3 py-1 text-sm font-medium text-lotus-deep/80 hover:text-lotus-deep hover:bg-white hover:shadow-sm rounded-md transition-all"
          >
            Hôm nay
          </button>
          <div className="w-[1px] h-4 bg-lotus-gold/20 mx-1"></div>
          <button onClick={handlePrevDay} className="p-1 text-lotus-stone hover:text-lotus-deep hover:bg-white rounded-md transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 text-sm font-medium text-lotus-deep min-w-[120px] justify-center">
            <Calendar className="w-4 h-4 text-lotus-stone" />
            {currentDate.toLocaleDateString('vi-VN')}
          </div>
          <button onClick={handleNextDay} className="p-1 text-lotus-stone hover:text-lotus-deep hover:bg-white rounded-md transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={onAddBooking}
          className="flex items-center gap-1.5 px-4 py-2 bg-lotus-leaf text-white text-sm font-semibold rounded-admin hover:bg-lotus-leaf/90 transition-all shadow-sm shadow-lotus-leaf/20"
        >
          <Plus className="w-4 h-4" />
          Thêm lịch
        </button>
      </div>
    </div>
  )
}
