import type { ServiceDTO } from "../../services/types/service.types";

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

export interface BookingPositionDTO {
  id: number;
  roomId?: number;
  name: string;
  roomName?: string;
  status?: number;
}
export interface SlotLockDto {
  slotId: number;
  staffId: number | null;
  positionId: number;
  appointmentDate: string;
  serviceId: number;
}
export interface GuestAppointmentDto {
  lockId?: number;
  staffId: number | null;
  slotId: number;
  appointmentDate: string;
  positionId: number;
  note?: string;
  services: { serviceId: number; quantity: number }[];
}

export type CreateSlotLockResponseDto = number[];
export type BookingResponseDto = number[];

export interface GuestBooking {
  id: number;
  selectedService: ServiceDTO | null;
  selectedTechnician: TechnicianDTO | null;
  selectedPosition: BookingPositionDTO | null;
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
  staffFullName?: string;
  timeSlotStartTime?: string;
  timeSlotEndTime?: string;
  positionName?: string;
  positionRoomName?: string;
  serviceNames?: string[];
}
