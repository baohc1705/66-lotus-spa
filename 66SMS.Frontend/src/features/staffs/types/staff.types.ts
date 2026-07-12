export interface StaffDto {
  id: number | null;
  userId: number | null;
  salonId?: number | null;
  salonName?: string | null;
  role?: string | null;
  code: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  nationalId: string | null;
  phone: string | null;
  hireDate: string | null;
  contractType: string | null;
  basicSalary: number | null;
  salaryType: number | null;
  status: string | null;
  streetAddress: string | null;
  provinceCode: string | null;
  wardCode: string | null;
  fullAddress: string | null;
  username: string | null;
  email: string | null;
  createdAt?: string | null;
}

// Payload tạo nhân viên (match CreateStaffCommand, bỏ [JsonIgnore] fields)
export interface CreateStaffPayload {
  salonId?: number;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: number;
  nationalId?: string;
  phone: string;
  hireDate?: string;
  contractType?: string;
  basicSalary?: number;
  salaryType?: number;
  status?: number;
  streetAddress?: string;
  provinceCode?: string;
  wardCode?: string;
  fullAddress?: string;
  role?: string;
}

// Payload cập nhật nhân viên (match UpdateStaffCommand, bỏ [JsonIgnore] fields, không có password)
export interface UpdateStaffPayload {
  salonId?: number;
  fullName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: number;
  nationalId?: string;
  phone?: string;
  hireDate?: string;
  contractType?: string;
  basicSalary?: number;
  salaryType?: number;
  status?: number;
  streetAddress?: string;
  provinceCode?: string;
  wardCode?: string;
  fullAddress?: string;
  userName?: string;
  email?: string;
  role?: string;
}
