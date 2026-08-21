import type { PageRequest } from "@/shared/types/common.types";

export interface StaffServiceDto {
  id?: number | null;
  staffId?: number | null;
  serviceId?: number | null;
  status?: number | null;
  serCode?: string | null;
  serName?: string | null;
  serDurationMins?: number | null;
  serSellPrice?: number | null;
  serCommissionRate?: number | null;
  createdAt?: string | null;
}

export interface GetStaffServicesQuery extends PageRequest {
  staffId?: number | null;
  serviceId?: number | null;
}

export interface CreateStaffServiceRequest {
  staffId: number;
  serviceIds: number[];
  status?: number;
}

export interface UpdateStaffServiceRequest {
  staffId?: number;
  serviceId?: number;
  status?: number;
}
