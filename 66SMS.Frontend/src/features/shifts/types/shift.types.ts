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
  status?: boolean;
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
