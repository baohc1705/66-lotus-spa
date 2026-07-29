import type { PageRequest } from "@/shared/types/common.types";

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
  isPrimary?: boolean | null;
  status?: number;
  createdAt?: string;
}

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
  isPrimary?: boolean;
  status?: number;
}

export type UpdateSalonPayload = Partial<CreateSalonPayload>;

export interface SalonQueryParams extends PageRequest {
  keyword?: string;
  status?: number;
}
