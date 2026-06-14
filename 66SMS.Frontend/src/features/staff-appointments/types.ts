export type StaffBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'not-arrived'
  | 'waiting'
  | 'in-progress'
  | 'completed'
  | 'unpaid'
  | 'paid'
  | 'cancelled'

export const BookingStatus = {
  Pending: 1,
  Confirmed: 2,
  Waiting: 3,
  InService: 4,
  Completed: 5,
  Cancelled: 6,
  NoShow: 9,
} as const

export interface StaffScheduleBooking {
  id: string
  customerName: string
  customerPhone?: string
  serviceName: string
  startTime: string
  endTime: string
  status: StaffBookingStatus
  totalAmount: number
  note?: string
}

export interface StaffScheduleDailyDto {
  date: string
  staffName?: string
  bookings: StaffScheduleBooking[]
}

export interface StaffScheduleDayDto {
  date: string
  bookings: StaffScheduleBooking[]
}

export interface StaffScheduleWeeklyDto {
  weekStart: string
  weekEnd: string
  days: StaffScheduleDayDto[]
}

export type ScheduleViewMode = 'day' | 'week'
