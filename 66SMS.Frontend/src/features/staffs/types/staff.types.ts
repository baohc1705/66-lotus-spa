import type { PageRequest } from "@/shared/types/common.types";

export interface StaffDto {
  id?: number | null;
  userId?: number | null;
  salonId?: number | null;
  salonName?: string | null;
  role?: string | null;
  code?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  gender?: number | null;
  phone?: string | null;
  contractType?: string | null;
  basicSalary?: number | null;
  status?: number | null;
  email?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface StaffFullDto {
  id?: number | null;
  userId?: number | null;
  salonId?: number | null;
  salonName?: string | null;
  code?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: number | null;
  nationalId?: string | null;
  phone?: string | null;
  hireDate?: string | null;
  contractType?: string | null;
  basicSalary?: number | null;
  salaryType?: number | null;
  status?: number | null;
  streetAddress?: string | null;
  provinceCode?: string | null;
  wardCode?: string | null;
  fullAddress?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface GetAllStaffQuery extends PageRequest {
  salonId?: number | null;
  isDeleted?: boolean;
  role?: string | null;
}

export interface CreateStaffRequest {
  salonId?: number | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: number | null;
  nationalId?: string | null;
  phone?: string | null;
  hireDate?: string | null;
  contractType?: string | null;
  basicSalary?: number | null;
  salaryType?: number | null;
  status?: number | null;
  streetAddress?: string | null;
  provinceCode?: string | null;
  wardCode?: string | null;
  fullAddress?: string | null;
  role?: string | null;
  email?: string | null;
}

export interface UpdateStaffRequest {
  salonId?: number | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: number | null;
  nationalId?: string | null;
  phone?: string | null;
  hireDate?: string | null;
  contractType?: string | null;
  basicSalary?: number | null;
  salaryType?: number | null;
  status?: number | null;
  streetAddress?: string | null;
  provinceCode?: string | null;
  wardCode?: string | null;
  fullAddress?: string | null;
  email?: string | null;
  role?: string | null;
}
