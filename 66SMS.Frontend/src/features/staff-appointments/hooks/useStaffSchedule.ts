import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { getIsoWeekStart, staffScheduleApi } from '../api'
import type { ScheduleViewMode } from '../types'

function getApiError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as { message?: string } | undefined
    if (body?.message) return body.message
  }
  return error instanceof Error ? error.message : fallback
}

export function useStaffScheduleDaily(date: Date, enabled = true) {
  const query = useQuery({
    queryKey: ['staff-schedule-daily', staffScheduleApi.formatDate(date)],
    queryFn: async () => {
      const res = await staffScheduleApi.getDaily(date)
      if (!res.isSuccess || !res.data) {
        throw new Error(res.message || 'Lỗi tải lịch hẹn')
      }
      return res.data
    },
    enabled,
    staleTime: 30_000,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getApiError(query.error, 'Không tải được lịch hẹn') : null,
    refetch: query.refetch,
  }
}

export function useStaffScheduleWeekly(weekStart: Date, enabled = true) {
  const normalizedStart = getIsoWeekStart(weekStart)

  const query = useQuery({
    queryKey: ['staff-schedule-weekly', staffScheduleApi.formatDate(normalizedStart)],
    queryFn: async () => {
      const res = await staffScheduleApi.getWeekly(normalizedStart)
      if (!res.isSuccess || !res.data) {
        throw new Error(res.message || 'Lỗi tải lịch tuần')
      }
      return res.data
    },
    enabled,
    staleTime: 30_000,
  })

  return {
    data: query.data ?? null,
    weekStart: normalizedStart,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getApiError(query.error, 'Không tải được lịch tuần') : null,
    refetch: query.refetch,
  }
}

export function useStaffSchedule(viewMode: ScheduleViewMode, anchorDate: Date, enabled = true) {
  const weekStart = getIsoWeekStart(anchorDate)
  const daily = useStaffScheduleDaily(anchorDate, enabled && viewMode === 'day')
  const weekly = useStaffScheduleWeekly(weekStart, enabled && viewMode === 'week')

  if (viewMode === 'day') {
    return { viewMode, ...daily }
  }

  return { viewMode, ...weekly }
}
