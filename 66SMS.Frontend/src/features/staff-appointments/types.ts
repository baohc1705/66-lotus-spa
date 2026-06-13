export type StaffBookingStatus =
  | 'pending'
  | 'not-arrived'
  | 'waiting'
  | 'in-progress'
  | 'completed'
  | 'unpaid'
  | 'paid'
  | 'cancelled'

export const BookingStatus = {
  Pending: 0,
  NotArrived: 1,
  Waiting: 2,
  InService: 3,
  Completed: 4,
  Unpaid: 5,
  Paid: 6,
  Cancelled: 7,
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
