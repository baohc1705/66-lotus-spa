export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'not-arrived'
  | 'waiting'
  | 'in-progress'
  | 'completed'
  | 'unpaid'
  | 'paid'
  | 'cancelled'

export interface CashierBooking {
  id: string
  customerName: string
  customerPhone?: string
  customerAvatar?: string
  bookingDate?: string
  serviceName: string
  staffId: string
  staffName: string
  startTime: string // ISO string or HH:mm
  endTime: string
  status: BookingStatus
  totalAmount: number
  paidAmount: number
  depositAmount: number
  remainingAmount: number
  depositPaid: boolean
  depositDeadlineAt?: string | null
  note?: string
}

export interface StaffColumn {
  id: string
  name: string
  avatar?: string
}

export interface CashierDailyDto {
  columns: StaffColumn[]
  bookings: CashierBooking[]
}
