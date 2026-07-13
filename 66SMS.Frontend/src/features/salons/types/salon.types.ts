import type { PageRequest } from "@/shared/types/common.types";

/** Item từ GetAllSalons — không có description (field dài). */
export interface SalonListItem {
  id?: number;
  code?: string;
  name?: string;
  phone?: string;
  email?: string;
  streetAddress?: string;
  provinceCode?: string;
  wardCode?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  workingDays?: string;
  taxCode?: string;
  imageUrl?: string;
  sortOrder?: number;
  status?: number;
  createdAt?: string;
}

/** Chi tiết đầy đủ từ GetDetailSalon — có description. */
export interface SalonDTO extends SalonListItem {
  description?: string;
  updatedAt?: string;
}

export interface CreateSalonPayload {
  name: string;
  phone: string;
  email?: string;
  streetAddress?: string;
  provinceCode?: string;
  wardCode?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  workingDays?: string;
  taxCode?: string;
  imageUrl?: string;
  imageBase64?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}

export type UpdateSalonPayload = Partial<CreateSalonPayload>;

export interface SalonQueryParams extends PageRequest {
  keyword?: string;
  status?: number;
}
