import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import type { ViewType } from "@/shared/components/Calendar";

import { getIsoWeekStart, staffScheduleApi } from "../api";
import type {
  StaffScheduleBooking,
  StaffScheduleDailyDto,
  StaffScheduleDayDto,
  StaffScheduleWeeklyDto,
} from "../types";
import {
  getMonthWeekStarts,
  toDateKey,
} from "../utils/staffAppointmentCalendar.utils";

function getApiError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as { message?: string } | undefined;
    if (body?.message) return body.message;
  }
  return error instanceof Error ? error.message : fallback;
}

export type StaffCalendarBookingItem = {
  dateKey: string;
  booking: StaffScheduleBooking;
};

function flattenWeeklyDays(
  days: StaffScheduleDayDto[] | undefined,
): StaffCalendarBookingItem[] {
  if (!days) return [];
  const items: StaffCalendarBookingItem[] = [];
  for (const day of days) {
    for (const booking of day.bookings) {
      items.push({ dateKey: day.date, booking });
    }
  }
  return items;
}

function flattenDaily(
  data: StaffScheduleDailyDto | null | undefined,
): StaffCalendarBookingItem[] {
  if (!data) return [];
  return data.bookings.map((booking: StaffScheduleBooking) => ({
    dateKey: data.date,
    booking,
  }));
}

export function useStaffAppointmentCalendar(
  view: ViewType,
  anchorDate: Date,
  enabled = true,
) {
  const isDay = view === "day";
  const isWeek = view === "week";
  const isMonthLike = view === "month" || view === "agenda" || view === "resource";

  const weekStart = useMemo(() => getIsoWeekStart(anchorDate), [anchorDate]);
  const monthWeekStarts = useMemo(
    () => getMonthWeekStarts(anchorDate),
    [anchorDate],
  );

  const dailyQuery = useQuery({
    queryKey: ["staff-schedule-daily", toDateKey(anchorDate)],
    queryFn: async () => {
      const result = await staffScheduleApi.getDaily(anchorDate);
      if (!result.isSuccess || !result.data) {
        throw new Error(result.message || "Lỗi tải lịch hẹn");
      }
      return result.data;
    },
    enabled: enabled && isDay,
    staleTime: 30_000,
  });

  const weeklyQuery = useQuery({
    queryKey: ["staff-schedule-weekly", toDateKey(weekStart)],
    queryFn: async () => {
      const result = await staffScheduleApi.getWeekly(weekStart);
      if (!result.isSuccess || !result.data) {
        throw new Error(result.message || "Lỗi tải lịch tuần");
      }
      return result.data;
    },
    enabled: enabled && isWeek,
    staleTime: 30_000,
  });

  const monthQueries = useQueries({
    queries: monthWeekStarts.map((start: Date) => ({
      queryKey: ["staff-schedule-weekly", toDateKey(start)],
      queryFn: async () => {
        const result = await staffScheduleApi.getWeekly(start);
        if (!result.isSuccess || !result.data) {
          throw new Error(result.message || "Lỗi tải lịch tháng");
        }
        return result.data as StaffScheduleWeeklyDto;
      },
      enabled: enabled && isMonthLike,
      staleTime: 30_000,
    })),
  });

  const items = useMemo(() => {
    if (isDay) return flattenDaily(dailyQuery.data);

    if (isWeek) return flattenWeeklyDays(weeklyQuery.data?.days);

    const map = new Map<string, StaffCalendarBookingItem>();
    for (const query of monthQueries) {
      const days = query.data?.days;
      if (!days) continue;
      for (const item of flattenWeeklyDays(days)) {
        map.set(`${item.dateKey}-${item.booking.id}`, item);
      }
    }
    return Array.from(map.values());
  }, [isDay, isWeek, dailyQuery.data, weeklyQuery.data, monthQueries]);

  const isLoading = isDay
    ? dailyQuery.isLoading
    : isWeek
      ? weeklyQuery.isLoading
      : monthQueries.some((query) => query.isLoading);

  const isError = isDay
    ? dailyQuery.isError
    : isWeek
      ? weeklyQuery.isError
      : monthQueries.some((query) => query.isError);

  const error = isDay
    ? dailyQuery.error
    : isWeek
      ? weeklyQuery.error
      : monthQueries.find((query) => query.error)?.error;

  function refetch() {
    if (isDay) return dailyQuery.refetch();
    if (isWeek) return weeklyQuery.refetch();
    return Promise.all(monthQueries.map((query) => query.refetch()));
  }

  return {
    items,
    isLoading,
    isError,
    error: error ? getApiError(error, "Không tải được lịch hẹn") : null,
    refetch,
    staffName: dailyQuery.data?.staffName,
  };
}
