import { Search, Filter, ChevronLeft, ChevronRight, Calendar, Plus, Rows3, Columns3 } from 'lucide-react'
import type { CashierViewMode, CashierTimeRange } from '../types'

interface CashierToolbarProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  onAddBooking: () => void
  viewMode: CashierViewMode
  onViewModeChange: (mode: CashierViewMode) => void
  timeRange: CashierTimeRange
  onTimeRangeChange: (range: CashierTimeRange) => void
}

export function CashierToolbar({ currentDate, onDateChange, onAddBooking, viewMode, onViewModeChange, timeRange, onTimeRangeChange }: CashierToolbarProps) {
  const handlePrevDay = () => {
    const prev = new Date(currentDate)
    if (timeRange === 'weekly') {
      prev.setDate(prev.getDate() - 7)
    } else {
      prev.setDate(prev.getDate() - 1)
    }
    onDateChange(prev)
  }

  const handleNextDay = () => {
    const next = new Date(currentDate)
    if (timeRange === 'weekly') {
      next.setDate(next.getDate() + 7)
    } else {
      next.setDate(next.getDate() + 1)
    }
    onDateChange(next)
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const getDisplayDate = () => {
    if (timeRange === 'daily') return currentDate.toLocaleDateString('vi-VN');
    
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  }

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-lotus-cream/20 border-b border-stone-200 sticky top-0 z-30 font-sans">
      {/* Left: Search & Filters */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-lotus-stone w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Tìm khách hàng (F4)..."
            className="pl-8 pr-3 py-1 bg-white border border-stone-200 rounded-[3px] text-xs w-48 focus:outline-none focus:ring-1 focus:ring-lotus-primary focus:border-lotus-primary transition-all text-lotus-deep placeholder:text-lotus-stone"
          />
        </div>
        <button className="w-7 h-7 flex items-center justify-center rounded-[3px] border border-stone-200 bg-white hover:bg-lotus-cream text-lotus-deep transition-colors">
          <Filter className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Date Nav & Action */}
      <div className="flex items-center gap-3">
        {/* Time Range Toggle */}
        <div className="flex items-center bg-white p-0.5 rounded-[3px] border border-stone-200">
          <button
            onClick={() => onTimeRangeChange('daily')}
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-[2px] transition-all whitespace-nowrap ${
              timeRange === 'daily'
                ? 'bg-lotus-primary/10 text-lotus-primary'
                : 'text-lotus-deep/70 hover:text-lotus-deep'
            }`}
          >
            Ngày
          </button>
          <button
            onClick={() => onTimeRangeChange('weekly')}
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-[2px] transition-all whitespace-nowrap ${
              timeRange === 'weekly'
                ? 'bg-lotus-primary/10 text-lotus-primary'
                : 'text-lotus-deep/70 hover:text-lotus-deep'
            }`}
          >
            Tuần
          </button>
        </div>

        {/* View Toggle: Timeline / Cột (Only show if daily) */}
        {timeRange === 'daily' && (
          <div className="flex items-center bg-white p-0.5 rounded-[3px] border border-stone-200">
            <button
              onClick={() => onViewModeChange('timeline')}
              title="Nhân viên theo hàng, thời gian chạy ngang"
              className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-[2px] transition-all whitespace-nowrap ${
                viewMode === 'timeline'
                  ? 'bg-lotus-primary/10 text-lotus-primary'
                  : 'text-lotus-deep/70 hover:text-lotus-deep'
              }`}
            >
              <Rows3 className="w-3.5 h-3.5" />
              Timeline
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              title="Nhân viên theo cột, thời gian chạy dọc"
              className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-[2px] transition-all whitespace-nowrap ${
                viewMode === 'grid'
                  ? 'bg-lotus-primary/10 text-lotus-primary'
                  : 'text-lotus-deep/70 hover:text-lotus-deep'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Cột
            </button>
          </div>
        )}

        <div className="flex items-center bg-white p-0.5 rounded-[3px] border border-stone-200">
          <button 
            onClick={handleToday}
            className="px-2 py-0.5 text-xs font-semibold text-lotus-deep/80 hover:text-lotus-deep hover:bg-lotus-cream/40 rounded-[2px] transition-all whitespace-nowrap"
          >
            Hôm nay
          </button>
          <div className="w-[1px] h-3 bg-stone-200 mx-0.5"></div>
          <button onClick={handlePrevDay} className="p-0.5 text-lotus-stone hover:text-lotus-deep hover:bg-lotus-cream/40 rounded-[2px] transition-all">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1 px-2 text-xs font-semibold text-lotus-deep min-w-[90px] justify-center whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-lotus-stone" />
            {getDisplayDate()}
          </div>
          <button onClick={handleNextDay} className="p-0.5 text-lotus-stone hover:text-lotus-deep hover:bg-lotus-cream/40 rounded-[2px] transition-all">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button 
          onClick={onAddBooking}
          className="flex items-center gap-1 px-2.5 py-1 bg-lotus-primary text-white text-xs font-bold rounded-[3px] hover:bg-lotus-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm lịch
        </button>
      </div>
    </div>
  )
}
