import type { ShiftDTO } from "@/features/shifts/types/shift.types";
import type { PageRequest } from "@/shared/types/common.types";

export interface WorkScheduleDTO {
  id?: number;
  shiftId?: number;
  shiftStart?: string;
  shiftEnd?: string;
  staffId?: number;
  salonId?: number;
  workDate?: string;
  shift?: ShiftDTO;
  staffName?: string;
}

export interface CreateWorkSchedulePayload {
  shiftId?: number;
  staffId?: number;
  salonId?: number;
  workDate?: string;
}

export interface BulkCreateWorkSchedulePayload {
  schedules: CreateWorkSchedulePayload[];
}

export interface UpdateWorkSchedulePayload {
  id?: number;
  shiftId?: number;
  staffId?: number;
  salonId?: number;
  workDate?: string;
}

export interface GetWorkSchedulesParams extends PageRequest {
  startDate?: string;
  endDate?: string;
  staffId?: number;
  salonId?: number;
}
