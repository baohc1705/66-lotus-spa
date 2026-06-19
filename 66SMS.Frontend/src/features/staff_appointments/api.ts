import axiosInstance from '@/shared/api/axiosInstance'
import type { Result } from '@/shared/types/common.types'
import type { StaffScheduleDailyDto, StaffScheduleWeeklyDto } from './types'

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getIsoWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export const staffScheduleApi = {
  getDaily: async (date: Date) => {
    const res = await axiosInstance.get<Result<StaffScheduleDailyDto>>('/staffs/me/schedule/daily', {
      params: { date: formatDate(date) },
    })
    return res.data
  },

  getWeekly: async (weekStart: Date) => {
    const res = await axiosInstance.get<Result<StaffScheduleWeeklyDto>>('/staffs/me/schedule/weekly', {
      params: { weekStart: formatDate(weekStart) },
    })
    return res.data
  },

  updateBookingStatus: async (id: string | number, status: number, note?: string) => {
    const res = await axiosInstance.put<Result<void>>(`/staffs/me/bookings/${id}/status`, { id: Number(id), status, note })
    return res.data
  },

  formatDate,
}
