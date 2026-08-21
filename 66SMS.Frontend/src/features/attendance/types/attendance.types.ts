import type { PageRequest } from "@/shared/types/common.types";

export interface AttendanceDto {
  id: number | null;
  staffId: number | null;
  staffName: string | null;
  salonId: number | null;
  salonName: string | null;
  workScheduleId: number | null;
  workDate: string | null;
  checkInAt: string | null;
  checkOutAt: string | null;
  workedHours: number | null;
  workCredits: number | null;
  status: number | null;
  note: string | null;
  shiftName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CheckInRequest {
  staffId: number;
  salonId?: number;
  workScheduleId?: number;
  note?: string;
}

export interface CheckOutRequest {
  staffId: number;
  workScheduleId?: number;
}

export interface UpdateAttendanceRequest {
  checkInAt?: string;
  checkOutAt?: string;
  status?: number;
  note?: string;
}

export interface CreateManualAttendanceRequest {
  staffId: number;
  workScheduleId?: number;
  workDate: string;
  status: number;
  note?: string;
}

export interface GetAllAttendancesQuery extends PageRequest {
  staffId?: number | null;
  salonId?: number | null;
  status?: number | null;
  fromDate?: string;
  toDate?: string;
}