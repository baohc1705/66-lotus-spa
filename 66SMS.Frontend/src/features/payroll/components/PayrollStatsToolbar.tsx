import { useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { TabNav } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import { SearchableSelect } from "@/shared/forms/SearchableSelect";
import type { SelectOption } from "@/shared/forms/Select";

import type { PayrollStatsViewMode } from "../types/payroll.types";

type PayrollStatsToolbarProps = {
  viewMode: PayrollStatsViewMode;
  onViewModeChange: (mode: PayrollStatsViewMode) => void;
  anchorDate: Date;
  onAnchorDateChange: (date: Date) => void;
  periodLabel: string;
  staffOptions?: SelectOption[];
  staffValue?: string;
  staffName?: string;
  staffEditable?: boolean;
  onStaffChange?: (value: string) => void;
};

const VIEW_TABS = [
  { id: "day", label: "Ngày" },
  { id: "week", label: "Tuần" },
  { id: "month", label: "Tháng" },
];

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function PayrollStatsToolbar({
  viewMode,
  onViewModeChange,
  anchorDate,
  onAnchorDateChange,
  periodLabel,
  staffOptions = [],
  staffValue = "",
  staffName,
  staffEditable = false,
  onStaffChange,
}: PayrollStatsToolbarProps) {
  const pickerRef = useRef<HTMLInputElement>(null);

  function handleToday() {
    onAnchorDateChange(new Date());
  }

  function handlePrev() {
    const next = new Date(anchorDate);
    if (viewMode === "day") next.setDate(next.getDate() - 1);
    else if (viewMode === "week") next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    onAnchorDateChange(next);
  }

  function handleNext() {
    const next = new Date(anchorDate);
    if (viewMode === "day") next.setDate(next.getDate() + 1);
    else if (viewMode === "week") next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    onAnchorDateChange(next);
  }

  function openPicker() {
    const element = pickerRef.current;
    if (!element) return;
    if (typeof element.showPicker === "function") {
      element.showPicker();
      return;
    }
    element.focus();
    element.click();
  }

  function handlePickerChange(value: string) {
    if (!value) return;
    if (viewMode === "month") {
      const [year, month] = value.split("-").map(Number);
      onAnchorDateChange(new Date(year, month - 1, 1));
      return;
    }
    onAnchorDateChange(new Date(`${value}T12:00:00`));
  }

  return (
    <div className="flex h-14 shrink-0 flex-wrap items-center gap-3 border-b border-kit px-4">
      <TabNav
        items={VIEW_TABS}
        activeId={viewMode}
        onChange={(id: string) =>
          onViewModeChange(id as PayrollStatsViewMode)
        }
        variant="btn-group-primary"
        className="mb-0"
      />

      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-sm text-kit-body">Nhân viên</span>
        {staffEditable ? (
          <SearchableSelect
            className="w-[220px]"
            inputSize="sm"
            value={staffValue}
            options={staffOptions}
            placeholder="Chọn nhân viên..."
            searchPlaceholder="Tìm nhân viên..."
            emptyText="Không tìm thấy"
            clearable
            onChange={(value: string) => onStaffChange?.(value)}
          />
        ) : (
          <div className="flex h-8 min-w-40 items-center rounded border border-kit bg-kit-page px-3 text-sm font-medium text-kit-heading">
            {staffName ?? "—"}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="mb-0! mr-0! h-8"
          onClick={handleToday}
        >
          Hôm nay
        </Button>

        <div className="relative flex h-8 items-center rounded border border-kit bg-kit-page">
          <button
            type="button"
            onClick={handlePrev}
            className="flex h-full items-center px-2 text-kit-muted transition-colors hover:bg-kit-white hover:text-kit-heading"
            aria-label="Kỳ trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={openPicker}
            className="flex h-full min-w-[170px] items-center justify-center gap-1.5 px-2 text-xs font-semibold text-kit-heading transition-colors hover:bg-kit-white"
            title="Chọn ngày"
          >
            <Calendar className="h-3.5 w-3.5 shrink-0 text-kit-muted" />
            <span className="truncate">{periodLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex h-full items-center px-2 text-kit-muted transition-colors hover:bg-kit-white hover:text-kit-heading"
            aria-label="Kỳ sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <input
            ref={pickerRef}
            type={viewMode === "month" ? "month" : "date"}
            value={
              viewMode === "month"
                ? toMonthInputValue(anchorDate)
                : toDateInputValue(anchorDate)
            }
            onChange={(event) => handlePickerChange(event.target.value)}
            className="pointer-events-none absolute h-0 w-0 opacity-0"
            tabIndex={-1}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
