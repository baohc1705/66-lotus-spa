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
}

/** DTO đầy đủ cho expand + form sửa (GetDetail) */
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

/** Dịch vụ được phân công cho nhân viên */
export interface StaffServiceDto {
  id?: number | null;
  staffId?: number | null;
  serviceId?: number | null;
  status?: number | null;
  serCode?: string | null;
  serName?: string | null;
  serDurationMins?: number | null;
  serCostPrice?: number | null;
  serCommissionRate?: number | null;
  createdAt?: string | null;
}

export interface CreateStaffServicePayload {
  staffId: number;
  serviceIds: number[];
  status?: number;
}

export interface UpdateStaffServicePayload {
  staffId?: number;
  serviceId?: number;
  status?: number;
}

export interface DeleteStaffServicePayload {
  ids: number[];
}

export type {
  CreateStaffPayload,
  UpdateStaffPayload,
  StaffFormValues,
} from "../schemas/staff.schema";
