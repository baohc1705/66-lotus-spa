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
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-white border border-[var(--color-border)] rounded-xl shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex p-1 bg-gray-100 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => onViewModeChange("day")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              viewMode === "day"
                ? "bg-white text-[#1A56DB] shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            Ngày
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("week")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              viewMode === "week"
                ? "bg-white text-[#1A56DB] shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            Tuần
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-gray-600 ml-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Chờ xác nhận
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Đã xác nhận
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Đang phục vụ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Hoàn thành
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToday}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-lg border transition-all",
            isToday
              ? "bg-[#1A56DB] text-white border-[#1A56DB]"
              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-white",
          )}
        >
          Hôm nay
        </button>

        <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 text-sm font-medium text-gray-900 min-w-[200px] justify-center">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{dateLabel}</span>
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
