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

export function PayrollStatsToolbar({
  viewMode,
  onViewModeChange,
  anchorDate,
  onAnchorDateChange,
  periodLabel,
  staffPicker,
}: PayrollStatsToolbarProps) {
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

        <div className="flex items-center bg-adminGray-50 border border-adminGray-100 h-9">
          <button
            type="button"
            onClick={handlePrev}
            className="px-2 h-full text-adminGray-600 hover:text-adminInk hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-adminInk min-w-[170px] justify-center">
            <Calendar className="w-3.5 h-3.5 text-adminGray-600 shrink-0" />
            <span className="truncate">{periodLabel}</span>
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="px-2 h-full text-adminGray-600 hover:text-adminInk hover:bg-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
