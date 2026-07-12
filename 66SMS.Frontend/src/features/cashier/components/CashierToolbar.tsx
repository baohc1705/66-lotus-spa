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
    <div className="flex items-center justify-between px-3 py-1.5 bg-adminGray-50/20 border-b border-adminGray-100 sticky top-0 z-30 font-sans">
      {/* Left: Search & Filters */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-adminGray-600 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Tìm khách hàng (F4)..."
            className="pl-8 pr-3 py-1 bg-white border border-adminGray-100 rounded-[3px] text-xs w-48 focus:outline-none focus:ring-1 focus:ring-adminGreen-600 focus:border-adminGreen-600 transition-all text-adminInk placeholder:text-adminGray-600"
          />
        </div>
        <button className="w-7 h-7 flex items-center justify-center rounded-[3px] border border-adminGray-100 bg-white hover:bg-adminGray-50 text-adminInk transition-colors">
          <Filter className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Date Nav & Action */}
      <div className="flex items-center gap-3">
        {/* Time Range Toggle */}
        <div className="flex items-center bg-white p-0.5 rounded-[3px] border border-adminGray-100">
          <button
            onClick={() => onTimeRangeChange('daily')}
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-[2px] transition-all whitespace-nowrap ${
              timeRange === 'daily'
                ? 'bg-adminGreen-100 text-adminGreen-600'
                : 'text-adminInk/70 hover:text-adminInk'
            }`}
          >
            Ngày
          </button>
          <button
            onClick={() => onTimeRangeChange('weekly')}
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-[2px] transition-all whitespace-nowrap ${
              timeRange === 'weekly'
                ? 'bg-adminGreen-100 text-adminGreen-600'
                : 'text-adminInk/70 hover:text-adminInk'
            }`}
          >
            Tuần
          </button>
        </div>

        {/* View Toggle: Timeline / Cột (Only show if daily) */}
        {timeRange === 'daily' && (
          <div className="flex items-center bg-white p-0.5 rounded-[3px] border border-adminGray-100">
            <button
              onClick={() => onViewModeChange('timeline')}
              title="Nhân viên theo hàng, thời gian chạy ngang"
              className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-[2px] transition-all whitespace-nowrap ${
                viewMode === 'timeline'
                  ? 'bg-adminGreen-100 text-adminGreen-600'
                  : 'text-adminInk/70 hover:text-adminInk'
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
                  ? 'bg-adminGreen-100 text-adminGreen-600'
                  : 'text-adminInk/70 hover:text-adminInk'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Cột
            </button>
          </div>
        )}

        <div className="flex items-center bg-white p-0.5 rounded-[3px] border border-adminGray-100">
          <button 
            onClick={handleToday}
            className="px-2 py-0.5 text-xs font-semibold text-adminInk/80 hover:text-adminInk hover:bg-adminGray-50/40 rounded-[2px] transition-all whitespace-nowrap"
          >
            Hôm nay
          </button>
          <div className="w-[1px] h-3 bg-adminGray-100 mx-0.5"></div>
          <button onClick={handlePrevDay} className="p-0.5 text-adminGray-600 hover:text-adminInk hover:bg-adminGray-50/40 rounded-[2px] transition-all">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1 px-2 text-xs font-semibold text-adminInk min-w-[90px] justify-center whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-adminGray-600" />
            {getDisplayDate()}
          </div>
          <button onClick={handleNextDay} className="p-0.5 text-adminGray-600 hover:text-adminInk hover:bg-adminGray-50/40 rounded-[2px] transition-all">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button 
          onClick={onAddBooking}
          className="flex items-center gap-1 px-2.5 py-1 bg-adminGreen-600 text-white text-xs font-bold rounded-[3px] hover:bg-adminGreen-600/90 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm lịch
        </button>
      </div>
    </div>
  )
}
