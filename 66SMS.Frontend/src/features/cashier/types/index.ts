export type CashierViewMode = 'timeline' | 'grid'
export type CashierTimeRange = 'daily' | 'weekly'

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
  appointmentCode?: string | null
  customerName: string
  customerPhone?: string
  customerAvatar?: string
  bookingDate?: string
  serviceName: string
  serviceId?: number | null
  staffId: string | number
  staffName: string
  slotId?: number | null
  startTime: string
  endTime: string
  status: BookingStatus
  totalAmount: number
  paidAmount: number
  depositAmount: number
  remainingAmount: number
  depositPaid: boolean
  depositDeadlineAt?: string | null
  note?: string
  customerWalletBalance?: number
  invoiceId?: number | null
  invoiceCode?: string | null
  discountAmount?: number
  positionId?: number | null
  positionName?: string | null
  positionStatus?: number | null
  timeStartService?: string | null
  completedAt?: string | null
}

export interface CashierPosition {
  id: number
  roomId: number
  name: string
  roomName: string
  status: number
  statusLabel: string
  isSelectable: boolean
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

export type StaffAvailabilityStatus = "available" | "busy" | "off";

export interface StaffAvailabilityDto {
  staffId: number;
  staffName: string;
  avatar?: string | null;
  status: StaffAvailabilityStatus;
  reason?: string | null;
  scheduleId?: number | null;
  busyCustomerName?: string | null;
  busyTimeRange?: string | null;
}