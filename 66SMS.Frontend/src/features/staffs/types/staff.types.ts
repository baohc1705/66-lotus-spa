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

export interface CreateStaffPayload {
  salonId?: number;
  fullName: string;
  /** Base64 ảnh mới (AvatarUrl trên backend) */
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
  /** Role code (vd: staff, manager) */
  role?: string;
}

export interface UpdateStaffPayload {
  salonId?: number;
  fullName?: string;
  /** Base64 ảnh mới — chỉ gửi khi đổi ảnh */
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
  email?: string;
  /** Role code (vd: staff, manager) */
  role?: string;
}
