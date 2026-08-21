export interface CashierBooking {
  id: string
  appointmentCode?: string | null
  customerName?: string | null
  customerPhone?: string
  customerEmail?: string
  customerAvatar?: string
  bookingDate?: string
  serviceName?: string | null
  serviceId?: number | null
  serviceIds?: number[]
  services?: { serviceId?: number; name?: string; durationMins?: number; price?: number }[]
  staffId: string | number
  staffName?: string | null
  startTime: string
  endTime: string
  status: number
  totalAmount?: number
  paidAmount?: number
  depositAmount?: number
  remainingAmount?: number
  depositPaid?: boolean
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