import { useAuthStore } from "@/features/auth/stores/authStore";
import { formatDate } from "@/shared/utils/date.utils";
import type { RevenueReportGrain } from "../types/revenue.types";
import { useMemo, useState } from "react";

function toYmd(date: Date): string {
  return formatDate(date).format("YYYY-MM-DD");
}

function lastDayOfMonth(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex + 1, 0);
}

export function useRevenueReportFilters() {
  const isAdmin = useAuthStore((s) => s.hasRole("Admin"));
  const selectedSalonId = useAuthStore((s) => s.selectedSalonId);
  const managedSalonId = useAuthStore((s) => s.managedSalonId);
  const mySalonId = useAuthStore((s) => s.mySalon?.salonId ?? null);

  const today = new Date();
  const [grain, setGrain] = useState<RevenueReportGrain>("day");
  const [from, setFrom] = useState(() =>
    toYmd(new Date(today.getFullYear(), today.getMonth(), 1)),
  );
  const [to, setTo] = useState(() => toYmd(today));
  const [adminSalonId, setAdminSalonId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const salonId = isAdmin
    ? adminSalonId
    : (selectedSalonId ?? managedSalonId ?? mySalonId);

  function setSalonId(id: number | null) {
    if (!isAdmin) return;
    setAdminSalonId(id);
  }

  function applyGrain(next: RevenueReportGrain) {
    const now = new Date();
    let fromDate: Date;
    let toDate: Date;

    if (next === "day") {
      fromDate = now;
      toDate = now;
    } else if (next === "week") {
      const day = now.getDay() || 7;
      fromDate = new Date(now);
      fromDate.setDate(fromDate.getDate() - day + 1);
      toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + 6);
    } else if (next === "month") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      toDate = lastDayOfMonth(now.getFullYear(), now.getMonth());
    } else if (next === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      fromDate = new Date(now.getFullYear(), q * 3, 1);
      toDate = lastDayOfMonth(now.getFullYear(), q * 3 + 2);
    } else {
      fromDate = new Date(now.getFullYear(), 0, 1);
      toDate = new Date(now.getFullYear(), 11, 31);
    }

    setGrain(next);
    setFrom(toYmd(fromDate));
    setTo(toYmd(toDate));
  }

  const range = useMemo(() => ({ from, to }), [from, to]);

  return {
    isAdmin,
    grain,
    setGrain: applyGrain,
    from,
    to,
    setFrom,
    setTo,
    salonId,
    setSalonId,
    categoryId,
    setCategoryId,
    range,
  };
}
