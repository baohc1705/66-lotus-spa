import { useState, useMemo } from "react";
import { formatDate } from "@/shared/utils/date.utils";

export type RevenuePreset =
  | "today"
  | "7days"
  | "30days"
  | "thisMonth"
  | "day"
  | "month"
  | "year";

export interface RevenueFilters {
  preset: RevenuePreset;
  from: string;
  to: string;
  label: string;
}

function toYmd(date: Date): string {
  return formatDate(date).format("YYYY-MM-DD");
}

function lastDayOfMonth(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex + 1, 0);
}

export function useRevenueFilters() {
  const today = new Date();
  const [preset, setPreset] = useState<RevenuePreset>("7days");
  const [selectedDay, setSelectedDay] = useState(() => toYmd(today));
  const [selectedMonth, setSelectedMonth] = useState(
    () =>
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
  );
  const [selectedYear, setSelectedYear] = useState(() => today.getFullYear());

  const filters = useMemo((): RevenueFilters => {
    const now = new Date();
    let fromDate = new Date(now);
    let toDate = new Date(now);
    let label = "7 ngày qua";

    switch (preset) {
      case "today":
        fromDate = new Date(now);
        label = "Hôm nay";
        break;
      case "7days":
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 6);
        label = "7 ngày qua";
        break;
      case "30days":
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 29);
        label = "30 ngày qua";
        break;
      case "thisMonth":
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        label = "Tháng này";
        break;
      case "day": {
        const parts = selectedDay.split("-").map(Number);
        const y = parts[0] ?? now.getFullYear();
        const m = (parts[1] ?? now.getMonth() + 1) - 1;
        const d = parts[2] ?? now.getDate();
        fromDate = new Date(y, m, d);
        toDate = new Date(y, m, d);
        label = `Ngày ${selectedDay}`;
        break;
      }
      case "month": {
        const parts = selectedMonth.split("-").map(Number);
        const y = parts[0] ?? now.getFullYear();
        const m = (parts[1] ?? now.getMonth() + 1) - 1;
        fromDate = new Date(y, m, 1);
        toDate = lastDayOfMonth(y, m);
        label = `Tháng ${m + 1}/${y}`;
        break;
      }
      case "year":
        fromDate = new Date(selectedYear, 0, 1);
        toDate = new Date(selectedYear, 11, 31);
        label = `Năm ${selectedYear}`;
        break;
    }

    return {
      preset,
      from: toYmd(fromDate),
      to: toYmd(toDate),
      label,
    };
  }, [preset, selectedDay, selectedMonth, selectedYear]);

  return {
    ...filters,
    setPreset,
    selectedDay,
    setSelectedDay,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
  };
}
