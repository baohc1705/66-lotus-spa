import type { PageRequest } from "@/shared/types/common.types";

export interface SalonDto {
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

export interface SalonFullDto extends SalonDto {
  description?: string;
}

export interface GetAllSalonQuery extends PageRequest {
  status?: number;
  isDeleted?: boolean;
}

export interface CreateSalonRequest {
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

export interface UpdateSalonRequest {
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
  imageBase64?: string;
  description?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  status?: number;
}
