import type { ShiftDTO } from "@/features/shifts/types/shift.types";

export interface WorkScheduleDTO {
  id?: number;
  shiftPeriodId?: number;
  staffId?: number;
  salonId?: number;
  workDate?: string; // DateOnly from backend, format: YYYY-MM-DD
  shift?: ShiftDTO;
  staffName?: string;
}

export interface CreateWorkSchedulePayload {
  shiftPeriodId?: number;
  staffId?: number;
  salonId?: number;
  workDate?: string;
}

export interface BulkCreateWorkSchedulePayload {
  schedules: CreateWorkSchedulePayload[];
}

export interface UpdateWorkSchedulePayload {
  id?: number;
  shiftPeriodId?: number;
  staffId?: number;
  salonId?: number;
  workDate?: string;
}

import type { PageRequest } from "@/shared/types/common.types";

export interface GetWorkSchedulesParams extends PageRequest {
  startDate?: string;
  endDate?: string;
  staffId?: number;
  salonId?: number;
}
