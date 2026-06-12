export interface ShiftPeriodDTO {
  id?: number;
  shiftStart?: string;
  shiftEnd?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  status?: boolean; // Tương đương "Ca đang hoạt động" trong lịch sử
}

export interface ShiftDTO {
  id?: number;
  name?: string;
  description?: string;
  shiftPeriodDTOs?: ShiftPeriodDTO[];
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
}

export interface CreateShiftPeriodPayload {
  shiftStart?: string;
  shiftEnd?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface CreateShiftPayload {
  name?: string;
  description?: string;
  shiftPeriod?: CreateShiftPeriodPayload;
}

export interface UpdateShiftPeriodPayload {
  id?: number;
  shiftStart?: string;
  shiftEnd?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface UpdateShiftPayload {
  id?: number;
  name?: string;
  description?: string;
  shiftPeriod?: UpdateShiftPeriodPayload;
}
