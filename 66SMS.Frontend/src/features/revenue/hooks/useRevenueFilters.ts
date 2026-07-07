import { useState, useMemo } from "react";
import { formatDate } from "@/shared/utils/date.utils";

export type RevenuePreset = "today" | "7days" | "30days" | "thisMonth";

export interface RevenueFilters {
  preset: RevenuePreset;
  from: string;
  to: string;
  label: string;
}

export function useRevenueFilters() {
  const [preset, setPreset] = useState<RevenuePreset>("7days");

  const filters = useMemo((): RevenueFilters => {
    const today = new Date();
    
    let fromDate = new Date(today);
    const toDate = new Date(today);
    let label = "7 ngày qua";

    switch (preset) {
      case "today":
        fromDate = new Date(today);
        label = "Hôm nay";
        break;
      case "7days":
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 6); // 7 days total including today
        label = "7 ngày qua";
        break;
      case "30days":
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 29); // 30 days total including today
        label = "30 ngày qua";
        break;
      case "thisMonth":
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        label = "Tháng này";
        break;
    }

    return {
      preset,
      from: formatDate(fromDate).format("YYYY-MM-DD"),
      to: formatDate(toDate).format("YYYY-MM-DD"),
      label,
    };
  }, [preset]);

  return {
    ...filters,
    setPreset,
  };
}
