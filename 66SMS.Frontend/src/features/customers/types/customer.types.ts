// DTO trả về từ API (match backend CustomerDTO.cs)
export interface CustomerDto {
  id: number | null
  userId: number | null
  fullName: string | null
  image: string | null
  dob: string | null
  gender: string | null
  phone: string | null
  tier: string | null
  loyaltyPoint: number | null
  firstPurchaseAt: string | null
  lastPurchaseAt: string | null
  source: string | null
  status: string | null
  note: string | null
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

// Payload tạo khách hàng (match CreateCustomerCommand, bỏ [JsonIgnore] fields: UserId, Role, CreatedBy)
export interface CreateCustomerPayload {
  fullName: string
  image?: string
  dob?: string
  gender?: number
  phone: string
  tier?: string
  loyaltyPoint?: number
  firstPurchaseAt?: string
  lastPurchaseAt?: string
  source?: string
  status?: number
  note?: string
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

// Payload cập nhật khách hàng (match UpdateCustomerCommand, bỏ [JsonIgnore] fields: Id, Role, CreatedBy, không có password)
export interface UpdateCustomerPayload {
  fullName?: string
  image?: string
  dob?: string
  gender?: number
  phone?: string
  tier?: string
  loyaltyPoint?: number
  firstPurchaseAt?: string
  lastPurchaseAt?: string
  source?: string
  status?: number
  note?: string
  streetAddress?: string
  provinceCode?: string
  wardCode?: string
  fullAddress?: string
  userName?: string
  email?: string
}
