import type { ShiftDTO } from "@/features/shifts/types/shift.types";

export interface WorkScheduleDTO {
  id?: number;
  shiftPeriodId?: number;
  employeeId?: number;
  workDate?: string; // DateOnly from backend, format: YYYY-MM-DD
  shift?: ShiftDTO;
  employeeName?: string;
}

export interface CreateWorkSchedulePayload {
  shiftPeriodId?: number;
  employeeId?: number;
  workDate?: string;
}

export interface BulkCreateWorkSchedulePayload {
  schedules: CreateWorkSchedulePayload[];
}

export interface UpdateWorkSchedulePayload {
  id?: number;
  shiftPeriodId?: number;
  employeeId?: number;
  workDate?: string;
}

import type { PageRequest } from "@/shared/types/common.types";

export interface GetWorkSchedulesParams extends PageRequest {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
}
