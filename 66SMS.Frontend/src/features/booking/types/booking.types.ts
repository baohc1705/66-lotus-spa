import type { ServiceDto } from "../../services/types/service.types";

export interface TechnicianDTO {
  id?: number;
  name?: string;
  avatar?: string;
  role?: string;
  accountRole?: string;
  slotsLeft?: number;
  status?: string;
  isAny?: boolean;
}

export interface TimeSlotDTO {
  slotId: number;
  time: string;
  status: string;
}

export interface BookingDayDto {
  date: string;
  dayName: string;
  dayNum: number;
  isToday: boolean;
  isBookedOut: boolean;
}

export interface BookingPositionDTO {
  id: number;
  roomId?: number;
  name: string;
  roomName?: string;
  status?: number;
}
export interface SlotLockDto {
  slotId?: number;
  staffId?: number | null;
  positionId?: number | null;
  appointmentDate?: string;
  serviceId?: number;
}

export interface CreateSlotLockPayload {
  locks: SlotLockDto[];
}

export interface GuestAppointmentDto {
  lockId?: number;
  staffId?: number | null;
  slotId?: number;
  appointmentDate?: string;
  positionId?: number | null;
  salonId?: number | null;
  note?: string;
  services?: { serviceId?: number; quantity?: number }[];
}

export interface PromotionValidationDto {
  id: number | null;
  code: string | null;
  name: string | null;
  discountType: number | null;
  discountAmount: number;
  finalAmount: number;
}

export interface ActivePromotionDto {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  discountType: number;
  discountTypeName: string;
  discountValue?: number | null;
  maxDiscountAmount?: number | null;
  minOrderValue?: number | null;
  endDate?: string | null;
}

export interface CreateAppointmentPayload {
  promotionCode?: string;
  guests: GuestAppointmentDto[];
}

export type CreateBookingPayload = CreateAppointmentPayload;

export interface GetAvailableBookingDaysParams {
  days?: number;
}

export interface GetTechniciansParams {
  date?: string;
  serviceId?: number;
  salonId?: number;
}

export interface GetTimeSlotsParams {
  date?: string;
  serviceId?: number;
  staffId?: number;
  salonId?: number;
}

export interface GetAllAppointmentParams {
  userId?: number;
  salonId?: number;
  pageIndex?: number;
  pageSize?: number;
  filter?: string;
  orderBy?: string;
  isDescending?: boolean;
}

export type CreateSlotLockResponseDto = number[];
export type BookingResponseDto = number[];

export interface GuestBooking {
  id: number;
  selectedService: ServiceDto | null;
  selectedTechnician: TechnicianDTO | null;
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlotDTO | null;
  lockId?: number;
}

export interface AppointmentDto {
  id?: number;
  appointmentCode?: string;
  customerId?: number;
  staffId?: number;
  slotId?: number;
  positionId?: number;
  appointmentDate?: string;
  status?: number;
  note?: string;
  totalAmount?: number;
  paidAmount?: number;
  depositPercent?: number;
  depositDeadlineAt?: string;
  createdAt?: string;
  servicesSubTotal?: number;
  membershipDiscountAmount?: number;
  promotionDiscountAmount?: number;
  staffFullName?: string;
  salonName?: string;
  timeSlotStartTime?: string;
  timeSlotEndTime?: string;
  positionName?: string;
  positionRoomName?: string;
  serviceNames?: string[];
}
