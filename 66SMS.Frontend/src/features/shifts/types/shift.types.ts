import type { PageRequest } from "@/shared/types/common.types";

export interface CreateShiftPayload {
  salonId?: number;
  name?: string;
  description?: string;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface UpdateShiftPayload {
  id?: number;
  salonId?: number;
  name?: string;
  description?: string;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface ShiftDTO {
  id?: number;
  salonId?: number;
  salonName?: string | null;
  name?: string;
  description?: string;
  shiftStart?: string;
  shiftEnd?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export interface GetShiftsParams extends PageRequest {
  salonId?: number;
}
