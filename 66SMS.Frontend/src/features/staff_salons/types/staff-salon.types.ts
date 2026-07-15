import type { PageRequest } from "@/shared/types/common.types";

export interface StaffSalonDTO {
  id?: number;
  staffId?: number;
  staffName?: string;
  staffCode?: string;
  staffRole?: string;
  salonId?: number;
  salonName?: string;
  isManager?: boolean;
  startDate?: string;
  endDate?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStaffSalonPayload {
  staffId: number;
  salonId: number;
  isManager?: boolean;
  startDate: string;
  endDate?: string;
  status?: number;
}

export interface UpdateStaffSalonPayload {
  isManager?: boolean;
  startDate?: string;
  endDate?: string;
  status?: number;
}

export interface StaffSalonQueryParams extends PageRequest {
  salonId?: number;
  staffId?: number;
  status?: number;
}
