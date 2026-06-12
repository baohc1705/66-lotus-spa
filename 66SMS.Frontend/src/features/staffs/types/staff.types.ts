// DTO trả về từ API (match backend StaffDto.cs)
export interface StaffDto {
  id: number | null
  userId: number | null
  code: string | null
  fullName: string | null
  image: string | null
  dob: string | null
  gender: string | null
  nationalId: string | null
  phone: string | null
  hireDate: string | null
  contractType: string | null
  basicSalary: number | null
  status: string | null
  streetAddress: string | null
  provinceCode: string | null
  wardCode: string | null
  fullAddress: string | null
  username: string | null
  email: string | null
  createdAt?: string | null
  createdBy?: number | null
  updatedAt?: string | null
  updatedBy?: number | null
}

// Payload tạo nhân viên (match CreateStaffCommand, bỏ [JsonIgnore] fields)
export interface CreateStaffPayload {
  fullName: string
  image?: string
  dob?: string
  gender?: number
  nationalId?: string
  phone: string
  hireDate?: string
  contractType?: string
  basicSalary?: number
  status?: number
  streetAddress?: string
  provinceCode?: string
  wardCode?: string
  fullAddress?: string
  // Account fields
  userName: string
  email: string
  password: string
  confirmPassword: string
}

// Payload cập nhật nhân viên (match UpdateStaffCommand, bỏ [JsonIgnore] fields, không có password)
export interface UpdateStaffPayload {
  fullName?: string
  image?: string
  dob?: string
  gender?: number
  nationalId?: string
  phone?: string
  hireDate?: string
  contractType?: string
  basicSalary?: number
  status?: number
  streetAddress?: string
  provinceCode?: string
  wardCode?: string
  fullAddress?: string
  userName?: string
  email?: string
}
