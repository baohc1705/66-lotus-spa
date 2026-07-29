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

export interface CheckInPayload {
  staffId: number;
  workScheduleId: number;
  note?: string;
}

export interface CheckOutPayload {
  staffId: number;
  workScheduleId: number;
}

export interface UpdateAttendancePayload {
  checkInAt?: string;
  checkOutAt?: string;
  status?: number;
  note?: string;
}
  
export interface CreateManualAttendancePayload {
  staffId: number;
  workScheduleId?: number;
  workDate: string;
  status: number;
  note?: string;
}
