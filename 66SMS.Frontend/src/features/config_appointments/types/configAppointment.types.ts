import type { PageRequest } from "@/shared/types/common.types";

export interface ConfigAppointmentDTO {
  id?: number;
  depositPercent?: number;
  startTime?: string;
  endTime?: string;
  slotMinutes?: number;
  salonId?: number;
  salonName?: string;
}

export interface CreateConfigAppointmentRequest {
  depositPercent?: number;
  startTime?: string;
  endTime?: string;
  slotMinutes?: number;
  salonId?: number;
}

export interface UpdateConfigAppointmentRequest {
  id?: number;
  depositPercent?: number;
  startTime?: string;
  endTime?: string;
  slotMinutes?: number;
  salonId?: number;
}

export interface GetAllConfigAppointmentQuery extends PageRequest {
    salonId?: number;
}