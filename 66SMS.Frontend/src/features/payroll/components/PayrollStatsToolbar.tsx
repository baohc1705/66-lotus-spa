import { useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { PayrollStatsViewMode } from "../types/payroll.types";

interface PayrollStatsToolbarProps {
  viewMode: PayrollStatsViewMode;
  onViewModeChange: (mode: PayrollStatsViewMode) => void;
  anchorDate: Date;
  onAnchorDateChange: (date: Date) => void;
  periodLabel: string;
  staffPicker?: ReactNode;
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toMonthInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function PayrollStatsToolbar({
  viewMode,
  onViewModeChange,
  anchorDate,
  onAnchorDateChange,
  periodLabel,
  staffPicker,
}: PayrollStatsToolbarProps) {
  const pickerRef = useRef<HTMLInputElement>(null);

  const handleToday = () => onAnchorDateChange(new Date());

  const handlePrev = () => {
    const next = new Date(anchorDate);
    if (viewMode === "day") next.setDate(next.getDate() - 1);
    else if (viewMode === "week") next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    onAnchorDateChange(next);
  };

  const handleNext = () => {
    const next = new Date(anchorDate);
    if (viewMode === "day") next.setDate(next.getDate() + 1);
    else if (viewMode === "week") next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    onAnchorDateChange(next);
  };

  const openPicker = () => {
    const el = pickerRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus();
      el.click();
    }
  };

  const handlePickerChange = (value: string) => {
    if (!value) return;
    if (viewMode === "month") {
      const [y, m] = value.split("-").map(Number);
      onAnchorDateChange(new Date(y, m - 1, 1));
      return;
    }
    onAnchorDateChange(new Date(`${value}T12:00:00`));
  };

  const isToday =
    viewMode === "day" &&
    anchorDate.toDateString() === new Date().toDateString();

  return (
    <div className="px-4 pt-3 pb-3 flex flex-wrap items-end gap-3 border-b border-adminGray-100 shrink-0">
      <div className="flex items-center bg-adminGray-50 p-0.5 border border-adminGray-100 h-9">
        {(
          [
            ["day", "Ngày"],
            ["week", "Tuần"],
            ["month", "Tháng"],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => onViewModeChange(mode)}
            className={cn(
              "px-3 h-8 text-xs font-semibold transition-colors",
              viewMode === mode
                ? "bg-white text-primary shadow-sm border border-adminGray-100"
                : "text-adminGray-600 hover:text-adminInk",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {staffPicker}

      <div className="ml-auto flex items-end gap-2">
        <Button
          type="button"
          variant={isToday ? "admin" : "outline"}
          size="sm"
          className="lotus-admin-table-toolbar-btn h-9"
          onClick={handleToday}
        >
          Hôm nay
        </Button>

        <div className="relative flex items-center bg-adminGray-50 border border-adminGray-100 h-9">
          <button
            type="button"
            onClick={handlePrev}
            className="px-2 h-full text-adminGray-600 hover:text-adminInk hover:bg-white transition-colors"
            aria-label="Kỳ trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={openPicker}
            className="flex items-center gap-1.5 px-2 text-xs font-semibold text-adminInk min-w-[170px] justify-center h-full hover:bg-white transition-colors"
            title="Chọn ngày"
          >
            <Calendar className="w-3.5 h-3.5 text-adminGray-600 shrink-0" />
            <span className="truncate">{periodLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-2 h-full text-adminGray-600 hover:text-adminInk hover:bg-white transition-colors"
            aria-label="Kỳ sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <input
            ref={pickerRef}
            type={viewMode === "month" ? "month" : "date"}
            value={
              viewMode === "month"
                ? toMonthInputValue(anchorDate)
                : toDateInputValue(anchorDate)
            }
            onChange={(e) => handlePickerChange(e.target.value)}
            className="absolute opacity-0 pointer-events-none w-0 h-0"
            tabIndex={-1}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
