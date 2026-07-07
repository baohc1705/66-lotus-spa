import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScheduleViewMode } from "../types";

interface StaffScheduleToolbarProps {
  viewMode: ScheduleViewMode;
  onViewModeChange: (mode: ScheduleViewMode) => void;
  anchorDate: Date;
  onAnchorDateChange: (date: Date) => void;
  weekLabel?: string;
}

export function StaffScheduleToolbar({
  viewMode,
  onViewModeChange,
  anchorDate,
  onAnchorDateChange,
  weekLabel,
}: StaffScheduleToolbarProps) {
  const handleToday = () => onAnchorDateChange(new Date());

  const handlePrev = () => {
    const next = new Date(anchorDate);
    if (viewMode === "day") {
      next.setDate(next.getDate() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    onAnchorDateChange(next);
  };

  const handleNext = () => {
    const next = new Date(anchorDate);
    if (viewMode === "day") {
      next.setDate(next.getDate() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    onAnchorDateChange(next);
  };

  const isToday =
    viewMode === "day"
      ? anchorDate.toDateString() === new Date().toDateString()
      : false;

  const dateLabel =
    viewMode === "day"
      ? anchorDate.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : (weekLabel ?? "");

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-admin border border-stone-200/30 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200/50 h-9">
          <button
            type="button"
            onClick={() => onViewModeChange("day")}
            className={cn(
              "px-3 py-1.5 text-lotus-admin-lg font-semibold rounded-md transition-colors",
              viewMode === "day"
                ? "bg-white text-primary shadow-sm"
                : "text-lotus-stone hover:text-lotus-deep",
            )}
          >
            Ngày
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("week")}
            className={cn(
              "px-3 py-1.5 text-lotus-admin-lg font-semibold rounded-md transition-colors",
              viewMode === "week"
                ? "bg-white text-primary shadow-sm"
                : "text-lotus-stone hover:text-lotus-deep",
            )}
          >
            Tuần
          </button>
        </div>
 
        <div className="hidden lg:flex items-center gap-3 text-lotus-admin-md font-medium text-lotus-stone ml-2 select-none">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-pending" />
            Chờ xác nhận
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-confirmed" />
            Đã xác nhận
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-waiting" />
            Chờ phục vụ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-in-progress" />
            Đang phục vụ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-completed" />
            Hoàn thành
          </span>
        </div>
      </div>
 
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={handleToday}
          className={cn(
            "px-4 h-9 text-lotus-admin-lg font-semibold rounded-lg border transition-all flex items-center justify-center",
            isToday
              ? "bg-primary text-white border-primary"
              : "bg-white text-lotus-deep border-stone-200/50 hover:bg-stone-50",
          )}
        >
          Hôm nay
        </button>
 
        <div className="flex items-center bg-stone-50 p-0.5 rounded-lg border border-stone-200/50 h-9">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 text-lotus-stone hover:text-lotus-deep hover:bg-white rounded-md transition-all h-full flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 text-lotus-admin-lg font-semibold text-lotus-deep min-w-[200px] justify-center select-none">
            <Calendar className="w-4 h-4 text-lotus-stone shrink-0" />
            <span className="truncate">{dateLabel}</span>
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 text-lotus-stone hover:text-lotus-deep hover:bg-white rounded-md transition-all h-full flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
